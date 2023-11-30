import { Redirect, Stack } from 'expo-router'
import { Text } from 'react-native'

import { useSession } from '@/context/authContext'

// export { default } from '../../../.storybook'

export default function Layout() {
  const { session, isLoading } = useSession() ?? {}

  if (isLoading) {
    return <Text>Loading...</Text>
  }

  if (!session) {
    return <Redirect href="/sign-in" />
  }
  return <Stack />
}
