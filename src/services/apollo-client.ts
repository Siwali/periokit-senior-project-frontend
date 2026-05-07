import { ApolloClient, createHttpLink, InMemoryCache, from } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { useAuthStore } from '../stores/auth'

// 1. นำเข้า Environment Variables ของ Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 2. ตั้งค่า Http Link เพื่อยิงไปที่ Endpoint ของ Supabase GraphQL
const httpLink = createHttpLink({
  uri: `${supabaseUrl}/graphql/v1`, 
})

// 3. ใช้ setContext เพื่อใส่ Headers (apikey และ Authorization)
const authLink = setContext((_, { headers }) => {
  // หากระบบของคุณมีระบบ Login (เช่น เก็บ token ไว้ใน localStorage) 
  // คุณสามารถดึง Token ของ User มาใส่แทน supabaseAnonKey เพื่อทำ RLS (Row Level Security) ได้
  const token = localStorage.getItem('periokit_access_token') || supabaseAnonKey

  return {
    headers: {
      ...headers,
      apikey: supabaseAnonKey, // Supabase ต้องการ apikey เสมอ
      Authorization: `Bearer ${token}`, // Bearer token สำหรับสิทธิ์การเข้าถึงข้อมูล
    }
  }
})

// 4. สร้าง Error Link เพื่อดักจับ 401 Unauthorized
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // ตรวจสอบ Error Code หรือ Message ที่บ่งบอกว่า Unauthorized
      if (err.extensions?.code === 'UNAUTHENTICATED' || err.message?.toLowerCase().includes('unauthorized') || err.message?.includes('401')) {
        const authStore = useAuthStore()
        authStore.handleUnauthorized()
        break
      }
    }
  }

  // สำหรับ Network Error เช่น 401
  if (networkError && 'statusCode' in networkError && networkError.statusCode === 401) {
    const authStore = useAuthStore()
    authStore.handleUnauthorized()
  }
})

// 5. สร้าง Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})
