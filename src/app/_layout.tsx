import * as QueryParams from 'expo-auth-session/build/QueryParams'
import { useFonts } from 'expo-font'
import * as Linking from 'expo-linking'
import { router, Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useCallback, useEffect } from 'react'
import { Alert, View } from 'react-native'
import { RootSiblingParent } from 'react-native-root-siblings'
import * as Sentry from 'sentry-expo'
import { useDeviceContext } from 'twrnc'

import { SessionProvider } from '@/context/authContext'
import { handleErrors } from '@/helpers/lib/Errors'
import tw from '@/helpers/lib/tailwind'
import { supabase } from '@/helpers/supabase/supabase'

SplashScreen.preventAutoHideAsync()

let sentryInitialzed = false
let storedToken = ''

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url)

  if (errorCode) throw new Error(errorCode)
  const { token, mode, email } = params
  console.log('my tok 1', token)

  if (mode !== 'app') return
  if (token === storedToken) return
  console.log('my tok 2', token)

  storedToken = token as string
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      type: 'signup',
      token: token as string,
      email: email as string
    })
    handleErrors(error)
    return data.session?.access_token
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message)
    } else {
      Alert.alert('An unknown error has occurred.')
    }
  }
}

if (!sentryInitialzed) {
  Sentry.init({
    dsn: 'https://d50d3a482469ae4a1ccb8e142683384e@o4506305008173056.ingest.sentry.io/4506305022263296',
    enableInExpoDevelopment: true,
    debug: process.env.NODE_ENV === 'development' // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  })
  sentryInitialzed = true
}

const RootLayout = () => {
  const url = Linking.useURL()

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
    if (url) {
      const session = await createSessionFromUrl(url)
      if (session) {
        router.replace('/')
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
