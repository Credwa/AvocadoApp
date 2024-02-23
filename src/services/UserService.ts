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
  notification_preferences: notificationPreferences,
  is_onboarded: z.boolean(),
  stripe_onboarding_complete: z.boolean()
})

const accountLinkData = z.object({
  accountLink: z.string()
})

type AccountLinkData = z.infer<typeof accountLinkData>

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

export const completeOnboarding = (userId: string) => {
  return fetchWithAuth<void>(`/user/me/onboarding-complete/${userId}`, undefined, {
    method: 'POST'
  })
}

export const createStripeAccount = (uid: string, returnUrl: string, refreshUrl: string) => {
  return fetchWithAuth<AccountLinkData>('/user/stripe/account-link', accountLinkData, {
    method: 'POST',
    body: JSON.stringify({ uid, returnUrl, refreshUrl })
  })
}

const stripeAccountInfo = z.object({
  charges_enabled: z.boolean(),
  payouts_enabled: z.boolean()
})

type StripeAccountInfo = z.infer<typeof stripeAccountInfo>

export const getStripeAccountInfo = (uid?: string) => {
  return {
    queryKey: ['user', 'stripe', uid],
    queryFn: async (): Promise<StripeAccountInfo> => {
      return fetchWithAuth<StripeAccountInfo>(`/user/stripe/account-details/${uid}`, stripeAccountInfo)
    }
  }
}

const stripeAccountBalance = z.object({
  available: z.array(
    z.object({
      amount: z.number(),
      currency: z.string()
    })
  ),
  pending: z.array(
    z.object({
      amount: z.number(),
      currency: z.string()
    })
  )
})

type StripeAccountBalance = z.infer<typeof stripeAccountBalance>

export const getStripeAccountBalance = (uid?: string) => {
  return {
    queryKey: ['user', 'stripe', 'balance', uid],
    queryFn: async (): Promise<StripeAccountBalance> => {
      return fetchWithAuth<StripeAccountBalance>(`/user/stripe/balance/${uid}`, stripeAccountBalance)
    }
  }
}

export const updateNotificationPreferences = (userId: string, notificationPreferences: NotificationPreferences) => {
  return fetchWithAuth<void>(`/user/me/notifications/${userId}`, undefined, {
    method: 'POST',
    body: JSON.stringify(notificationPreferences)
  })
}
