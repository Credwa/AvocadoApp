import LottieView from 'lottie-react-native'
import React from 'react'

import tw from '@/helpers/lib/tailwind'

const loadingAnim = require('~/assets/lottie/Loading.json')

export default function LoadingScreen() {
  return <LottieView autoPlay style={tw`flex-1 background-default`} source={loadingAnim} />
}
