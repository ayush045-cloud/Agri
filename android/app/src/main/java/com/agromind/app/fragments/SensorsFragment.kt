package com.agromind.app.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.GridLayoutManager
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
        setupSensorGrid()
        setupButtons()
    }

    private fun setupSensorGrid() {
        sensorAdapter = SensorAdapter(MockData.sensors)
        binding.rvSensors.apply {
            layoutManager = GridLayoutManager(requireContext(), 2)
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
