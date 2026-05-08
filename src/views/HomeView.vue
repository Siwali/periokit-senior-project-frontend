<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { User, Settings, LayoutDashboard } from 'lucide-vue-next'
import Navbar from '../components/layout/Navbar.vue'

const authStore = useAuthStore()
const router = useRouter()

const user = authStore.user
</script>

<template>
  <div class="min-h-screen bg-[#f3f6ff] font-sans flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-[#e2e8f0] flex flex-col sticky top-0 h-screen">
      <div class="p-6 flex items-center gap-3">
        <img src="../assets/mini_Logo_Periokit.png" alt="Logo" class="h-8 w-7" />
        <span class="text-xl font-bold text-[#0052ff]">PerioKit</span>
      </div>
      
      <nav class="flex-1 px-4 space-y-1">
        <a href="#" class="flex items-center gap-3 px-4 py-3 bg-blue-50 text-[#0052ff] rounded-xl font-bold">
          <LayoutDashboard class="w-5 h-5" />
          Dashboard
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
          <User class="w-5 h-5" />
          Patients
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
          <Settings class="w-5 h-5" />
          Settings
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <Navbar />
      
      <main class="p-8">
        <header class="mb-10">
          <h1 class="text-3xl font-bold text-[#1f2937]">Welcome back, {{ user?.first_name || 'User' }}!</h1>
          <p class="text-gray-500 mt-1">Here's what's happening with your projects today.</p>
        </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Stats Cards -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-[#e2e8f0]">
          <p class="text-gray-500 text-sm font-medium">Total Patients</p>
          <h3 class="text-2xl font-bold text-[#1f2937] mt-2">124</h3>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-[#e2e8f0]">
          <p class="text-gray-500 text-sm font-medium">New Charts</p>
          <h3 class="text-2xl font-bold text-[#1f2937] mt-2">12</h3>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-[#e2e8f0]">
          <p class="text-gray-500 text-sm font-medium">Pending Reviews</p>
          <h3 class="text-2xl font-bold text-[#1f2937] mt-2">5</h3>
        </div>
      </div>
    </main>
    </div>
  </div>
</template>


