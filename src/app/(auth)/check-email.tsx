import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import BackButton from '@/components/atoms/BackButton'
import { Button } from '@/components/atoms/Button'
import ShowToast from '@/components/atoms/Toast'
import { Typography } from '@/components/atoms/Typography'
import { AndroidSafeAreaPaddingTop } from '@/helpers/lib/constants'
import { handleErrors } from '@/helpers/lib/Errors'
import tw from '@/helpers/lib/tailwind'
import { supabase } from '@/helpers/supabase/supabase'

export default function CheckEmail() {
  const { email } = useLocalSearchParams<{ email?: string; password?: string }>()
  const [codeResent, setCodeResent] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    if (codeResent) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 0) {
            setCodeResent(false)
            clearInterval(timer)
          }
          return prev > 0 ? prev - 1 : 0
        })
      }, 1000)

      return () => {
        clearInterval(timer)
      }
    }
  }, [codeResent])

  const enterCode = () => {
    router.push(`/confirm-code?email=${email}&type=signup`)
  }

  const resend = async () => {
    if (email && !codeResent) {
      setCodeResent(true)
      setTimeLeft(60)
      const { error } = await supabase.auth.resend({
        email,
        type: 'signup'
      })
      handleErrors(error)
      ShowToast('Email was sent')
    } else if (codeResent && email) {
      ShowToast(`You can resend an email in ${timeLeft} seconds`)
    }
  }

  return (
    <SafeAreaView style={tw.style(`flex flex-1`, AndroidSafeAreaPaddingTop)}>
      <BackButton />
      <View style={tw`flex-col justify-center flex-1 gap-2 pb-4 gutter-sm`}>
        <Image style={tw`self-center w-16 h-16 mb-6`} source={require('~/assets/images/AvocadoLogoMinimal.png')} />

        <Typography weight={700} style={tw`text-2xl text-center text-black dark:text-white`}>
          Confirm your account
        </Typography>
        <Typography style={tw`text-center`}>
          We sent a link to your email. Click on the link to confirm your account.
        </Typography>
        <Button variant="default" styles="w-full mt-8 dark:bg-slate-700 bg-zinc-200" onPress={resend}>
          Send email again
        </Button>
        <Button variant="default" styles="w-full mt-4 " onPress={enterCode}>
          Enter code
        </Button>
      </View>
    </SafeAreaView>
  )
}
