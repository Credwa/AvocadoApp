import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import BackButton from '@/components/atoms/BackButton'
import { Button } from '@/components/atoms/Button'
import { ErrorText } from '@/components/atoms/ErrorText'
import { TextInput } from '@/components/atoms/TextInput'
import ShowToast from '@/components/atoms/Toast'
import { Typography } from '@/components/atoms/Typography'
import { useSession } from '@/context/authContext'
import { handleErrors } from '@/helpers/lib/Errors'
import tw from '@/helpers/lib/tailwind'
import { confirmCodeSchema, TConfirmCodeSchema } from '@/helpers/schemas/auth'
import { supabase } from '@/helpers/supabase/supabase'
import { zodResolver } from '@hookform/resolvers/zod'

export default function ConfirmCode() {
  const { email, type } = useLocalSearchParams<{
    email?: string
    password?: string
    type?: 'email' | 'signup'
  }>()
  const { emailConfirm } = useSession() ?? {}
  const [codeResent, setCodeResent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<TConfirmCodeSchema>({
    resolver: zodResolver(confirmCodeSchema)
  })
  const colorScheme = useColorScheme()
  let imageBackground = require('~/assets/images/auth-background.png')

  if (colorScheme === 'dark') {
    imageBackground = require('~/assets/images/auth-background-dark.png')
  }

  useEffect(() => {
    if (codeResent) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 0) {
            setCodeResent(false)
            clearInterval(timer)
          }
          return prev > 0 ? prev - 1 : 0
        })
      }, 1000)

      return () => {
        clearInterval(timer)
      }
    }
  }, [codeResent])

  const resend = async () => {
    if (email && !codeResent) {
      setCodeResent(true)
      setTimeLeft(60)
      const { error } = await supabase.auth.signInWithOtp({
        email
      })
      handleErrors(error)
      ShowToast('Code was sent')
    } else if (codeResent && email) {
      ShowToast(`You can resend a code in ${timeLeft} seconds`)
    }
  }

  const onSubmit = async (formData: TConfirmCodeSchema) => {
    setSubmitting(true)
    try {
      if (!email) {
        Alert.alert('An unknown error has occurred.', '', [
          {
            text: 'Go back',
            onPress: () => router.back()
          }
        ])
      } else {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: formData.code,
          type: type ?? 'email'
        })
        if (type === 'signup') {
          if (emailConfirm) {
            const session = await emailConfirm()
            if (session) {
              router.replace('/')
            }
          }
        } else {
          setSubmitting(false)
          handleErrors(error)
          router.push('/reset-password')
        }
      }
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
          <View style={tw`flex-col gap-2 pb-4`}>
            <Typography weight={700} style={tw`text-2xl text-black dark:text-white`}>
              Confirm your account
            </Typography>
            <Typography style={tw``}>We sent a code to your email. Enter that code to confirm your account.</Typography>
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
                    placeholder="Enter code"
                    inputMode="numeric"
                    keyboardType="numeric"
                    maxLength={6}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="code"
              />
              {errors.code && <ErrorText>{errors.code.message}</ErrorText>}
            </View>
          </View>

          <View style={tw`flex flex-col gap-4`}>
            <Button loading={submitting} styles="w-full" onPress={handleSubmit(onSubmit)}>
              Continue
            </Button>
            <Button variant="default" loading={submitting} styles="w-full" onPress={resend}>
              Send code again
            </Button>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  )
}
