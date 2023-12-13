import { router } from 'expo-router'
import { View } from 'react-native'

import { Pill } from '@/components/atoms/Pill'
import { Typography } from '@/components/atoms/Typography'
import { useSession } from '@/context/authContext'
import tw from '@/helpers/lib/tailwind'

const Explore = () => {
  const { signOut } = useSession() ?? {}

  return (
    <View style={tw`flex items-center justify-center flex-1 gap-y-8 dark:bg-zinc-950 bg-zinc-50`}>
      <Pill>Hello i am a pill</Pill>
      <Typography
        style={tw`text-black dark:text-white`}
        onPress={async () => {
          router.replace('/genre_preferences')
        }}
      >
        To Genres
      </Typography>
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

export default Explore
