import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import AsyncStorage from '@react-native-async-storage/async-storage'

interface AppState {
  user_id: string
}

const initialState: Partial<AppState> = {
  user_id: ''
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        user_id: '',
        setUserId: (user_id: string) => set({ user_id }),
        reset: () => set({ ...initialState })
      }),
      { name: 'AppStore', storage: createJSONStorage(() => AsyncStorage) }
    )
  )
)
