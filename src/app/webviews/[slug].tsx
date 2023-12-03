import { router, Stack, useLocalSearchParams } from 'expo-router'
import { WebView } from 'react-native-webview'

import tw from '@/helpers/lib/tailwind'

function toTitleCase(str: string) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function Page() {
  const { url, slug } = useLocalSearchParams<{ slug: string; url?: string }>()

  const headerTitle = toTitleCase(slug ?? '')

  if (!url) {
    router.back()
  }
  return (
    <>
      <Stack.Screen
        options={{
          headerTitleStyle: {
            fontFamily: 'REM-Medium'
          },
          headerTitle,
          headerTitleAlign: 'center'
        }}
      />
      <WebView style={tw``} source={{ uri: url as string }} />
    </>
  )
}
