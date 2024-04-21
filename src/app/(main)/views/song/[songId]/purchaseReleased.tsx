import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import LottieView from 'lottie-react-native'
import { usePostHog } from 'posthog-react-native'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native'
import { RootSiblingParent } from 'react-native-root-siblings'

import BackButton from '@/components/atoms/BackButton'
import { Button } from '@/components/atoms/Button'
import { ErrorText } from '@/components/atoms/ErrorText'
import { TextInput } from '@/components/atoms/TextInput'
import ShowToast, { ToastPositionsValues } from '@/components/atoms/Toast'
import { Typography } from '@/components/atoms/Typography'
import { defaultBlurhash } from '@/helpers/lib/constants'
import { getSongTitle } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { purchaseReleasedSchema, TPurchaseReleasedSchema } from '@/helpers/schemas/extras'
import { supabase } from '@/helpers/supabase/supabase'
import { useColorScheme } from '@/hooks/useColorScheme'
import useStripeOnboarding from '@/hooks/useStripeOnboarding'
import { getCampaignById, getReleasedPaymentSheet } from '@/services/CampaignService'
import { getCurrentUserProfile, getStripeAccountInfo } from '@/services/UserService'
import { useAppStore } from '@/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const successAnim = require('~/assets/lottie/Confetti.json')

const formatDisplayValue = (value: string) => {
  // Convert the string to an integer
  const intValue = parseInt(value, 10)

  // Divide by 100 to get the decimal value
  const displayValue = (intValue / 100).toFixed(2)

  // Handle the case where the input is empty
  if (isNaN(Number(displayValue))) {
    return '0.00'
  }

  return displayValue
}

