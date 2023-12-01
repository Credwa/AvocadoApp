import { Text, TextProps } from 'react-native'

type TypographyProps = {
  children: React.ReactNode
  weight?: 400 | 500 | 600 | 700
} & TextProps

export const Typography = (props: TypographyProps) => {
  const newProps = { ...props }
  delete newProps.children
  delete newProps.style
  let weightStyle = {}
  switch (props.weight) {
    case 400:
      weightStyle = { fontFamily: 'REM' }
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
    <Text style={[weightStyle, props.style]} {...newProps}>
      {props.children}
    </Text>
  )
}
