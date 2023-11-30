import { router } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import { useSession } from '@/context/authContext'
import tw from '@/helpers/lib/tailwind'
import { send_event } from '@/helpers/metrics.service'

const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true'

const Root = () => {
  const { signOut } = useSession() ?? {}

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Pressable style={tw`pb-12`} onPress={() => send_event('mobile_app_test_event')}>
        <Text>Hello</Text>
      </Pressable>

      <Text
        style={tw`text-black dark:text-white`}
        onPress={async () => {
          signOut && (await signOut())
          router.replace('/sign-in')
        }}
      >
        Sign Out
      </Text>
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
