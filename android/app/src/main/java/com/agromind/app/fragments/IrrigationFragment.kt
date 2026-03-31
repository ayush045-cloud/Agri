package com.agromind.app.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.agromind.app.R
import com.agromind.app.adapters.ScheduleAdapter
import com.agromind.app.databinding.FragmentIrrigationBinding
import com.agromind.app.utils.MockData
import com.google.android.material.snackbar.Snackbar

class IrrigationFragment : Fragment() {

    private var _binding: FragmentIrrigationBinding? = null
    private val binding get() = _binding!!

    private lateinit var scheduleAdapter: ScheduleAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentIrrigationBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupScheduleList()
        setupDropdowns()
        setupButtons()
    }

    private fun setupScheduleList() {
        scheduleAdapter = ScheduleAdapter(MockData.schedule)
        binding.rvSchedule.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = scheduleAdapter
            isNestedScrollingEnabled = false
        }
    }

    private fun setupDropdowns() {
        val ctx = requireContext()

        val cropTypes = arrayOf("Wheat", "Rice", "Cotton", "Maize", "Mustard")
        binding.spCropType.setAdapter(
            ArrayAdapter(ctx, android.R.layout.simple_dropdown_item_1line, cropTypes)
        )

        val soilTypes = arrayOf("Loamy", "Clay", "Sandy", "Silty")
        binding.spSoilType.setAdapter(
            ArrayAdapter(ctx, android.R.layout.simple_dropdown_item_1line, soilTypes)
        )

        val growthStages = arrayOf("Germination", "Vegetative", "Flowering", "Grain Fill", "Maturity")
        binding.spGrowthStage.setAdapter(
            ArrayAdapter(ctx, android.R.layout.simple_dropdown_item_1line, growthStages)
        )
    }

    private fun setupButtons() {
        binding.btnRunNow.setOnClickListener {
            Snackbar.make(it, "▶ Manual run triggered — connecting to pump controller", Snackbar.LENGTH_SHORT).show()
        }

        binding.btnAcceptPlan.setOnClickListener {
            /* Backend hook: POST /api/irrigation/accept */
            Snackbar.make(it, "✅ Irrigation plan accepted — schedule updated", Snackbar.LENGTH_SHORT).show()
        }

        binding.btnEditPlan.setOnClickListener {
            Snackbar.make(it, "📝 Plan editor will open here", Snackbar.LENGTH_SHORT).show()
        }

        binding.btnCalculate.setOnClickListener {
            /* Backend hook: POST /api/irrigation/calculate */
            val area    = binding.etFieldArea.text?.toString()?.toDoubleOrNull() ?: 0.0
            val current = binding.etCurrentMoisture.text?.toString()?.toIntOrNull() ?: 0
            val target  = binding.etTargetMoisture.text?.toString()?.toIntOrNull() ?: 0
            val crop    = binding.spCropType.text.toString()

            // Simple estimation: litres = (target - current) / 100 * area * 40468 * 0.01
            val estimatedLitres = ((target - current).coerceAtLeast(0) / 100.0 * area * 404.7).toInt()
            Snackbar.make(
                it,
                "⚙ Estimated ${estimatedLitres}L for $crop — POST /api/irrigation/calculate",
                Snackbar.LENGTH_LONG
            ).show()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
