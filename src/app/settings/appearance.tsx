import { Appearance as AppAppearance, View } from 'react-native'

import { RadioButton } from '@/components/atoms/RadioButton'
import tw from '@/helpers/lib/tailwind'
import { useAppStore } from '@/store'

const Appearance = () => {
  const appearance = useAppStore((state) => state.appearance)
  const setAppearance = useAppStore((state) => state.setAppearance)

  const buttonChange = (val: 'light' | 'dark' | 'automatic') => {
    setAppearance(val)
    AppAppearance.setColorScheme(val === 'automatic' ? null : val)
  }

  return (
    <>
      {appearance && (
        <View style={tw`flex-1 py-10 gutter-lg`}>
          <RadioButton.Group onValueChange={buttonChange as (value: string) => void} value={appearance}>
            <RadioButton label="Automatic" value="automatic" />
            <RadioButton label="Light" value="light" />
            <RadioButton label="Dark" value="dark" />
          </RadioButton.Group>
        </View>
      )}
    </>
  )
}

export default Appearance
