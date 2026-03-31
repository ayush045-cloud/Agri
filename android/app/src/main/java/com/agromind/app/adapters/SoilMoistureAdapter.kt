package com.agromind.app.adapters

import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.agromind.app.databinding.ItemSoilFieldBinding
import com.agromind.app.models.SoilField

class SoilMoistureAdapter(private var items: List<SoilField>) :
    RecyclerView.Adapter<SoilMoistureAdapter.VH>() {

    inner class VH(val binding: ItemSoilFieldBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val binding = ItemSoilFieldBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return VH(binding)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = items[position]
        with(holder.binding) {
            tvFieldName.text = item.name
            tvMoisturePct.text = "${item.moisture}%"

            // Set bar width proportionally via layout params
            val trackWidth = viewMoistureFill.parent as? ViewGroup
            viewMoistureFill.post {
                val parentWidth = (viewMoistureFill.parent as? ViewGroup)?.width ?: return@post
                val lp = viewMoistureFill.layoutParams
                lp.width = (parentWidth * item.moisture / 100f).toInt()
                viewMoistureFill.layoutParams = lp
            }

            // Set bar color from hex
            try {
                viewMoistureFill.setBackgroundColor(Color.parseColor(item.colorHex))
            } catch (e: IllegalArgumentException) {
                // fall back to default green
            }
        }
    }

    override fun getItemCount() = items.size

    fun updateData(newItems: List<SoilField>) {
        items = newItems
        notifyDataSetChanged()
    }
}
