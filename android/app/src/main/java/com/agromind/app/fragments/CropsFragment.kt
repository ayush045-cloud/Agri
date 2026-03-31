package com.agromind.app.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.GridLayoutManager
import com.agromind.app.adapters.CropResultAdapter
import com.agromind.app.databinding.FragmentCropsBinding
import com.agromind.app.models.CropRequest
import com.agromind.app.utils.MockData
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.*

class CropsFragment : Fragment() {

    private var _binding: FragmentCropsBinding? = null
    private val binding get() = _binding!!

    private lateinit var cropAdapter: CropResultAdapter
    private val fragmentScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCropsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupDropdowns()
        setupRecyclerView()
        setupButtons()
    }

    private fun setupDropdowns() {
        val ctx = requireContext()

        binding.spCSoil.setAdapter(
            ArrayAdapter(ctx, android.R.layout.simple_dropdown_item_1line,
                arrayOf("Loamy", "Clay", "Sandy", "Silty", "Black Cotton Soil"))
        )
        binding.spCRegion.setAdapter(
            ArrayAdapter(ctx, android.R.layout.simple_dropdown_item_1line,
                arrayOf("Punjab", "Haryana", "UP", "Rajasthan", "Maharashtra", "MP"))
        )
        binding.spCSeason.setAdapter(
            ArrayAdapter(ctx, android.R.layout.simple_dropdown_item_1line,
                arrayOf("Rabi (Oct–Mar)", "Kharif (Jun–Sep)", "Zaid"))
        )
        binding.spCWater.setAdapter(
            ArrayAdapter(ctx, android.R.layout.simple_dropdown_item_1line,
                arrayOf("Canal (abundant)", "Borewell (moderate)", "Rain-fed (limited)"))
        )
    }

    private fun setupRecyclerView() {
        cropAdapter = CropResultAdapter(emptyList())
        binding.rvCropResults.apply {
            layoutManager = GridLayoutManager(requireContext(), 2)
            adapter = cropAdapter
            isNestedScrollingEnabled = false
        }
    }

    private fun setupButtons() {
        binding.btnGetRecommendations.setOnClickListener {
            runCropAdvisor()
        }
    }

    private fun runCropAdvisor() {
        binding.btnGetRecommendations.isEnabled = false
        binding.btnGetRecommendations.text = getString(com.agromind.app.R.string.analysing)

        // Collect form values
        val request = CropRequest(
            soilType          = binding.spCSoil.text.toString(),
            ph                = binding.etCPh.text?.toString()?.toDoubleOrNull() ?: 6.8,
            rainfall          = binding.etCRain.text?.toString()?.toIntOrNull() ?: 650,
            temperature       = binding.etCTemp.text?.toString()?.toIntOrNull() ?: 28,
            region            = binding.spCRegion.text.toString(),
            season            = binding.spCSeason.text.toString(),
            nitrogen          = binding.etCNitrogen.text?.toString()?.toIntOrNull() ?: 80,
            waterAvailability = binding.spCWater.text.toString()
        )

        // Simulate API call — replace with:
        // lifecycleScope.launch { RetrofitClient.apiService.getCropRecommendations(request) }
        fragmentScope.launch {
            delay(1400)
            if (_binding == null) return@launch

            cropAdapter.updateData(MockData.cropRecommendations)
            binding.llCropResults.visibility = View.VISIBLE
            binding.btnGetRecommendations.isEnabled = true
            binding.btnGetRecommendations.text = getString(com.agromind.app.R.string.get_recommendations)
            Snackbar.make(binding.root, "✅ 6 crop recommendations ready", Snackbar.LENGTH_SHORT).show()
        }
    }

    override fun onDestroyView() {
        fragmentScope.cancel()
        super.onDestroyView()
        _binding = null
    }
}
