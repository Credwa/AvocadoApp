import { makeRedirectUri } from 'expo-auth-session'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native'

import { Button } from '@/components/atoms/Button'
import { ErrorText } from '@/components/atoms/ErrorText'
import { Link } from '@/components/atoms/Link'
import { TextInput } from '@/components/atoms/TextInput'
import { Typography } from '@/components/atoms/Typography'
import { WEB_URL } from '@/helpers/lib/constants'
import { handleErrors } from '@/helpers/lib/Errors'
import tw from '@/helpers/lib/tailwind'
import { signUpSchema, TSignUpSchema } from '@/helpers/schemas/auth'
import { supabase } from '@/helpers/supabase/supabase'
import { zodResolver } from '@hookform/resolvers/zod'

const redirectTo = makeRedirectUri()

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

  const onSubmit = async (data: TSignUpSchema) => {
    setSubmitting(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${WEB_URL}?mode=app&email=${data.email}&app_redirect=${redirectTo}`
        }
      })

      handleErrors(error)
      setSubmitting(false)
      router.push(`/check-email?email=${data.email}`)
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
              <TextInput placeholder="Email" inputMode="email" onBlur={onBlur} onChangeText={onChange} value={value} />
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
              <TextInput placeholder="Password" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} />
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
            styles="underline dark:text-secondary-light text-center text-xs"
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
  )
}
