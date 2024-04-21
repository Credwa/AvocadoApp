import { useRouter } from 'expo-router'
import { SectionList, View } from 'react-native'

import { ListItem } from '@/components/atoms/ListItem'
import { Typography } from '@/components/atoms/Typography'
import tw from '@/helpers/lib/tailwind'
import { supabase } from '@/helpers/supabase/supabase'

export default function PrivacyAndSecurity() {
  const router = useRouter()

  const DATA = [
    {
      title: 'Help',
      data: [
        {
          title: 'Delete Account',
          onPress: async () => {
            const {
              data: { user }
            } = await supabase.auth.getUser()
            router.push(
              `/webviews/delete-account?url=${encodeURIComponent(
                `http://192.168.1.23:3000/delete-account?email=${user?.email}`
              )}`
            )
          },
          icon: null
        }
      ]
    }
  ]

  return (
    <View style={tw`flex-1 py-10 gutter-md`}>
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item.title + index}
        renderItem={({ item, index, section }) => (
          <ListItem length={section.data.length} index={index} onPress={item.onPress}>
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
    </View>
  )
}
