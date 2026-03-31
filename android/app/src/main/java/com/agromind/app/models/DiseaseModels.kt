package com.agromind.app.models

data class DiseaseHistoryItem(
    val title: String,
    val meta: String,
    val resultType: DiseaseResultType
)

enum class DiseaseResultType { HEALTHY, WARNING, DISEASE }

data class DiseaseResult(
    val type: DiseaseResultType,
    val title: String,
    val description: String,
    val confidence: Int,    // 0–100
    val colorHex: String
)
