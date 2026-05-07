import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'

// 1. นำเข้า Environment Variables ของ Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 2. ตั้งค่า Http Link เพื่อยิงไปที่ Endpoint ของ Supabase GraphQL
const httpLink = createHttpLink({
  uri: `${supabaseUrl}/graphql/v1`, // ต้องต่อท้ายด้วย /graphql/v1
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

// 4. สร้าง Apollo Client
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})
