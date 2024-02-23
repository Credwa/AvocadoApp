import { Redirect, Stack } from 'expo-router'

import LoadingScreen from '@/components/LoadingScreen'
import { useSession } from '@/context/authContext'

export default function Layout() {
  const { session, isLoading } = useSession() ?? {}

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!session) {
    return <Redirect href="/sign-in" />
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          presentation: 'containedModal',
          headerShown: false
        }}
      />
    </Stack>
  )
}
