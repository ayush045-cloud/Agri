"""Tests for GET /health"""


def test_health_returns_200(client):
    res = client.get("/health")
    assert res.status_code == 200


def test_health_returns_ok_status(client):
    res = client.get("/health")
    data = res.json()
    assert data["status"] == "ok"


def test_health_returns_service_name(client):
    res = client.get("/health")
    data = res.json()
    assert "service" in data
    assert "agro" in data["service"].lower()


def test_health_content_type_is_json(client):
    res = client.get("/health")
    assert "application/json" in res.headers["content-type"]
