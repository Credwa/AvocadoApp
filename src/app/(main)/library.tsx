import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useState } from 'react'
import { FlatList, Pressable, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { PlayButton } from '@/components/atoms/PlayButton'
import { Typography } from '@/components/atoms/Typography'
import { PlaybackMetadata, usePlayback } from '@/context/playbackContext'
import { getRandomBlurhash, getSongTitle } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { getPurchasedCampaigns, PurchasedCampaign } from '@/services/CampaignService'
import { useAppStore } from '@/store'
import { useQuery } from '@tanstack/react-query'

function generatedMetaData(purchasedSong: PurchasedCampaign) {
  if (!purchasedSong) return null
  return {
    artwork_url: purchasedSong.artwork_url,
    song_title: purchasedSong.song_title,
    song_id: purchasedSong.song_id,
    duration: purchasedSong.duration,
    artist: purchasedSong.artist_name,
    title: getSongTitle(purchasedSong, 20),
    audio_url: purchasedSong.audio_url
  } as PlaybackMetadata
}

const Library = () => {
  const colorScheme = useColorScheme()
  const tabBarHeight = useAppStore((state) => state.tabBarHeight)
  const { play, isPlaying, currentMetadata } = usePlayback()
  const [shownCampaigns, setShownCampaigns] = useState<PurchasedCampaign[]>([])
  const [currentSong, setCurrentSong] = useState<PlaybackMetadata | null>(currentMetadata)
  const userId = useAppStore((state) => state.user_id)

  const { data: purchasedCampaigns } = useQuery({
    ...getPurchasedCampaigns(userId)
  })

  useEffect(() => {
    if (purchasedCampaigns && !currentSong) {
      const metadata = generatedMetaData(purchasedCampaigns[0])
      setCurrentSong(metadata)
    }
  }, [purchasedCampaigns])

  useEffect(() => {
    if (purchasedCampaigns) {
      setShownCampaigns(purchasedCampaigns)
    }
  }, [purchasedCampaigns])

  const gradient =
    colorScheme === 'dark'
      ? ['#5d12c5FF', '#5d12c5CC', '#5d12c599', '#5d12c566', '#5d12c533', '#09090b00']
      : ['#8a4dffFF', '#8a4dffCC', '#8a4dff99', '#8a4dff66', '#8a4dff33', '#8a4dff00']

  // const handleSearch = (searchQuery: string) => {
  //   console.log(searchQuery)
  //   if (searchQuery.length > 2) {
  //     const filteredCampaigns = purchasedCampaigns?.filter((campaign) =>
  //       campaign.song_title.toLowerCase().includes(searchQuery.toLowerCase())
  //     )

  //     console.log(filteredCampaigns)
  //     if (filteredCampaigns) setShownCampaigns(filteredCampaigns)
  //   }
  // }

  // const handleFocusStatusChange = (status: boolean) => {}

  const marginBottom = isPlaying ? tabBarHeight * 2 : tabBarHeight

  return (
    <View style={tw`flex-1 background-default`}>
      <FlatList
        keyboardShouldPersistTaps="handled"
        style={tw`background-default mb-[${marginBottom}px]`}
        data={shownCampaigns}
        keyExtractor={(item, index) => item.song_id + index}
        ListHeaderComponent={() => (
          <View style={tw``}>
            <LinearGradient colors={gradient.map((color) => (color ? color : 'transparent'))} style={tw`gutter-sm `}>
              <SafeAreaView>
                <View style={tw`gap-y-1`}>
                  <View>
                    {/* <View style={tw`py-2`}>
                      <SearchBar
                        searching={false}
                        placeholder="Search artists and songs..."
                        onChangeText={handleSearch}
                      />
                    </View> */}
                  </View>
                  <Typography weight={500} style={tw`text-2xl pt-2`}>
                    Library
                  </Typography>
                  <Typography weight={300} style={tw``}>
                    {purchasedCampaigns?.length} songs
                  </Typography>
                </View>

                <View style={tw`flex-row w-full justify-end`}>
                  <PlayButton metadata={currentSong as PlaybackMetadata} animationShown={false} />
                </View>
              </SafeAreaView>
            </LinearGradient>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={tw``} />}
        renderItem={({ item: campaign }) => (
          <Pressable
            key={campaign.song_id}
            style={({ pressed }) => [
              tw.style(`flex-row items-center justify-between gutter-sm py-2`),
              tw.style({
                'opacity-50': pressed
              })
            ]}
            onPress={() => {
              const metadata = generatedMetaData(campaign)
              setCurrentSong(metadata)
              if (!metadata) return
              play(metadata)
            }}
          >
            {({ pressed }) => (
              <View style={tw`flex-row items-center justify-between w-full gap-x-3`}>
                <View style={tw`flex-row gap-x-3`}>
                  <Image
                    source={campaign.artwork_url}
                    placeholder={getRandomBlurhash()}
                    contentFit="fill"
                    transition={200}
                    cachePolicy="disk"
                    style={[tw.style(`w-12 h-12 rounded-sm`), tw.style({ 'opacity-50': pressed })]}
                    alt="avatar image"
                  />
                  <View style={tw.style(`flex-col gap-y-0.5 self-center`)}>
                    <View style={tw`flex-row gap-x-0.5`}>
                      <Typography
                        weight={500}
                        style={tw.style(`text-sm text-zinc-950 dark:text-zinc-100`, {
                          'dark:text-secondary-dark text-secondary-main': currentSong?.song_id === campaign.song_id
                        })}
                      >
                        {getSongTitle(campaign, 40)}
                      </Typography>
                    </View>

                    <Typography weight={400} style={tw`text-sm text-zinc-700 dark:text-zinc-300`}>
                      {campaign.artist_name}
                    </Typography>
                  </View>
                </View>
              </View>
            )}
          </Pressable>
        )}
      />
    </View>
  )
}

export default Library
