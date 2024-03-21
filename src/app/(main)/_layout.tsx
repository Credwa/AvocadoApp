import { BlurView } from 'expo-blur'
import { Redirect, router, Tabs } from 'expo-router'
import { StyleSheet } from 'react-native'

import { Typography } from '@/components/atoms/Typography'
import { useSession } from '@/context/authContext'
import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { getCurrentUserProfile } from '@/services/UserService'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'

const iconSize = 24

export default function Layout() {
  const { session, isLoading } = useSession() ?? {}
  const colorScheme = useColorScheme()
  const { data, isLoading: isUserProfileLoading } = useQuery({ ...getCurrentUserProfile() })

  if (!isLoading && !session) {
    return <Redirect href="/sign-in" />
  }

  if (isLoading) {
    return <Typography>Loading...</Typography>
  }
  if (!isUserProfileLoading && !data?.is_onboarded) {
    router.push('/onboarding')
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

  return (
    <Tabs
      initialRouteName="discover"
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: tw.style(`absolute bg-transparent dark:border-t-zinc-800`, {
          display: route.name.match('views') ? 'none' : 'flex'
        }),
        tabBarBackground: () => (
          <BlurView
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            intensity={80}
            style={[{ ...StyleSheet.absoluteFillObject }, tw`overflow-hidden bg-zinc-100 dark:bg-black`]}
          />
        )
      })}
    >
      <Tabs.Screen name="index" options={{ ...tabBarOptions('home-sharp', 'Home') }} />
      <Tabs.Screen name="search" options={{ ...tabBarOptions('search', 'Search'), href: null }} />

      <Tabs.Screen name="views" options={{ ...tabBarOptions('search', 'Artist'), href: null }} />

      <Tabs.Screen name="discover" options={{ ...tabBarOptions('star', 'Discover') }} />

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
