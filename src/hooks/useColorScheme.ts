import { StatusBar } from 'react-native'
import { useAppColorScheme } from 'twrnc'

import tw from '@/helpers/lib/tailwind'
import { useAppStore } from '@/store'

export function useColorScheme() {
  const appearance = useAppStore((state) => state.appearance)
  const colorScheme = useAppColorScheme(tw)[0]
  const scheme = appearance === 'automatic' ? colorScheme : appearance
  StatusBar.setBarStyle(scheme === 'dark' ? 'light-content' : 'dark-content')
  return scheme
}
