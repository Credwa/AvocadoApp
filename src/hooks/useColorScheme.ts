import { StatusBar, useColorScheme as useNativeColorScheme } from 'react-native'

import { useAppStore } from '@/store'

export function useColorScheme() {
  const appearance = useAppStore((state) => state.appearance)
  const colorScheme = useNativeColorScheme()
  const scheme = appearance === 'automatic' ? colorScheme : appearance
  StatusBar.setBarStyle(scheme === 'dark' ? 'light-content' : 'dark-content')
  return scheme
}
