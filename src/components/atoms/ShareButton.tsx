import * as Linking from 'expo-linking'
import { usePathname } from 'expo-router'
import * as Sharing from 'expo-sharing'
import { Pressable } from 'react-native'

import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Ionicons } from '@expo/vector-icons'

import ShowToast from './Toast'

type ShareButtonProps = {
  size?: number
  style?: string
  forceColorScheme?: 'dark' | 'light'
  href?: string
}

export default function ShareButton({ size = 28, style, forceColorScheme, href }: ShareButtonProps) {
  let colorScheme = useColorScheme()
  const url = Linking.useURL()
  const pathname = usePathname()

  if (forceColorScheme) colorScheme = forceColorScheme

  const share = async () => {
    const shareAvailable = await Sharing.isAvailableAsync()
    if (shareAvailable) {
      await Sharing.shareAsync(url + pathname)
    } else {
      console.log('Sharing not available')
      ShowToast('Sharing not available', {
        backgroundColor: colorScheme === 'dark' ? tw.color('bg-zinc-800') : tw.color('bg-zinc-200')
      })
    }
  }

  return (
    <Pressable style={[tw`p-4`, tw.style(style)]} onPress={share}>
      {({ pressed }) => (
        <Ionicons
          name="share-outline"
          size={size}
          style={[tw.style(''), tw.style({ 'opacity-50': pressed })]}
          color={colorScheme === 'dark' ? tw.color('text-zinc-100') : tw.color('text-zinc-700')}
        />
      )}
    </Pressable>
  )
}
