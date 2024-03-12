import { useFonts } from 'expo-font'
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import { router, Slot, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import * as Updates from 'expo-updates'
import { PostHogProvider } from 'posthog-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Appearance as AppAppearance, AppStateStatus, Platform, StatusBar } from 'react-native'
import branch from 'react-native-branch'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { RootSiblingParent } from 'react-native-root-siblings'
import { useAppColorScheme, useDeviceContext } from 'twrnc'

import { SessionProvider } from '@/context/authContext'
import { PlaybackProvider } from '@/context/playbackContext'
import { getEnvironment } from '@/helpers/lib/constants'
import { createSessionFromUrl } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { useAppState } from '@/hooks/useAppState'
import { useOnlineManager } from '@/hooks/useOnlineManager'
import { useAppStore } from '@/store'
import * as Sentry from '@sentry/react-native'
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
    dsn: 'https://3693efacfda90eb925922d9ace2f379c@o4506305008173056.ingest.sentry.io/4506305022263296',
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
  const [initialUrl, setInitialUrl] = useState<string | null>(null)
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined)
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined)
  const setColorScheme = useAppColorScheme(tw)[2]
  const appearance = useAppStore((state) => state.appearance)
  const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates()

  useEffect(() => {
    if (isUpdatePending) {
      // Update has successfully downloaded
      Alert.alert('Update Available', 'A new version of the app is available. Would you like to update?', [
        {
          text: 'No',
          style: 'destructive'
        },
        {
          text: 'Yes',
          onPress: async () => {
            await Updates.fetchUpdateAsync()
            await Updates.reloadAsync()
          }
        }
      ])
    }
  }, [isUpdatePending])

  // branch deep links subscription
  // useEffect(() => {
  //   if (__DEV__) return
  //   const branchUnsub = branch.subscribe({
  //     onOpenStart: ({ uri, cachedInitialEvent }) => {
  //       console.log('subscribe onOpenStart, will open ' + uri + ' cachedInitialEvent is ' + cachedInitialEvent)
  //     },
  //     onOpenComplete: ({ error, params, uri }) => {
  //       if (error) {
  //         console.error('subscribe onOpenComplete, Error from opening uri: ' + uri + ' error: ' + error)
  //         return
  //       } else if (params) {
  //         if (!params['+clicked_branch_link']) {
  //           if (params['+non_branch_link']) {
  //             console.log('non_branch_link: ' + uri)
  //             // Route based on non-Branch links
  //             return
  //           }
  //         } else {
  //           // Handle params
  //           let deepLinkPath = params.$deeplink_path as string
  //           let canonicalUrl = params.$canonical_url as string
  //           // Route based on Branch link data
  //           console.log(deepLinkPath)
  //           console.log(canonicalUrl)
  //           return
  //         }
  //       }
  //     }
  //   })

  //   return () => {
  //     branchUnsub()
  //   }
  // }, [])

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
  const init = async (initUrl: string) => {
    // const prefix = Linking.createURL('/')
    if (initUrl && segments[0] === '(main)' && !segments[1]) {
      const session = await createSessionFromUrl(initUrl)

      if (session) {
        router.replace('/sign-in')
      }
    }
  }

  // Handle deep linking
  useEffect(() => {
    if (initialUrl === null) return
    init(initialUrl)
  }, [url, initialUrl])

  useEffect(() => {
    async function updateURL() {
      if (initialUrl === undefined) {
        const initialUrl = await Linking.getInitialURL()
        setInitialUrl(initialUrl)
        return
      }

      if (url === initialUrl) {
        return
      }

      setInitialUrl(url)
    }

    void updateURL()
  }, [url, initialUrl])

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
          merchantIdentifier="merchant.com.myavocado" // required for Apple Pay
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

export default Sentry.wrap(RootLayout)
