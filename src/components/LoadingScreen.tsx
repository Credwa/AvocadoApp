import LottieView from 'lottie-react-native'
import React from 'react'

import tw from '@/helpers/lib/tailwind'

export default function LoadingScreen() {
  const loadingAnim = require('~/assets/lottie/Loading.json')

  return <LottieView autoPlay style={tw`flex-1 background-default`} source={loadingAnim} />
}
