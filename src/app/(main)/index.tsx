import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Dimensions, RefreshControl, ScrollView, useColorScheme, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Typography } from '@/components/atoms/Typography'
import { Avatar } from '@/components/Avatar'
import { DropdownMenu } from '@/components/DropdownMenu'
import tw from '@/helpers/lib/tailwind'
import { Foundation } from '@expo/vector-icons'

const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true'

const height = Dimensions.get('window').height

const Root = () => {
  const colorScheme = useColorScheme()
  const [menuOpen, setMenuOpen] = useState(false)

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
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={tw`bg-black `}
      >
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
                src="https://i.scdn.co/image/ab6761610000e5ebcdce7620dc940db079bf4952"
                size={12}
                styles="mr-2 shadow-offset-1 shadow-md shadow-black mt-2"
                onPress={() => setMenuOpen(true)}
              />
              <DropdownMenu data={dropDownItems} open={menuOpen} targetHeight={12} />
            </View>
          </View>
          <View style={tw`flex items-center w-full h-full gap-y-4`} onTouchEnd={() => setMenuOpen(false)}>
            <Typography style={tw`text-lg text-neutral-200 opacity-90`}>Earnings</Typography>
            <View style={tw`flex-row items-center content-center justify-center gap-x-1`}>
              <Foundation name="dollar" size={64} style={tw`mb-3`} color={tw.color('text-zinc-100')} />
              <Typography weight={500} style={tw`text-6xl text-zinc-100`}>
                0.00
              </Typography>
            </View>
          </View>
        </LinearGradient>

        <View
          style={tw`z-20 w-screen h-screen background-default -top-6 rounded-t-3xl`}
          onTouchEnd={() => setMenuOpen(false)}
        >
          {/* <Typography style={tw`text-zinc-300`}>Balance</Typography> */}
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
