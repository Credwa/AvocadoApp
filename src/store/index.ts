import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import AsyncStorage from '@react-native-async-storage/async-storage'

interface AppState {
  user_id: string
  appearance: 'light' | 'dark' | 'automatic'
  tabBarHeight: number
  setAppearance: (appearance: 'light' | 'dark' | 'automatic') => void
  setTabBarHeight: (tabBarHeight: number) => void
}

const initialState: Partial<AppState> = {
  user_id: '',
  appearance: 'automatic',
  tabBarHeight: 80
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        user_id: '',
        appearance: 'automatic',
        tabBarHeight: 80,
        setTabBarHeight: (tabBarHeight: number) => set({ tabBarHeight }),
        setAppearance: (appearance: 'light' | 'dark' | 'automatic') => set({ appearance }),
        setUserId: (user_id: string) => set({ user_id }),
        reset: () => set({ ...initialState })
      }),
      { name: 'AppStore', storage: createJSONStorage(() => AsyncStorage) }
    )
  )
)
