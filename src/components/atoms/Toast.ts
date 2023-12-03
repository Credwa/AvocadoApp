import { Appearance, Dimensions, Keyboard } from 'react-native'
import * as DefaultToast from 'react-native-root-toast'

import tw from '@/helpers/lib/tailwind'

type ToastDuration = typeof DefaultToast.default.durations.LONG | typeof DefaultToast.default.durations.SHORT

type ToastPositions =
  | typeof DefaultToast.default.positions.BOTTOM
  | typeof DefaultToast.default.positions.TOP
  | typeof DefaultToast.default.positions.CENTER

export type ToastParams = {
  duration: ToastDuration
  position: ToastPositions
  shadow: boolean
  delay: number
  opacity: number
}

export default function ShowToast(message: string = '', params?: ToastParams) {
  const colorScheme = Appearance.getColorScheme()
  const toastWidth = Dimensions.get('window').width - 32
  Keyboard.dismiss()
  const toast = DefaultToast.default.show(message, {
    duration: params?.duration ?? DefaultToast.default.durations.LONG,
    position: params?.position ?? DefaultToast.default.positions.BOTTOM,
    shadow: params?.shadow ?? false,
    animation: true,
    keyboardAvoiding: true,
    hideOnPress: false,
    containerStyle: tw`w-[${toastWidth}px] py-3.5 rounded-xl shadow-lg gutter-sm`,
    backgroundColor: colorScheme === 'dark' ? tw.color('bg-slate-700') : tw.color('bg-zinc-50'),
    textColor: colorScheme === 'dark' ? tw.color('text-zinc-50') : tw.color('text-slate-700'),
    opacity: params?.opacity ?? 1,
    textStyle: {
      fontFamily: 'REM'
    },
    delay: params?.delay ?? 0,
    onShow: () => {
      // calls on toast\`s appear animation start
    },
    onShown: () => {
      // calls on toast\`s appear animation end.
    },
    onHide: () => {
      // calls on toast\`s hide animation start.
    },
    onHidden: () => {
      // calls on toast\`s hide animation end.
    }
  })

  return toast
}
