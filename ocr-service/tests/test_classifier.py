import numpy as np

from services.classifier import DocumentClassifier


class DummyEncoder:
    classes_ = np.array([
        "HM.01.03|Dengar Pendapat (RDP) Komisi I DPR RI",
        "KP.04.04|Kenaikan Pangkat Struktural dan Fungsional",
        "UM.01.01|Administrasi Persuratan",
    ])

    def inverse_transform(self, indices):
        return [self.classes_[index] for index in indices]


class DummyPipeline:
    def predict_proba(self, texts):
        return np.array([[0.01, 0.61, 0.38]])


def make_classifier():
    """Create a classifier with dummy models for testing.

    Uses the flat_pipeline/flat_encoder (legacy mode) since
    group_pipeline is None — this triggers single-stage fallback.
    """
    classifier = DocumentClassifier.__new__(DocumentClassifier)
    classifier.flat_pipeline = DummyPipeline()
    classifier.flat_encoder = DummyEncoder()
    classifier.group_pipeline = None
    classifier.group_encoder = None
    classifier.group_to_indices = {}
    classifier.label_uraian_map = {}
    classifier.is_loaded = True
    return classifier


def test_explicit_code_is_normalised_from_compact_ocr_text():
    classifier = make_classifier()

    code, index = classifier._find_explicit_code("Nomor: 123/HM.O1O3/VI/2026")

    assert code == "HM.01.03"
    assert index == 0


def test_explicit_code_becomes_top_prediction_with_high_confidence():
    classifier = make_classifier()

    result = classifier.predict("Nomor surat: 123/HM.0103/VI/2026 tentang rapat dengar pendapat")

    assert result["success"] is True
    assert result["top_prediction"]["kode_klasifikasi"] == "HM.01.03"
    assert result["top_prediction"]["confidence"] >= 90
    assert result["top_prediction"]["confidence_source"] == "explicit_code"
    assert result["top_prediction"]["raw_probability"] == 1.0
