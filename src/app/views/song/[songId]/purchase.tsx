import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import LottieView from 'lottie-react-native'
import { usePostHog } from 'posthog-react-native'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { KeyboardAvoidingView, Platform, Pressable, useColorScheme, View } from 'react-native'

import BackButton from '@/components/atoms/BackButton'
import { Button } from '@/components/atoms/Button'
import { ErrorText } from '@/components/atoms/ErrorText'
import { TextInput } from '@/components/atoms/TextInput'
import { Typography } from '@/components/atoms/Typography'
import { defaultBlurhash } from '@/helpers/lib/constants'
import { getSongTitle } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { purchaseSchema, TPurchaseSchema } from '@/helpers/schemas/extras'
import { getCampaignById } from '@/services/CampaignService'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'

const successAnim = require('~/assets/lottie/Confetti.json')

export default function Purchase() {
  const router = useRouter()
  const posthog = usePostHog()

  const [success, setSuccess] = useState(false)
  const [shares, setShares] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const animationRef = useRef<LottieView>(null)

  const [totalCost, setTotalCost] = useState(0)
  const colorScheme = useColorScheme()
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<TPurchaseSchema>({
    resolver: zodResolver(purchaseSchema)
  })

  const { songId } = useLocalSearchParams<{ songId: string }>()
  if (!songId) {
    router.back()
  }
  const { data: songData, isLoading: isSongLoading } = useQuery({
    ...getCampaignById(songId!)
  })

  const onSubmit = async (formData: TPurchaseSchema) => {
    if (shares < 1) return
    setSubmitting(true)
    console.log(formData)
    setTimeout(() => {
      setSubmitting(false)
      setSuccess(true)
      posthog?.capture('song purchase', {
        song_id: songData?.id,
        shares,
        total_cost: totalCost
      })
    }, 1500)
  }

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        animationRef.current?.play()
      }, 500)
    }
  }, [success])

  const gradient =
    colorScheme === 'dark'
      ? ['#1d1d24', '#1d1d24', '#0b0b0e', '#0b0b0e', '#0d0d10', '#0e0e11']
      : ['#d1d5db', '#e5e7eb', '#f4f4f5', '#fafafa', '#fafafa', '#fafafa', '#fafafa']
  return (
    <LinearGradient colors={gradient.map((color) => (color ? color : 'transparent'))} style={tw`flex-1 gutter-sm`}>
      <View style={tw`flex flex-1 mt-4 `}>
        <BackButton variant="close" />
        {success ? (
          <View style={tw`flex items-center flex-1 mt-4 gutter-md gap-y-8`}>
            <Typography weight={500} style={tw`flex-wrap text-xl text-center`}>
              Purchased {shares} shares of song {getSongTitle(songData!, 40)} by {songData?.artists.artist_name} for{' '}
              {totalCost.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}
            </Typography>
            <LottieView style={tw`w-full h-96 `} source={successAnim} ref={animationRef} autoPlay />
            <View style={tw.style(`w-full`)}>
              <Button
                loading={submitting}
                disabled={shares === 0}
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
              <View>
                <Typography weight={600} style={tw`text-xl`}>
                  Buy {getSongTitle(songData!, 40)}
                </Typography>
                <Pressable>
                  {({ pressed }) => (
                    <View style={tw`flex-row items-center gap-x-2`}>
                      <Image
                        source={songData?.artists.avatar_url}
                        placeholder={defaultBlurhash}
                        contentFit="fill"
                        cachePolicy="memory"
                        style={[tw.style(`h-5 w-5 rounded-full`, { 'opacity-50': pressed })]}
                        alt={`Profile picture for ${songData?.artists.artist_name}`}
                      />
                      <Typography weight={500}>{songData?.artists.artist_name}</Typography>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`h-full gap-y-2`}>
              <View>
                <View style={tw`relative flex-row items-center justify-between w-full `}>
                  <Typography weight={400} style={tw`text-base`}>
                    Number of Shares
                  </Typography>
                  <View>
                    <Controller
                      control={control}
                      rules={{
                        required: true
                      }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          autoFocus
                          styles="border-0 dark:bg-transparent bg-transparent text-right p-0 shadow-none"
                          inputMode="numeric"
                          maxLength={2}
                          keyboardType="phone-pad"
                          placeholder="0"
                          flatPlaceholder
                          onBlur={onBlur}
                          onChangeText={(event) => {
                            setShares(Number(event))
                            setTotalCost(Number(event) * (songData?.campaign_details?.price_per_share ?? 0))
                            onChange(event)
                          }}
                          value={value}
                        />
                      )}
                      name="numberOfShares"
                    />
                    {errors.numberOfShares && <ErrorText>{errors.numberOfShares.message}</ErrorText>}
                  </View>
                </View>
                <View style={tw`left-0 w-full border-b dark:border-zinc-800 border-zinc-200`} />
              </View>

              <View>
                <View style={tw`relative flex-row items-center justify-between w-full py-4 `}>
                  <Typography weight={400} style={tw`text-base`}>
                    Price
                  </Typography>
                  <Typography weight={400} style={tw`text-base`}>
                    {songData?.campaign_details?.price_per_share.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    })}
                  </Typography>
                </View>
                <View style={tw`left-0 w-full pt-1 border-b dark:border-zinc-800 border-zinc-200`} />
              </View>

              <View>
                <View style={tw`relative flex-row items-center justify-between w-full py-4`}>
                  <Typography weight={400} style={tw`text-base`}>
                    Total Cost
                  </Typography>
                  <Typography weight={400} style={tw`text-base`}>
                    {totalCost.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    })}
                  </Typography>
                </View>
              </View>
              <View style={tw.style(`justify-end mt-12 z-50 flex items-center`)}>
                <Button
                  loading={submitting}
                  disabled={shares === 0}
                  onPress={handleSubmit(onSubmit)}
                  styles="w-full rounded-md"
                  textStyles="text-white"
                  variant="secondary"
                >
                  Purchase
                </Button>
              </View>
            </KeyboardAvoidingView>
          </View>
        )}
      </View>
    </LinearGradient>
  )
}
