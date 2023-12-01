import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components/atoms/Button'
import { ErrorText } from '@/components/atoms/ErrorText'
import { Link } from '@/components/atoms/Link'
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
      const session = await signIn(data.email.trim(), data.password.trim())
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
      <SafeAreaView style={tw`flex flex-1 gutter-sm`}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={tw`flex-col justify-center flex-1 gap-10`}
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
                    onBlur={onBlur}
                    onChangeText={onChange}
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
              <Link variant="default" styles="font-semibold" href="/forgot-password">
                Forgot password?
              </Link>
            </View>
          </View>
        </KeyboardAvoidingView>
        <Button
          styles="w-full mb-4"
          outline
          onPress={() => {
            router.replace('/sign-up')
          }}
        >
          Create new account
        </Button>
      </SafeAreaView>
    </ImageBackground>
  )
}
