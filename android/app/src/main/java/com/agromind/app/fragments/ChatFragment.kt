package com.agromind.app.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.agromind.app.adapters.ChatAdapter
import com.agromind.app.databinding.FragmentChatBinding
import com.agromind.app.models.ChatMessage
import com.agromind.app.models.MessageRole
import kotlinx.coroutines.*

class ChatFragment : Fragment() {

    private var _binding: FragmentChatBinding? = null
    private val binding get() = _binding!!

    private lateinit var chatAdapter: ChatAdapter
    private val fragmentScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    private var chatMockIndex = 0

    private val suggestions = listOf(
        "How much fertiliser should I apply for wheat?",
        "What is the MSP for rice this year?",
        "How do I treat leaf blight in cotton?",
        "Recommend intercropping for mustard"
    )

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentChatBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupChatList()
        setupSuggestions()
        setupInput()
    }

    private fun setupChatList() {
        chatAdapter = ChatAdapter(mutableListOf())
        binding.rvChatMessages.apply {
            layoutManager = LinearLayoutManager(requireContext()).also { it.stackFromEnd = true }
            adapter = chatAdapter
        }
        updateEmptyState()
    }

    private fun setupSuggestions() {
        val suggestionViews = listOf(
            binding.tvSuggestion0,
            binding.tvSuggestion1,
            binding.tvSuggestion2,
            binding.tvSuggestion3
        )
        suggestions.forEachIndexed { index, text ->
            suggestionViews.getOrNull(index)?.apply {
                this.text = text
                setOnClickListener { sendMessage(text) }
            }
        }
    }

    private fun setupInput() {
        binding.etChatInput.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEND) {
                sendMessage(binding.etChatInput.text?.toString()?.trim() ?: "")
                true
            } else false
        }

        binding.btnSend.setOnClickListener {
            sendMessage(binding.etChatInput.text?.toString()?.trim() ?: "")
        }
    }

    private fun sendMessage(text: String) {
        if (text.isBlank() || !binding.btnSend.isEnabled) return
        binding.etChatInput.text?.clear()

        // Add user message
        chatAdapter.addMessage(ChatMessage(text, MessageRole.USER))
        updateEmptyState()
        scrollToBottom()

        // Disable send while "thinking"
        binding.btnSend.isEnabled = false
        binding.btnSend.text = "…"

        // Add typing indicator
        val typingMsg = ChatMessage("Thinking…", MessageRole.AI)
        chatAdapter.addMessage(typingMsg)
        scrollToBottom()

        // Simulate API response — replace with:
        // lifecycleScope.launch {
        //     val response = RetrofitClient.apiService.sendChatMessage(
        //         ChatRequest(text, chatHistory)
        //     )
        //     // handle response
        // }
        fragmentScope.launch {
            delay((1200 + (Math.random() * 800)).toLong())
            if (_binding == null) return@launch

            // Remove typing indicator and add real reply
            chatAdapter.removeTypingIndicator()
            val reply = com.agromind.app.utils.MockData.chatMocks[chatMockIndex % com.agromind.app.utils.MockData.chatMocks.size]
            chatMockIndex++
            chatAdapter.addMessage(ChatMessage(reply, MessageRole.AI))
            scrollToBottom()

            binding.btnSend.isEnabled = true
            binding.btnSend.text = getString(com.agromind.app.R.string.send)
        }
    }

    private fun updateEmptyState() {
        val hasMessages = chatAdapter.itemCount > 0
        binding.svSuggestions.visibility = if (hasMessages) View.GONE else View.VISIBLE
        binding.rvChatMessages.visibility = if (hasMessages) View.VISIBLE else View.GONE
    }

    private fun scrollToBottom() {
        binding.rvChatMessages.post {
            val count = chatAdapter.itemCount
            if (count > 0) binding.rvChatMessages.scrollToPosition(count - 1)
        }
    }

    override fun onDestroyView() {
        fragmentScope.cancel()
        super.onDestroyView()
        _binding = null
    }
}
