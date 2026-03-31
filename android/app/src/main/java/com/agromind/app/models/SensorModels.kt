package com.agromind.app.models

data class SensorReading(
    val id: String,
    val field: String,
    val info: String,
    val status: SensorStatus
)

enum class SensorStatus { ONLINE, LOW, OFFLINE }
