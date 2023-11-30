import { Slot } from 'expo-router'
import { View } from 'react-native'
import * as Sentry from 'sentry-expo'
import { useDeviceContext } from 'twrnc'

import { SessionProvider } from '@/context/authContext'
import tw from '@/helpers/lib/tailwind'

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
  useDeviceContext(tw)

  return (
    <SessionProvider>
      <View style={tw`flex-1 dark:bg-zinc-950 bg-zinc-50`}>
        <Slot />
      </View>
    </SessionProvider>
  )
}

export default Sentry.Native.wrap(RootLayout)
