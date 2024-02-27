import { useRouter } from 'expo-router'
import { Appearance as AppAppearance, useColorScheme as useNativeColorScheme, View } from 'react-native'
import { useAppColorScheme } from 'twrnc'

import { RadioButton } from '@/components/atoms/RadioButton'
import tw from '@/helpers/lib/tailwind'
import { useAppStore } from '@/store'

const Appearance = () => {
  const appearance = useAppStore((state) => state.appearance)
  const setAppearance = useAppStore((state) => state.setAppearance)
  const setColorScheme = useAppColorScheme(tw)[2]
  const nativeColorScheme = useNativeColorScheme()
  const router = useRouter()

  const buttonChange = (val: 'light' | 'dark' | 'automatic') => {
    setAppearance(val)
    setColorScheme(val === 'automatic' ? nativeColorScheme : val)
    AppAppearance.setColorScheme(val === 'automatic' ? undefined : val)
    if (val === 'automatic') {
      router.back()
    }
  }

  return (
    <>
      <View style={tw`flex-1 px-4 py-10 gutter-sm`}>
        <RadioButton.Group styles="w-full" onValueChange={buttonChange as (value: string) => void} value={appearance}>
          <RadioButton
            styles={`w-full justify-between flex-row-reverse bg-white dark:bg-zinc-800 py-3 px-4 rounded-t-md ${
              appearance === 'automatic' ? 'bg-zinc-50 dark:bg-zinc-700' : ''
            }`}
            label="Automatic"
            value="automatic"
          />
          <RadioButton
            styles={`w-full justify-between flex-row-reverse bg-white dark:bg-zinc-800 py-3 px-4 ${
              appearance === 'light' ? 'bg-zinc-50 dark:bg-zinc-700' : ''
            }`}
            label="Light"
            value="light"
          />
          <RadioButton
            styles={`w-full justify-between flex-row-reverse bg-white dark:bg-zinc-800 py-3 px-4 rounded-b-md ${
              appearance === 'dark' ? 'bg-zinc-50 dark:bg-zinc-700' : ''
            }`}
            label="Dark"
            value="dark"
          />
        </RadioButton.Group>
      </View>
    </>
  )
}

export default Appearance
