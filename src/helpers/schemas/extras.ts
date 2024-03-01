import { z } from 'zod'

export const purchaseSchema = z.object({
  numberOfShares: z.coerce.string()
})

export type TPurchaseSchema = z.infer<typeof purchaseSchema>

export const purchaseReleasedSchema = z.object({
  amount: z.coerce.string()
})

export type TPurchaseReleasedSchema = z.infer<typeof purchaseReleasedSchema>
