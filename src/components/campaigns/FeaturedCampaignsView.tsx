import { Image } from 'expo-image'
import React, { FC } from 'react'
import { Dimensions, Pressable, View } from 'react-native'
import Carousel from 'react-native-reanimated-carousel'

import { getSongTitle } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { MinCampaign } from '@/services/CampaignService'

import { PlayButton } from '../atoms/PlayButton'
import { Typography } from '../atoms/Typography'

type FeaturedProps = {
  data: MinCampaign[] | undefined
  title: string
}

const defaultBlurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

const FeaturedItem = ({ campaign }: { campaign: MinCampaign }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        tw.style(`flex-row items-center justify-between py-2 `),
        tw.style({
          'opacity-50': pressed
        })
      ]}
      onPress={() => {
        console.log('hello')
      }}
    >
      {({ pressed }) => (
        <View style={tw`flex-col justify-center gap-x-3 gap-y-2`}>
          <View style={tw`relative`}>
            <Image
              source={campaign.artwork_url}
              placeholder={defaultBlurhash}
              contentFit="fill"
              cachePolicy="memory"
              style={[tw.style(`h-40 w-40 rounded-sm`), tw.style({ 'opacity-50': pressed })]}
              alt={`Artwork for ${campaign.song_title} by ${campaign.artist_name}`}
            />
            <PlayButton metadata={{ audio_url: campaign.audio_url }} styles="absolute bottom-0 ml-1 mb-1" />
          </View>

          <View style={tw.style(`flex-col gap-y-0.5`)}>
            <View style={tw`flex-row gap-x-0.5`}>
              <Typography weight={500} style={tw`text-sm text-zinc-950 dark:text-zinc-100`}>
                {getSongTitle(campaign, 20)}
              </Typography>
            </View>

            <Typography weight={400} style={tw`text-sm text-zinc-600 dark:text-zinc-400`}>
              {campaign.artist_name}
            </Typography>
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
        renderItem={({ item }) => <FeaturedItem key={item.song_id} campaign={item} />}
      />
    </View>
  )
}
