import 'react-native-url-polyfill/auto'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NODE_ENV !== 'development' ? 'http://192.168.1.23:54321' : 'https://avgjpetxuposojfgvele.supabase.co'
const supabaseAnonKey =
  process.env.NODE_ENV !== 'development'
    ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2Z2pwZXR4dXBvc29qZmd2ZWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTcwNDM0NTgsImV4cCI6MjAxMjYxOTQ1OH0.FdGMlQVkOqz_9ltLKXaeDBR7936Oy3QgL40jW0Rp-LU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})
