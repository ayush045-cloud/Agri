package com.agromind.app.fragments

import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.agromind.app.adapters.AlertsAdapter
import com.agromind.app.adapters.ScheduleAdapter
import com.agromind.app.adapters.SoilMoistureAdapter
import com.agromind.app.databinding.FragmentDashboardBinding
import com.agromind.app.utils.MockData

import java.util.Locale

class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!

    private lateinit var soilAdapter: SoilMoistureAdapter
    private lateinit var alertsAdapter: AlertsAdapter
    private lateinit var scheduleAdapter: ScheduleAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupStatCards()
        setupRecyclerViews()
        renderBarChart()
    }

    private fun setupStatCards() {
        val totalFields = MockData.soilMoisture.size
        val activeSensors = MockData.sensors.count { it.status == com.agromind.app.models.SensorStatus.ONLINE }
        val waterToday = MockData.waterChart.lastOrNull()?.litres ?: 0

        binding.tvStatFields.text = totalFields.toString()
        binding.tvStatSensors.text = activeSensors.toString()
        binding.tvStatWater.text = String.format(Locale.getDefault(), "%,d L", waterToday)
    }

    private fun setupRecyclerViews() {
        soilAdapter = SoilMoistureAdapter(MockData.soilMoisture)
        binding.rvSoilMoisture.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = soilAdapter
            isNestedScrollingEnabled = false
        }

        alertsAdapter = AlertsAdapter(MockData.alerts)
        binding.rvAlerts.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = alertsAdapter
            isNestedScrollingEnabled = false
        }

        scheduleAdapter = ScheduleAdapter(MockData.schedule)
        binding.rvDashboardSchedule.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = scheduleAdapter
            isNestedScrollingEnabled = false
        }
    }

    private fun renderBarChart() {
        val data = MockData.waterChart
        val maxVal = data.maxOf { it.litres }.toFloat()
        val chartContainer = binding.llBarChart
        chartContainer.removeAllViews()

        data.forEachIndexed { index, entry ->
            val isToday = (index == data.size - 1)
            val fraction = entry.litres / maxVal

            // Column: vertical LinearLayout containing spacer + bar + label
            val columnLayout = LinearLayout(requireContext()).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
                setPadding(4, 0, 4, 0)
            }

            // Spacer fills the empty space above the bar
            val spacer = View(requireContext()).apply {
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f - fraction
                )
            }

            // The coloured bar
            val barColor = if (isToday) Color.parseColor("#4caf60") else Color.parseColor("#d4e8d6")
            val barView = View(requireContext()).apply {
                background = GradientDrawable().apply {
                    shape = GradientDrawable.RECTANGLE
                    setColor(barColor)
                    cornerRadii = floatArrayOf(4f, 4f, 4f, 4f, 0f, 0f, 0f, 0f)
                }
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, 0, fraction
                )
            }

            // Day label below the bar
            val labelView = TextView(requireContext()).apply {
                text = entry.day
                textSize = 10f
                setTextColor(if (isToday) Color.parseColor("#2d6a35") else Color.parseColor("#7a9e80"))
                gravity = Gravity.CENTER
                setPadding(0, 6, 0, 0)
                if (isToday) setTypeface(null, Typeface.BOLD)
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                )
            }

            columnLayout.addView(spacer)
            columnLayout.addView(barView)
            columnLayout.addView(labelView)

            // Add column with equal weight to the chart container
            val colLp = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1f)
            chartContainer.addView(columnLayout, colLp)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

