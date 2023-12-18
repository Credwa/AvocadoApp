import 'react-native-url-polyfill/auto'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseProdUrl = 'https://avgjpetxuposojfgvele.supabase.co'

const supabaseProdAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2Z2pwZXR4dXBvc29qZmd2ZWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTcwNDM0NTgsImV4cCI6MjAxMjYxOTQ1OH0.FdGMlQVkOqz_9ltLKXaeDBR7936Oy3QgL40jW0Rp-LU'

const supabaseUrl =
  process.env.NODE_ENV === 'development' ? process.env.EXPO_PUBLIC_SUPABASE_LOCAL_URL ?? '' : supabaseProdUrl
const supabaseAnonKey =
  process.env.NODE_ENV === 'development' ? process.env.EXPO_PUBLIC_SUPABASE_LOCAL_ANON_KEY ?? '' : supabaseProdAnonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: false
  }
})
