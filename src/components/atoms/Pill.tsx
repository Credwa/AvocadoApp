import { FC } from 'react'
import { Platform, Pressable, PressableProps } from 'react-native'

import tw from '@/helpers/lib/tailwind'

import { Typography } from './Typography'

type PillProps = PressableProps & {
  children: React.ReactNode
  styles?: string
  selected?: boolean
}

export const Pill: FC<PillProps> = ({ children, onPress, styles, selected = false }) => {
  let color = `border dark:border-secondary-light border-secondary-dark`
  let textColor = `dark:text-secondary-light text-secondary-dark`
  if (selected) {
    color = `dark:bg-secondary-light dark:border-secondary-light bg-secondary-main border-secondary-main`
    textColor = `text-zinc-950`
  }

  return (
    <Pressable
      style={({ pressed }) => [
        tw.style(`px-4 py-1.5 rounded-full flex-row justify-center border shadow-none`, color, styles),
        tw.style({
          'opacity-80': pressed
        })
      ]}
      onPress={onPress}
    >
      <Typography
        weight={500}
        style={[
          tw`${Platform.OS === 'android' ? 'text-xs' : 'text-sm'} font-semibold text-neutral`,
          tw.style(textColor)
        ]}
      >
        {children}
      </Typography>
    </Pressable>
  )
}
