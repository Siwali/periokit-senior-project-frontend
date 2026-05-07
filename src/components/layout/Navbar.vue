<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import { LogOut, Bell, Search } from 'lucide-vue-next'
import ConfirmModal from '../common/ConfirmModal.vue'

const authStore = useAuthStore()
const router = useRouter()

const showLogoutConfirm = ref(false)

const handleLogout = () => {
  showLogoutConfirm.value = true
}

const confirmLogout = async () => {
  showLogoutConfirm.value = false
  await authStore.logout()
  router.replace({ path: '/login', query: { logout: 'true' } })
}

const user = authStore.user
</script>

<template>
  <nav class="bg-white border-b border-[#e2e8f0] h-16 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
    <!-- Left: Search Bar -->
    <div class="flex-1 max-w-md hidden md:block">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search for patients or charts..." 
          class="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all"
        />
      </div>
    </div>

    <!-- Right: Actions & Profile -->
    <div class="flex items-center gap-6">
      <!-- Notifications -->
      <button class="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
        <Bell class="w-5 h-5" />
        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button>

      <!-- Vertical Divider -->
      <div class="h-8 w-[1px] bg-[#e2e8f0]"></div>

      <!-- User Profile -->
      <div class="flex items-center gap-4">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-bold text-[#1f2937] leading-none mb-1">
            {{ user?.first_name }} {{ user?.last_name }}
          </p>
          <p class="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
            {{ user?.role || 'Member' }}
          </p>
        </div>
        
        <!-- User Menu / Dropdown Trigger (Simplified for now) -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#0052ff] flex items-center justify-center text-white font-bold text-sm overflow-hidden border-2 border-white shadow-sm">
            <img v-if="user?.profile_image_url" :src="user.profile_image_url" class="w-full h-full object-cover" />
            <span v-else>{{ user?.first_name?.charAt(0) || 'U' }}</span>
          </div>

          <!-- Logout Button -->
          <button 
            @click="handleLogout"
            class="flex items-center gap-2 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-bold"
            title="Sign Out"
          >
            <LogOut class="w-4 h-4" />
            <span class="hidden lg:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Logout Confirmation Modal -->
  <ConfirmModal
    :show="showLogoutConfirm"
    title="Sign Out"
    message="Are you sure you want to sign out of PerioKit? You will need to login again to access your charts."
    confirmText="Sign Out"
    type="danger"
    @confirm="confirmLogout"
    @cancel="showLogoutConfirm = false"
  />
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

nav {
  font-family: 'Inter', sans-serif;
}
</style>
