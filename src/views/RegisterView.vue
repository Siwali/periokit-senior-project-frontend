<script setup lang="ts">
import { reactive,ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'
import { Upload } from 'lucide-vue-next'


const router = useRouter()

const form = reactive({
  studentId: '',
  firstName: '',
  surname: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// เพิ่ม state สำหรับเก็บ error แยกแต่ละช่อง
const errors = reactive({
  studentId: '',
  firstName: '',
  surname: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  // 1. ล้าง error เก่าทั้งหมดก่อน
  Object.keys(errors).forEach(key => (errors[key as keyof typeof errors] = ''))
  errorMessage.value = ''
  successMessage.value = ''

  // 2. Validate ทีละช่อง
  if (!form.studentId) {
    errors.studentId = 'Please enter your Student ID'
    return
  }
  if (!form.firstName) {
    errors.firstName = 'Please enter your First Name'
    return
  }
  if (!form.surname) {
    errors.surname = 'Please enter your Surname'
    return
  }
  if (!form.email) {
    errors.email = 'Please enter your Email'
    return
  }
  if (!form.password) {
    errors.password = 'Please enter your Password'
    return
  }
  if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    return
  }
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          student_id: form.studentId,
          first_name: form.firstName,
          surname: form.surname,
        }
      }
    })

    if (error) throw error

    successMessage.value = 'Registration successful! Please check your email for verification.'
    
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (error: any) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#f3f6ff] flex flex-col items-center justify-center py-8 px-4 font-sans">
    <div class="w-full max-w-[650px]">
      <div class="bg-white rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.05)] p-10">
        <!-- Logo & Header -->
        <div class="mb-6">
          <img src="../assets/mini_Logo_Periokit.png" alt="PerioKit Logo" class="h-24 w-20 ml-4 mb-4" />
          <h2 class="text-[32px] font-bold text-[#0052ff] leading-none mb-2">Sign up</h2>
          <p class="text-[#6b7280] text-[15px]">Enter your details below to create your account and get started.</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- Profile Picture -->
          <div class="flex flex-col items-center mb-2">
            <span class="text-[13px] font-bold text-[#1f2937] mb-3">Profile Picture</span>
            <div class="w-[80px] h-[80px] rounded-full bg-[#f1f5f9] border border-[#e2e8f0] mb-4"></div>
            <button type="button" class="flex items-center gap-2 px-4 py-1.5 border border-[#e2e8f0] rounded-[8px] text-[13px] font-medium text-[#374151] hover:bg-gray-50 transition-colors">
              <Upload class="w-3.5 h-3.5" />
              Upload
            </button>
          </div>

          <!-- Student ID -->
          <div>
            <label class="block text-[13px] font-bold text-[#1f2937] mb-1.5">Student ID</label>
            <input
              v-model="form.studentId"
              type="text"
              :class="[
                'w-full bg-[#f1f5f9] border-none rounded-[10px] py-2.5 px-4 text-[#1f2937] placeholder-[#9ca3af] focus:ring-2 focus:ring-[#0052ff] outline-none transition-all',
                errors.studentId ? 'ring-1 ring-red-500 bg-red-50' : ''
              ]"
            />
            <p v-if="errors.studentId" class="text-red-500 text-[11px] font-bold mt-1 ml-1">{{ errors.studentId }}</p>
          </div>

          <!-- First Name & Surname -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[13px] font-bold text-[#1f2937] mb-1.5">First Name</label>
                <input
                  v-model="form.firstName"
                  type="text"
                  placeholder="enter..."
                  :class="[
                    'w-full bg-[#f1f5f9] border-none rounded-[10px] py-2.5 px-4 text-[#1f2937] placeholder-[#9ca3af] focus:ring-2 focus:ring-[#0052ff] outline-none transition-all',
                    errors.firstName ? 'ring-1 ring-red-500 bg-red-50' : ''
                  ]"
                />
                <p v-if="errors.firstName" class="text-red-500 text-[11px] font-bold mt-1 ml-1">{{ errors.firstName }}</p>
            </div>
            <div>
              <label class="block text-[13px] font-bold text-[#1f2937] mb-1.5">Surname</label>
                <input
                  v-model="form.surname"
                  type="text"
                  placeholder="enter..."
                  :class="[
                    'w-full bg-[#f1f4f9] border-none rounded-[10px] py-2.5 px-4 text-[#1f2937] placeholder-[#9ca3af] focus:ring-2 focus:ring-[#0052ff] outline-none transition-all',
                    errors.surname ? 'ring-1 ring-red-500 bg-red-50' : ''
                  ]"
                />
                <p v-if="errors.surname" class="text-red-500 text-[11px] font-bold mt-1 ml-1">{{ errors.surname }}</p>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-[13px] font-bold text-[#1f2937] mb-1.5">Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="example@gmail.com"
              :class="[
                'w-full bg-[#f1f5f9] border-none rounded-[10px] py-2.5 px-4 text-[#1f2937] placeholder-[#9ca3af] focus:ring-2 focus:ring-[#0052ff] outline-none transition-all',
                errors.email ? 'ring-1 ring-red-500 bg-red-50' : ''
              ]"
            />
            <p v-if="errors.email" class="text-red-500 text-[11px] font-bold mt-1 ml-1">{{ errors.email }}</p>
          </div>

          <!-- Password & Confirm Password -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[13px] font-bold text-[#1f2937] mb-1.5">Password</label>
                <input
                  v-model="form.password"
                  type="password"
                  placeholder="enter..."
                  :class="[
                    'w-full bg-[#f1f5f9] border-none rounded-[10px] py-2.5 px-4 text-[#1f2937] placeholder-[#9ca3af] focus:ring-2 focus:ring-[#0052ff] outline-none transition-all',
                    errors.password ? 'ring-1 ring-red-500 bg-red-50' : ''
                  ]"
                />
                <p v-if="errors.password" class="text-red-500 text-[11px] font-bold mt-1 ml-1">{{ errors.password }}</p>
            </div>
            <div>
              <label class="block text-[13px] font-bold text-[#1f2937] mb-1.5">Confirm Password</label>
                <input
                  v-model="form.confirmPassword"
                  type="password"
                  placeholder="enter..."
                  :class="[
                    'w-full bg-[#f1f5f9] border-none rounded-[10px] py-2.5 px-4 text-[#1f2937] placeholder-[#9ca3af] focus:ring-2 focus:ring-[#0052ff] outline-none transition-all',
                    errors.confirmPassword ? 'ring-1 ring-red-500 bg-red-50' : ''
                  ]"
                />
                <p v-if="errors.confirmPassword" class="text-red-500 text-[11px] font-bold mt-1 ml-1">{{ errors.confirmPassword }}</p>
            </div>
          </div>

          <!-- Error & Success Messages -->
          <div class="space-y-2 mt-2 text-center">
            <div v-if="errorMessage" class="text-red-500 text-[12px] font-bold">
              {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="text-green-600 text-[14px] font-bold bg-green-50 p-3 rounded-[10px] border border-green-100">
              {{ successMessage }}
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-[#0052ff] hover:bg-[#0042cc] text-white font-bold py-3 rounded-[10px] transition-colors disabled:opacity-50"
            >
              {{ loading ? 'Signing up...' : 'Confirm' }}
            </button>
          </div>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-[13px] text-[#6b7280]">
            Already have an account?
            <router-link to="/login" class="font-bold text-[#0052ff] hover:underline">
              Login
            </router-link>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-4 text-center">
        <p class="text-[12px] text-[#9ca3af]">© 2026 PerioKit.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.font-sans {
  font-family: 'Inter', sans-serif;
}

input::placeholder {
  color: #9ca3af;
  font-size: 13px;
}
</style>
