import { z } from 'zod';

export const gymPriceSchema = z.object({
  plan: z.enum(['day', 'week', 'month', '3month', 'year', 'student_month']).default('month'),
  amount: z.number().min(0, 'Price must be 0 or higher'),
  currency: z.literal('BAM').default('BAM'),
  friendlyLabel: z.string().min(1, 'Price label is required'),
});

export const gymSchema = z.object({
  slug: z.string().min(2, 'Slug is required'),
  name: z.string().min(2, 'Name is required'),
  address: z.string().min(4, 'Address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().min(6, 'Phone is required'),
  website: z.string().url('Website must be a valid URL').or(z.literal('')),
  instagram: z.string().min(1, 'Instagram handle is required').or(z.literal('')),
  photos: z.array(z.string().url()).default([]),
  recommended: z.boolean().default(false),
  lastVerified: z.string().min(1, 'Verification date is required'),
  description: z.object({
    bs: z.string().min(3, 'Bosnian description is required'),
    en: z.string().min(3, 'English description is required'),
  }),
  editorNote: z.object({
    bs: z.string().min(3, 'Bosnian editor note is required'),
    en: z.string().min(3, 'English editor note is required'),
  }),
  bestFor: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  prices: z.array(gymPriceSchema).min(1, 'Add at least one price plan'),
  openingHours: z.record(z.string(), z.string()).default({}),
  pros: z.object({
    bs: z.array(z.string()).default([]),
    en: z.array(z.string()).default([]),
  }),
  cons: z.object({
    bs: z.array(z.string()).default([]),
    en: z.array(z.string()).default([]),
  }),
});

export type GymFormValues = z.infer<typeof gymSchema>;
