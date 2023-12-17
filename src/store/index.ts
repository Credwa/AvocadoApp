import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import AsyncStorage from '@react-native-async-storage/async-storage'

interface AppState {
  user_id: string
  appearance: 'light' | 'dark' | 'automatic'
  setAppearance: (appearance: 'light' | 'dark' | 'automatic') => void
}

const initialState: Partial<AppState> = {
  user_id: '',
  appearance: 'automatic'
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        user_id: '',
        appearance: 'automatic',
        setAppearance: (appearance: 'light' | 'dark' | 'automatic') => set({ appearance }),
        setUserId: (user_id: string) => set({ user_id }),
        reset: () => set({ ...initialState })
      }),
      { name: 'AppStore', storage: createJSONStorage(() => AsyncStorage) }
    )
  )
)
