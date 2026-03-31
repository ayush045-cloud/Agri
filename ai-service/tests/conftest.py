"""
Shared fixtures for the AI-service test suite.
The FastAPI TestClient starts the full app (including the lifespan that loads ML
models) once per session.  Models fall back to heuristics since no weight files
exist, but the service still returns valid responses.
"""

import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

# Ensure ai-service root is on the path (pytest.ini sets pythonpath = . already,
# but adding it here makes the suite runnable with plain "python -m pytest" too).
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app


@pytest.fixture(scope="session")
def client():
    """Single TestClient instance shared across all tests in the session."""
    with TestClient(app) as c:
        yield c


def make_png_bytes(color: tuple = (0, 200, 0), size: tuple = (100, 100)) -> bytes:
    """Create a minimal valid PNG image and return its raw bytes."""
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def make_jpeg_bytes(color: tuple = (0, 200, 0), size: tuple = (100, 100)) -> bytes:
    """Create a minimal valid JPEG image and return its raw bytes."""
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()
