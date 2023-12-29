import { LinearGradient } from 'expo-linear-gradient'
import { FC } from 'react'
import { Pressable, View } from 'react-native'

import { usePlayback } from '@/context/playbackContext'
import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useAppStore } from '@/store'
import { Ionicons } from '@expo/vector-icons'

import { Typography } from './atoms/Typography'

type PlaybarProps = {
  styles?: string
}

export const Playbar: FC<PlaybarProps> = () => {
  const colorScheme = useColorScheme()
  const tabBarHeight = useAppStore((state) => state.tabBarHeight)
  const { stop } = usePlayback()
  // ['#0f0421', '#0f0421', '#110424', '#120426', '#120426', '#140529', '#15052b']
  const gradient =
    colorScheme === 'dark'
      ? ['#0a0a0a', '#0f0f0f']
      : ['#0f0421', '#0f0421', '#110424', '#120426', '#120426', '#140529', '#15052b']

  return (
    <View style={tw.style(`absolute w-screen h-14 px-1 bottom-[${tabBarHeight}px]`)}>
      <Pressable>
        {({ pressed }) => (
          <LinearGradient
            colors={gradient.map((color) => (color ? color : 'transparent'))}
            start={[0, 1]}
            end={[1, 0]}
            style={tw.style(`flex flex-row items-center justify-between w-full h-full rounded-md gutter-sm`, {
              'opacity-80': pressed
            })}
          >
            <Typography>Hello</Typography>
            <Typography>Hello</Typography>
            <Pressable hitSlop={10} onPress={stop}>
              <Ionicons name="close" size={24} color={tw.color('text-zinc-500')} />
            </Pressable>
          </LinearGradient>
        )}
      </Pressable>
    </View>
  )
}