export default function PurchaseReleased() {
  const router = useRouter()
  const posthog = usePostHog()
  const queryClient = useQueryClient()
  const userId = useAppStore((state: { user_id: string }) => state.user_id)
  const { data: currentUser } = useQuery({ ...getCurrentUserProfile() })
  const { data: stripeAccountData, isLoading: isStripeAccDataLoading } = useQuery({
    ...getStripeAccountInfo(currentUser?.id),
    enabled: !!currentUser?.id
  })
  const { handleStripeOnboarding } = useStripeOnboarding(currentUser, '/')
  const [success, setSuccess] = useState(false)
  const [shares, setShares] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const animationRef = useRef<LottieView>(null)

  const [amountPaid, setAmountPaid] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const colorScheme = useColorScheme()
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<TPurchaseReleasedSchema>({
    resolver: zodResolver(purchaseReleasedSchema)
  })

  const { songId } = useLocalSearchParams<{ songId: string }>()
  if (!songId) {
    router.back()
  }

  const { data: songData } = useQuery({
    ...getCampaignById(songId!)
  })

  // const { mutateAsync } = useMutation({
  //   mutationFn: (shares: number) => {
  //     return purchaseCampaign(songId!, userId, shares)
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['campaigns', songId!] })
  //     queryClient.invalidateQueries({ queryKey: ['campaigns', 'purchase', userId] })
  //     setSubmitting(false)
  //     setSuccess(true)
  //     posthog?.capture('song purchase', {
  //       song_id: songData?.id,
  //       shares,
  //       total_cost: totalCost
  //     })
  //   },
  //   onError: (error) => {
  //     console.log(error)
  //     setSubmitting(false)
  //   }
  // })

  const {
    mutateAsync: mutatePaymentSheet,
    error: paymentSheetError,
    isError: paymentSheetIsError
  } = useMutation({
    mutationFn: (info: { amount: number; email: string }) => {
      return getReleasedPaymentSheet(
        userId,
        songId!,
        info.amount,
        info.email,
        getSongTitle(songData!, 100),
        songData?.artists.artist_name ?? ''
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', songId!] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'purchase', userId] })
      setSubmitting(false)
      posthog?.capture('payment sheet open', {
        song_id: songData?.id,
        shares,
        total_cost: totalCost
      })
    },
    onError: (error) => {
      console.log(error)
      setSubmitting(false)
    }
  })

  const initializePaymentSheet = async (amount: number) => {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    const data = await mutatePaymentSheet({ amount, email: user?.email! })

    const { error } = await initPaymentSheet({
      merchantDisplayName: 'Avocado Shares, Inc.',
      customerId: data.customer,
      customerEphemeralKeySecret: data.ephemeralKey,
      paymentIntentClientSecret: data.paymentIntent,
      allowsDelayedPaymentMethods: false
    })
    if (!error) {
      setSubmitting(false)
    }
  }

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet()

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message)
    } else {
      setSubmitting(false)
      setSuccess(true)
      posthog?.capture('song purchase', {
        song_id: songData?.id,
        shares,
        total_cost: totalCost
      })
    }
  }

  const onSubmit = async (formData: TPurchaseReleasedSchema) => {
    // if (isStripeAccDataLoading) return

    // if (!stripeAccountData?.charges_enabled && !stripeAccountData?.payouts_enabled) {
    //   Alert.alert('Error', 'You need to complete your stripe onboarding to purchase shares', [
    //     {
    //       text: 'Complete Onboarding',
    //       onPress: async () => await handleStripeOnboarding()
    //     },
    //     {
    //       text: 'Cancel',
    //       style: 'destructive'
    //     }
    //   ])
    //   return
    // }

    if (Number(formData.amount) < 100) {
      ShowToast(
        'Minimum amount is $1.00',
        {
          backgroundColor: colorScheme === 'dark' ? tw.color('bg-zinc-800') : tw.color('bg-zinc-200'),
          position: ToastPositionsValues.TOP
        },
        false
      )
      return
    }

    setSubmitting(true)
    await initializePaymentSheet(Number(formData.amount))
    const amount = Number(formData.amount)
    if (amount < 1) return
    setAmountPaid(Number(formData.amount))
    openPaymentSheet()
  }

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        animationRef.current?.play()
      }, 500)
    }
  }, [success])

  useEffect(() => {
    if (paymentSheetIsError) Alert.alert('Error', paymentSheetError?.message)
  }, [paymentSheetError])

  const gradient =
    colorScheme === 'dark'
      ? ['#1d1d24', '#1d1d24', '#0b0b0e', '#0b0b0e', '#0d0d10', '#0e0e11']
      : ['#d1d5db', '#e5e7eb', '#f4f4f5', '#fafafa', '#fafafa', '#fafafa', '#fafafa']
  return (
    <RootSiblingParent>
      <LinearGradient colors={gradient.map((color) => (color ? color : 'transparent'))} style={tw`flex-1 gutter-sm`}>
        <View style={tw`flex flex-1 mt-4 `}>
          <BackButton variant="close" />
          {success ? (
            <View style={tw`flex items-center flex-1 mt-4 gutter-md gap-y-8`}>
              <Typography weight={500} style={tw`flex-wrap text-xl text-center`}>
                Thanks for supporting the song {getSongTitle(songData!, 40)} by {songData?.artists.artist_name}. You've
                paid{' '}
                {(amountPaid / 100).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
              </Typography>
              <LottieView style={tw`w-full h-96 `} source={successAnim} ref={animationRef} autoPlay />
              <View style={tw.style(`w-full`)}>
                <Button
                  onPress={() => router.back()}
                  styles="rounded-md w-full text-center flex-col "
                  textStyles="text-white text-center "
                  variant="primary"
                >
                  Go back
                </Button>
              </View>
            </View>
          ) : (
            <View style={tw`mt-4 gutter-md gap-y-20`}>
              <View style={tw`flex-row gap-x-2`}>
                <View style={tw`gap-y-1`}>
                  <Typography weight={600} style={tw`text-xl`}>
                    Buy {getSongTitle(songData!, 40)}
                  </Typography>
                  <Pressable
                    onPress={() => router.replace(`views/artist/${songData?.artists.id}?url=views/song/${songId}`)}
                  >
                    {({ pressed }) => (
                      <View style={tw`flex-row items-center gap-x-2`}>
                        <Image
                          source={songData?.artists.avatar_url}
                          placeholder={defaultBlurhash}
                          contentFit="fill"
                          cachePolicy="disk"
                          style={[tw.style(`h-5 w-5 rounded-full`, { 'opacity-50': pressed })]}
                          alt={`Profile picture for ${songData?.artists.artist_name}`}
                        />
                        <Typography weight={500} style={tw.style({ 'opacity-50': pressed })}>
                          {songData?.artists.artist_name}
                        </Typography>
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>

              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`h-full gap-y-2`}>
                <View>
                  <View style={tw`relative flex-row items-center justify-center w-full`}>
                    <View style={tw`flex-col gap-y-4`}>
                      <Typography style={tw`text-lg text-center`} weight={500}>
                        Pay what you want
                      </Typography>
                      <Controller
                        control={control}
                        rules={{
                          required: true
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            autoFocus
                            styles="border-0 dark:bg-transparent bg-transparent text-center p-0 shadow-none text-4xl"
                            inputMode="numeric"
                            keyboardType="phone-pad"
                            placeholder="0.00"
                            hitSlop={{ top: 10, bottom: 10, left: 200, right: 10 }}
                            // selection={{ start: 2, end: 2 }}
                            flatPlaceholder
                            onBlur={onBlur}
                            onChangeText={(event) => {
                              // if (
                              //   songData?.campaign_details &&
                              //   Number(event) > songData?.campaign_details?.available_shares
                              // ) {
                              //   event = songData?.campaign_details?.available_shares.toString()
                              //   ShowToast(
                              //     `Max shares available is ${songData?.campaign_details?.available_shares}`,
                              //     {
                              //       backgroundColor:
                              //         colorScheme === 'dark' ? tw.color('bg-zinc-800') : tw.color('bg-zinc-200'),
                              //       position: ToastPositionsValues.TOP
                              //     },
                              //     false
                              //   )
                              // }
                              const numericText = event.replace(/[^0-9]/g, '')

                              onChange(numericText)
                            }}
                            value={formatDisplayValue(value)}
                          />
                        )}
                        name="amount"
                      />
                      {errors.amount && <ErrorText>{errors.amount.message}</ErrorText>}
                    </View>
                  </View>
                </View>

                <View style={tw.style(`justify-end mt-12 z-50 flex items-center`)}>
                  <Button
                    loading={submitting}
                    disabled={shares === 0}
                    onPress={handleSubmit(onSubmit)}
                    styles="w-full rounded-md"
                    textStyles="text-white"
                    variant="primary"
                  >
                    Buy Song
                  </Button>
                </View>
              </KeyboardAvoidingView>
            </View>
          )}
        </View>
      </LinearGradient>
    </RootSiblingParent>
  )
}
