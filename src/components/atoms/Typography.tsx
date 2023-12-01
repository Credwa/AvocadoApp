import { Text, TextProps } from 'react-native'

import tw from '@/helpers/lib/tailwind'

type TypographyProps = {
  children: React.ReactNode
  weight?: 300 | 400 | 500 | 600 | 700 | 'italic'
} & TextProps

export const Typography = (props: TypographyProps) => {
  const newProps = { ...props }
  delete newProps.children
  delete newProps.style
  let weightStyle = {}
  switch (props.weight) {
    case 300:
      weightStyle = { fontFamily: 'REM-Light' }
      break
    case 400:
      weightStyle = { fontFamily: 'REM' }
      break
    case 'italic':
      weightStyle = { fontFamily: 'REM-Italic' }
      break
    case 500:
      weightStyle = { fontFamily: 'REM-Medium' }
      break
    case 600:
      weightStyle = { fontFamily: 'REM-SemiBold' }
      break
    case 700:
      weightStyle = { fontFamily: 'REM-Bold' }
      break
    default:
      weightStyle = { fontFamily: 'REM' }
      break
  }

  return (
    <Text style={[tw.style('text-neutral'), weightStyle, props.style]} {...newProps}>
      {props.children}
    </Text>
  )
}
