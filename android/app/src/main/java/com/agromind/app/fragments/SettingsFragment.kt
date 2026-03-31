package com.agromind.app.fragments

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import androidx.fragment.app.Fragment
import com.agromind.app.api.RetrofitClient
import com.agromind.app.databinding.FragmentSettingsBinding
import com.google.android.material.snackbar.Snackbar

class SettingsFragment : Fragment() {

    private var _binding: FragmentSettingsBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSettingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupDropdowns()
        loadSavedSettings()
        setupButtons()
    }

    private fun setupDropdowns() {
        val ctx = requireContext()
        binding.spWaterSource.setAdapter(
            ArrayAdapter(ctx, android.R.layout.simple_dropdown_item_1line,
                arrayOf("Canal Irrigation", "Borewell", "Rainwater"))
        )
        binding.spAlertLanguage.setAdapter(
            ArrayAdapter(ctx, android.R.layout.simple_dropdown_item_1line,
                arrayOf("English", "Punjabi", "Hindi"))
        )
    }

    private fun loadSavedSettings() {
        val prefs = requireContext().getSharedPreferences("agro_settings", Context.MODE_PRIVATE)
        binding.etFarmName.setText(prefs.getString("farm_name", getString(com.agromind.app.R.string.farm_name_default)))
        binding.etTotalArea.setText(prefs.getString("total_area", "18.5"))
        binding.spWaterSource.setText(prefs.getString("water_source", "Canal Irrigation"), false)
        binding.spAlertLanguage.setText(prefs.getString("alert_language", "English"), false)
        binding.etApiUrl.setText(prefs.getString("api_url", ""))
        // Don't restore API key to the field for security
        binding.swAutoIrrigation.isChecked  = prefs.getBoolean("auto_irr", true)
        binding.swWeather.isChecked         = prefs.getBoolean("weather", true)
        binding.swDiseaseAlerts.isChecked   = prefs.getBoolean("disease", true)
        binding.swSms.isChecked             = prefs.getBoolean("sms", false)
        binding.swMandi.isChecked           = prefs.getBoolean("mandi", true)
    }

    private fun setupButtons() {
        binding.btnSaveAll.setOnClickListener {
            saveSettings()
        }
    }

    private fun saveSettings() {
        val farmName    = binding.etFarmName.text?.toString().orEmpty()
        val area        = binding.etTotalArea.text?.toString().orEmpty()
        val waterSource = binding.spWaterSource.text.toString()
        val language    = binding.spAlertLanguage.text.toString()
        val apiUrl      = binding.etApiUrl.text?.toString().orEmpty()
        val apiKey      = binding.etApiKey.text?.toString().orEmpty()

        // Persist to SharedPreferences
        requireContext()
            .getSharedPreferences("agro_settings", Context.MODE_PRIVATE)
            .edit()
            .putString("farm_name", farmName)
            .putString("total_area", area)
            .putString("water_source", waterSource)
            .putString("alert_language", language)
            .putString("api_url", apiUrl)
            .putBoolean("auto_irr",  binding.swAutoIrrigation.isChecked)
            .putBoolean("weather",   binding.swWeather.isChecked)
            .putBoolean("disease",   binding.swDiseaseAlerts.isChecked)
            .putBoolean("sms",       binding.swSms.isChecked)
            .putBoolean("mandi",     binding.swMandi.isChecked)
            .apply()

        // Update Retrofit client with new API config
        if (apiUrl.isNotBlank()) RetrofitClient.updateBaseUrl(apiUrl)
        if (apiKey.isNotBlank()) RetrofitClient.updateApiKey(apiKey)

        Snackbar.make(binding.root, getString(com.agromind.app.R.string.settings_saved), Snackbar.LENGTH_SHORT).show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
