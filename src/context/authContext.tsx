import React from 'react'
import { Alert } from 'react-native'
import * as Sentry from 'sentry-expo'

import { supabase } from '@/helpers/supabase/supabase'
import { useStorageState } from '@/hooks/useStorageState'

const AuthContext = React.createContext<{
  signIn: (email: string, password: string) => void
  signOut: () => void
  session?: string | null
  isLoading: boolean
} | null>(null)

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext)
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />')
    }
  }

  return value
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session')

  return (
    <AuthContext.Provider
      value={{
        signIn: async (email: string, password: string) => {
          const {
            error,
            data: { session }
          } = await supabase.auth.signInWithPassword({
            email,
            password
          })
          if (error) {
            Alert.alert(error.message)
            return
          }
          Sentry.Native.setUser({ id: session?.user.id })
          // Perform sign-in logic here
          await setSession(session?.access_token || null)
        },
        signOut: () => {
          setSession(null)
        },
        session,
        isLoading
      }}
    >
      {props.children}
    </AuthContext.Provider>
  )
}
