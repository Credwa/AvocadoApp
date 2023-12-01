import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, Pressable, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components/atoms/Button'
import { ErrorText } from '@/components/atoms/ErrorText'
import { TextInput } from '@/components/atoms/TextInput'
import { Typography } from '@/components/atoms/Typography'
import tw from '@/helpers/lib/tailwind'
import { confirmCodeSchema, TConfirmCodeSchema } from '@/helpers/schemas/auth'
import { supabase } from '@/helpers/supabase/supabase'
import { Ionicons } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'

export default function ConfirmCode() {
  const { email } = useLocalSearchParams<{ email?: string }>()

  console.log(email)
  const [submitting, setSubmitting] = useState(false)
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
  supabase.auth.getSession()

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
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: formData.code,
          type: 'email'
        })

        if (error) throw new Error(error?.message)
        setSubmitting(false)
        router.push('/reset-password')
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
        <Pressable style={tw`p-4`} onPress={() => router.back()}>
          {({ pressed }) => (
            <Ionicons
              name="chevron-back"
              size={32}
              style={[tw.style(''), tw.style({ 'opacity-50': pressed })]}
              color={colorScheme === 'dark' ? tw.color('text-zinc-100') : tw.color('text-zinc-700')}
            />
          )}
        </Pressable>

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

          <View style={tw`flex flex-col gap-8`}>
            <Button loading={submitting} styles="w-full" onPress={handleSubmit(onSubmit)}>
              Continue
            </Button>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  )
}
