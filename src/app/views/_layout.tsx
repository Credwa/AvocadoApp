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
        headerShown: false
      }}
    >
      <Stack.Screen
        name="song/[songId]/purchase"
        options={{
          presentation: 'modal',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="song/[songId]/purchaseReleased"
        options={{
          presentation: 'modal',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="song/[songId]/index"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="purchaseHistory/[songId]/index"
        options={{
          headerShown: true,
          title: 'Purchase History',
          headerBackVisible: false,
          headerTitleStyle: tw`dark:text-zinc-100 text-zinc-950`,
          headerStyle: tw`bg-transparent`,
          headerLeft: () => <BackButton style="p-0" href="/" />
        }}
      />
    </Stack>
  )
}
