package com.agromind.app.models

data class ScheduleItem(
    val fieldName: String,
    val meta: String,        // "06:00 AM · 380 L · 25 min"
    val status: ScheduleStatus
)

enum class ScheduleStatus { DONE, ACTIVE, SCHEDULED, URGENT }
