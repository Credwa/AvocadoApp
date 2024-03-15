import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, Keyboard, KeyboardAvoidingView, Platform, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components/atoms/Button'
import { ErrorText } from '@/components/atoms/ErrorText'
import { Link } from '@/components/atoms/Link'
import { TextInput } from '@/components/atoms/TextInput'
import { useSession } from '@/context/authContext'
import { AndroidSafeAreaPaddingTop } from '@/helpers/lib/constants'
import tw from '@/helpers/lib/tailwind'
import { signInSchema, TSignInSchema } from '@/helpers/schemas/auth'
import { zodResolver } from '@hookform/resolvers/zod'

export default function SignIn() {
  const { signIn, emailConfirm } = useSession() ?? {}
  const { errorMessage } = useLocalSearchParams<{ errorMessage?: string }>()
  const [submitting, setSubmitting] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<TSignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })
  const [keyboardShown, setKeyboardShown] = useState(false)

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardShown(true)
    })
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardShown(false)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  const init = async () => {
    try {
      if (emailConfirm) {
        const session = await emailConfirm()
        if (session) {
          router.replace('/')
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      } else {
        Alert.alert('An unknown error has occurred.')
      }
    }
  }
  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    switch (errorMessage) {
      case 'exists':
        setError('email', { message: 'Email already exists try logging in instead' }, { shouldFocus: true })
    }
  }, [])

  const onSubmit = async (data: TSignInSchema) => {
    if (!signIn) return
    setSubmitting(true)
    try {
      const session = await signIn(data.email.trim(), data.password.trim())
      if (session) {
        router.replace('/discover')
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
    <SafeAreaView style={tw.style(`flex flex-1 gutter-sm`, AndroidSafeAreaPaddingTop)}>
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

        <View style={tw`flex flex-col justify-end gap-8`}>
          <Button loading={submitting} styles="w-full" onPress={handleSubmit(onSubmit)}>
            Login
          </Button>
          {!keyboardShown && (
            <View style={tw`flex flex-row self-center`}>
              <Link variant="default" styles="font-semibold" href="/forgot-password">
                Forgot password?
              </Link>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
      {!keyboardShown && (
        <Button
          styles="w-full mb-4"
          outline
          onPress={() => {
            router.push('/sign-up')
          }}
        >
          Create new account
        </Button>
      )}
    </SafeAreaView>
  )
}
