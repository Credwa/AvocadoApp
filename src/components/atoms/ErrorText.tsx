import { Text } from 'react-native'

import tw from '@/helpers/lib/tailwind'

type ErrorTextProps = {
  children: React.ReactNode
}

export const ErrorText = (props: ErrorTextProps) => {
  return <Text style={tw`pt-1 text-sm text-red-500`}>{props.children}</Text>
}
