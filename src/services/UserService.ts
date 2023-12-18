import { z } from 'zod'

import { fetchWithAuth } from '@/helpers/lib/lib'

const user = z.object({
  id: z.string(),
  avatar_url: z.string()
})

type User = z.infer<typeof user>

export const getCurrentUserProfile = () => {
  return {
    queryKey: ['user/me'],
    queryFn: async (): Promise<User> => {
      return fetchWithAuth<User>('/user/me', user)
    }
  }
}
