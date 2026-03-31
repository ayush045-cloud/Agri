package com.agromind.app.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.agromind.app.R
import com.agromind.app.databinding.ItemAlertBinding
import com.agromind.app.models.AlertItem
import com.agromind.app.models.PipColor

class AlertsAdapter(private var items: List<AlertItem>) :
    RecyclerView.Adapter<AlertsAdapter.VH>() {

    inner class VH(val binding: ItemAlertBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val binding = ItemAlertBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return VH(binding)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = items[position]
        val ctx = holder.itemView.context
        with(holder.binding) {
            tvAlertTitle.text = item.title
            tvAlertMeta.text  = item.meta

            val bgRes = when (item.pipColor) {
                PipColor.RED   -> R.drawable.bg_badge_red
                PipColor.AMBER -> R.drawable.bg_badge_amber
                PipColor.GREEN -> R.drawable.bg_badge_green
                PipColor.BLUE  -> R.drawable.bg_badge_blue
            }
            viewPip.background = ContextCompat.getDrawable(ctx, bgRes)
        }
    }

    override fun getItemCount() = items.size

    fun updateData(newItems: List<AlertItem>) {
        items = newItems
        notifyDataSetChanged()
    }
}
