package com.agromind.app.models

data class ChatMessage(
    val text: String,
    val role: MessageRole
)

enum class MessageRole { USER, AI }

data class ChatRequest(
    val message: String,
    val history: List<Map<String, String>>
)

data class ChatResponse(
    val reply: String
)
