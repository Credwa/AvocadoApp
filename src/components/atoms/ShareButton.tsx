import { Pressable } from 'react-native'

import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Ionicons } from '@expo/vector-icons'

type ShareButtonProps = {
  size?: number
  style?: string
  forceColorScheme?: 'dark' | 'light'
  href?: string
}

export default function ShareButton({ size = 28, style, forceColorScheme, href }: ShareButtonProps) {
  let colorScheme = useColorScheme()

  if (forceColorScheme) colorScheme = forceColorScheme

  const share = () => {}

  return (
    <Pressable style={[tw`p-4`, tw.style(style)]} onPress={share}>
      {({ pressed }) => (
        <Ionicons
          name="md-share-outline"
          size={size}
          style={[tw.style(''), tw.style({ 'opacity-50': pressed })]}
          color={colorScheme === 'dark' ? tw.color('text-zinc-100') : tw.color('text-zinc-700')}
        />
      )}
    </Pressable>
  )
}
