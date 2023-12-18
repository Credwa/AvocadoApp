import { useFonts } from 'expo-font'
import * as Linking from 'expo-linking'
import { router, Slot, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { PostHogProvider } from 'posthog-react-native'
import { useCallback, useEffect } from 'react'
import { Appearance as AppAppearance, AppStateStatus, Platform, View } from 'react-native'
import { RootSiblingParent } from 'react-native-root-siblings'
import * as Sentry from 'sentry-expo'
import { useAppColorScheme, useDeviceContext } from 'twrnc'

import { SessionProvider } from '@/context/authContext'
import { createSessionFromUrl } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { useAppState } from '@/hooks/useAppState'
import { useOnlineManager } from '@/hooks/useOnlineManager'
import { useAppStore } from '@/store'
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'

SplashScreen.preventAutoHideAsync()

let sentryInitialzed = false
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2 } }
})

function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active')
  }
}

const postHogKey = __DEV__ ? '' : 'phc_kK42froNyH2xUUXebCZXl3YKF2V9jA2JInAGqhMog2Y'

if (!sentryInitialzed) {
  Sentry.init({
    dsn: 'https://d50d3a482469ae4a1ccb8e142683384e@o4506305008173056.ingest.sentry.io/4506305022263296',
    enableInExpoDevelopment: false,
    debug: __DEV__ // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  })
  sentryInitialzed = true
}

const RootLayout = () => {
  useOnlineManager()
  useAppState(onAppStateChange)
  useDeviceContext(tw, { withDeviceColorScheme: false })
  const setColorScheme = useAppColorScheme(tw)[2]
  const appearance = useAppStore((state) => state.appearance)

  useEffect(() => {
    const subscription = AppAppearance.addChangeListener((scheme) => {
      if (appearance === 'automatic') {
        setColorScheme(scheme.colorScheme)
        AppAppearance.setColorScheme(scheme.colorScheme)
      }
    })
    return () => {
      subscription.remove()
    }
  }, [appearance])

  useEffect(() => {
    setColorScheme(appearance === 'automatic' ? AppAppearance.getColorScheme() : appearance)
    AppAppearance.setColorScheme(appearance === 'automatic' ? AppAppearance.getColorScheme() : appearance)
  }, [appearance])
  const segments = useSegments()

  const url = Linking.useURL()

  const [fontsLoaded, fontError] = useFonts({
    'REM-Light': require('~/assets/fonts/REM/REM-Light.ttf'),
    REM: require('~/assets/fonts/REM/REM-Regular.ttf'),
    'REM-Italic': require('~/assets/fonts/REM/REM-Italic.ttf'),
    'REM-Medium': require('~/assets/fonts/REM/REM-Medium.ttf'),
    'REM-SemiBold': require('~/assets/fonts/REM/REM-SemiBold.ttf'),
    'REM-Bold': require('~/assets/fonts/REM/REM-Bold.ttf')
  })

  const init = async () => {
    if (url && segments[0] === '(main)' && !segments[1]) {
      const session = await createSessionFromUrl(url)

      if (session) {
        router.replace('/sign-in')
      }
    }
  }

  useEffect(() => {
    init()
  }, [url])

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <PostHogProvider
      apiKey={postHogKey}
      options={{
        host: 'https://app.posthog.com'
      }}
      debug={__DEV__}
    >
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <RootSiblingParent>
            <View style={tw`flex-1 dark:bg-zinc-950 bg-zinc-50`} onLayout={onLayoutRootView}>
              <Slot />
            </View>
          </RootSiblingParent>
        </QueryClientProvider>
      </SessionProvider>
    </PostHogProvider>
  )
}

export default Sentry.Native.wrap(RootLayout)
