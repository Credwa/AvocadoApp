import * as QueryParams from 'expo-auth-session/build/QueryParams'
import { Alert } from 'react-native'
import { z } from 'zod'

import { setStorageItemAsync } from '@/hooks/useStorageState'
import HTTPError from '@/services/HTTPError'

import { supabase } from '../supabase/supabase'
import { BASE_URL } from './constants'
import { handleErrors } from './Errors'

let storedTokenHash = ''

export const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url)

  if (errorCode) throw new Error(errorCode)
  const { token, mode, token_hash } = params
  if (mode !== 'app') return
  if (token_hash === storedTokenHash) return
  storedTokenHash = token as string
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      type: 'signup',
      token_hash
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

export async function fetchWithAuth<T>(
  endpoint: string,
  parser?: z.ZodSchema<T>,
  options: RequestInit = {}
): Promise<T> {
  try {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (session?.expires_at && session.expires_at < new Date().getTime() / 1000) {
      const {
        error,
        data: { session }
      } = await supabase.auth.refreshSession()

      handleErrors(error)
      setStorageItemAsync('session', JSON.stringify(session))
    }
    if (!session) {
      throw new HTTPError('No session found', 401)
    }

    console.log(BASE_URL + endpoint)
    const response = await fetch(BASE_URL + endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        grant_type: `${session.refresh_token}`,
        expires_in: `${session.expires_in}`,
        expires_at: `${session.expires_at}`,
        ...options.headers
      }
    })
    if (!response.ok) {
      const text = await response.text()
      throw new HTTPError(text, 401)
    }

    const data = await response.json()
    if (parser) {
      const parsedResponse = parser.safeParse(data)
      if (!parsedResponse.success) {
        throw new Error(parsedResponse.error?.message)
      }
      return parsedResponse.data
    } else {
      // Handle the case where no parser is provided
      return data as T
    }
  } catch (error) {
    if (error instanceof HTTPError) {
      throw new Error(`${error.message} - ${error.statusCode}`)
    } else if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error('An unknown error has occurred.')
  }
}
