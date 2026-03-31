# Add project specific ProGuard rules here.
# For Retrofit
-keepattributes Signature
-keepattributes *Annotation*
-keep class retrofit2.** { *; }
-keep class okhttp3.** { *; }
-keep class com.agromind.app.models.** { *; }
-keep class com.agromind.app.api.** { *; }

# Gson
-keep class com.google.gson.** { *; }
-keepclassmembers class ** {
    @com.google.gson.annotations.SerializedName <fields>;
}
