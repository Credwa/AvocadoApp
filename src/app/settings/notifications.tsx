import { router } from 'expo-router'
import { View } from 'react-native'

import { Pill } from '@/components/atoms/Pill'
import { Typography } from '@/components/atoms/Typography'
import LoadingScreen from '@/components/LoadingScreen'
import { useSession } from '@/context/authContext'
import tw from '@/helpers/lib/tailwind'

const Notifications = () => {
  const { signOut } = useSession() ?? {}

  return <LoadingScreen />
}

export default Notifications
