import { ResizeMode, Video } from 'expo-av'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { Dimensions, Pressable, SafeAreaView, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import { ActivitiesView } from '@/components/artistComponents/artistActivitiesView'
import ArtistLinks from '@/components/artistComponents/artistLinks'
import ArtistStats from '@/components/artistComponents/artistStats'
import BackButton from '@/components/atoms/BackButton'
import { Button } from '@/components/atoms/Button'
import { Typography } from '@/components/atoms/Typography'
import LoadingScreen from '@/components/LoadingScreen'
import { AndroidSafeAreaPaddingTop } from '@/helpers/lib/constants'
import { getRandomBlurhash, getSongTitle } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { getArtistProfile } from '@/services/ArtistService'
import { Campaign } from '@/services/CampaignService'
import { followArtist, getArtistFollowStatus, unfollowArtist } from '@/services/RelationshipService'
import { getCurrentUserProfile } from '@/services/UserService'
import { useAppStore } from '@/store'
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export default function ArtistProfile() {
  const colorScheme = useColorScheme()
  const tabBarHeight = useAppStore((state) => state.tabBarHeight)
  const [bioOpen, setBioOpen] = useState(false)
  const screenHeight = Dimensions.get('window').height
  const queryClient = useQueryClient()

  const video = useRef(null)
  const [status, setStatus] = useState<any>(null)
  const { artistId, url } = useLocalSearchParams<{ artistId: string; url?: string }>()
  if (!artistId) {
    router.back()
  }
  const { data: currentUser } = useQuery({ ...getCurrentUserProfile() })

  const { data: artistData, isLoading: isArtistLoading } = useQuery({
    ...getArtistProfile(artistId!)
  })

  const { data: followStatus, isLoading: isFollowStatusLoading } = useQuery({
    ...getArtistFollowStatus(currentUser?.id as string, artistData?.id as string),
    enabled: !!currentUser?.id
  })

  console.log('hi', followStatus)

  const { mutateAsync: followArtistAsync } = useMutation({
    mutationFn: async (data: { userId: string; artistId: string }) => {
      return followArtist(data.userId as string, data.artistId)
    },
    onMutate: async (newVal) => {
      // await queryClient.cancelQueries({
      //   queryKey: ['relationships', 'follow-status', currentUser?.id, artistData?.id]
      // })
      // const previousData = queryClient.getQueryData(['relationships', 'follow-status', currentUser?.id, artistData?.id])
      // queryClient.setQueryData(['relationships', 'follow-status', currentUser?.id, artistData?.id], (old: any) => [
      //   ...old,
      //   { isFollowing: true }
      // ])
      // return { previousData }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['relationships', 'follow-status', currentUser?.id, artistData?.id]
      })
    },
    onError: (error) => {
      console.log(error)
    }
  })

  const { mutateAsync: unfollowArtistAsync } = useMutation({
    mutationFn: async (data: { userId: string; artistId: string }) => {
      return unfollowArtist(data.userId as string, data.artistId)
    },
    onMutate: async (newVal) => {
      // await queryClient.cancelQueries({
      //   queryKey: ['relationships', 'follow', 'artist-status', currentUser?.id, artistData?.id]
      // })
      // const previousData = queryClient.getQueryData(['relationships', 'follow-status', currentUser?.id, artistData?.id])
      // queryClient.setQueryData(['relationships', 'follow-status', currentUser?.id, artistData?.id], (old: any) => [
      //   ...old,
      //   { isFollowing: false }
      // ])
      // return { previousData }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['relationships', 'follow-status', currentUser?.id, artistData?.id]
      })
    },
    onError: (error) => {
      console.log(error)
    }
  })

  // useEffect(() => {
  //   const value = getImageColorBrightness(artistData?.avatar_url as string)
  // }, [isArtistLoading])

  if (isArtistLoading) return <LoadingScreen />

  const filteredArtistActivities = artistData?.artist_activities?.activities?.filter(
    (activity) =>
      (activity.activity_avatar && activity.activity_avatar.length > 0) ||
      (activity.track_info?.avatar && activity.track_info?.avatar.length > 0)
  )

  const gradient = ['#00000000', '#00000033', '#00000066', '#00000099']

  const filteredArtistSongs = artistData?.songs?.filter((song) => song.status !== 'draft')

  return (
    <ScrollView nestedScrollEnabled style={tw.style(`flex flex-col flex-1 background-default`)}>
      <View style={tw`relative h-[${screenHeight / 2.3}px]`}>
        <Image
          source={artistData?.avatar_url}
          placeholder={getRandomBlurhash()}
          contentFit="fill"
          cachePolicy="disk"
          style={[tw.style(`w-full absolute h-[${screenHeight / 2.3}px]`)]}
          alt={`Profile picture for ${artistData?.artist_name}`}
        />
        <SafeAreaView
          style={tw.style(`flex justify-between flex-1 h-[${screenHeight / 2.3}px]`, AndroidSafeAreaPaddingTop)}
        >
          <BackButton hasBackground href={url} />

          <LinearGradient colors={gradient.map((color) => (color ? color : 'transparent'))} style={tw`flex-row `}>
            <Typography weight={600} style={tw`m-2 text-4xl text-white`}>
              {artistData?.artist_name}
            </Typography>
            {artistData?.is_verified && (
              <MaterialIcons
                name="verified"
                style={tw`self-center mb-1`}
                size={32}
                color={tw.color('text-primary-main')}
              />
            )}
          </LinearGradient>
        </SafeAreaView>
      </View>

      <View style={tw`flex gutter-sm pt-3 gap-y-4 pb-[${tabBarHeight * 1.5}px]`}>
        {isFollowStatusLoading || currentUser?.id === artistData?.id ? null : (
          <View style={tw`self-end`}>
            {followStatus?.isFollowing ? (
              <Button
                styles="rounded-full -mb-5"
                variant="default"
                outline
                onPress={() =>
                  unfollowArtistAsync({ userId: currentUser?.id as string, artistId: artistData?.id as string })
                }
                iconLeft={
                  <FontAwesome5
                    name="user-check"
                    size={16}
                    color={colorScheme === 'dark' ? tw.color('text-zinc-200') : tw.color('text-zinc-700')}
                  />
                }
              >
                Followed
              </Button>
            ) : (
              <Button
                styles="rounded-full -mb-5"
                variant="default"
                outline
                onPress={() =>
                  followArtistAsync({ userId: currentUser?.id as string, artistId: artistData?.id as string })
                }
                iconLeft={
                  <FontAwesome5
                    name="user-plus"
                    size={16}
                    color={colorScheme === 'dark' ? tw.color('text-zinc-200') : tw.color('text-zinc-700')}
                  />
                }
              >
                Follow
              </Button>
            )}
          </View>
        )}

        {Boolean(artistData?.bio) && (
          <View style={tw`flex-col self-start pt-4`}>
            <Typography weight={500} style={tw`pb-2 text-2xl`}>
              About
            </Typography>
            <Typography style={tw`text-base`} weight={400}>
              {bioOpen
                ? artistData?.bio
                : artistData?.bio!.slice(0, 150) + `${artistData?.bio && artistData?.bio!.length > 150 ? '...' : ''}`}
            </Typography>

            {artistData?.bio && artistData?.bio?.length > 150 && (
              <Pressable style={tw`py-2`} onPress={() => setBioOpen((prev) => !prev)}>
                <Typography weight={500} style={tw`text-base dark:text-primary-lighter text-primary-main`}>
                  {bioOpen ? 'Show less' : 'Show more'}
                </Typography>
              </Pressable>
            )}
          </View>
        )}

        {/* {Boolean(artistData?.video_url) && (
          <View style={tw`flex-1 w-full h-96`}>
            <Video
              ref={video}
              style={tw`flex-1 rounded-sm h-96`}
              source={{
                uri: artistData?.video_url as string
              }}
              useNativeControls
              resizeMode={ResizeMode.COVER}
              isLooping
              onPlaybackStatusUpdate={(status) => setStatus(() => status)}
            />
            <View>
              <Button
                title={status && status.isPlaying ? 'Pause' : 'Play'}
                // @ts-ignore
                onPress={() => (status.isPlaying ? video.current.pauseAsync() : video.current.playAsync())}
              />
            </View>
          </View>
        )} */}

        {Boolean(artistData?.bio) && <View style={tw`w-full my-4 border-b dark:border-zinc-700 border-zinc-300`} />}
        {Boolean(filteredArtistSongs && filteredArtistSongs.length > 0) && (
          <View style={tw`flex-col self-start h-52`}>
            <Typography weight={500} style={tw`pb-2 text-2xl`}>
              Available Songs
            </Typography>

            <ScrollView>
              {filteredArtistSongs?.map((campaign) => (
                <Pressable
                  key={campaign.id}
                  style={({ pressed }) => [
                    tw.style(`flex-row items-center justify-between py-2`),
                    tw.style({
                      'opacity-50': pressed
                    })
                  ]}
                  onPress={() => router.replace(`views/song/${campaign.id}`)}
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
                            <Typography weight={500} style={tw.style(`text-sm  text-zinc-950 dark:text-zinc-100`)}>
                              {getSongTitle(campaign as Campaign, 40)}
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
              ))}
            </ScrollView>
          </View>
        )}
        <ArtistLinks artistLinks={artistData?.artist_links!} />
        <ArtistStats artistStats={artistData?.artist_stats!} />
        <ActivitiesView artistActivities={filteredArtistActivities!} />
      </View>
    </ScrollView>
  )
}
