import { FC } from 'react'
import { Pressable, PressableProps } from 'react-native'

import tw from '@/helpers/lib/tailwind'

import { Typography } from './Typography'

type PillProps = PressableProps & {
  children: React.ReactNode
  styles?: string
  selected?: boolean
}

export const Pill: FC<PillProps> = ({ children, onPress, styles, selected = false }) => {
  let color = `border dark:border-zinc-400 border-zinc-500`
  let textColor = `dark:text-zinc-300 text-zinc-500`
  if (selected) {
    color = `dark:bg-zinc-700 dark:border-zinc-700 bg-zinc-600 border-zinc-600`
    textColor = `text-zinc-100`
  }

  return (
    <Pressable
      style={({ pressed }) => [
        tw.style(`px-5 py-2 rounded-full flex-row justify-center border shadow-none`, color, styles),
        tw.style({
          'opacity-80': pressed
        })
      ]}
      onPress={onPress}
    >
      <Typography weight={500} style={[tw`text-base font-semibold text-neutral`, tw.style(textColor)]}>
        {children}
      </Typography>
    </Pressable>
  )
}
