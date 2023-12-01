import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, Pressable, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components/atoms/Button'
import { ErrorText } from '@/components/atoms/ErrorText'
import { Link } from '@/components/atoms/Link'
import { TextInput } from '@/components/atoms/TextInput'
import { Typography } from '@/components/atoms/Typography'
import tw from '@/helpers/lib/tailwind'
import {
  passwordResetSchema,
  signUpSchema,
  TPasswordResetSchema,
  TSignInSchema,
  TSignUpSchema
} from '@/helpers/lib/validators'
import { supabase } from '@/helpers/supabase/supabase'
import { Ionicons } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'

export default function SignIn() {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<TPasswordResetSchema>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: ''
    }
  })
  const colorScheme = useColorScheme()
  let imageBackground = require('~/assets/images/auth-background.png')

  if (colorScheme === 'dark') {
    imageBackground = require('~/assets/images/auth-background-dark.png')
  }

  const onSubmit = async (data: TPasswordResetSchema) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: 'craigroe7@gmail.com',
        options: {
          emailRedirectTo: 'https://example.com/welcome'
        }
      })

      console.log(data, error)

      // const { error } = await supabase.auth.resetPasswordForEmail(data.email)
      if (error) throw new Error(error?.message)
    } catch (error) {
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
          style={tw`flex-col  flex-1 gap-12 gutter-sm`}
        >
          <Image style={tw`self-center w-16 h-16 pb-4`} source={require('~/assets/images/AvocadoLogoMinimal.png')} />
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
            <Button styles="w-full" onPress={handleSubmit(onSubmit)}>
              Find account
            </Button>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  )
}
