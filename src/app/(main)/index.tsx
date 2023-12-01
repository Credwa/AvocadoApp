import { router } from 'expo-router'
import { View } from 'react-native'

import { Typography } from '@/components/atoms/Typography'
import { useSession } from '@/context/authContext'
import tw from '@/helpers/lib/tailwind'

const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true'

const Root = () => {
  const { signOut } = useSession() ?? {}

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Typography
        style={tw`text-black dark:text-white`}
        onPress={async () => {
          signOut && (await signOut())
          router.replace('/sign-in')
        }}
      >
        Sign Out
      </Typography>
    </View>
  )
}

let EntryPoint = Root

if (storybookEnabled) {
  const StorybookUI = require('../../../.storybook').default
  EntryPoint = () => {
    return (
      <View style={{ flex: 1 }}>
        <StorybookUI />
      </View>
    )
  }
}

export default EntryPoint
