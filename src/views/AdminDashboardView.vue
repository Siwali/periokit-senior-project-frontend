<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { LogOut, ShieldCheck, Users, BarChart3, Settings } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const user = authStore.user
</script>

<template>
  <div class="min-h-screen bg-slate-900 font-sans flex text-white">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div class="p-6 flex items-center gap-3">
        <ShieldCheck class="h-8 w-8 text-blue-400" />
        <span class="text-xl font-bold tracking-tight">Admin Portal</span>
      </div>
      
      <nav class="flex-1 px-4 space-y-1 mt-4">
        <a href="#" class="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold">
          <BarChart3 class="w-5 h-5" />
          Overview
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-700 rounded-xl transition-colors">
          <Users class="w-5 h-5" />
          User Management
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-700 rounded-xl transition-colors">
          <Settings class="w-5 h-5" />
          System Settings
        </a>
      </nav>

      <div class="p-4 border-t border-slate-700">
        <button 
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors font-medium"
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
          <h1 class="text-3xl font-bold">Admin Dashboard</h1>
          <p class="text-slate-400 mt-1">System status and administrative controls.</p>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-sm font-bold">{{ user?.first_name }} {{ user?.last_name }}</p>
            <span class="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-bold uppercase tracking-wider">Administrator</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center text-blue-400 font-bold text-xl">
            {{ user?.first_name?.charAt(0) || 'A' }}
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Admin Stats -->
        <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <p class="text-slate-400 text-sm font-medium">Active Users</p>
          <h3 class="text-3xl font-bold mt-2">1,248</h3>
          <p class="text-green-400 text-xs mt-2">+12% from last week</p>
        </div>
        <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <p class="text-slate-400 text-sm font-medium">System Health</p>
          <h3 class="text-3xl font-bold mt-2">99.9%</h3>
          <p class="text-blue-400 text-xs mt-2">All systems operational</p>
        </div>
        <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <p class="text-slate-400 text-sm font-medium">New Registrations</p>
          <h3 class="text-3xl font-bold mt-2">45</h3>
          <p class="text-slate-500 text-xs mt-2">Past 24 hours</p>
        </div>
        <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <p class="text-slate-400 text-sm font-medium">Server Load</p>
          <h3 class="text-3xl font-bold mt-2">24%</h3>
          <p class="text-green-400 text-xs mt-2">Normal</p>
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
