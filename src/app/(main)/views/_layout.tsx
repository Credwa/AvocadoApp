import { Stack } from 'expo-router'

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerTitleStyle: {
          fontWeight: 'bold'
        },
        headerShown: false
      }}
    />
  )
}
