import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import AsyncStorage from '@react-native-async-storage/async-storage'

interface AppState {}

const initialState: Partial<AppState> = {
  apiKey: '',
  accountDataTime: null,
  accountInfo: null
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        apiKey: ''
      }),
      { name: 'AppStore' }
    )
  )
)
