import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import React, { FC } from 'react'
import { Dimensions, Pressable, View } from 'react-native'
import Carousel from 'react-native-reanimated-carousel'

import { getRandomBlurhash, getSongTitle } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { Artist } from '@/services/ArtistService'
import { MinCampaign } from '@/services/CampaignService'

import { PlayButton } from '../atoms/PlayButton'
import { Typography } from '../atoms/Typography'

type FeaturedProps = {
  data: MinCampaign[] | Artist[] | undefined
  title: string
}

function isCampaign(data: MinCampaign | Artist): data is MinCampaign {
  return (data as MinCampaign).song_id !== undefined
}

const FeaturedItem = ({ item }: { item: MinCampaign | Artist }) => {
  const router = useRouter()

  const newItem = {
    id: isCampaign(item) ? item.song_id : item.id,
    image_url: isCampaign(item) ? item.artwork_url : item.avatar_url,
    title: isCampaign(item) ? getSongTitle(item, 20) : item.artist_name,
    audio_url: isCampaign(item) ? item.audio_url : undefined
  }

  return (
    <Pressable
      style={({ pressed }) => [
        tw.style(`flex-row items-center justify-between py-2 `),
        tw.style({
          'opacity-50': pressed
        })
      ]}
      onPress={() => {
        if (isCampaign(item)) {
          router.push(`views/song/${item.song_id}?url=search`)
        } else {
          router.push(`views/artist/${item.id}?url=search`)
        }
      }}
    >
      {({ pressed }) => (
        <View style={tw`flex-col justify-center gap-x-3 gap-y-2`}>
          <View style={tw`relative`}>
            <Image
              source={newItem.image_url}
              placeholder={getRandomBlurhash()}
              contentFit="fill"
              cachePolicy="memory"
              style={[tw.style(`h-40 w-40 rounded-sm`), tw.style({ 'opacity-50': pressed })]}
              alt={`Artwork for ${newItem.title} by ${item.artist_name}`}
            />
            {isCampaign(item) && (
              <PlayButton
                metadata={{
                  song_id: item.song_id,
                  audio_url: item.audio_url,
                  title: getSongTitle(item, 20),
                  artist: item.artist_name,
                  duration: item.duration,
                  artwork_url: item.artwork_url
                }}
                styles="absolute bottom-0 ml-1 mb-1"
              />
            )}
          </View>

          <View style={tw.style(`flex-col gap-y-0.5`)}>
            <View style={tw`flex-row gap-x-0.5`}>
              <Typography weight={500} style={tw`text-sm text-zinc-950 dark:text-zinc-100`}>
                {newItem.title}
              </Typography>
            </View>

            {isCampaign(item) && (
              <Typography weight={400} style={tw`text-sm text-zinc-600 dark:text-zinc-400`}>
                {item.artist_name}
              </Typography>
            )}
          </View>
        </View>
      )}
    </Pressable>
  )
}

export const FeaturedView: FC<FeaturedProps> = ({ data, title }) => {
  const PAGE_WIDTH = Dimensions.get('window').width - 16
  if (!data) return null

  return (
    <View style={tw`z-0`}>
      <Typography weight={500} style={tw`pb-2 text-lg dark:text-zinc-300 text-zinc-700`}>
        {title}
      </Typography>
      <Carousel
        loop={false}
        panGestureHandlerProps={{
          activeOffsetX: [-20, 20]
        }}
        width={PAGE_WIDTH / 2.3}
        style={tw`w-[${PAGE_WIDTH}] content-center items-center h-60`}
        data={[...data]}
        renderItem={({ item }) => <FeaturedItem key={isCampaign(item) ? item.song_id : item.id} item={item} />}
      />
    </View>
  )
}
