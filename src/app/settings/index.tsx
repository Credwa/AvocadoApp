import { useRouter } from 'expo-router'
import { FC } from 'react'
import { Alert, Pressable, SectionList, View } from 'react-native'

import { Typography } from '@/components/atoms/Typography'
import { useSession } from '@/context/authContext'
import tw from '@/helpers/lib/tailwind'
import { Ionicons } from '@expo/vector-icons'

type ListItemProps = {
  onPress?: () => void
  children: any
  icon: JSX.Element
  index: number
  length: number
  showCaret?: boolean
}

const ListItem: FC<ListItemProps> = ({ icon, onPress, children, index, length, showCaret = true }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        tw.style(`w-full px-4 bg-white dark:bg-zinc-800`),
        tw.style({
          'bg-zinc-300 dark:bg-zinc-700': pressed,
          'rounded-t-md': index === 0 && length > 1,
          'rounded-b-md': index === length - 1 && length > 1,
          'rounded-md': length === 1
        })
      ]}
    >
      <View
        style={tw.style(`flex-row justify-between py-3 items-center`, {
          'border-b-0': index === length - 1 && length > 0
        })}
      >
        <View style={tw`flex-row items-center gap-x-4`}>
          {icon}
          {children}
        </View>

        {showCaret && <Ionicons style={tw`items-end pt-1 icon-neutral`} name="chevron-forward" size={16} />}
      </View>
    </Pressable>
  )
}

export default function Settings() {
  const router = useRouter()
  const { signOut } = useSession() ?? {}

  const iconStyle = tw`mt-1 icon-neutral`
  const iconSize = 20
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
        }
      ]
    }
  ]

  const appSignOut = async () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel'
      },
      { text: 'Sign Out', onPress: async () => signOut && (await signOut()), style: 'destructive' }
    ])
  }

  return (
    <View style={tw`flex-1 py-10 gutter-md`}>
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item.title + index}
        renderItem={({ item, index, section }) => (
          <ListItem length={section.data.length} index={index} onPress={item.onPress} icon={item.icon}>
            <Typography weight={500} style={tw`text-sm shadow-md text-zinc-950 dark:text-zinc-100 shadow-offset-1`}>
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
        <Typography weight={500} style={tw`text-sm text-red-600 shadow-md dark:text-red-400 shadow-offset-1`}>
          Sign Out
        </Typography>
      </ListItem>
    </View>
  )
}
