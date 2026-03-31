package com.agromind.app.api

import com.agromind.app.models.ChatRequest
import com.agromind.app.models.ChatResponse
import com.agromind.app.models.CropRequest
import com.agromind.app.models.CropResult
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ── Dashboard ──
    @GET("dashboard/stats")
    suspend fun getDashboardStats(): Response<Map<String, Any>>

    // ── Irrigation ──
    @GET("irrigation/schedule")
    suspend fun getIrrigationSchedule(): Response<List<Map<String, Any>>>

    @POST("irrigation/run")
    suspend fun runIrrigation(@Body body: Map<String, Any>): Response<Map<String, Any>>

    @POST("irrigation/calculate")
    suspend fun calculateIrrigation(@Body body: Map<String, Any>): Response<Map<String, Any>>

    // ── Disease Detection ──
    @Multipart
    @POST("disease/analyse")
    suspend fun analyseDisease(
        @Part image: MultipartBody.Part
    ): Response<Map<String, Any>>

    // ── Crop Advisor ──
    @POST("crops/recommend")
    suspend fun getCropRecommendations(
        @Body request: CropRequest
    ): Response<List<CropResult>>

    // ── Chat ──
    @POST("chat/message")
    suspend fun sendChatMessage(
        @Body request: ChatRequest
    ): Response<ChatResponse>

    // ── Sensors ──
    @GET("sensors/live")
    suspend fun getSensorData(): Response<List<Map<String, Any>>>

    @GET("sensors/export")
    suspend fun exportSensorsCsv(): Response<String>

    // ── Settings ──
    @POST("settings")
    suspend fun saveSettings(@Body body: Map<String, Any>): Response<Map<String, Any>>
}
