import { BlurView } from 'expo-blur'
import { Redirect, Tabs } from 'expo-router'
import { StyleSheet } from 'react-native'

import LoadingScreen from '@/components/LoadingScreen'
import { useSession } from '@/context/authContext'
import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'

const iconSize = 24

export default function Layout() {
  const { session, isLoading } = useSession() ?? {}
  const colorScheme = useColorScheme()

  if (isLoading) {
    return <LoadingScreen />
  }
  const tabBarOptions = (iconName: any, label: string, icon?: React.JSX.Element) => {
    return {
      tabBarActiveTintColor: tw.color('text-primary-main'),
      tabBarLabel: label,
      tabBarIcon: icon
        ? () => icon
        : () => (
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
        tabBarStyle: tw`absolute bg-transparent dark:border-t-zinc-800`,
        tabBarBackground: () => (
          <BlurView
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            intensity={80}
            style={[{ ...StyleSheet.absoluteFillObject }, tw`overflow-hidden bg-zinc-100 dark:bg-black`]}
          />
        )
      }}
    >
      <Tabs.Screen name="index" options={{ ...tabBarOptions('home-sharp', 'Home') }} />
      <Tabs.Screen name="search" options={{ ...tabBarOptions('search', 'Search') }} />
      <Tabs.Screen
        name="library"
        options={{
          ...tabBarOptions(
            'library',
            'Library',
            <MaterialIcons
              name="library-music"
              size={iconSize}
              color={colorScheme === 'dark' ? tw.color('text-zinc-100') : tw.color('text-zinc-700')}
            />
          )
        }}
      />
    </Tabs>
  )
}
