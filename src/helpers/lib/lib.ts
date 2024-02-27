import dayjs from 'dayjs'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import { Alert } from 'react-native'
// import ImageColors from 'react-native-image-colors'
import { z } from 'zod'

import { setStorageItemAsync } from '@/hooks/useStorageState'
import { Campaign, MinCampaign } from '@/services/CampaignService'
import HTTPError from '@/services/HTTPError'

import { supabase } from '../supabase/supabase'
import { BASE_URL, blurhashes } from './constants'
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

export function truncate_number(num: number): string {
  const absNum = Math.abs(num)
  const suffixes = ['', 'K', 'M', 'B', 'T']
  const suffixNum = Math.floor(('' + absNum).length / 3)
  let shortNum = parseFloat((suffixNum !== 0 ? absNum / Math.pow(1000, suffixNum) : absNum).toPrecision(2))
  if (shortNum % 1 !== 0) {
    shortNum = Number(shortNum.toFixed(1))
  }
  return (num < 0 ? '-' : '') + shortNum + suffixes[suffixNum]
}

export function getRandomBlurhash() {
  return blurhashes[Math.floor(Math.random() * blurhashes.length)]
}

export function getCampaignDaysLeft(campaign_start_date: string, time_restraint = 0) {
  if (!campaign_start_date) return 0
  const start = dayjs(campaign_start_date)
  const end = start.add(time_restraint, 'day')
  const now = dayjs()
  let daysLeft = end.diff(now, 'day')
  daysLeft = Math.max(daysLeft, 0)
  return daysLeft ?? 0
}

export function truncate_string(str: string, trunc: number) {
  if (!str) return ''
  if (str.length > trunc) {
    str = str.slice(0, trunc) + '...'
  }
  return str
}

export function getSongTitle(campaign: MinCampaign | Campaign, trunc: number) {
  if (!campaign) return ''
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

  return title.charAt(0).toUpperCase() + title.slice(1)
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

// get image color brightness. > 186 is light, < 186 is dark
// export const getImageColorBrightness = async (imageUrl: string) => {
//   try {
//     const colors = await ImageColors.getColors(imageUrl, {
//       fallback: 'grey',
//       cache: true,
//       key: imageUrl // Use a unique key for caching; optional
//     })

//     if (colors.platform === 'android') {
//       // android returns vibrant by default
//       console.log(colors.vibrant)
//       // const [r, g, b] = colors!.vibrant!.match(/\w\w/g).map((c) => parseInt(c, 16)) ?? [0, 0, 0]
//       return 1
//     } else if (colors.platform === 'ios') {
//       // iOS returns background color by default
//       console.log(colors.background)
//       // const [r, g, b] = colors.background?.vibrant.match(/\w\w/g).map((c) => parseInt(c, 16))
//       return 1
//     }
//   } catch (error) {
//     console.log(error)
//     return 0
//   }
// }
