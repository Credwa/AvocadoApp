import * as QueryParams from 'expo-auth-session/build/QueryParams'
import { Alert } from 'react-native'

import { supabase } from '../supabase/supabase'
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
