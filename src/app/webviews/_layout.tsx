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
    >
      {/* <Stack.Screen
        name="terms-of-use"
        options={{
          headerTitle: 'Terms of Use'
        }}
      />
      <Stack.Screen
        name="privacy-policy"
        options={{
          headerTitle: 'Privacy Policy'
        }}
      /> */}
    </Stack>
  )
}
