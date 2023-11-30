import React from 'react'
import * as Sentry from 'sentry-expo'

import { supabase } from '@/helpers/supabase/supabase'
import { useStorageState } from '@/hooks/useStorageState'
import { useAppStore } from '@/store'
import { Session } from '@supabase/supabase-js'

const AuthContext = React.createContext<{
  signIn: (email: string, password: string) => Promise<Session | null>
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
            throw new Error(error.message)
          }
          useAppStore.setState({ user_id: session?.user.id })
          Sentry.Native.setUser({ id: session?.user.id })
          // Perform sign-in logic here
          await setSession(session?.access_token || null)
          return session
        },
        signOut: async () => {
          const { error } = await supabase.auth.signOut()

          if (error) {
            throw new Error(error.message)
          }

          await setSession(null)
        },
        session,
        isLoading
      }}
    >
      {props.children}
    </AuthContext.Provider>
  )
}
