import Constants from 'expo-constants'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useRouter } from 'expo-router'
import React, { PropsWithChildren, useState } from 'react'
import { Dimensions, Pressable, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { Gesture, GestureDetector, LongPressGestureHandler, ScrollView } from 'react-native-gesture-handler'
import Animated, { Extrapolate, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import Carousel from 'react-native-reanimated-carousel'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Pill } from '@/components/atoms/Pill'
import { PlayButton } from '@/components/atoms/PlayButton'
import { Typography } from '@/components/atoms/Typography'
import LoadingScreen from '@/components/LoadingScreen'
import { getRandomBlurhash, getSongTitle } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Campaign, getDiscoveryCampaigns } from '@/services/CampaignService'
import { useQuery } from '@tanstack/react-query'

import type { StyleProp, ViewStyle, ViewProps, ImageSourcePropType } from 'react-native'
import type { AnimateProps } from 'react-native-reanimated'
const PAGE_WIDTH = Dimensions.get('window').width
const PAGE_HEIGHT = Dimensions.get('window').height

export default function Discover() {
  const colorScheme = useColorScheme()
  const safeAreaInsets = useSafeAreaInsets()

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({ ...getDiscoveryCampaigns(0) })
  const progressValue = useSharedValue<number>(0)

  if (campaignsLoading && !campaigns) return <LoadingScreen />

  const onCardChange = (position: number, absoluteProgress: number) => {
    progressValue.value = absoluteProgress
  }

  console.log(campaigns)
  return (
    <View style={tw`relative justify-center flex-1 w-screen bg-zinc-100 dark:bg-zinc-950`}>
      <View style={tw`absolute bg-primary-main h-[${PAGE_HEIGHT / 2.2}px] w-full top-0`}>
        <SafeAreaView style={tw`  flex-row justify-between flex-1 h-[${PAGE_HEIGHT / 3}px]`}>
          <View style={tw`flex items-center justify-center w-12 ml-8 rounded-lg h-13 dark:bg-zinc-900 bg-zinc-50`}>
            <Image
              source={require('~/assets/images/AvocadoLogoMinimal.png')}
              contentFit="fill"
              cachePolicy="disk"
              style={[tw.style(`h-10 w-10`)]}
              alt="Avocado Logo"
            />
          </View>
          <View />
        </SafeAreaView>
      </View>

      <View
        style={{
          alignItems: 'center'
        }}
      >
        <Carousel
          width={PAGE_WIDTH}
          height={PAGE_HEIGHT * 0.8}
          style={{
            width: PAGE_WIDTH
          }}
          pagingEnabled
          snapEnabled
          loop={false}
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
    </View>
  )
}

interface Props extends AnimateProps<ViewProps> {
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
  const routere = useRouter()
  const gesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      routere.push(`views/song/${campaign.id}?url=/discover`)
    })

  // router.push(`views/song/${campaign.id}?url=/discover`)

  const playbackMetaData = {
    title: campaign.song_title,
    artist: campaign.artists.artist_name,
    artwork: campaign.artwork_url,
    song_id: campaign.id,
    audio_url: campaign.audio_url,
    artwork_url: campaign.artwork_url,
    duration: campaign.duration
  }

  // () =>
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
          <Typography weight={600} style={tw`flex-wrap text-2xl text-center`}>
            {getSongTitle(campaign!, 120)}
          </Typography>
          <View style={tw`flex-row flex-wrap mt-12 gap-x-2 gap-y-2`}>
            <Pill>{campaign.primary_genre}</Pill>
            {campaign.secondary_genre !== 'Select a genre' && <Pill>{campaign.secondary_genre}</Pill>}
          </View>
        </View>
        <View style={tw`absolute self-center bottom-10`}>
          <PlayButton styles="w-18 h-18" playml={2} iconSize={40} pauseml={1} metadata={playbackMetaData} />
        </View>
      </Animated.View>
    </GestureDetector>
  )
}
