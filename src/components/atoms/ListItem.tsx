import React, { FC } from 'react'
import { Pressable, View } from 'react-native'

import tw from '@/helpers/lib/tailwind'
import { Ionicons } from '@expo/vector-icons'

type ListItemProps = {
  onPress?: () => void
  children: any
  icon: JSX.Element
  index: number
  length: number
  showCaret?: boolean
  styles?: string
}

export const ListItem: FC<ListItemProps> = ({ icon, onPress, styles, children, index, length, showCaret = true }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        tw.style(`w-full px-4 bg-white dark:bg-zinc-800`),
        tw.style({
          'bg-zinc-300 dark:bg-zinc-700': pressed,
          'rounded-t-md': index === 0 && length > 1,
          'rounded-b-md': index === length - 1 && length > 1,
          'rounded-md': length === 1
        })
      ]}
    >
      <View
        style={tw.style(`flex-row justify-between py-3 items-center`, {
          'border-b-0': index === length - 1 && length > 0
        })}
      >
        <View style={tw.style(`flex-row items-center gap-x-4`, styles)}>
          {icon}
          {children}
        </View>

        {showCaret && <Ionicons style={tw`items-end pt-1 icon-neutral`} name="chevron-forward" size={16} />}
      </View>
    </Pressable>
  )
}
