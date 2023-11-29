import { Slot } from 'expo-router'
import { useEffect } from 'react'
import * as Sentry from 'sentry-expo'

import { SessionProvider } from '@/context/authContext'

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
  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  )
}

export default Sentry.Native.wrap(RootLayout)
