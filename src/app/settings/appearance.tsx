import { Appearance as AppAppearance, View } from 'react-native'
import { useAppColorScheme } from 'twrnc'

import { RadioButton } from '@/components/atoms/RadioButton'
import { Typography } from '@/components/atoms/Typography'
import tw from '@/helpers/lib/tailwind'
import { useAppStore } from '@/store'

const Appearance = () => {
  const appearance = useAppStore((state) => state.appearance)
  const setAppearance = useAppStore((state) => state.setAppearance)
  const setColorScheme = useAppColorScheme(tw)[2]

  const buttonChange = (val: 'light' | 'dark' | 'automatic') => {
    const sch = AppAppearance.getColorScheme() as 'light' | 'dark'
    setAppearance(val)
    setColorScheme(val === 'automatic' ? sch : val)
    AppAppearance.setColorScheme(val === 'automatic' ? sch : val)
  }

  return (
    <>
      {appearance && (
        <View style={tw`flex-1 px-4 py-10 gutter-sm`}>
          <RadioButton.Group styles="w-full" onValueChange={buttonChange as (value: string) => void} value={appearance}>
            <RadioButton
              styles={`w-full justify-between flex-row-reverse  bg-white dark:bg-zinc-800 py-3 px-4 rounded-t-md ${
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

          {appearance === 'automatic' && (
            <Typography style={tw`mt-2 text-center`}>Restart app to change to system default color</Typography>
          )}
        </View>
      )}
    </>
  )
}

export default Appearance
