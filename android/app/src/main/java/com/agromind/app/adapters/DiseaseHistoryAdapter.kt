package com.agromind.app.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.agromind.app.R
import com.agromind.app.databinding.ItemDiseaseHistoryBinding
import com.agromind.app.models.DiseaseHistoryItem
import com.agromind.app.models.DiseaseResultType

class DiseaseHistoryAdapter(private val items: MutableList<DiseaseHistoryItem>) :
    RecyclerView.Adapter<DiseaseHistoryAdapter.VH>() {

    inner class VH(val binding: ItemDiseaseHistoryBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val binding = ItemDiseaseHistoryBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return VH(binding)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = items[position]
        val ctx = holder.itemView.context
        with(holder.binding) {
            tvHistTitle.text = item.title
            tvHistMeta.text  = item.meta

            val (bgRes, textColorRes, label) = when (item.resultType) {
                DiseaseResultType.HEALTHY -> Triple(R.drawable.bg_badge_green, R.color.badge_green_text, "Healthy")
                DiseaseResultType.WARNING -> Triple(R.drawable.bg_badge_amber, R.color.badge_amber_text, "Warning")
                DiseaseResultType.DISEASE -> Triple(R.drawable.bg_badge_red,   R.color.badge_red_text,   "Disease")
            }
            tvHistBadge.text = label
            tvHistBadge.background = ContextCompat.getDrawable(ctx, bgRes)
            tvHistBadge.setTextColor(ContextCompat.getColor(ctx, textColorRes))
        }
    }

    override fun getItemCount() = items.size

    fun addItem(item: DiseaseHistoryItem) {
        items.add(0, item)
        notifyItemInserted(0)
    }

    fun updateData(newItems: List<DiseaseHistoryItem>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }
}
