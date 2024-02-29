import { FC, useState } from 'react'
import { Pressable, PressableProps, View } from 'react-native'
import RootSiblingsManager from 'react-native-root-siblings'

import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'

import { Typography } from './Typography'

type ModalProps = PressableProps & {
  params: ModalParams
}

let currentShownModal: RootSiblingsManager | null = null

const Modal: FC<ModalProps> = ({ params: { title, message } }) => {
  const colorScheme = useColorScheme()
  return (
    <View
      style={[
        tw`absolute flex-col items-center max-w-xs rounded-md max-h-70 dark:bg-zinc-900`,
        { zIndex: 9999, alignSelf: 'center', top: '40%' }
      ]}
    >
      <View style={tw`w-full py-4 border-b border-zinc-500`}>
        <Typography weight={500} style={tw`text-lg text-center `}>
          {title}
        </Typography>
      </View>

      <View style={tw`px-4`}>
        <Typography weight={500} style={tw`py-2 text-lg text-center border-b border-zinc-500`}>
          {message}
        </Typography>
      </View>
    </View>
  )
}

type ModalButton = {
  text: string
  onPress?: () => void
  action: 'cancel' | 'confirm'
}

type ModalParams = {
  buttons: [ModalButton, ModalButton?]
  title?: string
  message?: string
}

export default function ShowModal(params: ModalParams) {
  if (currentShownModal) {
    console.log('destroying existing modal')
    currentShownModal.destroy()
  }
  console.log('showing modal')
  currentShownModal = new RootSiblingsManager(<Modal params={params} />)
}

export function HideModal() {
  if (currentShownModal) {
    currentShownModal.destroy()
  }
}
