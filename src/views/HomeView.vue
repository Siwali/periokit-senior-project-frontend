<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { LogOut, Home, User, Settings, LayoutDashboard } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const user = authStore.user
</script>

<template>
  <div class="min-h-screen bg-[#f3f6ff] font-sans flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-[#e2e8f0] flex flex-col">
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

      <div class="p-4 border-t border-[#e2e8f0]">
        <button 
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <LogOut class="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8">
      <header class="flex justify-between items-center mb-10">
        <div>
          <h1 class="text-3xl font-bold text-[#1f2937]">Welcome back, {{ user?.first_name || 'User' }}!</h1>
          <p class="text-gray-500 mt-1">Here's what's happening with your projects today.</p>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-sm font-bold text-[#1f2937]">{{ user?.first_name }} {{ user?.last_name }}</p>
            <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">{{ user?.role || 'User' }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-[#0052ff] flex items-center justify-center text-white font-bold text-xl overflow-hidden">
            <img v-if="user?.profile_image_url" :src="user.profile_image_url" class="w-full h-full object-cover" />
            <span v-else>{{ user?.first_name?.charAt(0) || 'U' }}</span>
          </div>
        </div>
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
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.font-sans {
  font-family: 'Inter', sans-serif;
}
</style>
