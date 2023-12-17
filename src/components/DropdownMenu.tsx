import { FC, useEffect } from 'react'
import { Pressable, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import tw from '@/helpers/lib/tailwind'

import { Typography } from './atoms/Typography'

type DropDownMenuProps = {
  open: boolean
  targetHeight?: number
  data: any[]
}

export const DropdownMenu: FC<DropDownMenuProps> = ({ open = false, targetHeight = 0, data = [] }) => {
  const totalHeight = data.length * (16 + 24 + 8)
  const height = useSharedValue(0)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (open) {
      height.value = withTiming(totalHeight, { duration: 300 })
      opacity.value = withTiming(1, { duration: 300 })
    } else {
      height.value = withTiming(0, { duration: 300 })
      opacity.value = withTiming(0, { duration: 300 })
    }
  }, [open, targetHeight, height, opacity])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
      opacity: opacity.value
    }
  })

  return (
    <>
      {open && (
        <Animated.View
          style={[
            tw`absolute top-0 shadow-offset-2  shadow-black dark:shadow-white shadow-md right-0 w-40 py-2 mt-${
              targetHeight + 2
            } rounded-md dark:bg-zinc-800 bg-zinc-100`,
            animatedStyle
          ]}
        >
          {data.map((item, index) => (
            <Pressable onPress={() => item.onPress()} key={index}>
              {({ pressed }) => (
                <View
                  style={[
                    tw`flex-row px-4 items-center justify-between w-full`,
                    tw.style({
                      'opacity-50 dark:bg-zinc-700 bg-zinc-300 ': pressed
                    })
                  ]}
                >
                  <View
                    style={[tw``, tw.style({ 'border-t dark:border-zinc-700 border-zinc-200 w-full': index !== 0 })]}
                  >
                    <Typography style={[tw` py-3 text-neutral-700 dark:text-neutral-200`]}>{item.label}</Typography>
                  </View>
                </View>
              )}
            </Pressable>
          ))}
        </Animated.View>
      )}
    </>
  )
}
