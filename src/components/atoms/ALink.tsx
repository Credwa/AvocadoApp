import { Link } from 'expo-router'
import { LinkProps } from 'expo-router/build/link/Link'
import { FC } from 'react'
import { Pressable, Text } from 'react-native'

import tw from '@/helpers/lib/tailwind'

type ALinkProps = LinkProps & {
  variant?: 'primary' | 'secondary' | 'danger' | 'default'
  children: React.ReactNode
  styles?: string
  href: string
}

// Link asChild with pressable for accessibility benefits
export const ALink: FC<ALinkProps> = ({ href, children, styles, variant = 'primary' }) => {
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
  }

  return (
    <Link href={href} asChild>
      <Pressable>
        <Text style={tw.style(color, styles)}>{children}</Text>
      </Pressable>
    </Link>
  )
}
