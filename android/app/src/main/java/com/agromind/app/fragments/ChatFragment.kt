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
import com.agromind.app.utils.MockData
import com.google.android.material.button.MaterialButton
import kotlinx.coroutines.*

class ChatFragment : Fragment() {

    private var _binding: FragmentChatBinding? = null
    private val binding get() = _binding!!

    private lateinit var chatAdapter: ChatAdapter
    private val fragmentScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    private var chatMockIndex = 0

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
        setupQuickChips()
        setupInput()
    }

    private fun setupChatList() {
        val initialMessages = mutableListOf(
            ChatMessage(getString(com.agromind.app.R.string.chat_intro), MessageRole.AI)
        )
        chatAdapter = ChatAdapter(initialMessages)
        binding.rvChatMessages.apply {
            layoutManager = LinearLayoutManager(requireContext()).also { it.stackFromEnd = true }
            adapter = chatAdapter
        }
    }

    private fun setupQuickChips() {
        val chipsContainer = binding.llQuickChips
        chipsContainer.removeAllViews()

        MockData.quickChatChips.forEach { (label, message) ->
            val chip = MaterialButton(
                requireContext(),
                null,
                com.google.android.material.R.attr.materialButtonOutlinedStyle
            ).apply {
                text = label
                textSize = 12.5f
                setPadding(32, 20, 32, 20)
                insetTop = 0
                insetBottom = 0
                cornerRadius = resources.getDimensionPixelSize(com.agromind.app.R.dimen.radius_full)
                val lp = ViewGroup.MarginLayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                )
                lp.marginEnd = 8
                layoutParams = lp
                setOnClickListener { sendMessage(message) }
            }
            chipsContainer.addView(chip)
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
            val reply = MockData.chatMocks[chatMockIndex % MockData.chatMocks.size]
            chatMockIndex++
            chatAdapter.addMessage(ChatMessage(reply, MessageRole.AI))
            scrollToBottom()

            binding.btnSend.isEnabled = true
            binding.btnSend.text = getString(com.agromind.app.R.string.send)
        }
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
