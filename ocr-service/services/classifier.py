"""
Document Classifier using TF-IDF + Naive Bayes / SVM
Classifies extracted text into document categories.
"""

import os
import json
import joblib
import numpy as np
from typing import Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import Pipeline


MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")


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
                print(f"Error loading model: {e}")
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

            # Get top 3 predictions
            top_indices = np.argsort(probabilities)[::-1][:3]

            predictions = []
            for idx in top_indices:
                label = self.label_encoder.inverse_transform([idx])[0]
                confidence = round(float(probabilities[idx]) * 100, 2)

                # Parse label: format is "kode_klasifikasi|uraian"
                parts = label.split("|", 1)
                prediction = {
                    "kode_klasifikasi": parts[0] if len(parts) > 0 else None,
                    "uraian": parts[1] if len(parts) > 1 else label,
                    "confidence": confidence,
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

        # Create pipeline: TF-IDF + Naive Bayes
        pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                max_features=5000,
                ngram_range=(1, 2),
                min_df=1,
                max_df=0.95,
                sublinear_tf=True,
            )),
            ("classifier", MultinomialNB(alpha=0.1)),
        ])

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
