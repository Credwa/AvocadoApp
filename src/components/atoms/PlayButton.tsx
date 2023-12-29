import { FC } from 'react'
import { Pressable } from 'react-native'

import { usePlayback } from '@/context/playbackContext'
import tw from '@/helpers/lib/tailwind'
import { Ionicons } from '@expo/vector-icons'

type PlayButtonProps = {
  onPress?: () => void
  styles?: string
  metadata: {
    audio_url: string
  }
}

export const PlayButton: FC<PlayButtonProps> = ({ styles, metadata }) => {
  const { play, pause, isPlaying, currentAudio } = usePlayback()

  return (
    <Pressable
      hitSlop={10}
      onPress={() => {
        if (isPlaying) {
          pause()
        } else {
          play(metadata.audio_url)
        }
      }}
      style={tw.style(`w-10 h-10 rounded-full bg-secondary-main flex justify-center items-center`, styles)}
    >
      {isPlaying && currentAudio === metadata.audio_url ? (
        <Ionicons name="pause-sharp" size={24} color={tw.color('text-zinc-800')} />
      ) : (
        <Ionicons name="play-sharp" size={24} style={tw`ml-1`} color={tw.color('text-zinc-800')} />
      )}
    </Pressable>
  )
}
