package com.agromind.app.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.agromind.app.databinding.ItemChatMessageBinding
import com.agromind.app.models.ChatMessage
import com.agromind.app.models.MessageRole

class ChatAdapter(private val messages: MutableList<ChatMessage>) :
    RecyclerView.Adapter<ChatAdapter.VH>() {

    inner class VH(val binding: ItemChatMessageBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val binding = ItemChatMessageBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return VH(binding)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val msg = messages[position]
        with(holder.binding) {
            if (msg.role == MessageRole.AI) {
                llBotMsg.visibility  = View.VISIBLE
                llUserMsg.visibility = View.GONE
                tvBotText.text  = msg.text
            } else {
                llUserMsg.visibility = View.VISIBLE
                llBotMsg.visibility  = View.GONE
                tvUserText.text = msg.text
            }
        }
    }

    override fun getItemCount() = messages.size

    fun addMessage(message: ChatMessage) {
        messages.add(message)
        notifyItemInserted(messages.size - 1)
    }

    fun removeTypingIndicator() {
        if (messages.isNotEmpty() && messages.last().text == "Thinking…") {
            val lastIndex = messages.size - 1
            messages.removeAt(lastIndex)
            notifyItemRemoved(lastIndex)
        }
    }

    fun clearMessages() {
        messages.clear()
        notifyDataSetChanged()
    }
}
