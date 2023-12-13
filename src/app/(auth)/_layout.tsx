import { Slot } from 'expo-router'
import { ImageBackground, useColorScheme } from 'react-native'

import tw from '@/helpers/lib/tailwind'

// export { default } from '../../../.storybook'

export default function Layout() {
  const colorScheme = useColorScheme()

  let imageBackground = require('~/assets/images/auth-background.png')

  if (colorScheme === 'dark') {
    imageBackground = require('~/assets/images/auth-background-dark.png')
  }

  return (
    <ImageBackground style={tw`flex-auto`} source={imageBackground}>
      <Slot />
    </ImageBackground>
  )
}
