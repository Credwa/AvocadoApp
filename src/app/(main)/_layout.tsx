import { BlurView } from 'expo-blur'
import { Redirect, Tabs } from 'expo-router'
import { StyleSheet, Text, useColorScheme } from 'react-native'

import { useSession } from '@/context/authContext'
import tw from '@/helpers/lib/tailwind'
import { Ionicons } from '@expo/vector-icons'

const iconSize = 24

export default function Layout() {
  const { session, isLoading } = useSession() ?? {}
  const colorScheme = useColorScheme()

  if (isLoading) {
    return <Text>Loading...</Text>
  }
  const tabBarOptions = (iconName: any, label: string) => {
    return {
      tabBarActiveTintColor: tw.color('text-primary-main'),
      tabBarLabel: label,

      tabBarIcon: () => (
        <Ionicons
          name={iconName}
          size={iconSize}
          color={colorScheme === 'dark' ? tw.color('text-zinc-100') : tw.color('text-zinc-700')}
        />
      )
    }
  }

  if (!session) {
    return <Redirect href="/sign-in" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: tw`absolute`,
        tabBarBackground: () => (
          <BlurView
            tint="light"
            intensity={100}
            style={[{ ...StyleSheet.absoluteFillObject }, tw`overflow-hidden bg-zinc-100 dark:bg-zinc-950`]}
          />
        )
      }}
    >
      <Tabs.Screen name="index" options={{ ...tabBarOptions('home-sharp', 'Home') }} />
      <Tabs.Screen name="explore" options={{ ...tabBarOptions('search', 'Search') }} />
    </Tabs>
  )
}
