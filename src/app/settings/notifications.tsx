import * as PushNotifications from 'expo-notifications'
import { useEffect, useState } from 'react'
import { Alert, Linking, Switch, useColorScheme, View } from 'react-native'

import { ListItem } from '@/components/atoms/ListItem'
import { Typography } from '@/components/atoms/Typography'
import tw from '@/helpers/lib/tailwind'
import { getCurrentUserProfile, NotificationPreferences, updateNotificationPreferences } from '@/services/UserService'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const Notifications = () => {
  const [isEnabled, setIsEnabled] = useState(false)
  const colorScheme = useColorScheme()
  const queryClient = useQueryClient()

  const { data: currentUser } = useQuery({ ...getCurrentUserProfile() })

  const checkNotificationStatus = async () => {
    const { status: existingStatus } = await PushNotifications.getPermissionsAsync()
    if (existingStatus === 'granted' && currentUser?.notification_preferences?.notifications_enabled) {
      setIsEnabled(true)
    } else {
      setIsEnabled(false)
    }
  }

  const { mutateAsync } = useMutation({
    mutationFn: async (data: NotificationPreferences) => {
      return updateNotificationPreferences(currentUser?.id as string, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user/me'] })
    },
    onError: (error) => {
      console.log(error)
    }
  })

  useEffect(() => {
    checkNotificationStatus()
  }, [])

  const toggleSwitch = async () => {
    if (!isEnabled) {
      const { status: existingStatus } = await PushNotifications.getPermissionsAsync()
      if (existingStatus === 'granted') {
        mutateAsync({ notifications_enabled: true })
        setIsEnabled(true)
      } else {
        Alert.alert('Notifications Enabled', 'Enabled them in your settings to allow notifications.', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'destructive'
          },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ])
      }
    } else {
      mutateAsync({ notifications_enabled: false })
      setIsEnabled(false)
    }
  }
  return (
    <View style={tw`flex-1 py-10 gutter-md`}>
      <ListItem
        length={1}
        index={0}
        styles="w-full"
        onPress={() => {}}
        icon={<Ionicons name="notifications" style={tw`icon-neutral`} size={20} />}
        showCaret={false}
      >
        <Typography weight={500} style={tw`py-1 text-sm text-zinc-950 dark:text-zinc-100`}>
          Enable Notifications
        </Typography>

        <Switch
          style={tw`ml-auto`}
          trackColor={{
            false: tw.color('text-zinc-100'),
            true: colorScheme === 'dark' ? tw.color('text-primary-light') : tw.color('text-primary-main')
          }}
          thumbColor={tw.color('text-zinc-100')}
          ios_backgroundColor={tw.color('text-zinc-700')}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </ListItem>
    </View>
  )
}

export default Notifications
