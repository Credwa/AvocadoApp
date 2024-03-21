import { router } from 'expo-router'
import { Pressable } from 'react-native'

import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Ionicons } from '@expo/vector-icons'

type BackButtonProps = {
  size?: number
  style?: string
  variant?: 'close'
  hasBackground?: boolean
  forceColorScheme?: 'dark' | 'light'
  href?: string
}

export default function BackButton({
  size = 32,
  style,
  forceColorScheme,
  href,
  variant,
  hasBackground = false
}: BackButtonProps) {
  let colorScheme = useColorScheme()

  if (forceColorScheme) colorScheme = forceColorScheme

  const goBack = () => {
    if (href) router.navigate(href)
    else router.back()
  }

  return (
    <Pressable
      style={[
        tw.style(`p-4`, { 'dark:bg-[#1f2937CC] bg-[#ffffffCC] rounded-full w-8 p-0 ml-4 mt-4': hasBackground }),
        tw.style(style)
      ]}
      onPress={goBack}
    >
      {({ pressed }) => (
        <Ionicons
          name={variant ? 'close' : 'chevron-back'}
          size={size}
          style={[tw.style('w-8'), tw.style({ 'opacity-50': pressed })]}
          color={colorScheme === 'dark' ? tw.color('text-zinc-100') : tw.color('text-zinc-700')}
        />
      )}
    </Pressable>
  )
}
