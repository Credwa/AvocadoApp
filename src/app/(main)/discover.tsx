import Constants from 'expo-constants'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useRouter } from 'expo-router'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import { Dimensions, Pressable, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { Gesture, GestureDetector, LongPressGestureHandler, ScrollView } from 'react-native-gesture-handler'
import Animated, { Extrapolate, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import Carousel from 'react-native-reanimated-carousel'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Pill } from '@/components/atoms/Pill'
import { PlayButton } from '@/components/atoms/PlayButton'
import { Typography } from '@/components/atoms/Typography'
import { FeaturedView } from '@/components/campaigns/FeaturedView'
import { RecentCampaignView } from '@/components/campaigns/RecentCampaignView'
import LoadingScreen from '@/components/LoadingScreen'
import { SearchBar } from '@/components/SearchBar'
import { SearchList } from '@/components/SearchList'
import { getRandomBlurhash, getSongTitle, isCampaignComingSoon, isCampaignFinished } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { getFeaturedArtists } from '@/services/ArtistService'
import {
  Campaign,
  getDiscoveryCampaigns,
  getFeaturedCampaigns,
  getRecentCampaigns,
  getSearchResults,
  getUpcomingCampaigns
} from '@/services/CampaignService'
import { useQuery } from '@tanstack/react-query'

import type { StyleProp, ViewStyle, ViewProps, ImageSourcePropType } from 'react-native'
import type { AnimatedProps } from 'react-native-reanimated'
const PAGE_WIDTH = Dimensions.get('window').width
const PAGE_HEIGHT = Dimensions.get('window').height

export default function Discover() {
  const colorScheme = useColorScheme()
  const safeAreaInsets = useSafeAreaInsets()
  const [query, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [showSearchList, setShowSearchList] = useState(false)
  const { data: searchData, isLoading: isSearchLoading } = useQuery({
    ...getSearchResults(query),
    // only run when search length is a minimum of 3 characters and debouncedQuery is equal to query which is set after specified timeout
    enabled: debouncedQuery.length > 2 && debouncedQuery === query
  })

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [query])

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.length > 2) {
      setSearchQuery(searchQuery)
    }
  }

  const handleFocusStatusChange = (status: boolean) => {
    setShowSearchList(status)
  }

  const progressValue = useSharedValue<number>(0)

  if (campaignsLoading && !campaigns && upcomingCampaignsLoading && !upcomingCampaigns) return <LoadingScreen />

  const onCardChange = (position: number, absoluteProgress: number) => {
    progressValue.value = absoluteProgress
  }

  return (
    <View style={tw`relative justify-center flex-1 w-screen bg-zinc-100 dark:bg-zinc-950`}>
      <ScrollView contentContainerStyle={tw`pb-44`}>
        <View style={tw`absolute bg-primary-main h-[${PAGE_HEIGHT / 2.2}px] w-full top-0`}>
          <SafeAreaView style={tw`flex-col gap-x-2 flex-1 h-[${PAGE_HEIGHT / 3}px]`}>
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
            {/* <View style={tw`relative w-full mt-1`}>
              <SearchBar
                styles="w-full"
                searching={isSearchLoading}
                placeholder="Search artists and songs..."
                onChangeText={handleSearch}
                onFocusStatusChange={handleFocusStatusChange}
              />
              {showSearchList && <SearchList searchResults={searchData} />}
            </View> */}
            <View />
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
            data={campaigns || []}
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
              <View style={tw`flex-row items-center gap-x-2`}>
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
