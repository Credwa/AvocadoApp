import { Link as ALink } from 'expo-router'
import { FC } from 'react'
import { Pressable, Text } from 'react-native'

import tw from '@/helpers/lib/tailwind'

import { Typography } from './Typography'

type LinkProps = {
  variant?: 'primary' | 'secondary' | 'danger' | 'default'
  children: React.ReactNode
  styles?: string
  href: string
}

// Link asChild with pressable for accessibility benefits
export const Link: FC<LinkProps> = ({ href, children, styles, variant = 'primary' }) => {
  let color = ``

  switch (variant) {
    case 'primary':
      color = 'text-primary-dark dark:text-primary-light'
      break
    case 'secondary':
      color = 'text-secondary-dark dark:text-secondary-light'
      break
    case 'danger':
      color = ''
      break
    case 'default':
      color = 'text-neutral'
      break
  }

  return (
    <ALink href={href} asChild>
      <Pressable>
        {({ pressed }) => (
          <Typography style={[tw.style(color, styles), tw.style({ 'opacity-50': pressed })]}>{children}</Typography>
        )}
      </Pressable>
    </ALink>
  )
}
