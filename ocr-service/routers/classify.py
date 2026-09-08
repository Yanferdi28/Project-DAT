"""
Classification Router - Handles document classification endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.classifier import DocumentClassifier
from services.text_extractor import TextFieldExtractor
from services.llm_extractor import LLMExtractor

router = APIRouter()

classifier = DocumentClassifier()
extractor = TextFieldExtractor()
llm_extractor = LLMExtractor()


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

    # Try LLM extraction first if configured
    extracted_fields = llm_extractor.extract_all(request.text)
    
    # Fallback to regex extraction if LLM is not configured or fails
    if not extracted_fields:
        extractor_instance = TextFieldExtractor()
        extracted_fields = extractor_instance.extract_all(request.text)

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
    status = {
        "model_loaded": classifier.is_loaded,
        "status": "ready" if classifier.is_loaded else "not_trained",
        "architecture": "two_stage" if classifier._is_two_stage else "single_stage",
    }
    if classifier._is_two_stage:
        status["groups"] = len(classifier.stage1_encoder.classes_) if classifier.stage1_encoder else 0
        status["stage2_classifiers"] = len(classifier.stage2_pipelines)
    return status
