package com.agromind.app.models

data class SoilField(
    val name: String,
    val moisture: Int,   // 0–100
    val colorHex: String // e.g. "#4caf60"
)

data class AlertItem(
    val pipColor: PipColor,
    val title: String,
    val meta: String
)

enum class PipColor { RED, AMBER, GREEN, BLUE }

data class WaterBarEntry(
    val day: String,
    val litres: Int
)
