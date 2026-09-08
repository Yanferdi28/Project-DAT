"""
Evaluate the group-constrained document classifier quality.

Reports:
    - Stage 1 (group): How well the classifier predicts the document group.
    - Flat (unconstrained): Baseline flat classifier accuracy over all classes.
    - Group-constrained: Combined accuracy — group prediction constrains
      the flat classifier's output to only consider classes in that group.

Usage:
    .\\ocr-service\\.venv\\Scripts\\python.exe .\\ocr-service\\models\\evaluate_classifier.py --data .\\ocr-service\\data\\training_data.json
    ./ocr-service/.venv/bin/python ocr-service/models/evaluate_classifier.py --data ocr-service/data/training_data.json
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import warnings
from collections import Counter, defaultdict
from datetime import datetime, timezone
from typing import Any

from sklearn.exceptions import UndefinedMetricWarning
from sklearn.metrics import accuracy_score
from sklearn.metrics import classification_report
from sklearn.metrics import f1_score
from sklearn.model_selection import cross_validate
from sklearn.model_selection import StratifiedKFold
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

OCR_SERVICE_DIR = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, OCR_SERVICE_DIR)

from services.classifier import build_classifier_pipeline  # noqa: E402
from services.classifier import build_flat_pipeline  # noqa: E402
from services.classifier import normalize_training_label  # noqa: E402
from services.classifier import extract_group  # noqa: E402

warnings.filterwarnings("ignore", category=UndefinedMetricWarning)
warnings.filterwarnings("ignore", message="The number of unique classes is greater than 50%")


def load_training_rows(data_path: str) -> tuple[list[str], list[str]]:
    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    rows = [
        (
            str(item.get("text", "")).strip(),
            normalize_training_label(item.get("label")),
        )
        for item in data
        if isinstance(item, dict)
    ]

    texts = [text for text, label in rows if text and label]
    labels = [label for text, label in rows if text and label]

    return texts, labels


def metric_summary(values: Any) -> dict[str, Any]:
    return {
        "mean": round(float(values.mean()), 4),
        "std": round(float(values.std()), 4),
        "folds": [round(float(value), 4) for value in values],
    }


def _compute_top_confusions(true_labels: list[str], pred_labels: list[str], top_n: int = 10) -> list[dict]:
    """Compute top misclassification pairs."""
    pairs: Counter = Counter()
    for true, pred in zip(true_labels, pred_labels):
        if true != pred:
            pairs[(true, pred)] += 1

    return [
        {"actual": actual, "predicted": predicted, "count": count}
        for (actual, predicted), count in pairs.most_common(top_n)
    ]


def evaluate(data_path: str, test_size: float, random_state: int, cv_folds: int) -> dict[str, Any]:
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Training data not found: {data_path}")

    texts, labels = load_training_rows(data_path)

    if len(texts) < 5:
        raise ValueError("Need at least 5 valid samples for evaluation")

    groups = [extract_group(lbl) for lbl in labels]
    group_counts = Counter(groups)
    label_counts = Counter(labels)
    min_group_count = min(group_counts.values()) if group_counts else 0
    min_class_count = min(label_counts.values()) if label_counts else 0

    report: dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "data_path": os.path.abspath(data_path),
        "samples": len(texts),
        "detail_classes": len(set(labels)),
        "group_classes": len(set(groups)),
        "group_distribution": dict(sorted(group_counts.items())),
    }

    # ---- Stage 1: Group-level evaluation ----
    group_encoder = LabelEncoder()
    y_groups = group_encoder.fit_transform(groups)

    s1_full = build_classifier_pipeline(n_classes=len(group_encoder.classes_))
    s1_full.fit(texts, y_groups)
    s1_full_pred = s1_full.predict(texts)

    report["stage1_resubstitution"] = {
        "accuracy": round(float(accuracy_score(y_groups, s1_full_pred)), 4),
        "macro_f1": round(float(f1_score(y_groups, s1_full_pred, average="macro", zero_division=0)), 4),
    }

    # ---- Flat classifier: Resubstitution ----
    flat_encoder = LabelEncoder()
    y_flat = flat_encoder.fit_transform(labels)

    flat_full = build_flat_pipeline()
    flat_full.fit(texts, y_flat)
    flat_full_pred = flat_full.predict(texts)

    report["flat_resubstitution"] = {
        "accuracy": round(float(accuracy_score(y_flat, flat_full_pred)), 4),
        "macro_f1": round(float(f1_score(y_flat, flat_full_pred, average="macro", zero_division=0)), 4),
    }

    # ---- Holdout evaluation ----
    if min_group_count >= 2 and min_class_count >= 2:
        # Split data
        (
            X_train, X_test,
            y_groups_train, y_groups_test,
            y_flat_train, y_flat_test,
            groups_train, groups_test,
            labels_train, labels_test,
        ) = train_test_split(
            texts, y_groups, y_flat, groups, labels,
            test_size=test_size,
            random_state=random_state,
            stratify=y_flat,
        )

        # Train Stage 1 on train split
        s1_eval = build_classifier_pipeline(n_classes=len(group_encoder.classes_))
        s1_eval.fit(X_train, y_groups_train)
        s1_pred = s1_eval.predict(X_test)
        s1_pred_groups = group_encoder.inverse_transform(s1_pred)

        group_names = [str(name) for name in group_encoder.classes_]

        report["stage1_holdout"] = {
            "available": True,
            "test_size": test_size,
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "accuracy": round(float(accuracy_score(y_groups_test, s1_pred)), 4),
            "macro_f1": round(float(f1_score(y_groups_test, s1_pred, average="macro", zero_division=0)), 4),
            "weighted_f1": round(float(f1_score(y_groups_test, s1_pred, average="weighted", zero_division=0)), 4),
        }

        # Train flat classifier on train split
        flat_eval = build_flat_pipeline()
        flat_eval.fit(X_train, y_flat_train)
        flat_pred = flat_eval.predict(X_test)

        report["flat_holdout"] = {
            "available": True,
            "accuracy": round(float(accuracy_score(y_flat_test, flat_pred)), 4),
            "macro_f1": round(float(f1_score(y_flat_test, flat_pred, average="macro", zero_division=0)), 4),
            "weighted_f1": round(float(f1_score(y_flat_test, flat_pred, average="weighted", zero_division=0)), 4),
        }

        # ---- Group-constrained evaluation ----
        # Build group-to-indices mapping from training data
        group_to_indices: dict[str, list[int]] = defaultdict(list)
        for idx, code in enumerate(flat_encoder.classes_):
            group = extract_group(str(code))
            group_to_indices[group].append(idx)

        flat_probs = flat_eval.predict_proba(X_test)

        gc_true = []
        gc_pred = []

        for i, (true_label, pred_group) in enumerate(zip(labels_test, s1_pred_groups)):
            indices = group_to_indices.get(pred_group, [])
            if indices:
                best_idx = max(indices, key=lambda idx: flat_probs[i][idx])
                pred_code = str(flat_encoder.classes_[best_idx])
            else:
                # Fallback to unconstrained prediction
                pred_code = str(flat_encoder.inverse_transform([flat_pred[i]])[0])

            gc_true.append(true_label)
            gc_pred.append(pred_code)

        gc_correct = sum(1 for t, p in zip(gc_true, gc_pred) if t == p)

        report["group_constrained_holdout"] = {
            "available": True,
            "accuracy": round(gc_correct / len(gc_true), 4) if gc_true else 0,
            "top_confusions": _compute_top_confusions(gc_true, gc_pred),
        }

        # Stage 1 CV
        if cv_folds > 1 and min_group_count >= cv_folds:
            splitter = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=random_state)
            cv_scores = cross_validate(
                build_classifier_pipeline(n_classes=len(group_encoder.classes_)),
                texts, y_groups, cv=splitter,
                scoring={"accuracy": "accuracy", "macro_f1": "f1_macro", "weighted_f1": "f1_weighted"},
            )
            report["stage1_cv"] = {
                "available": True,
                "folds": cv_folds,
                "accuracy": metric_summary(cv_scores["test_accuracy"]),
                "macro_f1": metric_summary(cv_scores["test_macro_f1"]),
                "weighted_f1": metric_summary(cv_scores["test_weighted_f1"]),
            }

        # Flat CV
        if cv_folds > 1 and min_class_count >= cv_folds:
            splitter = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=random_state)
            cv_scores = cross_validate(
                build_flat_pipeline(),
                texts, y_flat, cv=splitter,
                scoring={"accuracy": "accuracy", "macro_f1": "f1_macro", "weighted_f1": "f1_weighted"},
            )
            report["flat_cv"] = {
                "available": True,
                "folds": cv_folds,
                "accuracy": metric_summary(cv_scores["test_accuracy"]),
                "macro_f1": metric_summary(cv_scores["test_macro_f1"]),
                "weighted_f1": metric_summary(cv_scores["test_weighted_f1"]),
            }

    else:
        report["stage1_holdout"] = {
            "available": False,
            "reason": "Not enough samples per class for stratified split.",
        }

    return report


def main() -> int:
    parser = argparse.ArgumentParser(description="Evaluate OCR document classifier")
    parser.add_argument(
        "--data",
        default=os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "training_data.json"),
        help="Path to training data JSON",
    )
    parser.add_argument(
        "--output",
        default=os.path.join(os.path.dirname(__file__), "evaluation_report.json"),
        help="Path to save evaluation report JSON",
    )
    parser.add_argument("--test-size", type=float, default=0.2, help="Test split ratio")
    parser.add_argument("--random-state", type=int, default=42, help="Random seed")
    parser.add_argument("--cv-folds", type=int, default=0, help="Run stratified cross validation with N folds")

    args = parser.parse_args()

    result = evaluate(args.data, args.test_size, args.random_state, max(args.cv_folds, 0))

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print("=" * 60)
    print("EVALUATION COMPLETED")
    print("=" * 60)
    print(f"Report: {os.path.abspath(args.output)}")
    print(f"Samples: {result.get('samples')}")
    print(f"Groups: {result.get('group_classes')}")
    print(f"Detail classes: {result.get('detail_classes')}")

    # Resubstitution
    s1_r = result.get("stage1_resubstitution", {})
    f_r = result.get("flat_resubstitution", {})
    print(f"\n--- RESUBSTITUTION ---")
    print(f"Stage 1 (group) accuracy: {s1_r.get('accuracy')}")
    print(f"Flat (all classes) accuracy: {f_r.get('accuracy')}")

    # Holdout
    s1_h = result.get("stage1_holdout", {})
    f_h = result.get("flat_holdout", {})
    gc_h = result.get("group_constrained_holdout", {})

    if s1_h.get("available"):
        print(f"\n--- HOLDOUT (test_size={s1_h.get('test_size')}) ---")
        print(f"Stage 1 (group) accuracy:            {s1_h['accuracy']}")
        print(f"Stage 1 (group) macro_f1:             {s1_h['macro_f1']}")

    if f_h.get("available"):
        print(f"Flat (unconstrained) accuracy:        {f_h['accuracy']}")
        print(f"Flat (unconstrained) macro_f1:        {f_h['macro_f1']}")

    if gc_h.get("available"):
        print(f"*** GROUP-CONSTRAINED accuracy:       {gc_h['accuracy']} ***")

    # CV
    s1_cv = result.get("stage1_cv", {})
    f_cv = result.get("flat_cv", {})

    if s1_cv.get("available"):
        print(f"\n--- CROSS-VALIDATION ({s1_cv['folds']}-fold) ---")
        print(f"Stage 1 (group) CV accuracy:  {s1_cv['accuracy']['mean']} +/- {s1_cv['accuracy']['std']}")

    if f_cv.get("available"):
        print(f"Flat CV accuracy:             {f_cv['accuracy']['mean']} +/- {f_cv['accuracy']['std']}")

    print("=" * 60)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
