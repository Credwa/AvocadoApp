import { Slot } from 'expo-router'
import { ImageBackground } from 'react-native'

import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'

// export { default } from '../../../.storybook'

export default function Layout() {
  const scheme = useColorScheme()
  let imageBackground = require('~/assets/images/auth-background.png')
  if (scheme === 'dark') {
    imageBackground = require('~/assets/images/auth-background-dark.png')
  }
  return (
    <ImageBackground style={tw`flex-auto`} source={imageBackground}>
      <Slot />
    </ImageBackground>
  )
}
