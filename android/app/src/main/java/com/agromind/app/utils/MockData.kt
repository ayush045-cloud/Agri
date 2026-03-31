package com.agromind.app.utils

import com.agromind.app.models.*

/** All mock data mirrors the web app's MOCK object exactly. */
object MockData {

    val soilMoisture = listOf(
        SoilField("Field A – Wheat",   72, "#4caf60"),
        SoilField("Field B – Rice",    85, "#2563a8"),
        SoilField("Field C – Cotton",  41, "#e6a817"),
        SoilField("Field D – Maize",   63, "#4caf60"),
        SoilField("Field E – Mustard", 29, "#c0392b")
    )

    val alerts = listOf(
        AlertItem(PipColor.RED,   "Leaf Blight Detected — Field A (Wheat)",      "AI Model · 94% confidence · 18 min ago"),
        AlertItem(PipColor.AMBER, "Low Moisture — Field E (Mustard) at 29%",     "Sensor S-05 · Irrigation recommended · 34 min ago"),
        AlertItem(PipColor.AMBER, "Rain Expected Tomorrow — Skip irrigation?",    "Weather API · IMD forecast · 1 hr ago"),
        AlertItem(PipColor.GREEN, "Field B Irrigation Complete — 420 L used",    "Auto-scheduler · 2 hrs ago")
    )

    val waterChart = listOf(
        WaterBarEntry("Mon",   2100),
        WaterBarEntry("Tue",   1850),
        WaterBarEntry("Wed",   2300),
        WaterBarEntry("Thu",   1700),
        WaterBarEntry("Fri",   2050),
        WaterBarEntry("Sat",   1600),
        WaterBarEntry("Today", 1840)
    )

    val schedule = listOf(
        ScheduleItem("Field A – Wheat",   "06:00 AM · 380 L · 25 min", ScheduleStatus.DONE),
        ScheduleItem("Field B – Rice",    "09:30 AM · 420 L · 30 min", ScheduleStatus.DONE),
        ScheduleItem("Field C – Cotton",  "02:15 PM · 310 L · 22 min", ScheduleStatus.ACTIVE),
        ScheduleItem("Field D – Maize",   "04:00 PM · 290 L · 20 min", ScheduleStatus.SCHEDULED),
        ScheduleItem("Field E – Mustard", "05:30 PM · 340 L · 24 min", ScheduleStatus.URGENT)
    )

    val diseaseHistory = listOf(
        DiseaseHistoryItem("Leaf Blight — Wheat (Field A)", "Today, 9:42 AM · 94% confidence",  DiseaseResultType.DISEASE),
        DiseaseHistoryItem("Healthy — Rice (Field B)",      "Yesterday · 99% confidence",        DiseaseResultType.HEALTHY),
        DiseaseHistoryItem("Rust Spot — Cotton (Field C)",  "Oct 14 · 87% confidence",           DiseaseResultType.WARNING),
        DiseaseHistoryItem("Healthy — Maize (Field D)",     "Oct 12 · 97% confidence",           DiseaseResultType.HEALTHY)
    )

    val cropRecommendations = listOf(
        CropResult("🌾", "Wheat",        95, "Best soil + season match"),
        CropResult("🌻", "Mustard",      88, "High yield, moderate water"),
        CropResult("🫘", "Gram (Chana)", 82, "Nitrogen-fixing legume"),
        CropResult("🥬", "Spinach",      74, "Short 60-day cycle"),
        CropResult("🥕", "Carrot",       68, "Good winter demand"),
        CropResult("🌿", "Methi",        61, "Low water requirement")
    )

    val sensors = listOf(
        SensorReading("S-01", "Field A", "Moisture 72% · Temp 23°C · pH 6.7", SensorStatus.ONLINE),
        SensorReading("S-02", "Field B", "Moisture 85% · Temp 25°C · pH 6.2", SensorStatus.ONLINE),
        SensorReading("S-03", "Field C", "Moisture 41% · Temp 27°C · pH 7.1", SensorStatus.ONLINE),
        SensorReading("S-04", "Field D", "Moisture 63% · Temp 24°C · pH 6.9", SensorStatus.ONLINE),
        SensorReading("S-05", "Field E", "Moisture 29% · Temp 28°C · pH 7.4", SensorStatus.LOW),
        SensorReading("S-06", "Weather", "Temp 28°C · Humidity 62% · Wind 8 km/h", SensorStatus.ONLINE)
    )

    val chatMocks = listOf(
        "Based on Punjab conditions, wheat benefits from DAP at sowing (120 kg/ha) and urea in two splits — first at tillering (60 kg/ha) and again at boot stage. Top-dressing with sulphur 10 kg/ha also improves grain protein.",
        "Leaf blight (Alternaria triticina) should be treated with Mancozeb 75 WP @ 2.5 g/litre or Propiconazole @ 1 ml/litre. Spray when humidity is high and avoid irrigating overhead. Remove and destroy infected leaves.",
        "The MSP for wheat for 2024–25 season was set at ₹2,275/quintal, a ₹150 increase over the previous year. Procurement typically runs from April to June through FCI and state agencies.",
        "Cotton (Desi) needs approximately 700–1200 mm of water over its growing season. In Punjab, this equals 5–7 irrigations of ~60 mm each. Drip irrigation can cut this by 30–40% while improving yields.",
        "Mustard intercropped with chickpea is a classic Punjab combo. Use 6:2 row ratio (6 mustard, 2 chickpea). The legume fixes nitrogen that benefits mustard. Sow simultaneously in October for Rabi season.",
        "Nitrogen deficiency shows as yellowing (chlorosis) starting from older/lower leaves moving upward, stunted growth, and pale green colour overall. Apply urea top-dressing at 40–60 kg/ha. Confirm with a soil test first."
    )

    val diseaseMocks = listOf(
        DiseaseResult(DiseaseResultType.DISEASE, "⚠️ Leaf Blight Detected",
            "Early-stage blight detected. Recommend fungicide treatment within 48 hrs. Avoid overhead irrigation.",
            94, "#c0392b"),
        DiseaseResult(DiseaseResultType.WARNING, "⚡ Rust Spot — Mild Risk",
            "Mild rust spots observed. Monitor for 3–5 days. Apply sulphur-based fungicide as precaution.",
            81, "#e6a817"),
        DiseaseResult(DiseaseResultType.HEALTHY, "✅ Leaf Looks Healthy",
            "No disease detected. Good colour and structure. Continue normal irrigation and fertilisation.",
            99, "#3d8b47")
    )

    val quickChatChips = listOf(
        "🌾 Wheat fertiliser Dec?" to "What fertiliser should I use for wheat in December?",
        "🍃 Treat wheat blight"   to "How do I treat leaf blight in wheat?",
        "💰 MSP wheat 2025"       to "What is the MSP for wheat in 2025?",
        "💧 Cotton water needs"   to "How much water does cotton need per acre?",
        "🌻 Mustard intercropping" to "Best intercropping for mustard in Punjab?",
        "🔬 Nitrogen deficiency"  to "What are signs of nitrogen deficiency in crops?"
    )
}
