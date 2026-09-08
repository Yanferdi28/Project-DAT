"""
Group-Constrained Document Classifier using TF-IDF + Logistic Regression.

Architecture:
    Stage 1 (Group):  Predicts the document group (Level-1 prefix, e.g. KP, HK)
                      using all training data grouped by prefix (~19 classes).
    Flat Classifier:  Trained on all 415 fine-grained classes using all data.
    Combined:         Stage 1 narrows candidates to one group, then the flat
                      classifier's probabilities are masked to only consider
                      classes within that group. This combines the high accuracy
                      of group prediction with full-data feature learning.

This hybrid approach outperforms both pure single-stage (too many classes)
and pure two-stage (too little data per group-level classifier) designs.
"""

import logging
import os
import json
import joblib
import numpy as np
import re
import warnings
from collections import Counter, defaultdict
from typing import Optional
from sklearn.exceptions import InconsistentVersionWarning
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import FeatureUnion, Pipeline

warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

logger = logging.getLogger(__name__)


MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
CODE_PATTERN = re.compile(
    r"\b([A-Z]{1,4})\s*[.\-/]?\s*([0-9OIL]{2})(?:\s*[.\-/]?\s*([0-9OIL]{2}))?\b",
    re.IGNORECASE,
)
DIGIT_TRANSLATION = str.maketrans({
    "O": "0",
    "o": "0",
    "I": "1",
    "i": "1",
    "L": "1",
    "l": "1",
})
LABEL_CODE_PATTERN = re.compile(r"^\s*([A-Z]{1,4}\.[0-9]{2}(?:\.[0-9]{2})?)\b", re.IGNORECASE)

# Model file paths
MODEL_PATH = os.path.join(MODEL_DIR, "classifier_two_stage.pkl")
# Legacy single-stage paths (kept for backward-compatible loading)
LEGACY_PIPELINE_PATH = os.path.join(MODEL_DIR, "classifier_pipeline.pkl")
LEGACY_ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")


def normalize_training_label(label: object) -> str:
    """Use the classification code as the canonical training label."""
    raw_label = str(label or "").strip()
    code_part = raw_label.split("|", 1)[0].strip()
    code_part = re.sub(r"\s+", "", code_part).upper()

    match = LABEL_CODE_PATTERN.match(code_part)
    return match.group(1).upper() if match else code_part


def extract_group(code: str) -> str:
    """Extract the Level-1 group prefix from a classification code.

    Examples:
        'KP.01.06' -> 'KP'
        'HK.02.04' -> 'HK'
        'KJM.08.01' -> 'KJM'
    """
    return code.split(".")[0].upper()


def build_classifier_pipeline(n_classes: int = 19) -> Pipeline:
    """Build a tuned text classifier pipeline for Stage 1 (group classification).

    Hyperparameters are tuned for group-level classification:
    - Reduced max_features to prevent overfitting on small datasets
    - Stronger regularisation (lower C) for better generalisation
    - Narrower ngram ranges for short texts (~67 chars avg)

    Args:
        n_classes: Number of target classes.
    """
    c_value = 1.0 if n_classes > 10 else 2.0

    return Pipeline([
        ("features", FeatureUnion([
            ("word", TfidfVectorizer(
                analyzer="word",
                max_features=5000,
                ngram_range=(1, 2),
                min_df=2,
                max_df=0.95,
                sublinear_tf=True,
                strip_accents="unicode",
            )),
            ("char", TfidfVectorizer(
                analyzer="char_wb",
                max_features=8000,
                ngram_range=(2, 4),
                min_df=2,
                max_df=0.95,
                sublinear_tf=True,
                strip_accents="unicode",
            )),
        ])),
        ("classifier", LogisticRegression(
            max_iter=2000,
            C=c_value,
            class_weight="balanced",
            solver="lbfgs",
        )),
    ])


