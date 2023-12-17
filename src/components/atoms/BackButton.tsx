import { router } from 'expo-router'
import { Pressable, useColorScheme } from 'react-native'

import tw from '@/helpers/lib/tailwind'
import { Ionicons } from '@expo/vector-icons'

type BackButtonProps = {
  size?: number
  style?: string
  forceColorScheme?: 'dark' | 'light'
  href?: string
}

export default function BackButton({ size = 32, style, forceColorScheme, href }: BackButtonProps) {
  let colorScheme = useColorScheme()

  if (forceColorScheme) colorScheme = forceColorScheme

  const goBack = () => {
    router.back()
  }

  return (
    <Pressable style={[tw`p-4`, tw.style(style)]} onPress={goBack}>
      {({ pressed }) => (
        <Ionicons
          name="chevron-back"
          size={size}
          style={[tw.style(''), tw.style({ 'opacity-50': pressed })]}
          color={colorScheme === 'dark' ? tw.color('text-zinc-100') : tw.color('text-zinc-700')}
        />
      )}
    </Pressable>
  )
}
