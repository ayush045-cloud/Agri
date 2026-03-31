package com.agromind.app.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.agromind.app.databinding.ItemCropCardBinding
import com.agromind.app.models.CropResult

/** Displays crop cards in a 2-column grid (use GridLayoutManager with spanCount=2). */
class CropResultAdapter(private var items: List<CropResult>) :
    RecyclerView.Adapter<CropResultAdapter.VH>() {

    inner class VH(val binding: ItemCropCardBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val binding = ItemCropCardBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return VH(binding)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = items[position]
        with(holder.binding) {
            tvCropEmoji.text = item.emoji
            tvCropName.text  = item.name
            tvCropWhy.text   = item.reason
            tvCropScore.text = "${item.matchScore}% match"
        }
    }

    override fun getItemCount() = items.size

    fun updateData(newItems: List<CropResult>) {
        items = newItems
        notifyDataSetChanged()
    }
}
