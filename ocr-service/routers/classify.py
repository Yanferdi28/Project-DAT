"""
Classification Router - Handles document classification endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.classifier import DocumentClassifier
from services.text_extractor import TextFieldExtractor

router = APIRouter()

classifier = DocumentClassifier()
extractor = TextFieldExtractor()


class ClassifyRequest(BaseModel):
    text: str


class TrainRequest(BaseModel):
    training_data_path: Optional[str] = None


@router.post("/predict")
async def predict_category(request: ClassifyRequest):
    """
    Predict document category from extracted text.

    Args:
        request: JSON body with 'text' field

    Returns:
        JSON with top predictions and confidence scores
    """
    if not request.text or len(request.text.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Text too short for classification. Minimum 10 characters required.",
        )

    # Always extract structured fields from the text, regardless of classification
    extracted_fields = extractor.extract_all(request.text)

    result = classifier.predict(request.text)

    # Always include extracted_fields, even if classification fails
    result["extracted_fields"] = extracted_fields

    return result


@router.post("/train")
async def train_model(request: TrainRequest = TrainRequest()):
    """
    Train or retrain the classification model.

    Args:
        request: Optional path to training data JSON file

    Returns:
        JSON with training results
    """
    result = DocumentClassifier.train(request.training_data_path)

    if not result["success"]:
        raise HTTPException(status_code=422, detail=result["error"])

    # Reload the classifier with new model
    global classifier
    classifier = DocumentClassifier()

    return result


@router.get("/status")
async def classifier_status():
    """Check if classification model is trained and ready."""
    return {
        "model_loaded": classifier.is_loaded,
        "status": "ready" if classifier.is_loaded else "not_trained",
    }
