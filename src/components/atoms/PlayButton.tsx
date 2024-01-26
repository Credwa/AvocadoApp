import { FC } from 'react'
import { Pressable } from 'react-native'

import { PlaybackMetadata, usePlayback } from '@/context/playbackContext'
import tw from '@/helpers/lib/tailwind'
import { Ionicons } from '@expo/vector-icons'

type PlayButtonProps = {
  onPress?: () => void
  styles?: string
  metadata: PlaybackMetadata
  animationShown?: boolean
}

export const PlayButton: FC<PlayButtonProps> = ({ styles, metadata, animationShown = true }) => {
  const { play, pause, isPlaying, currentMetadata } = usePlayback()

  return (
    <Pressable
      hitSlop={10}
      onPress={() => {
        if (isPlaying) {
          pause()
        } else {
          play(metadata)
        }
      }}
      style={({ pressed }) =>
        tw.style(`w-10 h-10 rounded-full bg-secondary-main flex justify-center items-center`, styles, {
          'opacity-80 w-9 h-9': pressed && animationShown
        })
      }
    >
      {isPlaying && currentMetadata && currentMetadata?.audio_url === metadata.audio_url ? (
        <Ionicons name="pause-sharp" size={24} color={tw.color('text-zinc-800')} />
      ) : (
        <Ionicons name="play-sharp" size={24} style={tw`ml-1`} color={tw.color('text-zinc-800')} />
      )}
    </Pressable>
  )
}
