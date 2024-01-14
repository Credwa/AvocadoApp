import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Pressable, SafeAreaView, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import BackButton from '@/components/atoms/BackButton'
import { Button } from '@/components/atoms/Button'
import { PlayButton } from '@/components/atoms/PlayButton'
import ShareButton from '@/components/atoms/ShareButton'
import { Typography } from '@/components/atoms/Typography'
import { usePlayback } from '@/context/playbackContext'
import { getCampaignDaysLeft, getRandomBlurhash, getSongTitle } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { getCampaignById, getPurchaseHistoryForSong } from '@/services/CampaignService'
import { useAppStore } from '@/store'
import { MaterialIcons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'

const PurchaseHistory = () => {
  const colorScheme = useColorScheme()
  const tabBarHeight = useAppStore((state) => state.tabBarHeight)

  const userId = useAppStore((state) => state.user_id)
  const { songId } = useLocalSearchParams<{ songId: string; url?: string }>()
  if (!songId) {
    router.back()
  }
  const { data: songData } = useQuery({
    ...getCampaignById(songId!)
  })

  dayjs.extend(localizedFormat)

  const { data: purchaseData } = useQuery({
    ...getPurchaseHistoryForSong(songId!, userId)
  })
  return (
    <ScrollView style={tw`flex-1 py-8 background-default gutter-md`}>
      <SafeAreaView style={tw`mb-[${tabBarHeight * 1.5}px]`}>
        <Typography weight={500} style={tw`text-2xl`}>
          {getSongTitle(songData!, 20)}
        </Typography>
        <Pressable
          style={tw.style(`self-start justify-end mb-12 mt-8`)}
          onPress={() => router.push(`views/artist/${songData?.artists.id}`)}
        >
          {({ pressed }) => (
            <View style={tw.style(`flex-row items-center gap-x-3`, { 'opacity-50': pressed })}>
              <Image
                source={songData?.artists.avatar_url}
                placeholder={getRandomBlurhash()}
                contentFit="fill"
                cachePolicy="memory"
                style={[tw.style(`h-12 w-12 rounded-full`)]}
                alt={`Profile picture for ${songData?.artists.artist_name}`}
              />
              <Typography weight={500} style={tw`text-lg`}>
                {songData?.artists.artist_name}
              </Typography>
              <MaterialIcons
                name="verified"
                style={tw`self-center`}
                size={17}
                color={colorScheme === 'dark' ? tw.color('text-primary-lighter') : tw.color('text-primary-main')}
              />
            </View>
          )}
        </Pressable>
        <View style={tw`w-full mb-4 border-b dark:border-zinc-700 border-zinc-300`} />
        <Typography weight={500} style={tw`text-xl`}>
          History
        </Typography>
        {purchaseData?.map((purchase, index) => (
          <View style={tw`flex-row items-center justify-between py-4`} key={index}>
            <View style={tw`flex-row items-center`}>
              <View>
                <Typography weight={500} style={tw`text-base`}>
                  Purchase
                </Typography>
                <Typography style={tw`text-sm text-gray-400`}>{dayjs(purchase.created_at).format('lll')}</Typography>
              </View>
            </View>
            <View style={tw`flex-col items-center`}>
              <Typography weight={400} style={tw`self-end text-base`}>
                {purchase.shares} {purchase.shares === 1 ? 'share' : 'shares'}
              </Typography>
              <View style={tw`ml-4`}>
                <Typography weight={300} style={tw`self-end text-base text-secondary-dark dark:text-secondary-main `}>
                  {(purchase.shares * (songData?.campaign_details?.price_per_share ?? 0)).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </Typography>
              </View>
            </View>
          </View>
        ))}
      </SafeAreaView>
    </ScrollView>
  )
}

export default PurchaseHistory
