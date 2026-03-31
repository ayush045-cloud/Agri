package com.agromind.app.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.agromind.app.R
import com.agromind.app.databinding.ItemSensorBinding
import com.agromind.app.models.SensorReading
import com.agromind.app.models.SensorStatus

class SensorAdapter(private var items: List<SensorReading>) :
    RecyclerView.Adapter<SensorAdapter.VH>() {

    inner class VH(val binding: ItemSensorBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val binding = ItemSensorBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return VH(binding)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = items[position]
        val ctx = holder.itemView.context
        with(holder.binding) {
            tvSensorIdField.text = "${item.id} · ${item.field}"
            tvSensorInfo.text    = item.info

            val (bgRes, textColorRes, label) = when (item.status) {
                SensorStatus.ONLINE  -> Triple(R.drawable.bg_badge_green, R.color.badge_green_text, "Online")
                SensorStatus.LOW     -> Triple(R.drawable.bg_badge_red,   R.color.badge_red_text,   "Low!")
                SensorStatus.OFFLINE -> Triple(R.drawable.bg_badge_amber, R.color.badge_amber_text, "Offline")
            }
            tvSensorStatus.text = label
            tvSensorStatus.background = ContextCompat.getDrawable(ctx, bgRes)
            tvSensorStatus.setTextColor(ContextCompat.getColor(ctx, textColorRes))
        }
    }

    override fun getItemCount() = items.size

    fun updateData(newItems: List<SensorReading>) {
        items = newItems
        notifyDataSetChanged()
    }
}
