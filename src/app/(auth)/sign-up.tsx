import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, useColorScheme, View } from 'react-native'

import { Button } from '@/components/atoms/Button'
import { ErrorText } from '@/components/atoms/ErrorText'
import { Link } from '@/components/atoms/Link'
import { TextInput } from '@/components/atoms/TextInput'
import { Typography } from '@/components/atoms/Typography'
import tw from '@/helpers/lib/tailwind'
import { signUpSchema, TSignUpSchema } from '@/helpers/schemas/auth'
import { supabase } from '@/helpers/supabase/supabase'
import { zodResolver } from '@hookform/resolvers/zod'

export default function SignUp() {
  const [submitting, setSubmitting] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<TSignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })
  const colorScheme = useColorScheme()
  let imageBackground = require('~/assets/images/auth-background.png')

  if (colorScheme === 'dark') {
    imageBackground = require('~/assets/images/auth-background-dark.png')
  }

  const onSubmit = async (data: TSignUpSchema) => {
    setSubmitting(true)
    try {
      await fetch(`http://192.168.1.23:3000/api/app/new-user`, {
        method: 'POST',
        body: JSON.stringify({
          email: data.email
        })
      })
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          shouldCreateUser: false
        }
      })
      console.log(error)
      if (error) throw new Error(error?.message)
      setSubmitting(false)
      router.push(`/confirm-code?email=${data.email}&password=${data.password}`)
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-col justify-center flex-1 gap-10 gutter-sm`}
      >
        <Image style={tw`self-center w-16 h-16 mb-12`} source={require('~/assets/images/AvocadoLogoMinimal.png')} />
        <View style={tw`flex-col gap-4`}>
          <View>
            <Controller
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
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
          <View>
            <Controller
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Password"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="password"
            />
            {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
          </View>
        </View>
        <View style={tw`flex-col self-center w-full`}>
          <View style={tw`flex flex-row flex-wrap self-center justify-center gap-1`}>
            <Typography style={tw`flex flex-col text-xs text-center text-neutral`}>
              By continuing, you agree to the{' '}
            </Typography>
            <Link
              styles="underline dark:text-secondary-light text-xs"
              variant="secondary"
              href="/webviews/terms-of-use?url=https://myavocado.app/terms-of-use"
            >
              Avocado User Account Agreement
            </Link>
            <Typography style={tw`text-xs text-neutral`}>and</Typography>
            <Link
              styles="underline dark:text-secondary-light text-center text-xs"
              variant="secondary"
              href="/webviews/privacy-policy?url=https://myavocado.app/privacy-policy"
            >
              Privacy Policy
            </Link>
          </View>
        </View>
        <View style={tw`flex flex-col gap-8`}>
          <Button loading={submitting} styles="w-full" onPress={handleSubmit(onSubmit)}>
            Sign up
          </Button>
          <View style={tw`flex flex-row self-center`}>
            <Typography style={tw`text-neutral`}>Already have an account? </Typography>
            <Link variant="secondary" href="/sign-in">
              Log in
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  )
}
