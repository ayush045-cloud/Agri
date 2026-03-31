package com.agromind.app.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.agromind.app.R
import com.agromind.app.databinding.ItemScheduleBinding
import com.agromind.app.models.ScheduleItem
import com.agromind.app.models.ScheduleStatus

class ScheduleAdapter(private var items: List<ScheduleItem>) :
    RecyclerView.Adapter<ScheduleAdapter.VH>() {

    inner class VH(val binding: ItemScheduleBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val binding = ItemScheduleBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return VH(binding)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = items[position]
        val ctx = holder.itemView.context
        with(holder.binding) {
            tvSchedName.text = item.fieldName
            tvSchedMeta.text = item.meta

            val (bgRes, textColorRes, label) = when (item.status) {
                ScheduleStatus.DONE      -> Triple(R.drawable.bg_badge_green, R.color.badge_green_text, "Done")
                ScheduleStatus.ACTIVE    -> Triple(R.drawable.bg_badge_blue,  R.color.badge_blue_text,  "Active")
                ScheduleStatus.SCHEDULED -> Triple(R.drawable.bg_badge_amber, R.color.badge_amber_text, "Scheduled")
                ScheduleStatus.URGENT    -> Triple(R.drawable.bg_badge_red,   R.color.badge_red_text,   "Urgent")
            }
            tvSchedBadge.text = label
            tvSchedBadge.background = ContextCompat.getDrawable(ctx, bgRes)
            tvSchedBadge.setTextColor(ContextCompat.getColor(ctx, textColorRes))
        }
    }

    override fun getItemCount() = items.size

    fun updateData(newItems: List<ScheduleItem>) {
        items = newItems
        notifyDataSetChanged()
    }
}
