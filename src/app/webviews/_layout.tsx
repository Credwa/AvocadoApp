import { Stack } from 'expo-router'

import BackButton from '@/components/atoms/BackButton'

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerTitleStyle: {
          fontWeight: 'bold'
        },
        headerLeft: () => <BackButton style="p-0" forceColorScheme="light" />,
        headerTitleAlign: 'center'
      }}
    />
  )
}
