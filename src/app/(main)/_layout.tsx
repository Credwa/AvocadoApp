import { Redirect, Stack } from 'expo-router'
import { Text } from 'react-native'

import { useSession } from '@/context/authContext'

export default function MainLayout() {
  const { session, isLoading } = useSession() ?? {}

  if (isLoading) {
    return <Text>Loading...</Text>
  }
  if (!session) {
    return <Redirect href="/sign-in" />
  }
  return <Stack />
}
