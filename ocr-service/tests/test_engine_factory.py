from services.engine_factory import VALID_ENGINES, get_default_engine_name


def test_valid_engines_is_tesseract_only():
    assert VALID_ENGINES == ("tesseract",)


def test_default_engine_falls_back_to_tesseract(monkeypatch):
    monkeypatch.setenv("OCR_ENGINE", "paddleocr")
    monkeypatch.delenv("OCR_DEFAULT_ENGINE", raising=False)

    assert get_default_engine_name() == "tesseract"


def test_default_engine_uses_tesseract_env(monkeypatch):
    monkeypatch.setenv("OCR_ENGINE", "tesseract")
    monkeypatch.delenv("OCR_DEFAULT_ENGINE", raising=False)

    assert get_default_engine_name() == "tesseract"