def build_flat_pipeline() -> Pipeline:
    """Build the flat classifier pipeline for all fine-grained classes.

    Uses settings closer to the original (higher features, higher C) since
    the flat classifier sees ALL training data and needs to discriminate
    between many classes. Group-constraining at prediction time will filter
    out irrelevant classes, so overfitting across groups is less of a risk.
    """
    return Pipeline([
        ("features", FeatureUnion([
            ("word", TfidfVectorizer(
                analyzer="word",
                max_features=12000,
                ngram_range=(1, 3),
                min_df=1,
                max_df=0.98,
                sublinear_tf=True,
                strip_accents="unicode",
            )),
            ("char", TfidfVectorizer(
                analyzer="char_wb",
                max_features=18000,
                ngram_range=(2, 5),
                min_df=1,
                max_df=0.98,
                sublinear_tf=True,
                strip_accents="unicode",
            )),
        ])),
        ("classifier", LogisticRegression(
            max_iter=2000,
            C=8.0,
            class_weight="balanced",
            solver="lbfgs",
        )),
    ])


class DocumentClassifier:
    """Group-constrained document classifier.

    Uses Stage 1 to predict the document group, then constrains a flat
    classifier's output to only consider classes within the predicted group.
    """

    def __init__(self):
        # Group classifier (Stage 1)
        self.group_pipeline: Optional[Pipeline] = None
        self.group_encoder: Optional[LabelEncoder] = None
        # Flat classifier (all classes)
        self.flat_pipeline: Optional[Pipeline] = None
        self.flat_encoder: Optional[LabelEncoder] = None
        # Mapping: group -> list of indices in flat_encoder
        self.group_to_indices: dict[str, list[int]] = {}
        # Mapping from full code to its uraian (description)
        self.label_uraian_map: dict[str, Optional[str]] = {}
        self.is_loaded = False
        self._load_model()

    def _load_model(self):
        """Load trained model from disk if available."""
        if os.path.exists(MODEL_PATH):
            try:
                bundle = joblib.load(MODEL_PATH)
                self.group_pipeline = bundle["group_pipeline"]
                self.group_encoder = bundle["group_encoder"]
                self.flat_pipeline = bundle["flat_pipeline"]
                self.flat_encoder = bundle["flat_encoder"]
                self.group_to_indices = bundle.get("group_to_indices", {})
                self.label_uraian_map = bundle.get("label_uraian_map", {})
                self.is_loaded = True
                n_groups = len(self.group_encoder.classes_) if self.group_encoder else 0
                n_classes = len(self.flat_encoder.classes_) if self.flat_encoder else 0
                logger.info(
                    "Group-constrained model loaded: %d groups, %d classes",
                    n_groups, n_classes,
                )
            except Exception as e:
                logger.error("Error loading model: %s", e)
                self.is_loaded = False
            return

        # Fallback: try loading legacy single-stage model
        if os.path.exists(LEGACY_PIPELINE_PATH) and os.path.exists(LEGACY_ENCODER_PATH):
            try:
                pipeline = joblib.load(LEGACY_PIPELINE_PATH)
                label_encoder = joblib.load(LEGACY_ENCODER_PATH)
                self.flat_pipeline = pipeline
                self.flat_encoder = label_encoder
                self.group_pipeline = None
                self.group_encoder = None
                self.group_to_indices = {}
                self.is_loaded = True
                logger.info("Legacy single-stage model loaded as fallback")
            except Exception as e:
                logger.error("Error loading legacy model: %s", e)
                self.is_loaded = False

    @property
    def _is_group_constrained(self) -> bool:
        """Check if the loaded model supports group-constrained prediction."""
        return self.group_pipeline is not None and bool(self.group_to_indices)

    # Keep backward-compatible aliases
    @property
    def _is_two_stage(self) -> bool:
        return self._is_group_constrained

    @property
    def stage1_encoder(self):
        return self.group_encoder

    @property
    def stage2_pipelines(self):
        return self.group_to_indices  # non-empty dict signals two-stage

    @property
    def stage2_encoders(self):
        return {}

    def predict(self, text: str) -> dict:
        """
        Predict document category from text.

        If a group-constrained model is loaded:
        1. Stage 1 predicts the group (e.g. KP, HK)
        2. Flat classifier gives probabilities for all 415 classes
        3. Probabilities are masked to only the predicted group's classes
        4. Best match within the group is selected

        Args:
            text: Extracted document text

        Returns:
            dict with predictions and confidence scores
        """
        if not self.is_loaded:
            return {
                "success": False,
                "error": "Model not trained yet. Run training first.",
                "predictions": [],
            }

        if not text or len(text.strip()) < 10:
            return {
                "success": False,
                "error": "Text too short for classification",
                "predictions": [],
            }

        try:
            if self._is_group_constrained:
                return self._predict_group_constrained(text)
            return self._predict_flat(text)
        except Exception as e:
            logger.exception("Prediction error")
            return {
                "success": False,
                "error": str(e),
                "predictions": [],
            }

    def _predict_group_constrained(self, text: str) -> dict:
        """Group-constrained prediction: group first, then filter flat output."""
        # --- Stage 1: Predict group ---
        s1_probs = self.group_pipeline.predict_proba([text])[0]
        s1_top_indices = list(np.argsort(s1_probs)[::-1][:3])

        # Check for explicit code in text
        explicit_code, _ = self._find_explicit_code(text)
        explicit_group = extract_group(explicit_code) if explicit_code else None

        # If explicit code found, prioritise its group
        if explicit_group and self.group_encoder is not None:
            group_classes = list(self.group_encoder.classes_)
            if explicit_group in group_classes:
                explicit_group_idx = group_classes.index(explicit_group)
                if explicit_group_idx not in s1_top_indices:
                    s1_top_indices = [explicit_group_idx] + s1_top_indices[:2]

        # --- Flat classifier: Get all probabilities ---
        flat_probs = self.flat_pipeline.predict_proba([text])[0]

        # --- Combine: Constrain flat output to predicted groups ---
        predictions = []
        seen_codes = set()

        for s1_idx in s1_top_indices:
            group = str(self.group_encoder.inverse_transform([s1_idx])[0])
            group_confidence = float(s1_probs[s1_idx])

            # Get indices of flat classes that belong to this group
            group_indices = self.group_to_indices.get(group, [])
            if not group_indices:
                continue

            # Extract probabilities for this group's classes and pick top
            group_probs = [(idx, flat_probs[idx]) for idx in group_indices]
            group_probs.sort(key=lambda x: x[1], reverse=True)

            for flat_idx, flat_prob in group_probs[:2]:  # Top 2 from each group
                code = str(self.flat_encoder.inverse_transform([flat_idx])[0])
                if code in seen_codes:
                    continue
                seen_codes.add(code)

                # Combined confidence: group_confidence * within-group relative probability
                group_total = sum(flat_probs[i] for i in group_indices) or 1e-10
                within_group_share = flat_prob / group_total
                combined = group_confidence * within_group_share
                confidence = round(max(0.0, min(100.0, combined * 100)), 2)
                raw_probability = round(max(0.0, min(100.0, float(flat_prob) * 100)), 2)
                confidence_source = "model"

                if explicit_code and explicit_code == code:
                    confidence = max(confidence, self._explicit_code_confidence(combined))
                    confidence_source = "explicit_code"

                uraian = self.label_uraian_map.get(code)

                predictions.append({
                    "kode_klasifikasi": code,
                    "uraian": uraian,
                    "grup": group,
                    "confidence": confidence,
                    "raw_probability": raw_probability,
                    "confidence_source": confidence_source,
                })

            if len(predictions) >= 3:
                break

        # Sort by confidence, take top 3
        predictions.sort(key=lambda p: p["confidence"], reverse=True)
        predictions = predictions[:3]

        return {
            "success": True,
            "predictions": predictions,
            "top_prediction": predictions[0] if predictions else None,
        }

    def _predict_flat(self, text: str) -> dict:
        """Fallback: legacy flat single-stage prediction."""
        probabilities = self.flat_pipeline.predict_proba([text])[0]
        explicit_code, explicit_index = self._find_explicit_code(text)

        model_top_indices = list(np.argsort(probabilities)[::-1][:3])

        if explicit_index is not None:
            top_indices = [explicit_index] + [
                idx for idx in model_top_indices if idx != explicit_index
            ]
            top_indices = top_indices[:3]
        else:
            top_indices = model_top_indices

        confidence_scores = self._decision_confidences(probabilities, top_indices)

        predictions = []
        for position, idx in enumerate(top_indices):
            label = self.flat_encoder.inverse_transform([idx])[0]
            kode_klasifikasi, uraian = self._parse_label(label)
            raw_probability = round(max(0.0, min(100.0, float(probabilities[idx]) * 100)), 2)
            confidence = confidence_scores[position]
            confidence_source = "model"

            if explicit_index == idx and explicit_code:
                confidence = max(confidence, self._explicit_code_confidence(probabilities[idx]))
                confidence_source = "explicit_code"

            prediction = {
                "kode_klasifikasi": kode_klasifikasi,
                "uraian": uraian,
                "confidence": confidence,
                "raw_probability": raw_probability,
                "confidence_source": confidence_source,
            }
            predictions.append(prediction)

        return {
            "success": True,
            "predictions": predictions,
            "top_prediction": predictions[0] if predictions else None,
        }

    @staticmethod
    def _decision_confidences(probabilities, top_indices) -> list[float]:
        """
        Convert multiclass probabilities into user-facing decision confidence.

        With hundreds of labels, absolute probabilities can look tiny even when
        the top class is clearly separated. This score combines absolute model
        probability, top-k share, and the gap to the next candidate.
        """
        if len(top_indices) == 0:
            return []

        top_values = [max(0.0, float(probabilities[idx])) for idx in top_indices]
        top_mass = sum(top_values) or 1.0
        scores = []

        for position, value in enumerate(top_values):
            if position > 0:
                scores.append(round(max(0.0, min(100.0, value * 100)), 2))
                continue

            next_value = top_values[position + 1] if position + 1 < len(top_values) else 0.0
            share = value / top_mass
            margin = (value - next_value) / value if value > 0 else 0.0
            decision = (0.35 * value) + (0.45 * share) + (0.20 * max(0.0, margin))
            scores.append(round(max(0.0, min(100.0, decision * 100)), 2))

        return scores

    def _find_explicit_code(self, text: str) -> tuple[Optional[str], Optional[int]]:
        """Return a valid classification code found explicitly in OCR text."""
        code_to_index = self._code_to_label_index()

        if not code_to_index:
            return None, None

        for match in CODE_PATTERN.finditer(text):
            candidate = self._normalise_code_match(match)

            if candidate in code_to_index:
                return candidate, code_to_index[candidate]

        return None, None

    def _code_to_label_index(self) -> dict[str, int]:
        if self.flat_encoder is None:
            return {}

        return {
            self._parse_label(label)[0]: index
            for index, label in enumerate(self.flat_encoder.classes_)
        }

    @staticmethod
    def _parse_label(label: object) -> tuple[str, Optional[str]]:
        label_text = str(label or "").strip()
        parts = label_text.split("|", 1)
        kode_klasifikasi = normalize_training_label(parts[0])
        uraian = parts[1].strip() if len(parts) > 1 and parts[1].strip() else None

        return kode_klasifikasi, uraian

    @staticmethod
    def _normalise_code_match(match: re.Match) -> str:
        prefix = re.sub(r"[^A-Z]", "", match.group(1).upper())
        first = match.group(2).translate(DIGIT_TRANSLATION)
        second = match.group(3).translate(DIGIT_TRANSLATION) if match.group(3) else None

        if second:
            return f"{prefix}.{first}.{second}"

        return f"{prefix}.{first}"

    @staticmethod
    def _explicit_code_confidence(probability: float) -> float:
        """A visible valid code is stronger evidence than multiclass probability."""
        return round(max(90.0, min(99.0, 90.0 + (float(probability) * 10.0))), 2)

    @staticmethod
    def train(training_data_path: Optional[str] = None) -> dict:
        """
        Train the group-constrained classifier.

        Trains two models:
        1. Group classifier (Stage 1): Predicts the Level-1 group prefix
        2. Flat classifier: Predicts all fine-grained codes

        Also builds a mapping from each group to the indices of its codes
        in the flat classifier's label encoder.

        Args:
            training_data_path: Path to JSON training data file

        Returns:
            dict with training results
        """
        if training_data_path is None:
            training_data_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "data",
                "training_data.json",
            )

        if not os.path.exists(training_data_path):
            return {"success": False, "error": f"Training data not found: {training_data_path}"}

        # Load training data
        with open(training_data_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        texts = []
        labels = []
        uraian_map: dict[str, Optional[str]] = {}

        for item in data:
            text = str(item.get("text", "")).strip()
            raw_label = str(item.get("label", "")).strip()
            label = normalize_training_label(raw_label)

            if text and label:
                texts.append(text)
                labels.append(label)
                # Extract uraian from raw label if present
                if "|" in raw_label and label not in uraian_map:
                    uraian = raw_label.split("|", 1)[1].strip()
                    if uraian:
                        uraian_map[label] = uraian

        if len(texts) < 5:
            return {"success": False, "error": "Need at least 5 training samples"}

        # ---- Stage 1: Train group classifier ----
        groups = [extract_group(lbl) for lbl in labels]
        group_counts = Counter(groups)

        group_encoder = LabelEncoder()
        y_groups = group_encoder.fit_transform(groups)

        logger.info(
            "Stage 1 training: %d samples, %d groups: %s",
            len(texts), len(group_encoder.classes_),
            dict(sorted(group_counts.items())),
        )

        group_pipeline = build_classifier_pipeline(n_classes=len(group_encoder.classes_))
        group_pipeline.fit(texts, y_groups)
        stage1_accuracy = group_pipeline.score(texts, y_groups)

        # ---- Flat classifier: Train on all classes ----
        flat_encoder = LabelEncoder()
        y_flat = flat_encoder.fit_transform(labels)

        logger.info(
            "Flat classifier training: %d samples, %d classes",
            len(texts), len(flat_encoder.classes_),
        )

        flat_pipeline = build_flat_pipeline()
        flat_pipeline.fit(texts, y_flat)
        flat_accuracy = flat_pipeline.score(texts, y_flat)

        # ---- Build group-to-indices mapping ----
        group_to_indices: dict[str, list[int]] = defaultdict(list)
        for idx, code in enumerate(flat_encoder.classes_):
            group = extract_group(str(code))
            group_to_indices[group].append(idx)
        group_to_indices = dict(group_to_indices)

        # ---- Save bundled model ----
        os.makedirs(MODEL_DIR, exist_ok=True)
        bundle = {
            "group_pipeline": group_pipeline,
            "group_encoder": group_encoder,
            "flat_pipeline": flat_pipeline,
            "flat_encoder": flat_encoder,
            "group_to_indices": group_to_indices,
            "label_uraian_map": uraian_map,
        }
        joblib.dump(bundle, MODEL_PATH)

        # Also save legacy files for backward compatibility
        joblib.dump(flat_pipeline, LEGACY_PIPELINE_PATH)
        joblib.dump(flat_encoder, LEGACY_ENCODER_PATH)

        # Calculate group-constrained training accuracy
        group_preds = group_encoder.inverse_transform(group_pipeline.predict(texts))
        flat_probs = flat_pipeline.predict_proba(texts)
        correct = 0

        for i, (true_label, pred_group) in enumerate(zip(labels, group_preds)):
            indices = group_to_indices.get(pred_group, [])
            if not indices:
                continue
            # Pick the class with highest probability within the predicted group
            best_idx = max(indices, key=lambda idx: flat_probs[i][idx])
            pred_code = str(flat_encoder.classes_[best_idx])
            if pred_code == true_label:
                correct += 1

        combined_accuracy = correct / len(texts) if texts else 0.0

        return {
            "success": True,
            "samples": len(texts),
            "classes": len(set(labels)),
            "groups": len(group_encoder.classes_),
            "class_names": sorted(set(labels)),
            "group_names": list(group_encoder.classes_),
            "training_accuracy": round(combined_accuracy * 100, 2),
            "stage1_accuracy": round(stage1_accuracy * 100, 2),
            "flat_accuracy": round(flat_accuracy * 100, 2),
            "group_distribution": dict(sorted(group_counts.items())),
        }
