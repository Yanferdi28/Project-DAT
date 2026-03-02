"""
Training script for the document classifier.
Run this script to train or retrain the classification model.

Usage:
    python train_classifier.py
"""

import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from services.classifier import DocumentClassifier


def main():
    print("=" * 60)
    print("Document Classifier Training")
    print("=" * 60)

    data_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data",
        "training_data.json",
    )

    print(f"\nTraining data: {data_path}")

    if not os.path.exists(data_path):
        print("ERROR: Training data file not found!")
        sys.exit(1)

    print("\nTraining model...")
    result = DocumentClassifier.train(data_path)

    if result["success"]:
        print(f"\n✓ Training completed successfully!")
        print(f"  Samples: {result['samples']}")
        print(f"  Classes: {result['classes']}")
        print(f"  Training Accuracy: {result['training_accuracy']}%")
        print(f"\n  Categories:")
        for name in result["class_names"]:
            print(f"    - {name}")
        print(f"\nModel saved to: {os.path.join(os.path.dirname(__file__))}")
    else:
        print(f"\n✗ Training failed: {result['error']}")
        sys.exit(1)


if __name__ == "__main__":
    main()
