import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import BackButton from '@/components/atoms/BackButton'
import { Button } from '@/components/atoms/Button'
import { ErrorText } from '@/components/atoms/ErrorText'
import { TextInput } from '@/components/atoms/TextInput'
import { Typography } from '@/components/atoms/Typography'
import tw from '@/helpers/lib/tailwind'
import { TVerifyOTPSchema, verifyOTPSchema } from '@/helpers/schemas/auth'
import { supabase } from '@/helpers/supabase/supabase'
import { zodResolver } from '@hookform/resolvers/zod'

export default function ForgotPassword() {
  const [submitting, setSubmitting] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<TVerifyOTPSchema>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: {
      email: ''
    }
  })
  const colorScheme = useColorScheme()
  let imageBackground = require('~/assets/images/auth-background.png')

  if (colorScheme === 'dark') {
    imageBackground = require('~/assets/images/auth-background-dark.png')
  }

  const onSubmit = async (data: TVerifyOTPSchema) => {
    setSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          shouldCreateUser: false
        }
      })
      if (error) {
        if (error.name === 'AuthApiError') {
          Alert.alert(
            `We couldn't find your account. Create a new account?`,
            `It looks like ${data.email} isn't connected to an account. You can create a new account with this email or try again.`,
            [
              {
                text: 'Try again',
                onPress: () => setValue('email', ''),
                style: 'cancel'
              },
              { text: 'Create new account', onPress: () => router.push('/sign-up') }
            ]
          )
          setSubmitting(false)
          return
        } else {
          throw new Error(error?.message)
        }
      }

      setSubmitting(false)
      router.push(`/confirm-code?email=${data.email}`)
    } catch (error) {
      setSubmitting(false)
      if (error instanceof Error) {
        Alert.alert(error.message)
      } else {
        Alert.alert('An unknown error has occurred.')
      }
    }
  }

  return (
    <ImageBackground style={tw`flex flex-1`} source={imageBackground}>
      <SafeAreaView style={tw`flex flex-1`}>
        <BackButton />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={tw`flex-col flex-1 justify-center gap-12 gutter-sm`}
        >
          <Image style={tw`self-center w-16 h-16`} source={require('~/assets/images/AvocadoLogoMinimal.png')} />
          <View style={tw`flex-col gap-2 pb-4`}>
            <Typography weight={700} style={tw`text-2xl text-black dark:text-white`}>
              Find your account
            </Typography>
            <Typography style={tw``}>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
          </View>
          <View style={tw`flex-col gap-4`}>
            <View>
              <Controller
                control={control}
                rules={{
                  required: true
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    autoFocus
                    placeholder="Email"
                    inputMode="email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="email"
              />
              {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
            </View>
          </View>

          <View style={tw`flex flex-col gap-8`}>
            <Button loading={submitting} styles="w-full" onPress={handleSubmit(onSubmit)}>
              Find account
            </Button>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  )
}
