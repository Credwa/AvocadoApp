import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import React, { FC } from 'react'
import { Dimensions, Pressable, View } from 'react-native'
import Carousel from 'react-native-reanimated-carousel'

import { getRandomBlurhash, truncate_string } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { ArtistActivity } from '@/services/ArtistService'

import { Typography } from '../atoms/Typography'

type ActivitiesProps = {
  artistActivities: ArtistActivity[]
}

const ActivitiesItem = ({ item }: { item: ArtistActivity }) => {
  const router = useRouter()

  const avatar = item.track_info?.avatar

  return (
    <Pressable
      style={({ pressed }) => [
        tw.style(`flex-row items-center justify-between py-2 `),
        tw.style({
          'opacity-50': pressed
        })
      ]}
      onPress={() => {
        if (item.activity_url) {
          router.push(item.activity_url)
        }
      }}
    >
      {({ pressed }) => (
        <View style={tw`flex-col justify-center gap-x-3 gap-y-2`}>
          <View style={tw`relative`}>
            <Image
              source={avatar}
              placeholder={getRandomBlurhash()}
              contentFit="fill"
              cachePolicy="disk"
              style={[tw.style(`h-40 w-40 rounded-sm`), tw.style({ 'opacity-50': pressed })]}
              alt={`Activity for ${item.activity_text}`}
            />
          </View>

          <View style={tw.style(`flex-col gap-y-0.5 pr-1`)}>
            <Typography weight={500} style={tw`text-sm  text-zinc-600 dark:text-zinc-400`}>
              {truncate_string(item.track_info?.title ?? '', 20)}
            </Typography>
            <View style={tw`flex-row gap-x-0.5`}>
              <Typography weight={500} style={tw`text-sm text-zinc-950 dark:text-zinc-100`}>
                {truncate_string(item.activity_text ?? '', 40)}
              </Typography>
            </View>

            <Typography weight={400} style={tw`text-sm text-zinc-600 dark:text-zinc-400`}>
              {item.source}
            </Typography>
          </View>
        </View>
      )}
    </Pressable>
  )
}

export const ActivitiesView: FC<ActivitiesProps> = ({ artistActivities }) => {
  const PAGE_WIDTH = Dimensions.get('window').width - 16
  if (!artistActivities || !artistActivities.length) return null

  return (
    <View style={tw``}>
      <Typography weight={500} style={tw`pb-2 text-lg `}>
        Recent Activities
      </Typography>
      <Carousel
        loop
        panGestureHandlerProps={{
          activeOffsetX: [-20, 20]
        }}
        width={PAGE_WIDTH / 2.3}
        style={tw`w-[${PAGE_WIDTH}]  justify-center h-70`}
        data={[...artistActivities]}
        renderItem={({ item }) => <ActivitiesItem key={item.activity_url + item.activity_date!} item={item} />}
      />
    </View>
  )
}
