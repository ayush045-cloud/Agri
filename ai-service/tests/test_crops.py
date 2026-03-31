"""Tests for POST /crops/recommend"""

import pytest


# ── Shared valid payloads ─────────────────────────────────────────────────────

RABI_PAYLOAD = {
    "soil": "loamy", "ph": 6.5, "rainfall": 600.0, "temp": 18.0,
    "region": "Punjab", "season": "rabi", "nitrogen": 60.0, "water": "medium",
}

KHARIF_PAYLOAD = {
    "soil": "clay", "ph": 6.0, "rainfall": 1200.0, "temp": 28.0,
    "region": "Bihar", "season": "kharif", "nitrogen": 40.0, "water": "high",
}

ZAID_PAYLOAD = {
    "soil": "sandy", "ph": 6.8, "rainfall": 200.0, "temp": 32.0,
    "region": "Rajasthan", "season": "zaid", "nitrogen": 30.0, "water": "low",
}


# ── Response shape ────────────────────────────────────────────────────────────

def test_recommend_returns_200_for_rabi(client):
    res = client.post("/crops/recommend", json=RABI_PAYLOAD)
    assert res.status_code == 200


def test_recommend_returns_200_for_kharif(client):
    res = client.post("/crops/recommend", json=KHARIF_PAYLOAD)
    assert res.status_code == 200


def test_recommend_returns_200_for_zaid(client):
    res = client.post("/crops/recommend", json=ZAID_PAYLOAD)
    assert res.status_code == 200


def test_recommend_response_has_crops_and_summary(client):
    res = client.post("/crops/recommend", json=RABI_PAYLOAD)
    data = res.json()
    assert "crops" in data
    assert "summary" in data


def test_recommend_crops_is_non_empty_list(client):
    res = client.post("/crops/recommend", json=RABI_PAYLOAD)
    crops = res.json()["crops"]
    assert isinstance(crops, list)
    assert len(crops) > 0


def test_recommend_returns_at_most_6_crops(client):
    res = client.post("/crops/recommend", json=RABI_PAYLOAD)
    assert len(res.json()["crops"]) <= 6


def test_recommend_each_crop_has_required_fields(client):
    res = client.post("/crops/recommend", json=RABI_PAYLOAD)
    for crop in res.json()["crops"]:
        assert "name" in crop
        assert "emoji" in crop
        assert "score" in crop
        assert "why" in crop


def test_recommend_scores_are_in_valid_range(client):
    res = client.post("/crops/recommend", json=RABI_PAYLOAD)
    for crop in res.json()["crops"]:
        assert 0 <= crop["score"] <= 99


def test_recommend_summary_mentions_top_crop(client):
    res = client.post("/crops/recommend", json=RABI_PAYLOAD)
    data = res.json()
    top_crop = data["crops"][0]["name"]
    assert top_crop in data["summary"]


def test_recommend_summary_mentions_region(client):
    res = client.post("/crops/recommend", json=RABI_PAYLOAD)
    assert "Punjab" in res.json()["summary"]


# ── Seasonal correctness ──────────────────────────────────────────────────────

def test_rabi_includes_wheat(client):
    res = client.post("/crops/recommend", json=RABI_PAYLOAD)
    names = [c["name"] for c in res.json()["crops"]]
    assert "Wheat" in names


def test_kharif_includes_rice(client):
    res = client.post("/crops/recommend", json=KHARIF_PAYLOAD)
    names = [c["name"] for c in res.json()["crops"]]
    assert "Rice" in names


def test_zaid_includes_a_summer_crop(client):
    """Zaid season should return at least one heat-tolerant crop."""
    res = client.post("/crops/recommend", json=ZAID_PAYLOAD)
    names = [c["name"] for c in res.json()["crops"]]
    summer_crops = {"Maize", "Groundnut", "Sunflower", "Sugarcane", "Spinach", "Methi"}
    assert bool(summer_crops & set(names))


# ── Default values ────────────────────────────────────────────────────────────

def test_recommend_uses_defaults_for_missing_optional_fields(client):
    """Sending only required fields (all have defaults) still returns a valid response."""
    res = client.post("/crops/recommend", json={})
    assert res.status_code == 200
    assert len(res.json()["crops"]) > 0


# ── Validation errors ─────────────────────────────────────────────────────────

def test_recommend_rejects_ph_out_of_range(client):
    payload = {**RABI_PAYLOAD, "ph": 15.0}
    res = client.post("/crops/recommend", json=payload)
    assert res.status_code == 422


def test_recommend_rejects_negative_rainfall(client):
    payload = {**RABI_PAYLOAD, "rainfall": -100.0}
    res = client.post("/crops/recommend", json=payload)
    assert res.status_code == 422


def test_recommend_rejects_negative_nitrogen(client):
    payload = {**RABI_PAYLOAD, "nitrogen": -5.0}
    res = client.post("/crops/recommend", json=payload)
    assert res.status_code == 422
