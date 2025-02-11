import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import React, { FC } from 'react'
import { Dimensions, Platform, Pressable, View } from 'react-native'
import Carousel from 'react-native-reanimated-carousel'

import { getRandomBlurhash, getSongTitle } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { MinCampaign } from '@/services/CampaignService'

import { Typography } from '../atoms/Typography'

type RecentCampaignProps = {
  data: MinCampaign[] | undefined
}

const RecentCampaignList = ({ campaigns }: { campaigns: MinCampaign[] }) => {
  if (campaigns.length > 6) throw new Error('Only 6 campaigns per view is allowed')

  return (
    <View style={tw`flex flex-row justify-between`}>
      <View style={tw`flex flex-col w-1/2 gap-y-2`}>
        {campaigns.slice(0, 3).map((campaign, index) => (
          <RecentCampaignItem key={campaign.song_id + index} campaign={campaign} />
        ))}
      </View>
      <View style={tw`flex flex-col w-1/2 gap-y-2`}>
        {campaigns.slice(3, 6).map((campaign, index) => (
          <RecentCampaignItem key={campaign.song_id + index} campaign={campaign} />
        ))}
      </View>
    </View>
  )
}

const RecentCampaignItem = ({ campaign }: { campaign: MinCampaign }) => {
  const router = useRouter()
  return (
    <Pressable
      style={({ pressed }) => [
        tw.style(`flex-row items-center justify-between py-2`),
        tw.style({
          'opacity-50': pressed
        })
      ]}
      onPress={() => {
        router.push(`views/song/${campaign.song_id}?url=discover`)
      }}
    >
      {({ pressed }) => (
        <View style={tw`flex-row items-center gap-x-3`}>
          <Image
            source={campaign.artwork_url}
            placeholder={getRandomBlurhash()}
            contentFit="fill"
            transition={1500}
            cachePolicy="disk"
            style={[tw.style(`w-12 h-12 rounded-sm`), tw.style({ 'opacity-50': pressed })]}
            alt={`Artwork for ${campaign.song_title} by ${campaign.artist_name}`}
          />
          <View style={tw.style(`flex-col gap-y-0.5`)}>
            <View style={tw`flex-row gap-x-0.5`}>
              <Typography
                weight={500}
                style={tw`${Platform.OS === 'android' ? 'text-xs' : 'text-sm'} text-zinc-950 dark:text-zinc-100`}
              >
                {getSongTitle(campaign, 15)}
              </Typography>
            </View>

            <Typography
              weight={400}
              style={tw`${Platform.OS === 'android' ? 'text-xs' : 'text-sm'} text-zinc-600 dark:text-zinc-400`}
            >
              {campaign.artist_name}
            </Typography>
          </View>
        </View>
      )}
    </Pressable>
  )
}

function splitArrayIntoChunks(array: MinCampaign[], chunkSize: number) {
  const result = []

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize)
    result.push(chunk)
  }

  return result
}

export const RecentCampaignView: FC<RecentCampaignProps> = ({ data }) => {
  const width = Dimensions.get('window').width - 16
  if (!data || !data.length) return null
  const newData = splitArrayIntoChunks(data, 6)

  return (
    <View style={tw`z-0 mb-4`}>
      <Typography weight={500} style={tw`pb-2 text-xl dark:text-zinc-300 text-zinc-700`}>
        New Releases
      </Typography>
      <Carousel
        loop={data.length > 6}
        autoPlay={data.length > 6}
        // onConfigurePanGesture={(gestureChain) => gestureChain.activeOffsetX([-10, 10]) as any}
        // onConfigurePan
        panGestureHandlerProps={{
          activeOffsetX: [-20, 20]
        }}
        windowSize={3}
        style={tw`z-10 h-60`}
        width={width}
        data={newData}
        autoPlayInterval={5000}
        scrollAnimationDuration={2500}
        renderItem={({ item, index }) => <RecentCampaignList campaigns={item} />}
      />
    </View>
  )
}
