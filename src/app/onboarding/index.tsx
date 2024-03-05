import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import LottieView from 'lottie-react-native'
import { usePostHog } from 'posthog-react-native'
import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import welcomeAnim from '~/assets/lottie/Welcome.json'

import { Button } from '@/components/atoms/Button'
import { Typography } from '@/components/atoms/Typography'
import LoadingScreen from '@/components/LoadingScreen'
import tw from '@/helpers/lib/tailwind'
import useStripeOnboarding from '@/hooks/useStripeOnboarding'
import { registerForPushNotificationsAsync } from '@/services/NotificationService'
import { completeOnboarding, getCurrentUserProfile, updateExpoPushToken } from '@/services/UserService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const AnimatedWord = ({
  word,
  index,
  delay,
  textStyle
}: {
  word: string
  index: number
  delay: number
  textStyle: string
}) => {
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withDelay(index * delay, withTiming(1, { duration: 500 }))
  }, [index, delay, opacity])

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: opacity.value
    }
  })

  return (
    <Animated.Text style={[{ marginRight: 5 }, animatedStyles]}>
      <Typography style={tw.style(textStyle)} weight={500}>
        {word}
      </Typography>
    </Animated.Text>
  )
}

const AnimatedText = ({ text, textStyle, delay = 500 }: { textStyle: string; text: string; delay: number }) => {
  const words = text.split(' ')

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {words.map((word, index) => (
        <AnimatedWord key={`${word}-${index}`} word={word} index={index} delay={delay} textStyle={textStyle} />
      ))}
    </View>
  )
}

export default function Onboarding() {
  const router = useRouter()
  const posthog = usePostHog()
  const queryClient = useQueryClient()
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const { data: currentUser, isLoading: isCurrentUserLoading } = useQuery({ ...getCurrentUserProfile() })
  const headerOpacity = useSharedValue(0)
  const contentOpacity = useSharedValue(0)
  const { handleStripeOnboarding, onboarding } = useStripeOnboarding(currentUser, '/')
  const { mutateAsync: mutateTokenAsync } = useMutation({
    mutationFn: async (token: string) => {
      return updateExpoPushToken(currentUser?.id as string, token)
    },
    onError: (error) => {
      console.log(error)
    }
  })
  if (currentUser?.is_onboarded) {
    router.push('/discover')
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
        duration: 2500,
        easing: Easing.out(Easing.exp)
      },
      () => {
        runOnJS(startSecondAnimation)()
      }
    )
  }, [])

  useEffect(() => {
    Notifications.getPermissionsAsync().then((status) => {
      if (status.status === 'granted' && currentUser?.expo_push_token) {
        setNotificationsEnabled(true)
      }
    })
  })

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

  const handleSkipOnboarding = async () => {
    await mutateCompleteOnboarding()
    posthog?.capture('onboarding_skip')
    setTimeout(() => {
      router.push('/discover')
    }, 1000)
  }

  const onTokenReceived = async (token?: string) => {
    if (token) {
      setNotificationsLoading(false)
      setNotificationsEnabled(true)
      await mutateTokenAsync(token)
    }
  }

  const enableNotifications = async () => {
    setNotificationsLoading(true)

    const status = await Notifications.getPermissionsAsync()
    if (status.status === 'undetermined') {
      const token = await registerForPushNotificationsAsync()
      onTokenReceived(token)
    } else if (status.canAskAgain) {
      await Notifications.requestPermissionsAsync
      const token = await registerForPushNotificationsAsync()
      onTokenReceived(token)

      console.log(token)
    }
    setNotificationsLoading(false)
  }

  if (isCurrentUserLoading) {
    return <LoadingScreen />
  }

  return (
    <SafeAreaView style={tw`items-center justify-between flex-1 py-10 bg-primary-main`}>
      {!notificationsEnabled ? (
        <>
          <View style={tw`items-center gap-y-4`}>
            <Animated.View style={[tw`items-center gap-y-2`, headerAnimatedStyle]}>
              <AnimatedText textStyle="text-3xl text-zinc-100 " text="Welcome to Avocado" delay={200} />
              <AnimatedText
                textStyle="text-lg text-zinc-100 opacity-90"
                text=" Where artists and their fans earn together"
                delay={300}
              />
            </Animated.View>
            <Animated.View style={[tw`items-center `, contentAnimatedStyle]}>
              {/* <Typography style={tw`text-lg text-zinc-100 opacity-90`} weight={500}>
            Where artists and their fans earn together
          </Typography> */}
              <LottieView style={tw`h-44 w-44`} source={welcomeAnim} autoPlay />
            </Animated.View>
          </View>
          <Animated.View style={[tw`gap-y-6`, contentAnimatedStyle]}>
            <Typography style={tw`text-lg text-zinc-100 opacity-90`} weight={500}>
              Get notified when you earn.
            </Typography>
            <Button
              loading={notificationsLoading}
              disabled={notificationsLoading}
              variant="secondary"
              styles="rounded-lg"
              onPress={enableNotifications}
            >
              Enable Notifications
            </Button>
          </Animated.View>
        </>
      ) : (
        <>
          <View />
          <Animated.View style={[tw`justify-center`, contentAnimatedStyle]}>
            <Typography style={tw`text-lg text-center text-zinc-100 opacity-90`} weight={500}>
              Almost there.
            </Typography>
            <Typography style={tw`pb-6 text-lg text-center text-zinc-100 opacity-90`} weight={500}>
              Fill in some information to start earning.
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
        </>
      )}

      <Pressable style={tw`justify-end`} onPress={handleSkipOnboarding}>
        <Typography style={tw`text-base text-zinc-100 opacity-85`} weight={500}>
          Skip
        </Typography>
      </Pressable>
    </SafeAreaView>
  )
}
