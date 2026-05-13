<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import { 
  Menu, 
  Activity, 
  User, 
  ChevronDown,
  Bell, 
  LogOut 
} from 'lucide-vue-next'
import ConfirmModal from '../common/ConfirmModal.vue'

const authStore = useAuthStore()
const router = useRouter()

const showLogoutConfirm = ref(false)
const isProfileMenuOpen = ref(false)

const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value
}

const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.profile-dropdown-container')) {
    isProfileMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)
})

const handleLogout = () => {
  isProfileMenuOpen.value = false
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
  <nav class="bg-white border-b border-[#e2e8f0] h-16 flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
    <!-- Left: Hamburger + Logo + Nav Links -->
    <div class="flex items-center gap-8">
      <div class="flex items-center gap-6">
        <!-- Hamburger Menu (Placeholder) -->
        <button class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu class="w-6 h-6 text-[#1f2937]" />
        </button>
        
        <!-- Logo -->
        <router-link to="/chart" class="flex items-center">
          <img src="@/assets/logo_perio.png" alt="PERIOKIT" class="h-8 w-auto" />
        </router-link>
      </div>

      <!-- Navigation Links -->
      <div class="hidden md:flex items-center gap-6">
        <router-link 
          to="/chart" 
          class="flex items-center gap-2 text-[#4b5563] hover:text-[#0052ff] font-bold text-sm transition-colors"
          active-class="text-[#0052ff]"
        >
          <Activity class="w-5 h-5" />
          Periodontal Chart
        </router-link>
        <router-link 
          to="/my-patient" 
          class="flex items-center gap-2 text-[#4b5563] hover:text-[#0052ff] font-bold text-sm transition-colors"
          active-class="text-[#0052ff]"
        >
          <User class="w-5 h-5" />
          My Patient
        </router-link>
      </div>
    </div>

    <!-- Right: Actions & User Profile Section -->
    <div class="flex items-center gap-6">
      <!-- Notification Icon -->
      <button class="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
        <Bell class="w-5 h-5" />
        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button>

      <!-- User Profile Dropdown Container -->
      <div class="relative profile-dropdown-container">
        <div 
          @click="toggleProfileMenu"
          class="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div class="text-right hidden sm:block">
            <p class="text-sm font-bold text-[#1f2937] leading-none mb-0.5 group-hover:text-[#0052ff] transition-colors">
              {{ user?.first_name }} {{ user?.last_name }}
            </p>
            <p class="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              {{ user?.role || 'Member' }}
            </p>
          </div>
          
          <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm group-hover:border-[#0052ff]/20 transition-all">
            <img v-if="user?.profile_image_url" :src="user.profile_image_url" class="w-full h-full object-cover" />
            <User v-else class="w-6 h-6 text-gray-400" />
          </div>

          <ChevronDown 
            class="w-4 h-4 text-gray-400 transition-transform duration-200" 
            :class="{ 'rotate-180 text-[#0052ff]': isProfileMenuOpen }"
          />
        </div>

        <!-- Dropdown Menu -->
        <div 
          v-if="isProfileMenuOpen"
          class="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] py-2 z-50"
        >
          <!-- User Info (Mobile/Small screens) -->
          <div class="px-4 py-3 border-b border-[#e2e8f0] mb-1 sm:hidden">
            <p class="text-sm font-bold text-[#1f2937] truncate">{{ user?.first_name }} {{ user?.last_name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ user?.email }}</p>
          </div>

          <button 
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors text-sm font-bold"
          >
            <div class="p-1.5 bg-red-100 rounded-lg">
              <LogOut class="w-4 h-4" />
            </div>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Logout Confirmation Modal -->
  <ConfirmModal
    :show="showLogoutConfirm"
    title="Sign Out"
    :message="`Are you sure you want to sign out of PerioKit?\nYou will need to login again to access your charts.`"
    confirmText="Sign Out"
    type="danger"
    @confirm="confirmLogout"
    @cancel="showLogoutConfirm = false"
  />
</template>




