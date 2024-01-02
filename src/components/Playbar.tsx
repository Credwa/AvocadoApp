import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { FC } from 'react'
import { Pressable, View } from 'react-native'

import { usePlayback } from '@/context/playbackContext'
import tw from '@/helpers/lib/tailwind'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useAppStore } from '@/store'
import { Ionicons } from '@expo/vector-icons'

import { Typography } from './atoms/Typography'

type PlaybarProps = {
  styles?: string
}

const defaultBlurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

export const Playbar: FC<PlaybarProps> = () => {
  const colorScheme = useColorScheme()
  const tabBarHeight = useAppStore((state) => state.tabBarHeight)
  const { stop, currentMetadata, isPlaying, pause, play } = usePlayback()
  const { title, artist, artwork_url } = currentMetadata ?? {}
  // ['#0f0421', '#0f0421', '#110424', '#120426', '#120426', '#140529', '#15052b']
  const gradient =
    colorScheme === 'dark'
      ? ['#0f0421', '#0f0421', '#110424', '#120426', '#120426', '#140529', '#15052b']
      : [tw.color('text-primary-dark'), tw.color('text-primary-dark'), tw.color('text-primary-darker')]

  return (
    <View style={tw.style(`absolute w-screen h-14 px-1 bottom-[${tabBarHeight}px]`)}>
      <Pressable>
        {({ pressed }) => (
          <LinearGradient
            colors={gradient.map((color) => (color ? color : 'transparent'))}
            start={[0, 1]}
            end={[1, 0]}
            style={tw.style(`flex flex-row items-center justify-between w-full h-full rounded-md gutter-sm`, {
              'opacity-80': pressed
            })}
          >
            <View style={tw`flex-row items-center gap-x-3`}>
              <Image
                source={artwork_url}
                placeholder={defaultBlurhash}
                contentFit="fill"
                transition={50}
                cachePolicy="memory"
                style={[tw.style(`w-11 h-11 rounded-sm`), tw.style({ 'opacity-50': pressed })]}
                alt={`Artwork for ${title} by ${artist}`}
              />
              <View style={tw.style(`flex-col gap-y-0.5`)}>
                <View style={tw`flex-row gap-x-0.5`}>
                  <Typography weight={500} style={tw`text-sm text-zinc-200 dark:text-zinc-100`}>
                    {title}
                  </Typography>
                </View>

                <Typography weight={400} style={tw`text-sm text-zinc-300 dark:text-zinc-400`}>
                  {artist}
                </Typography>
              </View>
            </View>
            <View style={tw`flex flex-row items-center justify-center gap-x-8`}>
              <Pressable
                hitSlop={5}
                onPress={() => {
                  if (isPlaying) {
                    pause()
                  } else {
                    play(currentMetadata!)
                  }
                }}
                style={tw.style(`w-10 h-10 rounded-full  flex justify-center items-center`)}
              >
                {isPlaying ? (
                  <Ionicons name="pause-sharp" size={24} color={tw.color('text-zinc-300')} />
                ) : (
                  <Ionicons name="play-sharp" size={24} style={tw`ml-1`} color={tw.color('text-zinc-300')} />
                )}
              </Pressable>
              <Pressable hitSlop={5} onPress={stop}>
                <Ionicons name="close" size={24} color={tw.color('text-zinc-300')} />
              </Pressable>
            </View>
          </LinearGradient>
        )}
      </Pressable>
    </View>
  )
}
