import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { usePostHog } from 'posthog-react-native'
import { useState } from 'react'

import { completeOnboarding, createStripeAccount, User } from '@/services/UserService'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const useStripeOnboarding = (currentUser: User | undefined, redirectUrl: string) => {
  const [onboarding, setOnboarding] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()
  const posthog = usePostHog()
  const url = Linking.useURL()

  const { mutateAsync: mutateStripe } = useMutation({
    mutationFn: async () => {
      const appUrl = 'app.myavocado://'
      return createStripeAccount(
        currentUser?.id as string,
        `${appUrl}?deepLink=${url}/onboarding?stripeComplete=true`,
        `${appUrl}?deepLink=${url}/onboarding?stripeRefresh=true`
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user/me'] })
    },
    onError: (error) => {
      console.error(error)
    }
  })

  const { mutateAsync: mutateCompleteOnboarding } = useMutation({
    mutationFn: async () => {
      return completeOnboarding(currentUser?.id as string)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user/me'] })
    },
    onError: (error) => {
      console.log(error)
    }
  })

  const openPage = async (stripeUrl: string) => {
    try {
      const result = await WebBrowser.openAuthSessionAsync(stripeUrl)
      let redirectData
      if (result.type === 'success' && (redirectData = result.url)) {
        redirectData = Linking.parse(result.url)
      }
      queryClient.invalidateQueries({ queryKey: ['user', 'stripe'] })
      return redirectData
    } catch (error) {
      console.error(error)
    }
  }

  const handleStripeOnboarding = async () => {
    setOnboarding(true)
    const accountLink = await mutateStripe()
    await openPage(accountLink.accountLink)
    await mutateCompleteOnboarding() // Ensure mutateCompleteOnboarding is defined or imported
    posthog?.capture('onboarding_stripe_complete')
    setOnboarding(false)
    if (redirectUrl) router.push(redirectUrl)
  }

  return { onboarding, handleStripeOnboarding }
}

export default useStripeOnboarding
