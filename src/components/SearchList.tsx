import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { FC } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, SectionList, useColorScheme, View } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'

import { getRandomBlurhash } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { SearchResult } from '@/services/CampaignService'
import { MaterialIcons } from '@expo/vector-icons'

import { Typography } from './atoms/Typography'

type SearchListProps = {
  searchResults: SearchResult[] | undefined
}

type SearchListItemProps = {
  item: SearchResult & { title: string }
}

const titleMapping = new Map([
  ['song', 'Songs'],
  ['artist', 'Artists']
])

const SearchListItem: FC<SearchListItemProps> = ({ item }) => {
  const router = useRouter()
  const colorScheme = useColorScheme()
  return (
    <Pressable
      style={({ pressed }) => [
        tw.style(`flex-row items-center justify-between py-2`),
        tw.style({
          'opacity-50': pressed
        })
      ]}
      onPress={() => {
        if (item.type === 'artist') router.replace(`views/artist/${item.id}?url=discover`)
        else if (item.type === 'song') router.replace(`views/song/${item.id}?url=discover`)
      }}
    >
      {({ pressed }) => (
        <View style={tw`flex-row items-center gap-x-3`}>
          <Image
            source={item.image_url}
            placeholder={getRandomBlurhash()}
            contentFit="fill"
            transition={200}
            cachePolicy="disk"
            style={[tw.style(`w-12 h-12 rounded-sm`), tw.style({ 'opacity-50': pressed })]}
            alt="avatar image"
          />
          <View style={tw.style(`flex-col gap-y-0.5`, { 'self-start': item.type === 'song' })}>
            <View style={tw`flex-row gap-x-0.5`}>
              <Typography weight={500} style={tw`text-sm text-zinc-950 dark:text-zinc-100`}>
                {item.title}
              </Typography>
              {item.type === 'artist' && item.is_verified && (
                <MaterialIcons
                  name="verified"
                  style={tw`self-center`}
                  size={12}
                  color={colorScheme === 'dark' ? tw.color('text-primary-lighter') : tw.color('text-primary-main')}
                />
              )}
            </View>

            {item.type === 'song' && (
              <Typography weight={400} style={tw`text-sm text-zinc-700 dark:text-zinc-300`}>
                {item.artist_name}
              </Typography>
            )}
          </View>
        </View>
      )}
    </Pressable>
  )
}

const MAX_RESULTS_PER_SECTION = 3
export const SearchList: FC<SearchListProps> = ({ searchResults }) => {
  const getItemTitle = (item: SearchResult) => {
    switch (item.type) {
      case 'artist':
        return item.artist_name
      case 'song':
        return item.song_title
    }
  }

  const DATA = searchResults
    ? searchResults.reduce(
        (
          acc: {
            title: string
            data: {
              image_url: string
              title: string
              id: string
              artist_name: string
              song_title: string
              type: 'song' | 'artist'
              is_verified: boolean
            }[]
          }[],
          item
        ) => {
          // Find an existing group with the same title
          let group = acc.find((g) => g.title === titleMapping.get(item.type))

          // If it doesn't exist, create a new group
          if (!group) {
            group = { title: titleMapping.get(item.type) ?? '', data: [] }
            acc.push(group)
          }

          // Add the current item to the group's data array
          group.data.length < MAX_RESULTS_PER_SECTION &&
            group?.data.push({
              id: item.id,
              title: getItemTitle(item),
              image_url: item.image_url,
              artist_name: item.artist_name,
              song_title: item.song_title,
              is_verified: item.is_verified,
              type: item.type
            })

          return acc
        },
        []
      )
    : []

  return (
    <Animated.View
      entering={FadeInUp}
      style={tw`absolute z-50 flex self-center flex-1 w-full h-screen px-2 py-4 background-default top-11`}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SectionList
          sections={DATA}
          keyboardShouldPersistTaps="always"
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SearchListItem item={item} />}
          renderSectionHeader={({ section: { title } }) => (
            <Typography weight={600} style={tw`pb-1 mt-4 text-base`}>
              {title}
            </Typography>
          )}
        />
      </KeyboardAvoidingView>
    </Animated.View>
  )
}
