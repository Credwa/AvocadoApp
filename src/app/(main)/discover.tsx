import { Image } from 'expo-image'
import { router, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { Dimensions, Pressable, SafeAreaView, View } from 'react-native'
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler'
import Animated, { useSharedValue } from 'react-native-reanimated'
import Carousel from 'react-native-reanimated-carousel'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Pill } from '@/components/atoms/Pill'
import { PlayButton } from '@/components/atoms/PlayButton'
import { Typography } from '@/components/atoms/Typography'
import { FeaturedView } from '@/components/campaigns/FeaturedView'
import { RecentCampaignView } from '@/components/campaigns/RecentCampaignView'
import LoadingScreen from '@/components/LoadingScreen'
import { getRandomBlurhash, getSongTitle, isCampaignComingSoon, isCampaignFinished } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { getFeaturedArtists } from '@/services/ArtistService'
import {
  Campaign,
  getDiscoveryCampaigns,
  getFeaturedCampaigns,
  getRecentCampaigns,
  getUpcomingCampaigns
} from '@/services/CampaignService'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'

import type { StyleProp, ViewStyle, ViewProps, ImageSourcePropType } from 'react-native'
import type { AnimatedProps } from 'react-native-reanimated'
const PAGE_WIDTH = Dimensions.get('window').width
const PAGE_HEIGHT = Dimensions.get('window').height

const sortAndShuffleDiscoveryCards = (campaigns: Campaign[]) => {
  // Function to shuffle an array (Fisher-Yates Shuffle)
  function shuffleArray(array: Campaign[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  // Classifying campaigns
  const ongoingCampaigns = campaigns.filter((campaign) => {
    const startDate = campaign.campaign_details?.campaign_start_date
    const timeRestraint = campaign.campaign_details?.time_restraint
    return !isCampaignComingSoon(startDate) && !isCampaignFinished(startDate, timeRestraint)
  })

  const releasedCampaigns = campaigns.filter((campaign) => {
    const startDate = campaign.campaign_details?.campaign_start_date
    const timeRestraint = campaign.campaign_details?.time_restraint
    return isCampaignFinished(startDate, timeRestraint)
  })

  const upcomingCampaigns = campaigns.filter((campaign) => {
    const startDate = campaign.campaign_details?.campaign_start_date
    return isCampaignComingSoon(startDate)
  })

  // Randomizing each category
  shuffleArray(ongoingCampaigns)
  shuffleArray(releasedCampaigns)
  shuffleArray(upcomingCampaigns)

  // Concatenating the categories
  return ongoingCampaigns.concat(releasedCampaigns, upcomingCampaigns)
}

export default function Discover() {
  useColorScheme()
  const { data: recentCampaigns } = useQuery({
    ...getRecentCampaigns()
  })
  const { data: featuredCampaigns } = useQuery({
    ...getFeaturedCampaigns()
  })
  const { data: featuredArtists } = useQuery({
    ...getFeaturedArtists()
  })
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({ ...getDiscoveryCampaigns(0) })
  const { data: upcomingCampaigns, isLoading: upcomingCampaignsLoading } = useQuery({
    ...getUpcomingCampaigns()
  })

  const progressValue = useSharedValue<number>(0)

  const sortedCampaigns = useMemo(() => sortAndShuffleDiscoveryCards(campaigns || []), [campaigns])

  if (campaignsLoading && !campaigns && upcomingCampaignsLoading && !upcomingCampaigns) return <LoadingScreen />

  const onCardChange = (position: number, absoluteProgress: number) => {
    progressValue.value = absoluteProgress
  }

  return (
    <View style={tw`relative justify-center flex-1 w-screen bg-zinc-100 dark:bg-zinc-950`}>
      <ScrollView contentContainerStyle={tw`pb-44`}>
        <View style={tw`absolute bg-primary-main h-[${PAGE_HEIGHT / 2.2}px] w-full top-0`}>
          <SafeAreaView style={tw`flex-row gap-x-2 justify-between flex-1 h-[${PAGE_HEIGHT / 3}px]`}>
            <View
              style={tw`flex items-center justify-center w-12 ml-[33px] rounded-lg h-13 dark:bg-zinc-900 bg-zinc-50`}
            >
              <Image
                source={require('~/assets/images/AvocadoLogoMinimal.png')}
                contentFit="fill"
                cachePolicy="disk"
                style={[tw.style(`h-10 w-10`)]}
                alt="Avocado Logo"
              />
            </View>
            <Pressable style={tw`mt-2.5 ml-2 mr-[33px]`} hitSlop={10} onPress={() => router.push('/search')}>
              <Ionicons name="search" size={28} color={tw.color('text-zinc-100')} />
            </Pressable>
          </SafeAreaView>
        </View>
        <View
          style={[
            {
              alignItems: 'center',
              marginTop: '20%'
            }
          ]}
        >
          <Carousel
            width={PAGE_WIDTH}
            height={PAGE_HEIGHT * 0.75}
            style={{
              width: PAGE_WIDTH
            }}
            pagingEnabled
            snapEnabled
            loop={false}
            panGestureHandlerProps={{
              activeOffsetX: [-20, 20]
            }}
            onProgressChange={onCardChange}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.85,
              parallaxScrollingOffset: 70
            }}
            data={sortedCampaigns || []}
            renderItem={({ index, item }) => (
              <DiscoveryCard campaign={item} index={index} currentIndex={progressValue.value} />
            )}
          />
        </View>
        <View style={tw`gutter-sm`}>
          <FeaturedView data={upcomingCampaigns} title="Upcoming Songs" returnUrl="discover" />
          <RecentCampaignView data={recentCampaigns} />
          <FeaturedView data={featuredCampaigns} title="Featured Songs" />
          <FeaturedView data={featuredArtists} title="Artist Spotlight" />
        </View>
      </ScrollView>
    </View>
  )
}

