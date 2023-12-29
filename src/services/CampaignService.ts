import { z } from 'zod'

import { fetchWithAuth } from '@/helpers/lib/lib'

const searchResult = z.object({
  id: z.string(),
  artist_name: z.string(),
  song_title: z.string(),
  image_url: z.string(),
  is_verified: z.boolean(),
  type: z.enum(['song', 'artist'])
})
const searchResults = z.array(searchResult)
export type SearchResult = z.infer<typeof searchResult>

export const getSearchResults = (query: string) => {
  return {
    queryKey: ['search', 'tabs', query],
    queryFn: async (): Promise<SearchResult[]> => {
      return fetchWithAuth<SearchResult[]>(`/search?query=${query}`, searchResults)
    }
  }
}

const minCampaign = z.object({
  song_id: z.string(),
  song_title: z.string(),
  artwork_url: z.string(),
  audio_url: z.string(),
  duration: z.number().nullable(),
  explicit_lyrics: z.boolean(),
  artist_name: z.string(),
  add_version_info: z.string(),
  add_version_info_other: z.string(),
  is_radio_edit: z.boolean()
})

const minCampaigns = z.array(minCampaign)
export type MinCampaign = z.infer<typeof minCampaign>

export const getRecentCampaigns = () => {
  return {
    queryKey: ['campaigns', 'recent'],
    queryFn: async (): Promise<MinCampaign[]> => {
      return fetchWithAuth<MinCampaign[]>(`/campaigns/recent`, minCampaigns)
    }
  }
}

export const getFeaturedCampaigns = () => {
  return {
    queryKey: ['campaigns', 'featured'],
    queryFn: async (): Promise<MinCampaign[]> => {
      return fetchWithAuth<MinCampaign[]>(`/campaigns/featured`, minCampaigns)
    }
  }
}
