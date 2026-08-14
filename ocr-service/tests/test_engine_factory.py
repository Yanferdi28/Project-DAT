from services.engine_factory import VALID_ENGINES, get_default_engine_name


def test_valid_engines():
    assert VALID_ENGINES == ("tesseract", "easyocr", "paddleocr")


def test_default_engine_falls_back_to_tesseract(monkeypatch):
    monkeypatch.setenv("OCR_ENGINE", "invalid_engine")
    monkeypatch.delenv("OCR_DEFAULT_ENGINE", raising=False)

    assert get_default_engine_name() == "tesseract"


def test_default_engine_supports_paddleocr(monkeypatch):
    monkeypatch.setenv("OCR_ENGINE", "paddleocr")
    monkeypatch.delenv("OCR_DEFAULT_ENGINE", raising=False)

    assert get_default_engine_name() == "paddleocr"

