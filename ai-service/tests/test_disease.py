"""Tests for POST /disease/detect"""

from .conftest import make_png_bytes, make_jpeg_bytes


# ── Happy-path tests ──────────────────────────────────────────────────────────

def test_detect_returns_200_for_valid_png(client):
    res = client.post(
        "/disease/detect",
        files={"image": ("leaf.png", make_png_bytes(), "image/png")},
    )
    assert res.status_code == 200


def test_detect_returns_200_for_valid_jpeg(client):
    res = client.post(
        "/disease/detect",
        files={"image": ("leaf.jpg", make_jpeg_bytes(), "image/jpeg")},
    )
    assert res.status_code == 200


def test_detect_response_has_required_fields(client):
    res = client.post(
        "/disease/detect",
        files={"image": ("leaf.png", make_png_bytes(), "image/png")},
    )
    data = res.json()
    assert "type" in data
    assert "disease" in data
    assert "confidence" in data
    assert "description" in data
    assert "class_index" in data


def test_detect_type_is_valid_value(client):
    res = client.post(
        "/disease/detect",
        files={"image": ("leaf.png", make_png_bytes(), "image/png")},
    )
    assert res.json()["type"] in ("healthy", "warning", "danger")


def test_detect_confidence_is_between_0_and_100(client):
    res = client.post(
        "/disease/detect",
        files={"image": ("leaf.png", make_png_bytes(), "image/png")},
    )
    conf = res.json()["confidence"]
    assert 0.0 <= conf <= 100.0


def test_detect_class_index_is_non_negative_int(client):
    res = client.post(
        "/disease/detect",
        files={"image": ("leaf.png", make_png_bytes(), "image/png")},
    )
    idx = res.json()["class_index"]
    assert isinstance(idx, int)
    assert idx >= 0


def test_detect_green_image_is_healthy(client):
    """A pure-green image should be classified as healthy by the heuristic."""
    green_img = make_png_bytes(color=(0, 200, 0))
    res = client.post(
        "/disease/detect",
        files={"image": ("green.png", green_img, "image/png")},
    )
    assert res.status_code == 200
    assert res.json()["type"] == "healthy"


def test_detect_brown_image_triggers_blight(client):
    """A predominantly brown image should trigger the blight (danger) detection."""
    brown_img = make_png_bytes(color=(160, 70, 40))
    res = client.post(
        "/disease/detect",
        files={"image": ("brown.png", brown_img, "image/png")},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["type"] == "danger"
    assert data["class_index"] == 1  # Leaf Blight


def test_detect_treatment_is_present_for_danger(client):
    brown_img = make_png_bytes(color=(160, 70, 40))
    res = client.post(
        "/disease/detect",
        files={"image": ("brown.png", brown_img, "image/png")},
    )
    data = res.json()
    assert data["type"] == "danger"
    assert data["treatment"] is not None
    assert len(data["treatment"]) > 0


def test_detect_treatment_is_null_for_healthy(client):
    green_img = make_png_bytes(color=(0, 200, 0))
    res = client.post(
        "/disease/detect",
        files={"image": ("green.png", green_img, "image/png")},
    )
    data = res.json()
    assert data["type"] == "healthy"
    assert data["treatment"] is None


# ── Validation / error tests ──────────────────────────────────────────────────

def test_detect_rejects_pdf_content_type(client):
    res = client.post(
        "/disease/detect",
        files={"image": ("doc.pdf", b"fake pdf", "application/pdf")},
    )
    assert res.status_code == 422


def test_detect_rejects_text_plain(client):
    res = client.post(
        "/disease/detect",
        files={"image": ("notes.txt", b"not an image", "text/plain")},
    )
    assert res.status_code == 422


def test_detect_returns_422_for_corrupt_image_bytes(client):
    res = client.post(
        "/disease/detect",
        files={"image": ("bad.png", b"\x00\x01\x02\x03corrupt", "image/png")},
    )
    assert res.status_code == 422


def test_detect_requires_image_field(client):
    """Sending no file at all should result in a 422 validation error."""
    res = client.post("/disease/detect")
    assert res.status_code == 422
