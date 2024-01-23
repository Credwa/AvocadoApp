import { z } from 'zod'

import { fetchWithAuth } from '@/helpers/lib/lib'

import { minCampaign } from './CampaignService'

const artist = z.object({
  id: z.string(),
  artist_name: z.string(),
  avatar_url: z.string(),
  is_verified: z.boolean()
})

export type Artist = z.infer<typeof artist>

export const getFeaturedArtists = () => {
  return {
    queryKey: ['artists', 'featured'],
    queryFn: async (): Promise<Artist[]> => {
      return fetchWithAuth<Artist[]>('/artists/featured', z.array(artist))
    }
  }
}

export const displayedStats = {
  streams: {
    spotify_streams_total: null,
    soundcloud_streams_total: null
  },
  views: {
    instagram_views_total: null,
    tiktok_views_total: null,
    youtube_video_views_total: null,
    spotify_monthly_listeners_current: null
  },
  followers: {
    spotify_followers_total: null,
    soundcloud_followers_total: null,
    deezer_followers_total: null,
    instagram_followers_total: null,
    tiktok_followers_total: null,
    twitter_followers_total: null
  }
} as Record<string, Record<string, number | null>>

const artistActivity = z.object({
  source: z.string().nullable(),
  activity_text: z.string().nullable(),
  activity_url: z.string().nullable(),
  activity_date: z.string().nullable(),
  activity_avatar: z.string().nullable(),
  track_info: z
    .object({
      title: z.string().nullable(),
      avatar: z.string().nullable(),
      release_date: z.string().nullable()
    })
    .nullable()
})
export type ArtistActivity = z.infer<typeof artistActivity>

const artistProfile = z.object({
  ...artist.shape,
  bio: z.string().or(z.null()),
  video_url: z.string().or(z.null()),
  artist_links: z.object({
    spotify_url: z.string().trim().or(z.null()),
    apple_music_url: z.string().trim().or(z.null()),
    soundcloud_url: z.string().trim().or(z.null()),
    deezer_url: z.string().trim().or(z.null()),
    amazon_url: z.string().trim().or(z.null()),
    tidal_url: z.string().trim().or(z.null()),
    shazam_url: z.string().trim().or(z.null()),
    tiktok_url: z.string().trim().or(z.null()),
    facebook_url: z.string().trim().or(z.null()),
    instagram_url: z.string().trim().or(z.null()),
    youtube_url: z.string().trim().or(z.null()),
    twitter_url: z.string().trim().or(z.null())
  }),
  artist_stats: z.object({
    spotify_streams_total: z.number().or(z.null()),
    spotify_monthly_listeners_current: z.number().or(z.null()),
    spotify_followers_total: z.number().or(z.null()),
    amazon_followers_total: z.number().or(z.null()),
    deezer_followers_total: z.number().or(z.null()),
    youtube_video_views_total: z.number().or(z.null()),
    instagram_followers_total: z.number().or(z.null()),
    tiktok_views_total: z.number().or(z.null()),
    youtube_subscribers_total: z.number().or(z.null()),
    soundcloud_streams_total: z.number().or(z.null()),
    soundcloud_followers_total: z.number().or(z.null()),
    twitter_followers_total: z.number().or(z.null()),
    facebook_followers_total: z.number().or(z.null()),
    instagram_views_total: z.number().or(z.null()),
    shazam_shazams_total: z.number().or(z.null()),
    tracklist_tracklist_views_total: z.number().or(z.null()),
    shown_stats: z.array(z.string()).or(z.null())
  }),
  artist_activities: z.object({
    activities: z.array(artistActivity).or(z.null())
  }),
  songs: z.array(
    z.object({
      id: z.string(),
      song_title: z.string(),
      artwork_url: z.string(),
      audio_url: z.string(),
      duration: z.number().nullable(),
      explicit_lyrics: z.boolean(),
      artist_name: z.string().optional(),
      add_version_info: z.string(),
      add_version_info_other: z.string(),
      is_radio_edit: z.boolean()
    })
  )
})

export type ArtistProfile = z.infer<typeof artistProfile>

export const getArtistProfile = (id: string) => {
  return {
    queryKey: ['artists', id],
    queryFn: async (): Promise<ArtistProfile> => {
      return fetchWithAuth<ArtistProfile>(`/artists/${id}`, artistProfile)
    }
  }
}
