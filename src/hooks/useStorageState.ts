/**
 * Secure storage hook for storing sensitive data like session tokens.
 * @see https://docs.expo.io/versions/latest/sdk/securestore/
 * Use @/store for non-sensitive data.
 */

import * as SecureStore from 'expo-secure-store'
import * as React from 'react'

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void]

function useAsyncState<T>(initialValue: [boolean, T | null] = [true, null]): UseStateHook<T> {
  return React.useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (value == null) {
    await SecureStore.deleteItemAsync(key)
  } else {
    await SecureStore.setItemAsync(key, value)
  }
}

export async function getStorageItemAsync(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key)
}

export function useStorageState(key: string): UseStateHook<string> {
  // Public
  const [state, setState] = useAsyncState<string>()

  // Get
  React.useEffect(() => {
    SecureStore.getItemAsync(key).then((value) => {
      setState(value)
    })
  }, [key])

  // Set
  const setValue = React.useCallback(
    async (value: string | null) => {
      await setStorageItemAsync(key, value)
      setState(value)
    },
    [key]
  )

  return [state, setValue]
}
