import LottieView from 'lottie-react-native'
import { FC } from 'react'
import { Pressable, PressableProps } from 'react-native'

import tw from '@/helpers/lib/tailwind'

import { Typography } from './Typography'

type ButtonProps = PressableProps & {
  variant?: 'primary' | 'secondary' | 'danger' | 'default'
  children: React.ReactNode
  styles?: string
  outline?: boolean
  loading?: boolean
}

export const Button: FC<ButtonProps> = ({
  loading = false,
  children,
  onPress,
  styles,
  variant = 'primary',
  outline = false
}) => {
  let color = ``
  let textColor = ``
  switch (variant) {
    case 'primary':
      color = outline
        ? 'border dark:border-primary-lighter border-primary-main'
        : 'dark:bg-primary-main bg-primary-main dark:shadow-primary-main shadow-black'
      textColor = outline ? 'dark:text-primary-lighter text-primary-main' : ''
      break
    case 'secondary':
      color = outline
        ? 'border dark:border-secondary-lighter border-secondary-main'
        : 'dark:bg-secondary-main bg-secondary-main dark:shadow-secondary-main shadow-black'
      textColor = outline ? 'dark:text-secondary-lighter text-secondary-main' : ''
      break
    case 'danger':
      color = 'bg-danger-main'
      break
    case 'default':
      textColor = `text-neutral`
  }

  const loadingAnim = require('~/assets/lottie/SoundwaveLight.json')

  return (
    <Pressable
      style={({ pressed }) => [
        tw.style(
          `px-5 py-2 rounded-xl shadow-md dark:shadow-lg dark:shadow-offset-1 flex-row justify-center`,
          color,
          styles
        ),
        tw.style({
          'opacity-80': pressed,
          'shadow-none': outline || variant === 'default'
        })
      ]}
      onPress={onPress}
    >
      {loading && <LottieView autoPlay style={tw`absolute w-12 h-10`} source={loadingAnim} />}
      <Typography
        weight={500}
        style={[
          tw`text-base font-semibold text-white dark:text-zinc-200`,
          tw.style(textColor, { 'opacity-0': loading })
        ]}
      >
        {children}
      </Typography>
    </Pressable>
  )
}
