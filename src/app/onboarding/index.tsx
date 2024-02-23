import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import LottieView from 'lottie-react-native'
import { usePostHog } from 'posthog-react-native'
import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import welcomeAnim from '~/assets/lottie/Welcome.json'

import { Button } from '@/components/atoms/Button'
import { Typography } from '@/components/atoms/Typography'
import LoadingScreen from '@/components/LoadingScreen'
import tw from '@/helpers/lib/tailwind'
import { completeOnboarding, createStripeAccount, getCurrentUserProfile } from '@/services/UserService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export default function Onboarding() {
  const router = useRouter()
  const url = Linking.useURL()
  const [onboarding, setOnboarding] = useState(false)
  const posthog = usePostHog()
  const queryClient = useQueryClient()
  const { data: currentUser, isLoading: isCurrentUserLoading } = useQuery({ ...getCurrentUserProfile() })
  const headerOpacity = useSharedValue(0)
  const contentOpacity = useSharedValue(0)

  if (currentUser?.is_onboarded) {
    router.push('/')
  }

  const startSecondAnimation = () => {
    contentOpacity.value = withTiming(1, {
      duration: 1000
    })
  }

  useEffect(() => {
    // Start the fade-in animation when the component mounts
    headerOpacity.value = withTiming(
      1,
      {
        duration: 1500,
        easing: Easing.out(Easing.exp)
      },
      () => {
        runOnJS(startSecondAnimation)()
      }
    )
  }, [])

  // Animated style that will be applied to the text
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value
  }))
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value
  }))

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

  const { mutateAsync: mutateStripe } = useMutation({
    mutationFn: async () => {
      const appUrl = __DEV__ ? 'http://192.168.1.23:3000/auth/stripe' : 'https://artists.myavocado.app/auth/stripe'
      return createStripeAccount(
        currentUser?.id as string,
        appUrl + `?deepLink=${url + '/onboarding?stripeComplete=true'}`,
        appUrl + `?deepLink=${url + '/onboarding?stripeRefresh=true'}`
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user/me'] })
    },
    onError: (error) => {
      console.log(error)
    }
  })

  const handleSkipOnboarding = async () => {
    await mutateCompleteOnboarding()
    posthog?.capture('onboarding_skip')
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }

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
      console.log(error)
    }
  }

  const handleStripeOnboarding = async () => {
    setOnboarding(true)
    const accountLink = await mutateStripe()
    console.log(accountLink)
    await openPage(accountLink.accountLink)
    await mutateCompleteOnboarding()
    posthog?.capture('onboarding_stripe_complete')
    setOnboarding(false)
    router.push('/')
  }

  if (isCurrentUserLoading) {
    return <LoadingScreen />
  }

  return (
    <SafeAreaView style={tw`items-center justify-between py-10 flex-1 bg-primary-main`}>
      <View style={tw`items-center gap-y-4`}>
        <Animated.View style={[tw``, headerAnimatedStyle]}>
          <Typography weight={500} style={tw`text-3xl text-zinc-100`}>
            Welcome to Avocado
          </Typography>
        </Animated.View>
        <Animated.View style={[tw`items-center `, contentAnimatedStyle]}>
          <Typography style={tw`text-lg text-zinc-100 opacity-90`} weight={500}>
            Where artists and their fans earn together
          </Typography>
          <LottieView style={tw`h-44 w-44`} source={welcomeAnim} autoPlay />
        </Animated.View>
      </View>

      <Animated.View style={[tw`gap-y-6`, contentAnimatedStyle]}>
        <Typography style={tw`text-lg text-zinc-100 opacity-90`} weight={500}>
          Fill in some information to start earning
        </Typography>
        <Button
          loading={onboarding}
          disabled={onboarding}
          variant="secondary"
          styles="rounded-lg"
          onPress={handleStripeOnboarding}
        >
          Continue
        </Button>
      </Animated.View>

      <Pressable style={tw`justify-end`} onPress={handleSkipOnboarding}>
        <Typography style={tw`text-base text-zinc-100 opacity-85`} weight={500}>
          Skip
        </Typography>
      </Pressable>
    </SafeAreaView>
  )
}
