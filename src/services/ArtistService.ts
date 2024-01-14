import { z } from 'zod'

import { fetchWithAuth } from '@/helpers/lib/lib'

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
