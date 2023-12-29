import { usePostHog } from 'posthog-react-native'
import React from 'react'
import * as Sentry from 'sentry-expo'
import { z } from 'zod'

import { handleErrors } from '@/helpers/lib/Errors'
import { fetchWithAuth } from '@/helpers/lib/lib'
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

  const userExists = z.object({
    exists: z.boolean()
  })
  const response = await fetchWithAuth<z.infer<typeof userExists>>('/user/verify', userExists, {
    method: 'POST',
    body: JSON.stringify({ id: session.user.id })
  })
  return response.exists
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session')
  const posthog = usePostHog()
  const parsedSession = session ? (JSON.parse(session) as Session) : null

  if (parsedSession?.expires_at && parsedSession.expires_at < new Date().getTime() / 1000) {
    console.log('refreshing session auth context')
    supabase.auth.refreshSession({ refresh_token: parsedSession.refresh_token }).then(({ error, data }) => {
      if (error) {
        console.error(error)
        setSession(null)
      } else {
        setSession(JSON.stringify(data.session))
      }
    })
  }

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
          await setSession(session?.access_token ? JSON.stringify(session) : null)
          posthog?.identify(session?.user.id)
          posthog?.capture('Sign in')

          return session
        },
        signUp: async (password: string, otpSession: Session | null) => {
          const doesUserExist = await checkIfUserExists(otpSession)
          if (!doesUserExist) {
            const { error: updateUserError } = await supabase.auth.updateUser({ password })
            handleErrors(updateUserError)
            await setSession(otpSession?.access_token ? JSON.stringify(session) : null)
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
          if (error?.status === 400) {
            await setSession(null)
            return null
          }
          await checkIfUserExists(session)
          handleErrors(error)
          await setSession(session?.access_token ? JSON.stringify(session) : null)
          return session
        },
        signOut: async () => {
          try {
            posthog?.capture('Sign out')
            const { error } = await supabase.auth.signOut()
            handleErrors(error)
            await setSession(null)
          } catch (error) {
            console.error(error)
            await setSession(null)
          }
        },
        session,
        isLoading
      }}
    >
      {props.children}
    </AuthContext.Provider>
  )
}
