// TODO Finish building the modal component

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

const Modal: FC<ModalProps> = ({ params: { title, message, buttons, body } }) => {
  const colorScheme = useColorScheme()
  return (
    <View
      style={[
        tw`absolute flex-col max-w-xs px-4 rounded-md max-h-70 dark:bg-zinc-900`,
        { zIndex: 9999, alignSelf: 'center', top: '20%' }
      ]}
    >
      <View style={tw`w-full py-4 `}>
        <Typography weight={500} style={tw`text-lg text-center `}>
          {title}
        </Typography>
      </View>

      <View style={tw`self-center px-4 mb-8 w-80`}>
        <Typography weight={500} style={tw`py-2 text-lg text-center `}>
          {message}
        </Typography>
        {Boolean(body) && body}
      </View>

      <View style={tw`flex-row justify-around border-t border-zinc-700`}>
        {buttons.map((button, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              tw.style(`px-4 py-3`),
              tw.style({
                'opacity-50': pressed
              })
            ]}
            onPress={() => {
              if (button?.onPress) {
                button?.onPress()
              }
            }}
          >
            {({ pressed }) => (
              <Typography
                weight={500}
                style={[
                  tw.style(`text-lg text-center text-secondary-lighter`),
                  tw.style({
                    'opacity-50': pressed,
                    'text-red-500': button?.action === 'cancel'
                  })
                ]}
              >
                {button?.text}
              </Typography>
            )}
          </Pressable>
        ))}
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
  body?: React.ReactNode
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
