export type GymPrice = {
  plan: 'day' | 'week' | 'month' | '3month' | 'year' | 'student_month' | string;
  amount: number;
  currency: 'BAM';
  friendlyLabel: string;
};

export type Gym = {
  slug: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  website: string;
  instagram: string;
  photos: string[];
  recommended: boolean;
  lastVerified: string;
  description: {
    bs: string;
    en: string;
  };
  editorNote: {
    bs: string;
    en: string;
  };
  bestFor: string[];
  amenities: string[];
  prices: GymPrice[];
  openingHours: Record<string, string>;
  pros: {
    bs: string[];
    en: string[];
  };
  cons: {
    bs: string[];
    en: string[];
  };
};

export type SortOption = 'distance' | 'price' | 'recommended';
