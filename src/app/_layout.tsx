import { useFonts } from 'expo-font'
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import { router, Slot, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { PostHogProvider } from 'posthog-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Appearance as AppAppearance, AppStateStatus, Platform, StatusBar } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { RootSiblingParent } from 'react-native-root-siblings'
import * as Sentry from 'sentry-expo'
import { useAppColorScheme, useDeviceContext } from 'twrnc'

import { SessionProvider } from '@/context/authContext'
import { PlaybackProvider } from '@/context/playbackContext'
import { getEnvironment } from '@/helpers/lib/constants'
import { createSessionFromUrl } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { useAppState } from '@/hooks/useAppState'
import { useOnlineManager } from '@/hooks/useOnlineManager'
import { registerForPushNotificationsAsync } from '@/services/NotificationService'
import { useAppStore } from '@/store'
import { StripeProvider } from '@stripe/stripe-react-native'
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
  const notificationListener = useRef<Notifications.Subscription>()
  const responseListener = useRef<Notifications.Subscription>()
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined)
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined)
  const setColorScheme = useAppColorScheme(tw)[2]
  const appearance = useAppStore((state) => state.appearance)

  // Handle color scheme changes
  useEffect(() => {
    const subscription = AppAppearance.addChangeListener((scheme) => {
      if (appearance === 'automatic') {
        setColorScheme(scheme.colorScheme)
        StatusBar.setBarStyle(scheme.colorScheme === 'dark' ? 'light-content' : 'dark-content')
      } else {
        setColorScheme(appearance)
      }
    })

    return () => {
      subscription.remove()
    }
  }, [appearance])

  // Set initial color scheme
  useEffect(() => {
    if (appearance === 'automatic') {
      setColorScheme(AppAppearance.getColorScheme())
    } else {
      setColorScheme(appearance)
    }
  }, [])

  // Handle notifications
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token))

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response)
    })

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current)
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current)
      }
    }
  }, [])

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

  // Handle deep linking
  const init = async () => {
    if (url && segments[0] === '(main)' && !segments[1]) {
      const session = await createSessionFromUrl(url)

      if (session) {
        router.replace('/sign-in')
      }
    }
  }

  // Handle deep linking
  useEffect(() => {
    init()
  }, [url])

  // Hide splash screen
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
        <StripeProvider
          publishableKey={getEnvironment().stripePublishableKey}
          urlScheme="app.myavocado" // required for 3D Secure and bank redirects
          merchantIdentifier="merchant.com.shares.app.myavocado" // required for Apple Pay
        >
          <QueryClientProvider client={queryClient}>
            <PlaybackProvider>
              <RootSiblingParent>
                <GestureHandlerRootView style={tw`flex-1 dark:bg-zinc-950 bg-zinc-50`} onLayout={onLayoutRootView}>
                  <Slot />
                </GestureHandlerRootView>
              </RootSiblingParent>
            </PlaybackProvider>
          </QueryClientProvider>
        </StripeProvider>
      </SessionProvider>
    </PostHogProvider>
  )
}

export default Sentry.Native.wrap(RootLayout)