interface Props extends AnimatedProps<ViewProps> {
  style?: StyleProp<ViewStyle>
  index?: number
  pretty?: boolean
  showIndex?: boolean
  img?: ImageSourcePropType
  campaign: Campaign
  currentIndex: number
}

export const DiscoveryCard: React.FC<Props> = (props) => {
  const { style, index, currentIndex, pretty, campaign, img, testID, ...animatedViewProps } = props
  const router = useRouter()
  const gesture = Gesture.Tap()
    .maxDuration(500)
    .onEnd(() => {})

  const playbackMetaData = {
    title: campaign.song_title,
    artist: campaign.artists.artist_name,
    artwork: campaign.artwork_url,
    song_id: campaign.id,
    audio_url: campaign.audio_url,
    artwork_url: campaign.artwork_url,
    duration: campaign.duration
  }

  const artworkHeight = PAGE_HEIGHT / 3

  return (
    <GestureDetector gesture={Gesture.Exclusive(gesture)}>
      <Animated.View
        testID={testID}
        style={tw`relative flex-1 bg-white rounded-xl dark:bg-zinc-900`}
        {...animatedViewProps}
      >
        <View style={tw`relative h-[${artworkHeight}px]`}>
          <Image
            source={campaign.artwork_url}
            placeholder={getRandomBlurhash()}
            contentFit="fill"
            cachePolicy="disk"
            style={[tw.style(`w-full absolute rounded-t-xl h-[${artworkHeight}px]`)]}
            alt={`Artwork for ${campaign.song_title} by ${campaign.artists.artist_name}`}
          />
          {/* <View style={tw`flex justify-between flex-1 h-[${artworkHeight}px]`}></View> */}
        </View>
        <View style={tw`items-center justify-center gutter-sm `}>
          <Pressable
            style={tw`-top-12`}
            onPress={() => router.push(`views/artist/${campaign?.artists.id}?url=/discover`)}
          >
            {({ pressed }) => (
              <View style={tw`flex-row items-center bg-white rounded-full dark:bg-zinc-900 gap-x-2`}>
                <Image
                  source={campaign?.artists.avatar_url}
                  placeholder={getRandomBlurhash()}
                  contentFit="fill"
                  cachePolicy="disk"
                  style={[tw.style(`h-24 w-24 rounded-full border border-zinc-50`, { 'opacity-50': pressed })]}
                  alt={`Profile picture for ${campaign?.artists.artist_name}`}
                />
              </View>
            )}
          </Pressable>
          <Typography weight={500} style={tw`text-2xl -top-10`}>
            {campaign?.artists.artist_name}
          </Typography>
          <Pressable onPress={() => router.push(`views/song/${campaign.id}?url=/discover`)}>
            <Typography weight={600} style={tw`flex-wrap text-2xl text-center`}>
              {getSongTitle(campaign!, 120)}
            </Typography>
          </Pressable>

          <View style={tw`flex-row flex-wrap mt-12 gap-x-2 gap-y-2`}>
            <Pill onPress={() => router.push(`views/song/${campaign.id}?url=/discover`)}>{campaign.primary_genre}</Pill>
            {campaign.secondary_genre !== 'Select a genre' && (
              <Pill onPress={() => router.push(`views/song/${campaign.id}?url=/discover`)}>
                {campaign.secondary_genre}
              </Pill>
            )}
          </View>
        </View>
        <View style={tw`absolute self-center bottom-10`}>
          <PlayButton styles="w-18 h-18" playml={2} iconSize={40} pauseml={1} metadata={playbackMetaData} />
        </View>
        {isCampaignComingSoon(campaign.campaign_details?.campaign_start_date) && (
          <View style={tw`absolute self-end top-9 -right-3`}>
            <View
              style={[
                tw`rounded-sm bg-primary-main`,
                {
                  transform: [{ rotate: '45deg' }]
                }
              ]}
            >
              <Typography weight={500} style={tw`px-3 py-0.5 text-base text-white`}>
                Coming Soon
              </Typography>
            </View>
          </View>
        )}
        {isCampaignFinished(
          campaign.campaign_details?.campaign_start_date,
          campaign.campaign_details?.time_restraint
        ) && (
          <View style={tw`absolute self-end top-9 -right-3`}>
            <View
              style={[
                tw`rounded-sm bg-fuchsia-500`,
                {
                  transform: [{ rotate: '45deg' }]
                }
              ]}
            >
              <Typography weight={500} style={tw`px-3 py-0.5 text-base text-white min-w-[120px] text-center`}>
                Released
              </Typography>
            </View>
          </View>
        )}
        {!isCampaignFinished(
          campaign.campaign_details?.campaign_start_date,
          campaign.campaign_details?.time_restraint
        ) &&
          !isCampaignComingSoon(campaign.campaign_details?.campaign_start_date) && (
            <View style={tw`absolute self-end top-9 -right-3`}>
              <View
                style={[
                  tw`rounded-sm bg-secondary-main`,
                  {
                    transform: [{ rotate: '45deg' }]
                  }
                ]}
              >
                <Typography weight={500} style={tw`px-3 py-0.5 text-base text-white min-w-[120px] text-center`}>
                  Ongoing
                </Typography>
              </View>
            </View>
          )}
      </Animated.View>
    </GestureDetector>
  )
}
