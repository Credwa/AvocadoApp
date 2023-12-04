import * as Device from 'expo-device'
import { useFonts } from 'expo-font'
import * as Linking from 'expo-linking'
import { router, Slot, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useCallback, useEffect } from 'react'
import { View } from 'react-native'
import { RootSiblingParent } from 'react-native-root-siblings'
import * as Sentry from 'sentry-expo'
import { useDeviceContext } from 'twrnc'

import { SessionProvider } from '@/context/authContext'
import { createSessionFromUrl } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'

SplashScreen.preventAutoHideAsync()

let sentryInitialzed = false

if (!sentryInitialzed) {
  Sentry.init({
    dsn: 'https://d50d3a482469ae4a1ccb8e142683384e@o4506305008173056.ingest.sentry.io/4506305022263296',
    enableInExpoDevelopment: true,
    debug: process.env.NODE_ENV === 'development' // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  })
  sentryInitialzed = true
}

const RootLayout = () => {
  const segments = useSegments()

  const url = Linking.useURL()

  console.log(segments)
  const [fontsLoaded] = useFonts({
    'REM-Light': require('~/assets/fonts/REM/REM-Light.ttf'),
    REM: require('~/assets/fonts/REM/REM-Regular.ttf'),
    'REM-Italic': require('~/assets/fonts/REM/REM-Italic.ttf'),
    'REM-Medium': require('~/assets/fonts/REM/REM-Medium.ttf'),
    'REM-SemiBold': require('~/assets/fonts/REM/REM-SemiBold.ttf'),
    'REM-Bold': require('~/assets/fonts/REM/REM-Bold.ttf')
  })

  useDeviceContext(tw)

  const init = async () => {
    console.log('seg', segments[0])
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
    if (fontsLoaded) {
      await SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <SessionProvider>
      <RootSiblingParent>
        <View style={tw`flex-1 dark:bg-zinc-950 bg-zinc-50`} onLayout={onLayoutRootView}>
          <Slot />
        </View>
      </RootSiblingParent>
    </SessionProvider>
  )
}

export default Sentry.Native.wrap(RootLayout)
