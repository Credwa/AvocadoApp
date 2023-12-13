import { usePostHog } from 'posthog-react-native'
import React from 'react'
import * as Sentry from 'sentry-expo'

import { handleErrors } from '@/helpers/lib/Errors'
import { supabase } from '@/helpers/supabase/supabase'
import { useStorageState } from '@/hooks/useStorageState'
import { useAppStore } from '@/store'
import { Session } from '@supabase/supabase-js'

const AuthContext = React.createContext<{
  signIn: (email: string, password: string) => Promise<Session | null>
  signUp: (password: string, otpSession: Session | null) => Promise<Session | null>
  signOut: () => void
  emailConfirm: () => Promise<Session | null>
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

const checkIfUserExists = async (session: Session | null = null) => {
  // check is user exists in users table if not insert new user
  if (!session) return
  const { data: usersData, error: usersError } = await supabase.from('users').select('id')
  handleErrors(usersError)
  if (!usersData?.length) {
    const { error: insertUserError } = await supabase.from('users').insert({})
    handleErrors(insertUserError)
    return false
  } else {
    return true
  }
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session')
  const posthog = usePostHog()

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
          handleErrors(error)
          await checkIfUserExists(session)
          useAppStore.setState({ user_id: session?.user.id })
          Sentry.Native.setUser({ id: session?.user.id })

          // Perform sign-in logic here
          await setSession(session?.access_token || null)
          posthog?.identify(session?.user.id)
          posthog?.capture('Sign in')

          return session
        },
        signUp: async (password: string, otpSession: Session | null) => {
          const doesUserExist = await checkIfUserExists(otpSession)
          if (!doesUserExist) {
            const { error: updateUserError } = await supabase.auth.updateUser({ password })
            handleErrors(updateUserError)
            await setSession(otpSession?.access_token || null)
            posthog?.identify(otpSession?.user.id)
            posthog?.capture('Sign up')
            return otpSession
          } else {
            return null
          }
        },
        emailConfirm: async () => {
          const {
            error,
            data: { session }
          } = await supabase.auth.getSession()

          await checkIfUserExists(session)
          handleErrors(error)
          await setSession(session?.access_token || null)
          return session
        },
        signOut: async () => {
          posthog?.capture('Sign out')
          const { error } = await supabase.auth.signOut()
          handleErrors(error)
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
