import { Redirect, Stack } from 'expo-router'

import BackButton from '@/components/atoms/BackButton'
import LoadingScreen from '@/components/LoadingScreen'
import { useSession } from '@/context/authContext'
import tw from '@/helpers/lib/tailwind'

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
        headerShown: true
      }}
    >
      <Stack.Screen
        name="song/[songId]/purchase"
        options={{
          presentation: 'modal'
        }}
      />
      <Stack.Screen
        name="song/[songId]/index"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="purchase/[songId]/index"
        options={{
          title: 'Purchase History',
          headerBackVisible: true,
          headerTitleStyle: tw`text-zinc-100`,
          headerStyle: tw`bg-transparent`,
          headerLeft: () => <BackButton style="p-0" />
        }}
      />
    </Stack>
  )
}
