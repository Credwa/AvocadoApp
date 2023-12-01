import { Image } from 'expo-image'
import { Controller, useForm } from 'react-hook-form'
import { ImageBackground, KeyboardAvoidingView, Platform, useColorScheme, View } from 'react-native'

import { Button } from '@/components/atoms/Button'
import { ErrorText } from '@/components/atoms/ErrorText'
import { Link } from '@/components/atoms/Link'
import { TextInput } from '@/components/atoms/TextInput'
import { Typography } from '@/components/atoms/Typography'
import tw from '@/helpers/lib/tailwind'
import { signUpSchema, TSignInSchema, TSignUpSchema } from '@/helpers/lib/validators'
import { zodResolver } from '@hookform/resolvers/zod'

export default function SignIn() {
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

  const onSubmit = async (data: TSignInSchema) => {
    try {
    } catch (error) {}
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
                  textContentType="oneTimeCode"
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
          <Typography style={tw`flex flex-col text-xs leading-6 text-center text-neutral`}>
            By continuing, you agree to the{' '}
          </Typography>
          <View style={tw`flex flex-row self-center gap-1`}>
            <Link styles="underline dark:text-secondary-light text-xs" variant="secondary" href="">
              Avocado User Account Agreement
            </Link>
            <Typography style={tw`text-xs text-neutral`}>and</Typography>
            <Link styles="underline dark:text-secondary-light text-xs" variant="secondary" href="">
              Privacy Policy
            </Link>
          </View>
        </View>
        <View style={tw`flex flex-col gap-8`}>
          <Button styles="w-full" onPress={handleSubmit(onSubmit)}>
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
