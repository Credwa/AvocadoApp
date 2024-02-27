import { z } from 'zod'

import { fetchWithAuth } from '@/helpers/lib/lib'

import { songStatuses } from './ArtistService'

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

export const minCampaign = z.object({
  song_id: z.string(),
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
export type MinCampaign = z.infer<typeof minCampaign>

export const getRecentCampaigns = () => {
  return {
    queryKey: ['campaigns', 'recent'],
    queryFn: async (): Promise<MinCampaign[]> => {
      return fetchWithAuth<MinCampaign[]>(`/campaigns/recent`, z.array(minCampaign))
    }
  }
}

export const getFeaturedCampaigns = () => {
  return {
    queryKey: ['campaigns', 'featured'],
    queryFn: async (): Promise<MinCampaign[]> => {
      return fetchWithAuth<MinCampaign[]>(`/campaigns/featured`, z.array(minCampaign))
    }
  }
}

const campaign = z.object({
  id: z.string(),
  song_title: z.string(),
  song_description: z.string(),
  artwork_url: z.string(),
  audio_url: z.string(),
  primary_genre: z.string(),
  secondary_genre: z.string().nullable(),
  duration: z.number().nullable(),
  explicit_lyrics: z.boolean(),
  add_version_info: z.string(),
  add_version_info_other: z.string(),
  is_radio_edit: z.boolean(),
  status: z.enum(songStatuses),
  campaign_details: z
    .object({
      available_shares: z.number(),
      price_per_share: z.number(),
      time_restraint: z.number(),
      campaign_start_date: z.string().nullable()
    })
    .nullable(),
  artists: z.object({
    id: z.string(),
    artist_name: z.string(),
    avatar_url: z.string(),
    is_verified: z.boolean()
  })
})
export type Campaign = z.infer<typeof campaign>

export const getCampaignById = (songId: string) => {
  return {
    queryKey: ['campaigns', songId],
    queryFn: async (): Promise<Campaign> => {
      return fetchWithAuth<Campaign>(`/campaigns/${songId}`, campaign)
    }
  }
}

export const getDiscoveryCampaigns = (offset: number) => {
  return {
    queryKey: ['campaigns', 'discovery', offset],
    queryFn: async (): Promise<Campaign[]> => {
      return fetchWithAuth<Campaign[]>(`/campaigns/discover?limit=8&offset=${offset}`, z.array(campaign))
    }
  }
}

const purchasedCampaign = z.object({
  song_id: z.string(),
  song_title: z.string(),
  artwork_url: z.string(),
  audio_url: z.string(),
  artist_name: z.string(),
  duration: z.number().nullable(),
  explicit_lyrics: z.boolean(),
  add_version_info: z.string(),
  add_version_info_other: z.string(),
  is_radio_edit: z.boolean(),
  latest_purchase: z.string(),
  total_shares: z.number()
})

export type PurchasedCampaign = z.infer<typeof purchasedCampaign>

export const purchaseCampaign = (songId: string, userId: string, shares: number) => {
  return fetchWithAuth<void>(`/campaigns/purchase/${songId}`, undefined, {
    method: 'POST',
    body: JSON.stringify({ userid: userId, shares, songid: songId })
  })
}

const paymentSheet = z.object({
  paymentIntent: z.string(),
  ephemeralKey: z.string(),
  customer: z.string(),
  publishableKey: z.string()
})

type PaymentSheet = z.infer<typeof paymentSheet>

export const getPaymentSheet = (
  uid: string,
  songId: string,
  quantity: number,
  email: string,
  songName: string,
  artistName: string
) => {
  console.log(email)
  return fetchWithAuth<PaymentSheet>(`/campaigns/purchase/payment-sheet`, paymentSheet, {
    method: 'POST',
    body: JSON.stringify({ uid, songId, quantity, email, songName, artistName })
  })
}

export const getPurchasedCampaigns = (userId?: string) => {
  return {
    queryKey: ['campaigns', 'purchase', userId],
    queryFn: async (): Promise<PurchasedCampaign[]> => {
      return fetchWithAuth<PurchasedCampaign[]>(`/campaigns/purchase?userId=${userId}`, z.array(purchasedCampaign))
    }
  }
}

const purchaseHistory = z.object({
  user_id: z.string(),
  song_id: z.string(),
  created_at: z.string(),
  shares: z.number()
})

export type PurchaseHistory = z.infer<typeof purchaseHistory>

export const getPurchaseHistoryForSong = (songId: string, userId: string) => {
  return {
    queryKey: ['campaigns', 'purchase', userId, songId],
    queryFn: async (): Promise<PurchaseHistory[]> => {
      return fetchWithAuth<PurchaseHistory[]>(
        `/campaigns/purchase/${songId}?userId=${userId}`,
        z.array(purchaseHistory)
      )
    }
  }
}
