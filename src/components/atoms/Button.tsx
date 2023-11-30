import { FC } from 'react'
import { Pressable, PressableProps, Text } from 'react-native'

import tw from '@/helpers/lib/tailwind'

type ButtonProps = PressableProps & {
  variant?: 'primary' | 'secondary' | 'danger'
  children: React.ReactNode
  styles?: string
}

export const Button: FC<ButtonProps> = ({ children, onPress, styles, variant = 'primary' }) => {
  let color = ``

  switch (variant) {
    case 'primary':
      color = 'dark:bg-primary-main bg-primary-main dark:shadow-primary-main shadow-black'
      break
    case 'secondary':
      color = 'bg-secondary-main'
      break
    case 'danger':
      color = 'bg-danger-main'
      break
  }
  return (
    <Pressable
      style={({ pressed }) => [
        tw.style(
          `px-5 py-2 rounded-lg shadow-md dark:shadow-lg dark:shadow-offset-1 flex-row justify-center`,
          color,
          styles
        ),
        tw.style({
          'opacity-80': pressed
        })
      ]}
      onPress={onPress}
    >
      <Text style={tw`text-base font-semibold text-white dark:text-zinc-200`}>{children}</Text>
    </Pressable>
  )
}
