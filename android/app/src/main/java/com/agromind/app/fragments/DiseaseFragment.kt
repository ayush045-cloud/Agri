package com.agromind.app.fragments

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.agromind.app.adapters.DiseaseHistoryAdapter
import com.agromind.app.databinding.FragmentDiseaseBinding
import com.agromind.app.models.DiseaseHistoryItem
import com.agromind.app.models.DiseaseResult
import com.agromind.app.models.DiseaseResultType
import com.agromind.app.utils.MockData
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.*

class DiseaseFragment : Fragment() {

    private var _binding: FragmentDiseaseBinding? = null
    private val binding get() = _binding!!

    private lateinit var historyAdapter: DiseaseHistoryAdapter
    private val fragmentScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    private var mockIndex = 0

    // Gallery picker
    private val galleryLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { handleImage(it) }
    }

    // Camera
    private val cameraLauncher = registerForActivityResult(
        ActivityResultContracts.TakePicture()
    ) { success: Boolean ->
        if (success) cameraTempUri?.let { handleImage(it) }
    }

    private var cameraTempUri: Uri? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDiseaseBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupHistoryList()
        setupClickListeners()
    }

    private fun setupHistoryList() {
        historyAdapter = DiseaseHistoryAdapter(MockData.diseaseHistory.toMutableList())
        binding.rvDiseaseHistory.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = historyAdapter
            isNestedScrollingEnabled = false
        }
    }

    private fun setupClickListeners() {
        binding.uploadZone.setOnClickListener { galleryLauncher.launch("image/*") }

        binding.btnPickGallery.setOnClickListener { galleryLauncher.launch("image/*") }

        binding.btnPickCamera.setOnClickListener {
            val ctx = requireContext()
            // Create a temp URI for the camera capture
            val contentValues = android.content.ContentValues().apply {
                put(MediaStore.Images.Media.DISPLAY_NAME, "agro_scan_${System.currentTimeMillis()}.jpg")
                put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
            }
            cameraTempUri = ctx.contentResolver.insert(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues
            )
            cameraTempUri?.let { cameraLauncher.launch(it) }
        }
    }

    private fun handleImage(uri: Uri) {
        // Show preview
        binding.ivLeafPreview.visibility = View.VISIBLE
        binding.uploadHintLayout.visibility = View.GONE
        binding.ivLeafPreview.setImageURI(uri)
        binding.uploadZone.background = requireContext().getDrawable(
            com.agromind.app.R.drawable.bg_upload_zone_active
        )

        // Show loading, hide result
        binding.llDiseaseLoading.visibility = View.VISIBLE
        binding.llDiseaseResult.visibility  = View.GONE

        // Simulate API latency — replace with actual Retrofit call:
        // val formData = MultipartBody.Part.createFormData("image", ...)
        // viewLifecycleOwner.lifecycleScope.launch { RetrofitClient.apiService.analyseDisease(formData) }
        fragmentScope.launch {
            delay(1800)
            if (_binding == null) return@launch

            val mock = MockData.diseaseMocks[mockIndex % MockData.diseaseMocks.size]
            mockIndex++

            binding.llDiseaseLoading.visibility = View.GONE
            showDiseaseResult(mock)
        }
    }

    private fun showDiseaseResult(result: DiseaseResult) {
        with(binding) {
            llDiseaseResult.visibility = View.VISIBLE
            tvDiseaseTitle.text = result.title
            tvDiseaseDesc.text  = result.description
            tvConfLabel.text    = "${result.confidence}% confidence"

            // Set confidence bar color
            try {
                viewConfFill.setBackgroundColor(Color.parseColor(result.colorHex))
            } catch (e: IllegalArgumentException) { /* ignore */ }

            // Animate bar width
            viewConfFill.post {
                val parentWidth = (viewConfFill.parent as? ViewGroup)?.width ?: return@post
                val lp = viewConfFill.layoutParams
                lp.width = 0
                viewConfFill.layoutParams = lp
                viewConfFill.postDelayed({
                    if (_binding == null) return@postDelayed
                    val targetWidth = (parentWidth * result.confidence / 100f).toInt()
                    val anim = android.animation.ValueAnimator.ofInt(0, targetWidth).apply {
                        duration = 600
                        addUpdateListener { animator ->
                            if (_binding == null) return@addUpdateListener
                            val lp2 = viewConfFill.layoutParams
                            lp2.width = animator.animatedValue as Int
                            viewConfFill.layoutParams = lp2
                        }
                    }
                    anim.start()
                }, 80)
            }

            // Add to history
            val historyItem = DiseaseHistoryItem(
                title = "${result.title} — Just scanned",
                meta  = "Now · ${result.confidence}% confidence · Mock model",
                resultType = result.type
            )
            historyAdapter.addItem(historyItem)
            rvDiseaseHistory.scrollToPosition(0)
        }
    }

    override fun onDestroyView() {
        fragmentScope.cancel()
        super.onDestroyView()
        _binding = null
    }
}
