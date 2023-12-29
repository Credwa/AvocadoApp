import * as QueryParams from 'expo-auth-session/build/QueryParams'
import { Alert } from 'react-native'
import { z } from 'zod'

import { setStorageItemAsync } from '@/hooks/useStorageState'
import { MinCampaign } from '@/services/CampaignService'
import HTTPError from '@/services/HTTPError'

import { supabase } from '../supabase/supabase'
import { BASE_URL } from './constants'
import { handleErrors } from './Errors'

let storedTokenHash = ''

/** Creates a session from a url when deep linked into the app from email sign up */
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

export function getSongTitle(campaign: MinCampaign, trunc: number) {
  const { song_title, add_version_info, add_version_info_other, is_radio_edit } = campaign

  let title = song_title

  if (add_version_info === 'other') {
    title = `${song_title} (${add_version_info_other})`
  } else if (add_version_info === 'radio edit' && is_radio_edit) {
    title = song_title
  } else {
    title = song_title
  }

  if (title.length > trunc) {
    title = title.slice(0, trunc) + '...'
  }

  return title
}

/** Calls backend requests with current user auth tokens and validates/parses the data with zod */
export async function fetchWithAuth<T>(
  endpoint: string,
  parser?: z.ZodSchema<T>,
  options: RequestInit = {}
): Promise<T> {
  try {
    /** Gets the session in storage */
    const {
      data: { session }
    } = await supabase.auth.getSession()
    let apiSess = session

    console.log(
      `expires at - ${session?.expires_at} current time - ${new Date().getTime() / 1000} - result ----- ${
        (session?.expires_at as number) < new Date().getTime() / 1000
      }`
    )
    if (session?.expires_at && session.expires_at < new Date().getTime() / 1000) {
      console.log('refreshing session fetch')
      // Refreshes session in storage if it's expired
      const {
        error,
        data: { session }
      } = await supabase.auth.refreshSession()
      apiSess = session
      handleErrors(error)
      await setStorageItemAsync('session', JSON.stringify(session))
    }

    if (!apiSess) {
      throw new HTTPError('No session found', 401)
    }
    console.log(BASE_URL + endpoint)
    const response = await fetch(BASE_URL + endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiSess?.access_token}`,
        grant_type: `${apiSess?.refresh_token}`,
        expires_in: `${apiSess?.expires_in}`,
        expires_at: `${apiSess?.expires_at}`,
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
        console.error(parsedResponse.error)
        throw new Error(parsedResponse.error?.message)
      }
      return parsedResponse.data
    } else {
      // Handle the case where no parser is provided
      return data as T
    }
  } catch (error) {
    if (error instanceof HTTPError) {
      throw new Error(`${error.message} ${error.statusCode}`)
    } else if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error('An unknown error has occurred.')
  }
}
