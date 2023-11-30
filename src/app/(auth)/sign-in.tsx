import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, Text, useColorScheme, View } from 'react-native'

import { ALink } from '@/components/atoms/ALink'
import { Button } from '@/components/atoms/Button'
import { ErrorText } from '@/components/atoms/ErrorText'
import { TextInput } from '@/components/atoms/TextInput'
import { useSession } from '@/context/authContext'
import tw from '@/helpers/lib/tailwind'
import { signInSchema, TSignInSchema } from '@/helpers/lib/validators'
import { zodResolver } from '@hookform/resolvers/zod'

export default function SignIn() {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<TSignInSchema>({
    resolver: zodResolver(signInSchema),
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

  const { signIn } = useSession() ?? {}

  const onSubmit = async (data: TSignInSchema) => {
    if (!signIn) return
    try {
      const session = await signIn(data.email, data.password)
      if (session) {
        router.replace('/')
      }
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-col justify-center flex-1 gap-8 gutter-sm`}
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
                  value={value}
                  textContentType="oneTimeCode"
                  onChangeText={onChange}
                  secureTextEntry={false}
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
        <View style={tw`flex flex-col justify-end gap-8`}>
          <Button styles="w-full" onPress={handleSubmit(onSubmit)}>
            Login
          </Button>
          <View style={tw`flex flex-row self-center`}>
            <Text style={tw` text-zinc-600 dark:text-zinc-200`}>Don't have an account? </Text>
            <ALink variant="secondary" href="/sign-up">
              Sign up
            </ALink>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  )
}
