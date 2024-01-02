import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av'
import React, { useEffect, useState } from 'react'
import RootSiblingsManager from 'react-native-root-siblings'

import { Playbar } from '@/components/Playbar'

export type PlaybackMetadata = {
  song_id: string
  audio_url: string
  duration: number | null
  title: string
  artist: string
  artwork_url: string
}

const PlaybackContext = React.createContext<{
  play: (metadata: PlaybackMetadata) => Promise<void>
  pause: () => Promise<void>
  stop: () => Promise<void>
  isPlaying: boolean
  viewVisible: boolean
  currentMetadata: PlaybackMetadata | null
} | null>(null)

// This hook can be used to access the user info.
export function usePlayback() {
  const value = React.useContext(PlaybackContext)
  if (!value) {
    console.error('usePlayback must be wrapped in a <PlaybackProvider />')
    throw new Error('usePlayback must be wrapped in a <PlaybackProvider />')
  }
  return value
}

/** Loads the uri into the audio player only runs if the uris are different*/
async function loadAsync(
  audio_url: string,
  hasPermissions: boolean,
  currentAudio: string | null
): Promise<Audio.Sound | undefined> {
  if (currentAudio === audio_url) return
  if (!audio_url) return
  if (!hasPermissions) {
    const { granted } = await Audio.requestPermissionsAsync()

    if (!granted) {
      return
    }
  }
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true
  })
  console.log(`loading music - ${audio_url}`)
  const playbackObject = new Audio.Sound()

  await playbackObject.loadAsync(
    {
      uri: audio_url
    },
    { shouldPlay: true }
  )

  return playbackObject
}

const PlaybackStatus = {
  UNLOADED: 'UNLOADED',
  LOADING: 'LOADING',
  LOADED: 'LOADED',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  STOPPED: 'STOPPED',
  ERROR: 'ERROR',
  BUFFERING: 'BUFFERING'
} as const

export function PlaybackProvider(props: React.PropsWithChildren) {
  const [currentPlaybackObject, setCurrentPlaybackObject] = useState<Audio.Sound>()
  const [currentPlaybackStatus, setCurrentPlaybackStatus] = useState<keyof typeof PlaybackStatus>(
    PlaybackStatus.UNLOADED
  )
  const [currentPlaybackMetadata, setCurrentPlaybackMetadata] = useState<PlaybackMetadata | null>(null)
  const [currentAudio, setCurrentAudio] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPermissions, setHasPermissions] = useState(false)
  const [playbar, setPlaybar] = useState<RootSiblingsManager | null>(null)

  Audio.getPermissionsAsync().then((resp) => {
    if (resp.granted) {
      setHasPermissions(true)
    }
  })

  Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    shouldDuckAndroid: false
  })

  useEffect(() => {
    currentPlaybackObject?.setOnMetadataUpdate(async (metadata) => {
      console.log('metadata', metadata)
    })

    currentPlaybackObject?.setOnPlaybackStatusUpdate(async (playbackStatus) => {
      if (!playbackStatus.isLoaded) {
        if (playbackStatus.error) {
          console.log(`Encountered a fatal error during playback: ${playbackStatus.error}`)
        }
      } else {
        if (playbackStatus.isPlaying) {
          if (!isPlaying) {
            setIsPlaying(true)
            setCurrentPlaybackStatus(PlaybackStatus.PLAYING)
          }
        } else if (!playbackStatus.isPlaying && !playbackStatus.isBuffering) {
          setIsPlaying(false)
          setCurrentPlaybackStatus(PlaybackStatus.PAUSED)
        }

        if (playbackStatus.isBuffering) {
          setCurrentPlaybackStatus(PlaybackStatus.BUFFERING)
        }
      }
    })

    return currentPlaybackObject
      ? () => {
          console.log('Unloading Ssound')
          stopPlayback()
        }
      : undefined
  }, [currentPlaybackObject])

  const stopPlayback = async () => {
    try {
      setPlaybar(null)
      setCurrentAudio(null)
      setCurrentPlaybackObject(undefined)
      playbar?.destroy()
      console.log('stopping audio')
      await currentPlaybackObject?.stopAsync()
      await currentPlaybackObject?.unloadAsync()
    } catch (error) {
      console.log('stop errfors', error)
    }
  }

  return (
    <PlaybackContext.Provider
      value={{
        play: async (metadata: PlaybackMetadata) => {
          try {
            if (currentAudio && currentAudio !== metadata.audio_url) {
              console.log('insta stop')
              await stopPlayback()
            }
            const playbackObject = await loadAsync(metadata.audio_url, hasPermissions, currentAudio)
            setCurrentPlaybackObject(playbackObject ?? currentPlaybackObject)
            console.log(`playing music -  ${metadata}`)
            setCurrentPlaybackMetadata(metadata)
            await currentPlaybackObject?.playAsync()
            if (!playbar) setPlaybar(new RootSiblingsManager(<Playbar />))
          } catch (error) {
            console.log('play error', error)
          }
        },
        pause: async () => {
          try {
            const status = await currentPlaybackObject?.pauseAsync()
            console.log('paused status', status)
          } catch (error) {
            console.log('pause error', error)
          }
        },
        stop: async () => {
          await stopPlayback()
        },
        isPlaying,
        viewVisible: !!playbar,
        currentMetadata: currentPlaybackMetadata
      }}
    >
      {props.children}
    </PlaybackContext.Provider>
  )
}
