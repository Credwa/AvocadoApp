import { z } from 'zod'

import { fetchWithAuth } from '@/helpers/lib/lib'

export const followArtist = (user_id: string, artist_id: string) => {
  return fetchWithAuth<void>(`/relationships/follow-artist`, undefined, {
    method: 'POST',
    body: JSON.stringify({ user_id, artist_id })
  })
}

export const unfollowArtist = (user_id: string, artist_id: string) => {
  return fetchWithAuth<void>(`/relationships/unfollow-artist`, undefined, {
    method: 'POST',
    body: JSON.stringify({ user_id, artist_id })
  })
}

const followStatus = z.object({
  isFollowing: z.boolean()
})
export type FollowStatus = z.infer<typeof followStatus>

export const getArtistFollowStatus = (user_id: string, artist_id: string) => {
  return {
    queryKey: ['relationships', 'follow-status', user_id, artist_id],
    queryFn: async (): Promise<FollowStatus> => {
      return fetchWithAuth<FollowStatus>(`/relationships/follow-status/${user_id}/${artist_id}`, followStatus)
    }
  }
}

const followCount = z.object({
  count: z.number()
})
export type FollowCount = z.infer<typeof followCount>

export const getFollowingCount = (user_id: string) => {
  return {
    queryKey: ['relationships', 'following', 'total', user_id],
    queryFn: async (): Promise<FollowCount> => {
      return fetchWithAuth<FollowCount>(`/relationships/following/total/${user_id}`, followCount)
    }
  }
}
