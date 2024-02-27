import { z } from 'zod'

export const purchaseSchema = z.object({
  numberOfShares: z.coerce.string()
})

export type TPurchaseSchema = z.infer<typeof purchaseSchema>
