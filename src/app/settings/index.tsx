import * as Application from 'expo-application'
import { useRouter } from 'expo-router'
import { Alert, SectionList, View } from 'react-native'

import { ListItem } from '@/components/atoms/ListItem'
import ShowModal, { HideModal } from '@/components/atoms/Modal'
import ShowToast from '@/components/atoms/Toast'
import { Typography } from '@/components/atoms/Typography'
import { useSession } from '@/context/authContext'
import { usePlayback } from '@/context/playbackContext'
import tw from '@/helpers/lib/tailwind'
import { useEmailEntryForm } from '@/hooks/useEmailEntry'
import { getCurrentUserProfile, updatePaypalAccount } from '@/services/UserService'
import { useAppStore } from '@/store'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export default function Settings() {
  const router = useRouter()
  const { signOut } = useSession() ?? {}
  const { stop, isPlaying } = usePlayback() ?? {}
  const { data: currentUser } = useQuery({ ...getCurrentUserProfile() })

  const tabBarHeight = useAppStore((state) => state.tabBarHeight)
  const playerMarginBottom = isPlaying ? `pb-[${tabBarHeight * 1.3}]` : ''
  const queryClient = useQueryClient()

  const iconStyle = tw`icon-neutral`
  const iconSize = 20

  const { mutateAsync: mutatePaypalAsync } = useMutation({
    mutationFn: async (token: string) => {
      return updatePaypalAccount(currentUser?.id as string, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user/me'] })
    },
    onError: (error) => {
      console.log(error)
    }
  })
  const { emailInput, emailError, handleSubmit } = useEmailEntryForm(
    mutatePaypalAsync,
    HideModal,
    currentUser?.paypal ?? ''
  )

  const handlePaypalOnboarding = () => {
    ShowModal({
      buttons: [
        {
          text: 'Okay',
          action: 'confirm',
          onPress: () => {
            handleSubmit()
            console.log(emailError)
          }
        },
        {
          text: 'Cancel',
          action: 'cancel',
          onPress: () => {
            HideModal()
          }
        }
      ],
      title: 'Update Paypal Account',
      body: emailInput
    })
  }

  const DATA = [
    {
      title: 'Account Settings',
      data: [
        {
          title: 'Notifications',
          onPress: () => router.push('/settings/notifications'),
          icon: <Ionicons name="notifications" style={iconStyle} size={iconSize} />
        },
        {
          title: 'Privacy & Security',
          onPress: () => router.push('/settings/privacy-security'),
          icon: <Ionicons name="lock-closed" style={iconStyle} size={iconSize} />
        },
        {
          title: 'Appearance',
          onPress: () => router.push('/settings/appearance'),
          icon: <Ionicons name="eye" style={iconStyle} size={iconSize} />
        },
        {
          title: 'Update Paypal Account',
          onPress: handlePaypalOnboarding,
          icon: <Ionicons name="mail-unread-sharp" style={iconStyle} size={iconSize} />
        },
        {
          title: 'Help',
          onPress: () => router.push('/settings/help'),
          icon: <Ionicons name="help-circle" style={iconStyle} size={iconSize} />
        }
      ]
    }
  ]

  const signOutActions = async () => {
    await stop()
    signOut && (await signOut())
  }

  const appSignOut = async () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel'
      },
      { text: 'Sign Out', onPress: signOutActions, style: 'destructive' }
    ])
  }

  return (
    <View style={tw`flex-1 py-10 gutter-md ${playerMarginBottom}`}>
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item.title + index}
        renderItem={({ item, index, section }) => (
          <ListItem length={section.data.length} index={index} onPress={item.onPress} icon={item.icon}>
            <Typography weight={500} style={tw`py-1 text-sm text-zinc-950 dark:text-zinc-100`}>
              {item.title}
            </Typography>
          </ListItem>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Typography weight={500} style={tw`pb-4 text-sm`}>
            {title}
          </Typography>
        )}
      />

      <ListItem
        length={1}
        index={0}
        onPress={appSignOut}
        icon={<Ionicons name="exit-outline" style={iconStyle} size={iconSize} />}
        showCaret={false}
      >
        <Typography weight={500} style={tw`py-1 text-sm text-red-600 dark:text-red-400`}>
          Sign Out
        </Typography>
      </ListItem>

      <Typography style={tw`pt-4 text-center text-neutral opacity-80`}>
        {Application.nativeApplicationVersion} ({Application.nativeBuildVersion})
      </Typography>
    </View>
  )
}
