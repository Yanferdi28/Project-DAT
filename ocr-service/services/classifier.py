"""
Document Classifier using word and character TF-IDF + Logistic Regression
Classifies extracted text into document categories.
"""

import logging
import os
import json
import joblib
import numpy as np
import re
from typing import Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import FeatureUnion, Pipeline

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


def build_classifier_pipeline() -> Pipeline:
    """Build a text classifier that is more robust to OCR noise."""
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
                ngram_range=(3, 5),
                min_df=1,
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
    """Classifies document text into predefined categories."""

    def __init__(self):
        self.pipeline: Optional[Pipeline] = None
        self.label_encoder: Optional[LabelEncoder] = None
        self.is_loaded = False
        self._load_model()

    def _load_model(self):
        """Load trained model from disk if available."""
        pipeline_path = os.path.join(MODEL_DIR, "classifier_pipeline.pkl")
        encoder_path = os.path.join(MODEL_DIR, "label_encoder.pkl")

        if os.path.exists(pipeline_path) and os.path.exists(encoder_path):
            try:
                self.pipeline = joblib.load(pipeline_path)
                self.label_encoder = joblib.load(encoder_path)
                self.is_loaded = True
            except Exception as e:
                logger.error("Error loading model: %s", e)
                self.is_loaded = False

    def predict(self, text: str) -> dict:
        """
        Predict document category from text.

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
            # Get probability predictions
            probabilities = self.pipeline.predict_proba([text])[0]
            explicit_code, explicit_index = self._find_explicit_code(text)

            # Get top 3 predictions
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
                label = self.label_encoder.inverse_transform([idx])[0]
                raw_probability = round(max(0.0, min(100.0, float(probabilities[idx]) * 100)), 2)
                confidence = confidence_scores[position]
                confidence_source = "model"

                if explicit_index == idx and explicit_code:
                    confidence = max(confidence, self._explicit_code_confidence(probabilities[idx]))
                    confidence_source = "explicit_code"

                # Parse label: format is "kode_klasifikasi|uraian"
                parts = label.split("|", 1)
                prediction = {
                    "kode_klasifikasi": parts[0] if len(parts) > 0 else None,
                    "uraian": parts[1] if len(parts) > 1 else label,
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

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "predictions": [],
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
        if self.label_encoder is None:
            return {}

        return {
            str(label).split("|", 1)[0]: index
            for index, label in enumerate(self.label_encoder.classes_)
        }

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
        Train the classifier from training data.

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

        texts = [item["text"] for item in data]
        labels = [item["label"] for item in data]

        if len(texts) < 5:
            return {"success": False, "error": "Need at least 5 training samples"}

        # Create label encoder
        label_encoder = LabelEncoder()
        y = label_encoder.fit_transform(labels)

        pipeline = build_classifier_pipeline()

        # Train
        pipeline.fit(texts, y)

        # Save model
        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump(pipeline, os.path.join(MODEL_DIR, "classifier_pipeline.pkl"))
        joblib.dump(label_encoder, os.path.join(MODEL_DIR, "label_encoder.pkl"))

        # Calculate training accuracy
        train_accuracy = pipeline.score(texts, y)

        return {
            "success": True,
            "samples": len(texts),
            "classes": len(label_encoder.classes_),
            "class_names": list(label_encoder.classes_),
            "training_accuracy": round(train_accuracy * 100, 2),
        }
