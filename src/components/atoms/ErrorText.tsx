import tw from '@/helpers/lib/tailwind'

import { Typography } from './Typography'

type ErrorTextProps = {
  children: React.ReactNode
}

export const ErrorText = (props: ErrorTextProps) => {
  return <Typography style={tw`pt-1 text-sm text-red-500`}>{props.children}</Typography>
}
