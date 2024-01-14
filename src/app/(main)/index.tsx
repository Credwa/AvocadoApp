import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Dimensions, Pressable, RefreshControl, ScrollView, useColorScheme, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Typography } from '@/components/atoms/Typography'
import { Avatar } from '@/components/Avatar'
import { DropdownMenu } from '@/components/DropdownMenu'
import { getRandomBlurhash, getSongTitle } from '@/helpers/lib/lib'
import tw from '@/helpers/lib/tailwind'
import { getPurchasedCampaigns } from '@/services/CampaignService'
import { getCurrentUserProfile } from '@/services/UserService'
import { useAppStore } from '@/store'
import { Foundation } from '@expo/vector-icons'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useQuery } from '@tanstack/react-query'

const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true'

const height = Dimensions.get('window').height

const Root = () => {
  const colorScheme = useColorScheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const { data } = useQuery({ ...getCurrentUserProfile() })
  const tabBarHeight = useBottomTabBarHeight()
  const setTabBarHeight = useAppStore((state) => state.setTabBarHeight)

  const { data: purchasedCampaigns } = useQuery({
    ...getPurchasedCampaigns(data?.id),
    enabled: !!data?.id
  })

  const shownCampaigns = purchasedCampaigns?.slice(0, 5)

  useEffect(() => {
    setTabBarHeight(tabBarHeight)
  }, [])

  const gradient =
    colorScheme === 'dark'
      ? [tw.color('text-primary-darker'), tw.color('text-primary-dark'), tw.color('text-primary-main')]
      : [tw.color('text-primary-light'), tw.color('text-primary-main'), tw.color('text-primary-dark')]
  const safeAreaInsets = useSafeAreaInsets()
  const [refreshing, setRefreshing] = React.useState(false)

  const marqueeHeight = height * 0.4
  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }, [])

  const dropDownItems = [
    {
      label: 'Profile',
      onPress: () => router.push('/profile')
    },
    {
      label: 'Settings',
      onPress: () => {
        setMenuOpen(false)
        router.push('/settings')
      }
    }
  ]

  return (
    <View style={tw`flex-1 background-default`}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <LinearGradient
          colors={gradient.map((color) => (color ? color : 'transparent'))}
          start={[0, 1]}
          end={[1, 0]}
          style={tw` w-screen h-[${
            marqueeHeight * 1.1
          }px] bg-primary-dark z-10 gap-y-10 gutter-sm flex items-center pt-[${safeAreaInsets.top}]`}
        >
          <View style={tw`z-20 flex flex-row justify-between w-full`}>
            <View />
            <View>
              <Avatar
                src={data?.avatar_url ?? ''}
                size={12}
                styles="mr-2 shadow-offset-1 shadow-md shadow-black mt-2"
                onPress={() => setMenuOpen((prev) => !prev)}
              />
              <DropdownMenu data={dropDownItems} open={menuOpen} targetHeight={12} />
            </View>
          </View>
          <View style={tw`flex items-center w-full h-full gap-y-4`} onTouchEnd={() => setMenuOpen(false)}>
            <Typography style={tw`text-lg text-neutral-200 opacity-90`}>Earnings</Typography>
            <View style={tw`flex-row items-center content-center justify-center gap-x-1`}>
              <Foundation name="dollar" size={64} style={tw`mb-3`} color={tw.color('text-zinc-100')} />
              <Typography weight={500} style={tw`text-6xl text-zinc-100`}>
                244.68
              </Typography>
            </View>
          </View>
        </LinearGradient>

        <View
          style={tw`z-20 w-screen h-screen pt-8 background-default -top-6 rounded-t-3xl gutter-md`}
          onTouchEnd={() => setMenuOpen(false)}
        >
          <Typography style={tw`text-xl dark:text-zinc-300 text-zinc-700`} weight={500}>
            Owned Songs
          </Typography>
          <View style={tw`flex-col pt-4 gap-y-3`}>
            {shownCampaigns && shownCampaigns?.length === 0 ? (
              <>
                <Typography style={tw`pt-2 text-base`}>Nothing here yet</Typography>
              </>
            ) : (
              <>
                {shownCampaigns?.map((campaign) => (
                  <Pressable
                    key={campaign.song_id}
                    style={({ pressed }) => [
                      tw.style(`flex-row items-center justify-between`),
                      tw.style({
                        'opacity-50': pressed
                      })
                    ]}
                    onPress={() => router.push(`views/purchase/${campaign.song_id}`)}
                  >
                    {({ pressed }) => (
                      <View style={tw`flex-row items-center justify-between w-full gap-x-3`}>
                        <View style={tw`flex-row gap-x-3`}>
                          <Image
                            source={campaign.artwork_url}
                            placeholder={getRandomBlurhash()}
                            contentFit="fill"
                            transition={200}
                            cachePolicy="memory"
                            style={[tw.style(`w-12 h-12 rounded-sm`), tw.style({ 'opacity-50': pressed })]}
                            alt="avatar image"
                          />
                          <View style={tw.style(`flex-col gap-y-0.5  self-start`)}>
                            <View style={tw`flex-row gap-x-0.5`}>
                              <Typography weight={500} style={tw`text-sm text-zinc-950 dark:text-zinc-100`}>
                                {getSongTitle(campaign, 30)}
                              </Typography>
                            </View>

                            <Typography weight={400} style={tw`text-sm text-zinc-700 dark:text-zinc-300`}>
                              {campaign.artist_name}
                            </Typography>
                          </View>
                        </View>

                        <View style={tw`self-start justify-end`}>
                          <Typography weight={500}>Shares</Typography>
                          <Typography weight={500} style={tw`self-end text-base`}>
                            {campaign.total_shares}
                          </Typography>
                        </View>
                      </View>
                    )}
                  </Pressable>
                ))}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

let EntryPoint = Root

if (storybookEnabled) {
  const StorybookUI = require('../../../.storybook').default
  EntryPoint = () => {
    return (
      <View style={{ flex: 1 }}>
        <StorybookUI />
      </View>
    )
  }
}

export default EntryPoint
