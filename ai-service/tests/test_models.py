"""
Unit tests for DiseaseModel and CropModel classes.
These test the model logic directly, independent of the HTTP layer.
"""

import pytest
from PIL import Image

from app.models.disease_model import DiseaseModel, CLASS_MAP
from app.models.crop_model import CropModel, _score


# ══════════════════════════════════════════════════════════════════════════════
# DiseaseModel
# ══════════════════════════════════════════════════════════════════════════════

class TestDiseaseModel:
    @pytest.fixture(scope="class")
    def model(self):
        return DiseaseModel()

    def test_predict_returns_dict(self, model):
        img = Image.new("RGB", (100, 100), color=(0, 200, 0))
        result = model.predict(img)
        assert isinstance(result, dict)

    def test_predict_has_all_required_keys(self, model):
        img = Image.new("RGB", (100, 100), color=(0, 200, 0))
        result = model.predict(img)
        assert set(result.keys()) == {"type", "disease", "confidence", "description", "treatment", "class_index"}

    def test_predict_type_is_valid(self, model):
        img = Image.new("RGB", (100, 100), color=(0, 200, 0))
        result = model.predict(img)
        assert result["type"] in ("healthy", "warning", "danger")

    def test_predict_confidence_range(self, model):
        img = Image.new("RGB", (100, 100), color=(0, 200, 0))
        result = model.predict(img)
        assert 0.0 <= result["confidence"] <= 100.0

    def test_predict_class_index_is_int(self, model):
        img = Image.new("RGB", (100, 100), color=(0, 200, 0))
        result = model.predict(img)
        assert isinstance(result["class_index"], int)

    def test_green_image_is_healthy(self, model):
        img = Image.new("RGB", (100, 100), color=(0, 200, 0))
        result = model.predict(img)
        assert result["type"] == "healthy"
        assert result["class_index"] == 0

    def test_brown_image_is_danger(self, model):
        img = Image.new("RGB", (100, 100), color=(160, 70, 40))
        result = model.predict(img)
        assert result["type"] == "danger"
        assert result["class_index"] == 1

    def test_yellow_orange_image_is_warning(self, model):
        img = Image.new("RGB", (100, 100), color=(220, 180, 50))
        result = model.predict(img)
        assert result["type"] == "warning"
        assert result["class_index"] == 2

    def test_healthy_has_no_treatment(self, model):
        img = Image.new("RGB", (100, 100), color=(0, 200, 0))
        result = model.predict(img)
        assert result["treatment"] is None

    def test_danger_has_treatment(self, model):
        img = Image.new("RGB", (100, 100), color=(160, 70, 40))
        result = model.predict(img)
        assert result["treatment"] is not None
        assert len(result["treatment"]) > 0

    def test_warning_has_treatment(self, model):
        img = Image.new("RGB", (100, 100), color=(220, 180, 50))
        result = model.predict(img)
        assert result["treatment"] is not None

    def test_class_map_has_entries(self):
        assert len(CLASS_MAP) >= 1

    def test_class_map_keys_are_ints(self):
        for k in CLASS_MAP:
            assert isinstance(k, int)

    def test_class_map_types_are_valid(self):
        valid_types = {"healthy", "warning", "danger"}
        for v in CLASS_MAP.values():
            assert v["type"] in valid_types

    def test_predict_large_image(self, model):
        img = Image.new("RGB", (1000, 1000), color=(0, 180, 0))
        result = model.predict(img)
        assert result["type"] == "healthy"

    def test_predict_tiny_image(self, model):
        img = Image.new("RGB", (1, 1), color=(0, 200, 0))
        result = model.predict(img)
        assert result["type"] in ("healthy", "warning", "danger")


# ══════════════════════════════════════════════════════════════════════════════
# CropModel
# ══════════════════════════════════════════════════════════════════════════════

class TestCropModel:
    @pytest.fixture(scope="class")
    def model(self):
        return CropModel()

    def test_recommend_returns_list(self, model):
        result = model.recommend({"season": "rabi"})
        assert isinstance(result, list)

    def test_recommend_returns_up_to_6(self, model):
        result = model.recommend({"season": "rabi"})
        assert 1 <= len(result) <= 6

    def test_each_item_has_required_keys(self, model):
        result = model.recommend({"season": "rabi"})
        for item in result:
            assert "name"  in item
            assert "emoji" in item
            assert "score" in item
            assert "why"   in item

    def test_scores_are_in_valid_range(self, model):
        for season in ("rabi", "kharif", "zaid"):
            result = model.recommend({"season": season})
            for item in result:
                assert 0 <= item["score"] <= 99, f"Score out of range for {item}"

    def test_rabi_wheat_is_top_for_loamy_soil(self, model):
        result = model.recommend({
            "season": "rabi", "soil": "loamy", "ph": 6.5,
            "rainfall": 600.0, "temp": 18.0, "nitrogen": 60.0,
        })
        assert result[0]["name"] == "Wheat"

    def test_kharif_includes_rice_for_high_rainfall(self, model):
        result = model.recommend({
            "season": "kharif", "ph": 6.0, "rainfall": 1500.0, "temp": 28.0,
        })
        names = [r["name"] for r in result]
        assert "Rice" in names

    def test_cotton_appears_for_black_soil_kharif(self, model):
        result = model.recommend({
            "season": "kharif", "soil": "black", "ph": 7.0, "temp": 30.0,
        })
        names = [r["name"] for r in result]
        assert "Cotton" in names

    def test_zaid_returns_summer_crops(self, model):
        result = model.recommend({"season": "zaid", "temp": 32.0})
        names = [r["name"] for r in result]
        summer = {"Maize", "Groundnut", "Sunflower", "Sugarcane", "Spinach", "Methi"}
        assert bool(summer & set(names))

    def test_sandy_soil_includes_groundnut(self, model):
        result = model.recommend({
            "season": "kharif", "soil": "sandy", "ph": 6.0, "temp": 30.0,
        })
        names = [r["name"] for r in result]
        assert "Groundnut" in names

    def test_results_are_sorted_by_score_desc(self, model):
        result = model.recommend({"season": "rabi", "soil": "loamy", "ph": 6.5})
        scores = [r["score"] for r in result]
        assert scores == sorted(scores, reverse=True)

    def test_empty_params_returns_valid_response(self, model):
        result = model.recommend({})
        assert len(result) > 0

    def test_why_text_is_non_empty(self, model):
        result = model.recommend({"season": "rabi"})
        for item in result:
            assert len(item["why"]) > 0


# ══════════════════════════════════════════════════════════════════════════════
# _score helper
# ══════════════════════════════════════════════════════════════════════════════

class TestScoreHelper:
    def test_value_at_midpoint_returns_max_score(self):
        assert _score(6.25, 5.5, 7.0) == pytest.approx(30.0)

    def test_value_exactly_at_low_boundary(self):
        score = _score(5.5, 5.5, 7.0)
        assert score > 0

    def test_value_exactly_at_high_boundary(self):
        score = _score(7.0, 5.5, 7.0)
        assert score > 0

    def test_value_in_range_is_positive(self):
        assert _score(6.5, 6.0, 7.5) > 0

    def test_value_far_below_range_is_zero_or_low(self):
        score = _score(0.0, 6.0, 7.5)
        assert score >= 0  # never negative

    def test_value_far_above_range_is_zero_or_low(self):
        score = _score(15.0, 6.0, 7.5)
        assert score >= 0  # never negative

    def test_score_never_negative(self):
        for v in [-100, 0, 3.0, 6.5, 10.0, 100]:
            assert _score(v, 6.0, 7.5) >= 0
