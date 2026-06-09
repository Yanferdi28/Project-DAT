"""
Evaluate document classifier quality with validation metrics.

Usage:
    python models/evaluate_classifier.py
    python models/evaluate_classifier.py --data ocr-service/data/training_data.generated.json
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import warnings
from collections import Counter
from datetime import datetime, timezone
from typing import Any

from sklearn.exceptions import UndefinedMetricWarning
from sklearn.metrics import accuracy_score
from sklearn.metrics import classification_report
from sklearn.metrics import confusion_matrix
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

OCR_SERVICE_DIR = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, OCR_SERVICE_DIR)

from services.classifier import build_classifier_pipeline  # noqa: E402

warnings.filterwarnings("ignore", category=UndefinedMetricWarning)
warnings.filterwarnings("ignore", message="The number of unique classes is greater than 50%")


def build_pipeline():
    """Build a pipeline that matches the production classifier."""
    return build_classifier_pipeline()


def top_confusions(matrix: Any, labels: list[str], top_n: int = 10) -> list[dict[str, Any]]:
    """Return the most frequent misclassification pairs from confusion matrix."""
    pairs: list[dict[str, Any]] = []

    for actual_idx, actual_label in enumerate(labels):
        for predicted_idx, predicted_label in enumerate(labels):
            if actual_idx == predicted_idx:
                continue

            count = int(matrix[actual_idx][predicted_idx])
            if count > 0:
                pairs.append(
                    {
                        "actual": actual_label,
                        "predicted": predicted_label,
                        "count": count,
                    }
                )

    pairs.sort(key=lambda item: item["count"], reverse=True)
    return pairs[:top_n]


def evaluate(data_path: str, test_size: float, random_state: int) -> dict[str, Any]:
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Training data not found: {data_path}")

    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    texts = [item["text"] for item in data if item.get("text") and item.get("label")]
    labels = [item["label"] for item in data if item.get("text") and item.get("label")]

    if len(texts) < 5:
        raise ValueError("Need at least 5 valid samples for evaluation")

    counts = Counter(labels)
    min_class_count = min(counts.values()) if counts else 0

    label_encoder = LabelEncoder()
    encoded = label_encoder.fit_transform(labels)

    # Baseline resubstitution metric for visibility (not for model selection).
    full_pipeline = build_pipeline()
    full_pipeline.fit(texts, encoded)
    train_pred = full_pipeline.predict(texts)

    report: dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "data_path": os.path.abspath(data_path),
        "samples": len(texts),
        "classes": len(label_encoder.classes_),
        "class_distribution": dict(sorted(counts.items(), key=lambda item: item[0])),
        "resubstitution": {
            "accuracy": round(float(accuracy_score(encoded, train_pred)), 4),
            "macro_f1": round(float(f1_score(encoded, train_pred, average="macro", zero_division=0)), 4),
        },
        "holdout": None,
    }

    if min_class_count < 2 or len(label_encoder.classes_) < 2:
        report["holdout"] = {
            "available": False,
            "reason": "Holdout stratified split needs at least 2 samples in every class.",
            "min_class_count": int(min_class_count),
        }
        return report

    X_train, X_test, y_train, y_test = train_test_split(
        texts,
        encoded,
        test_size=test_size,
        random_state=random_state,
        stratify=encoded,
    )

    eval_pipeline = build_pipeline()
    eval_pipeline.fit(X_train, y_train)
    y_pred = eval_pipeline.predict(X_test)

    class_names = [str(name) for name in label_encoder.classes_]

    c_report = classification_report(
        y_test,
        y_pred,
        target_names=class_names,
        output_dict=True,
        zero_division=0,
    )

    cm = confusion_matrix(y_test, y_pred)

    report["holdout"] = {
        "available": True,
        "test_size": test_size,
        "random_state": random_state,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "macro_f1": round(float(f1_score(y_test, y_pred, average="macro", zero_division=0)), 4),
        "weighted_f1": round(float(f1_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
        "classification_report": c_report,
        "confusion_matrix": {
            "labels": class_names,
            "matrix": cm.tolist(),
            "top_confusions": top_confusions(cm, class_names),
        },
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

    args = parser.parse_args()

    result = evaluate(args.data, args.test_size, args.random_state)

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print("Evaluation completed")
    print(f"Report: {os.path.abspath(args.output)}")
    print(f"Samples: {result['samples']}")
    print(f"Classes: {result['classes']}")
    print(f"Resubstitution accuracy: {result['resubstitution']['accuracy']}")
    print(f"Resubstitution macro_f1: {result['resubstitution']['macro_f1']}")

    holdout = result.get("holdout") or {}
    if holdout.get("available"):
        print(f"Holdout accuracy: {holdout['accuracy']}")
        print(f"Holdout macro_f1: {holdout['macro_f1']}")
        print(f"Holdout weighted_f1: {holdout['weighted_f1']}")
    else:
        print("Holdout evaluation unavailable:", holdout.get("reason", "Unknown reason"))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
