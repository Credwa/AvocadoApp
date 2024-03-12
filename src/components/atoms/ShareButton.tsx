import * as Linking from 'expo-linking'
import { usePathname } from 'expo-router'
import * as Sharing from 'expo-sharing'
import { useEffect, useState } from 'react'
import { Pressable } from 'react-native'

// import branch from 'react-native-branch'
import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Ionicons } from '@expo/vector-icons'

import ShowToast from './Toast'

type ShareButtonProps = {
  size?: number
  style?: string
  forceColorScheme?: 'dark' | 'light'
  href?: string
  id: string
  title: string
  contentDescription: string
  contentMetadata?: Record<string, any>
}

export default function ShareButton({
  size = 28,
  style,
  forceColorScheme,
  href,
  id,
  title,
  contentDescription,
  contentMetadata
}: ShareButtonProps) {
  let colorScheme = useColorScheme()
  const [buo, setBuo] = useState<any>(null)

  if (forceColorScheme) colorScheme = forceColorScheme

  // const runBuo = async () => {
  //   try {
  //     const buo = await branch.createBranchUniversalObject(id, contentMetadata!)
  //     setBuo(buo)
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // useEffect(() => {
  //   if (!__DEV__) {
  //     runBuo()
  //   }
  // }, [])

  const share = async () => {
    // try {
    //   let shareOptions = {
    //     messageHeader: title,
    //     messageBody: contentDescription
    //   }
    //   let linkProperties = {
    //     feature: 'sharing'
    //   }
    //   let controlParams = {
    //     $desktop_url: 'https://ltpqx.app.link/song',
    //     $ios_url: 'https://ltpqx.app.link/song'
    //   }
    //   let { channel, completed, error } = await buo.showShareSheet(shareOptions, linkProperties, controlParams)
    // } catch (error) {
    //   console.log(error)
    // }
    // const shareAvailable = await Sharing.isAvailableAsync()
    // if (shareAvailable) {
    //   await Sharing.shareAsync(url + pathname)
    // } else {
    //   console.log('Sharing not available')
    //   ShowToast('Sharing not available', {
    //     backgroundColor: colorScheme === 'dark' ? tw.color('bg-zinc-800') : tw.color('bg-zinc-200')
    //   })
    // }
  }

  return (
    <Pressable style={[tw`p-4`, tw.style(style)]} onPress={share}>
      {({ pressed }) => (
        <Ionicons
          name="share-outline"
          size={size}
          style={[tw.style(''), tw.style({ 'opacity-50': pressed })]}
          color={colorScheme === 'dark' ? tw.color('text-zinc-100') : tw.color('text-zinc-700')}
        />
      )}
    </Pressable>
  )
}
