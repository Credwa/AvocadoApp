import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, TextInput, View } from 'react-native'

import { Button } from '@/components/atoms/Button'
import { ErrorText } from '@/components/atoms/ErrorText'
import { Typography } from '@/components/atoms/Typography'
import { useSession } from '@/context/authContext'
import { usePlayback } from '@/context/playbackContext'
import { WEB_URL } from '@/helpers/lib/constants'
import tw from '@/helpers/lib/tailwind'
import { passwordResetSchema, TPasswordResetSchema } from '@/helpers/schemas/auth'
import { supabase } from '@/helpers/supabase/supabase'
import { zodResolver } from '@hookform/resolvers/zod'

const DeleteAccountPage: React.FC = () => {
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
  const { stop } = usePlayback() ?? {}
  const { signOut, session } = useSession() ?? {}
  console.log(session)

  const handleDeleteAccount = (data: TPasswordResetSchema) => {
    // Logic to delete the account using the password
    Alert.alert('Sign out', 'Are you sure you want to delete your account?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel'
      },
      {
        text: 'Delete Account',
        onPress: async () => {
          try {
            const {
              data: { user }
            } = await supabase.auth.getUser()
            await fetch(`${WEB_URL}/auth/delete-app-account`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: user?.email,
                password: data.password
              })
            })
            await stop()
            signOut && (await signOut())
          } catch (error) {
            Alert.alert('Error', 'Failed to delete account')
          }
        },
        style: 'destructive'
      }
    ])
  }

  return (
    <View style={tw`flex items-center justify-center h-1/2 gap-y-8`}>
      <Typography weight={500} style={tw`text-base`}>
        Confirm Password to Delete Account
      </Typography>

      <View style={tw`w-4/5`}>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              secureTextEntry
              autoFocus
              style={[
                tw.style(
                  `dark:bg-zinc-900 dark:border-primary-light border-zinc-800 flex bg-zinc-200 dark:text-zinc-300 text-zinc-700 rounded-md h-12 px-3 no-underline border`
                ),
                { fontFamily: 'REM' }
              ]}
              placeholder="Confirm Password"
              inputMode="email"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="password"
        />
        {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
      </View>
      <Button
        style={tw`text-red-400`}
        variant="danger"
        styles="text-red-500"
        onPress={handleSubmit(handleDeleteAccount)}
      >
        Delete Account
      </Button>
    </View>
  )
}

export default DeleteAccountPage
