import { useRouter } from 'expo-router'
import { SectionList, View } from 'react-native'

import { ListItem } from '@/components/atoms/ListItem'
import { Typography } from '@/components/atoms/Typography'
import tw from '@/helpers/lib/tailwind'

export default function PrivacyAndSecurity() {
  const router = useRouter()
  const DATA = [
    {
      title: 'Account Settings',
      data: [
        {
          title: 'Privacy Policy',
          onPress: () => router.push('/webviews/privacy-policy?url=https://myavocado.app/privacy-policy'),
          icon: null
        },
        {
          title: 'Terms Of Use',
          onPress: () => router.push('/webviews/terms-of-use?url=https://myavocado.app/terms-of-use'),
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
