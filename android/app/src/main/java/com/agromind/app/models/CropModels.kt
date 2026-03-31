package com.agromind.app.models

data class CropResult(
    val emoji: String,
    val name: String,
    val matchScore: Int,   // 0–100
    val reason: String
)

data class CropRequest(
    val soilType: String,
    val ph: Double,
    val rainfall: Int,
    val temperature: Int,
    val region: String,
    val season: String,
    val nitrogen: Int,
    val waterAvailability: String
)
