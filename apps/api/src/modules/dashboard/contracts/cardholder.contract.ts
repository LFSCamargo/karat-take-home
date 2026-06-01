import { z } from 'zod';

export const cardholderPrimaryCardSchema = z.object({
  last4: z.string(),
  brand: z.string(),
  status: z.string(),
});

export const cardholderProfileSchema = z.object({
  id: z.string().uuid(),
  stripeCardholderId: z.string(),
  displayName: z.string().nullable(),
  email: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  status: z.string().nullable(),
  memberSince: z.string().datetime().nullable(),
  primaryCard: cardholderPrimaryCardSchema.nullable(),
});

export type CardholderPrimaryCard = z.infer<typeof cardholderPrimaryCardSchema>;
export type CardholderProfile = z.infer<typeof cardholderProfileSchema>;
