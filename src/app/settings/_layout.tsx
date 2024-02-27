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
        headerBackVisible: false,
        headerLeft: () => <BackButton style="p-0" />,
        headerStyle: tw`border-0 shadow-none background-default shadow-offset-0 elevation-0`,
        headerTitleStyle: tw`text-base font-bold text-zinc-950 dark:text-zinc-100`,
        headerTitleAlign: 'center',
        headerBackground: () => null,
        animation: 'slide_from_right',
        contentStyle: tw`background-default`
      }}
    >
      <Stack.Screen
        options={{
          headerTitle: 'Settings'
        }}
        name="index"
      />
      <Stack.Screen
        options={{
          headerTitle: 'Appearance'
        }}
        name="appearance"
      />
      <Stack.Screen
        options={{
          headerTitle: 'Notifications'
        }}
        name="notifications"
      />
    </Stack>
  )
}
