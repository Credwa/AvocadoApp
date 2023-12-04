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
import ShowToast from '@/components/atoms/Toast'
import { Typography } from '@/components/atoms/Typography'
import { handleErrors } from '@/helpers/lib/Errors'
import tw from '@/helpers/lib/tailwind'
import { passwordResetSchema, TPasswordResetSchema } from '@/helpers/schemas/auth'
import { supabase } from '@/helpers/supabase/supabase'
import { zodResolver } from '@hookform/resolvers/zod'

export default function ResetPassword() {
  const [submitting, setSubmitting] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<TPasswordResetSchema>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: ''
    }
  })
  const colorScheme = useColorScheme()
  let imageBackground = require('~/assets/images/auth-background.png')

  if (colorScheme === 'dark') {
    imageBackground = require('~/assets/images/auth-background-dark.png')
  }

  const onSubmit = async (data: TPasswordResetSchema) => {
    setSubmitting(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password })
      handleErrors(error)
      const { error: signOutError } = await supabase.auth.signOut()
      handleErrors(signOutError)
      setSubmitting(false)
      ShowToast('Password reset successfully')
      router.push(`/sign-in`)
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
              Reset your password
            </Typography>
            <Typography style={tw``}>
              Enter a new password below to reset it. You'll be able to sign in with your new password after resetting
              it.
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
                    placeholder="New password"
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

          <View style={tw`flex flex-col gap-8`}>
            <Button loading={submitting} styles="w-full" onPress={handleSubmit(onSubmit)}>
              Reset password
            </Button>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  )
}
