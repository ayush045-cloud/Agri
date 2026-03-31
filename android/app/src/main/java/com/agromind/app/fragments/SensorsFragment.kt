package com.agromind.app.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.agromind.app.adapters.SensorAdapter
import com.agromind.app.databinding.FragmentSensorsBinding
import com.agromind.app.utils.MockData
import com.google.android.material.snackbar.Snackbar

class SensorsFragment : Fragment() {

    private var _binding: FragmentSensorsBinding? = null
    private val binding get() = _binding!!

    private lateinit var sensorAdapter: SensorAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSensorsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupGauges()
        setupSensorList()
        setupButtons()
    }

    private fun setupGauges() {
        // Soil temp gauge — 48% of max (24°C out of ~50°C max)
        setGaugeFill(binding.viewGaugeTempFill, 48)
        // Soil moisture gauge — 68%
        setGaugeFill(binding.viewGaugeMoistureFill, 68)
        // Light index gauge — 72% (7.2 klx out of ~10 klx)
        setGaugeFill(binding.viewGaugeLightFill, 72)
    }

    private fun setGaugeFill(fillView: View, percent: Int) {
        fillView.post {
            val parentWidth = (fillView.parent as? ViewGroup)?.width ?: return@post
            val lp = fillView.layoutParams
            lp.width = (parentWidth * percent / 100f).toInt()
            fillView.layoutParams = lp
        }
    }

    private fun setupSensorList() {
        sensorAdapter = SensorAdapter(MockData.sensors)
        binding.rvSensors.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = sensorAdapter
            isNestedScrollingEnabled = false
        }
    }

    private fun setupButtons() {
        binding.btnExportCsv.setOnClickListener {
            /* Backend hook: GET /api/sensors/export */
            Snackbar.make(it, "📥 Exporting CSV… GET /api/sensors/export", Snackbar.LENGTH_SHORT).show()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
