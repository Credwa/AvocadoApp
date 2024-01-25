import { z } from 'zod'

import { fetchWithAuth } from '@/helpers/lib/lib'

const notificationPreferences = z
  .object({
    notifications_enabled: z.boolean()
  })
  .nullable()
  .optional()

export type NotificationPreferences = z.infer<typeof notificationPreferences>

export const roles = z.enum(['admin', 'user', 'artist'])

const user = z.object({
  id: z.string(),
  avatar_url: z.string(),
  role: roles,
  notification_preferences: notificationPreferences
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

export const uploadNewAvatar = (data: { id: string; imageBase64: string; currentAvatar?: string }) => {
  return fetchWithAuth<void>('/user/me/avatar', undefined, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export const updateNotificationPreferences = (userId: string, notificationPreferences: NotificationPreferences) => {
  return fetchWithAuth<void>(`/user/me/notifications/${userId}`, undefined, {
    method: 'POST',
    body: JSON.stringify(notificationPreferences)
  })
}
