import dayjs from 'dayjs'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import * as Linking from 'expo-linking'
import { router, useLocalSearchParams, usePathname } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, SafeAreaView, View } from 'react-native'
import branch from 'react-native-branch'
import { ScrollView } from 'react-native-gesture-handler'

import BackButton from '@/components/atoms/BackButton'
import { Button } from '@/components/atoms/Button'
import { PlayButton } from '@/components/atoms/PlayButton'
import ShareButton from '@/components/atoms/ShareButton'
import { Typography } from '@/components/atoms/Typography'
import LoadingScreen from '@/components/LoadingScreen'
import { usePlayback } from '@/context/playbackContext'
import { AndroidSafeAreaPaddingTop } from '@/helpers/lib/constants'
import {
  getCampaignDaysLeft,
  getRandomBlurhash,
  getSongTitle,
  isCampaignComingSoon,
  isCampaignFinished
} from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { getCampaignById } from '@/services/CampaignService'
import { useAppStore } from '@/store'
import { MaterialIcons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'

const Song = () => {
  const colorScheme = useColorScheme()
  const [descOpen, setDescOpen] = useState(false)
  const [campaignState, setCampaignState] = useState<'coming' | 'ongoing' | 'released'>('ongoing')
  const { viewVisible } = usePlayback()
  const tabBarHeight = useAppStore((state) => state.tabBarHeight)

  const { songId, url } = useLocalSearchParams<{ songId: string; url?: string }>()
  if (!songId) {
    router.back()
  }
  const { data: songData, isLoading: isSongLoading } = useQuery({
    ...getCampaignById(songId!)
  })

  useEffect(() => {
    if (!isSongLoading) {
      const isComingSoon = isCampaignComingSoon(songData?.campaign_details?.campaign_start_date)
      const isFinished = isCampaignFinished(
        songData?.campaign_details?.campaign_start_date,
        songData?.campaign_details?.time_restraint
      )
      if (isComingSoon) {
        setCampaignState('coming')
      } else if (isFinished) {
        setCampaignState('released')
      } else {
        setCampaignState('ongoing')
      }
    }
  }, [songData])

  if (isSongLoading) return <LoadingScreen />

  const metaData = {
    song_id: songData!.id,
    audio_url: songData!.audio_url,
    title: getSongTitle(songData!, 20),
    artist: songData!.artists.artist_name,
    duration: songData!.duration,
    artwork_url: songData!.artwork_url
  }

  const gradient =
    colorScheme === 'dark'
      ? ['#333340', '#1d1d24', '#1d1d24', '#0b0b0e', '#0b0b0e', '#0d0d10', '#0e0e11']
      : ['#d1d5db', '#e5e7eb', '#f4f4f5', '#fafafa', '#fafafa', '#fafafa', '#fafafa']

  const daysLeft = getCampaignDaysLeft(
    songData?.campaign_details?.campaign_start_date as string,
    songData?.campaign_details?.time_restraint
  )

  return (
    <LinearGradient colors={gradient.map((color) => (color ? color : 'transparent'))} style={tw`flex-1 gutter-sm`}>
      <SafeAreaView style={tw.style(`flex flex-1`, AndroidSafeAreaPaddingTop)}>
        <View style={tw`flex-row items-center justify-between mt-4`}>
          <BackButton href={url} />
          {/* <ShareButton
            title={`Buy ${songData?.song_title} by ${songData?.artists.artist_name}`}
            id={`song/${songId}`}
            contentDescription={`Check out this song by ${songData?.artists.artist_name} on ${songData?.song_title}!`}
          /> */}
        </View>
        <ScrollView contentContainerStyle={tw`items-center`} style={tw`flex-col flex-1 gap-y-12 gutter-md`}>
          <View style={tw`items-center w-full gap-y-8`}>
            <Image
              source={songData?.artwork_url}
              placeholder={getRandomBlurhash()}
              contentFit="fill"
              cachePolicy="disk"
              style={[tw.style(`h-70 w-70 rounded-sm`)]}
              alt={`Artwork for ${songData?.song_title} by ${songData?.artists.artist_name}`}
            />
            <View style={tw`flex-row items-center self-center justify-between w-full`}>
              <View style={tw`flex-row gap-x-2`}>
                <View>
                  <View style={tw`flex-row max-w-70`}>
                    <Typography weight={600} style={tw`text-xl`}>
                      {getSongTitle(songData!, 40)}
                    </Typography>
                  </View>

                  <Pressable
                    onPress={() =>
                      router.navigate(`views/artist/${songData?.artists.id}?url=views/song/${songData?.id}`)
                    }
                  >
                    {({ pressed }) => (
                      <View style={tw`flex-row items-center gap-x-2`}>
                        <Image
                          source={songData?.artists.avatar_url}
                          placeholder={getRandomBlurhash()}
                          contentFit="fill"
                          cachePolicy="disk"
                          style={[tw.style(`h-5 w-5 rounded-full`, { 'opacity-50': pressed })]}
                          alt={`Profile picture for ${songData?.artists.artist_name}`}
                        />
                        <Typography style={tw.style({ 'opacity-50': pressed })} weight={500}>
                          {songData?.artists.artist_name}
                        </Typography>
                      </View>
                    )}
                  </Pressable>
                  {songData?.artist_features && songData.artist_features.length > 0 && (
                    <>
                      <Typography style={tw`pt-1 text-sm`} weight={500}>
                        + {songData.artist_features.map((artist) => artist).join(', ')}
                      </Typography>
                    </>
                  )}
                </View>
              </View>
              <View style={tw`justify-end`}>
                <PlayButton styles="h-12 w-12" metadata={metaData} />
              </View>
            </View>
          </View>

          <View style={tw`w-screen pt-8 border-b dark:border-zinc-700 border-zinc-200`} />
          <View style={tw`flex-row justify-between w-full`}>
            <View style={tw`flex-col self-start pt-4`}>
              <Typography weight={500} style={tw`text-lg`}>
                {campaignState === 'released' ? 'Suggested Donation' : 'Price'}
              </Typography>
              <Typography style={tw`text-2xl`} weight={600}>
                {songData?.campaign_details?.price_per_share.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
              </Typography>
            </View>
            <View style={tw`flex-col self-center pt-4`}>
              {campaignState === 'ongoing' && (
                <Typography
                  style={tw.style('text-base text-secondary-main dark:text-secondary-lighter', {
                    'dark:text-red-400 text-red-600': daysLeft < 5
                  })}
                >
                  {daysLeft} days left
                </Typography>
              )}
              {campaignState === 'coming' && (
                <View style={tw`flex-col`}>
                  <Typography style={tw.style('text-base self-center ')}>Coming Soon</Typography>
                  <Typography style={tw.style('text-base self-center text-primary-dark dark:text-primary-lighter')}>
                    {dayjs(songData?.campaign_details?.campaign_start_date).format('MMMM D, YYYY')}
                  </Typography>
                </View>
              )}
              {campaignState === 'released' && (
                <View style={tw`flex-col`}>
                  <Typography style={tw.style('text-base self-center text-fuchsia-500 dark:text-fuchsia-400')}>
                    Released
                  </Typography>
                </View>
              )}
            </View>
          </View>

          <View style={tw`w-screen pt-8 border-0 dark:border-zinc-700 border-zinc-400`} />
          <View style={tw`flex-col self-start pt-4`}>
            <Typography weight={500} style={tw`text-xl`}>
              About
            </Typography>
            <Typography style={tw`text-base`} weight={400}>
              {descOpen ? songData?.song_description : songData?.song_description.slice(0, 150) + '...'}
            </Typography>

            <Pressable style={tw`py-2`} onPress={() => setDescOpen((prev) => !prev)}>
              <Typography weight={500} style={tw`text-base dark:text-primary-lighter text-primary-main`}>
                {descOpen ? 'Show less' : 'Show more'}
              </Typography>
            </Pressable>
          </View>

          <Pressable
            style={tw.style(`self-start justify-end mb-36 mt-20`, viewVisible && 'mb-36')}
            onPress={() => router.navigate(`views/artist/${songData?.artists.id}?url=views/song/${songId}`)}
          >
            {({ pressed }) => (
              <View style={tw.style(`flex-row items-center gap-x-3`, { 'opacity-50': pressed })}>
                <Image
                  source={songData?.artists.avatar_url}
                  placeholder={getRandomBlurhash()}
                  contentFit="fill"
                  cachePolicy="disk"
                  style={[tw.style(`h-12 w-12 rounded-full`)]}
                  alt={`Profile picture for ${songData?.artists.artist_name}`}
                />
                <Typography weight={500} style={tw.style(`text-lg`, { 'opacity-50': pressed })}>
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
        </ScrollView>

        {/* Purchase button */}
        <View
          style={tw.style(
            `absolute left-0 right-0 z-50 flex items-center bottom-16 gutter-md`,
            viewVisible && `bottom-[${tabBarHeight * 1.3}px]`
          )}
        >
          {campaignState === 'ongoing' && (
            <Button
              onPress={() => router.navigate(`views/song/${songId}/purchase`)}
              styles="w-full rounded-md"
              textStyles="text-white"
              variant="secondary"
            >
              Purchase
            </Button>
          )}

          {campaignState === 'released' && (
            <Button
              onPress={() => router.navigate(`views/song/${songId}/purchaseReleased`)}
              styles="w-full rounded-md"
              textStyles="text-white"
              variant="primary"
            >
              Donate
            </Button>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

export default Song
