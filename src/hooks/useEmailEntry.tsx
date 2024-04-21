import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { TextInput, View } from 'react-native'

import { ErrorText } from '@/components/atoms/ErrorText'
import tw from '@/helpers/lib/tailwind'
import { TVerifyOTPSchema, verifyOTPSchema } from '@/helpers/schemas/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { UseMutateAsyncFunction } from '@tanstack/react-query'

export function useEmailEntryForm(
  submitAction: UseMutateAsyncFunction<void, Error, string, unknown>,
  onComplete: () => void,
  defaultEmail: string = ''
) {
  const [submitting, setSubmitting] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<TVerifyOTPSchema>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: {
      email: defaultEmail
    }
  })

  const onSubmit = async (data: TVerifyOTPSchema) => {
    setSubmitting(true)
    try {
      await submitAction(data.email)
      onComplete()
    } catch (error) {
      console.log(error)
    }
    // Add your submission logic here.
    setSubmitting(false)
  }

  const emailInput = (
    <View style={tw`w-full`}>
      <Controller
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            autoFocus
            style={[
              tw.style(
                `dark:bg-zinc-800 dark:border-primary-light border-zinc-800 flex bg-zinc-200 dark:text-zinc-300 text-zinc-700 rounded-md h-12 px-3 no-underline border`
              ),
              { fontFamily: 'REM' }
            ]}
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
  )

  // Instead of just returning the error display, you can return the error object itself if needed
  const emailError = errors.email ? errors.email.message : null

  return { emailInput, emailError, handleSubmit: handleSubmit(onSubmit), submitting }
}
