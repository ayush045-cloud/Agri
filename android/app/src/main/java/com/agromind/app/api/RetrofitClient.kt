package com.agromind.app.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    /** Base URL is configurable via Settings → API Base URL.
     *  Defaults to localhost for development; update from SettingsFragment. */
    private var baseUrl: String = "http://localhost:3000/api/"

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .addInterceptor { chain ->
                val originalRequest = chain.request()
                val request = originalRequest.newBuilder()
                    .header("Accept", "application/json")
                    .also { builder ->
                        if (apiKey.isNotBlank()) {
                            builder.header("Authorization", "Bearer $apiKey")
                        }
                    }
                    .build()
                chain.proceed(request)
            }
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    private var apiKey: String = ""

    private var retrofit: Retrofit = buildRetrofit()

    val apiService: ApiService
        get() = retrofit.create(ApiService::class.java)

    private fun buildRetrofit(): Retrofit = Retrofit.Builder()
        .baseUrl(baseUrl)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    /** Called from SettingsFragment when the user saves a new base URL. */
    fun updateBaseUrl(newUrl: String) {
        val normalized = if (newUrl.endsWith("/")) newUrl else "$newUrl/"
        baseUrl = normalized
        retrofit = buildRetrofit()
    }

    /** Called from SettingsFragment when the user saves an API key. */
    fun updateApiKey(key: String) {
        apiKey = key
    }
}
