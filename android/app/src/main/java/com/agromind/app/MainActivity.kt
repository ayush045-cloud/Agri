package com.agromind.app

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.MenuItem
import androidx.appcompat.app.ActionBarDrawerToggle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.NavigationUI
import com.agromind.app.databinding.ActivityMainBinding
import com.google.android.material.navigation.NavigationView

class MainActivity : AppCompatActivity(), NavigationView.OnNavigationItemSelectedListener {

    private lateinit var binding: ActivityMainBinding
    private lateinit var navController: NavController

    /** Map from menu item id → page title and subtitle. */
    private val pageTitles = mapOf(
        R.id.nav_dashboard  to Pair("Farm Dashboard",    "Real-time status"),
        R.id.nav_irrigation to Pair("Smart Irrigation",  "AI-optimised watering"),
        R.id.nav_disease    to Pair("Disease Detection", "Upload a leaf photo"),
        R.id.nav_crops      to Pair("Crop Advisor",      "ML recommendations"),
        R.id.nav_chat       to Pair("Farm AI Chat",      "Conversational assistant"),
        R.id.nav_sensors    to Pair("Sensors & Data",    "Live IoT readings"),
        R.id.nav_settings   to Pair("Settings",          "Configure the app")
    )

    private val clockHandler = Handler(Looper.getMainLooper())
    private val clockRunnable = object : Runnable {
        override fun run() {
            updateClock()
            clockHandler.postDelayed(this, 60_000)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupNavigation()
        setupDrawer()
        setupBottomNav()
        setupTopbar()
        clockHandler.post(clockRunnable)
    }

    private fun setupNavigation() {
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController

        // Listen for destination changes to update the topbar
        navController.addOnDestinationChangedListener { _, destination, _ ->
            val titles = pageTitles[destination.id]
            if (titles != null) {
                binding.tvTopbarTitle.text = titles.first
            }
            // Sync bottom nav
            syncBottomNav(destination.id)
        }
    }

    private fun setupDrawer() {
        binding.btnHamburger.setOnClickListener {
            if (binding.drawerLayout.isDrawerOpen(GravityCompat.START)) {
                binding.drawerLayout.closeDrawer(GravityCompat.START)
            } else {
                binding.drawerLayout.openDrawer(GravityCompat.START)
            }
        }

        binding.navView.setNavigationItemSelectedListener(this)

        // Mark dashboard as checked initially
        binding.navView.setCheckedItem(R.id.nav_dashboard)
    }

    private fun setupBottomNav() {
        binding.bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_dashboard  -> { navigateTo(R.id.nav_dashboard);  true }
                R.id.nav_irrigation -> { navigateTo(R.id.nav_irrigation); true }
                R.id.nav_disease    -> { navigateTo(R.id.nav_disease);    true }
                R.id.nav_chat       -> { navigateTo(R.id.nav_chat);       true }
                R.id.nav_more       -> { openDrawer(); true }
                else -> false
            }
        }
    }

    private fun setupTopbar() {
        binding.chipAlert.setOnClickListener {
            navigateTo(R.id.nav_sensors)
        }
    }

    override fun onNavigationItemSelected(item: MenuItem): Boolean {
        val id = item.itemId
        if (pageTitles.containsKey(id)) {
            navigateTo(id)
        }
        binding.drawerLayout.closeDrawer(GravityCompat.START)
        return true
    }

    private fun navigateTo(destinationId: Int) {
        if (navController.currentDestination?.id != destinationId) {
            navController.navigate(destinationId)
        }
        // Update drawer check
        binding.navView.setCheckedItem(destinationId)
    }

    private fun syncBottomNav(destinationId: Int) {
        val bottomNavItemId = when (destinationId) {
            R.id.nav_dashboard  -> R.id.nav_dashboard
            R.id.nav_irrigation -> R.id.nav_irrigation
            R.id.nav_disease    -> R.id.nav_disease
            R.id.nav_chat       -> R.id.nav_chat
            else                -> R.id.nav_more
        }
        // Update bottom nav selection without triggering the listener
        binding.bottomNav.menu.findItem(bottomNavItemId)?.isChecked = true
    }

    private fun openDrawer() {
        binding.drawerLayout.openDrawer(GravityCompat.START)
    }

    private fun updateClock() {
        val now = java.util.Calendar.getInstance()
        val h = now.get(java.util.Calendar.HOUR_OF_DAY)
        val m = now.get(java.util.Calendar.MINUTE)
        binding.tvLastUpdated.text = "updated %02d:%02d".format(h, m)
    }

    override fun onBackPressed() {
        if (binding.drawerLayout.isDrawerOpen(GravityCompat.START)) {
            binding.drawerLayout.closeDrawer(GravityCompat.START)
        } else if (!navController.popBackStack()) {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        clockHandler.removeCallbacks(clockRunnable)
        super.onDestroy()
    }
}
