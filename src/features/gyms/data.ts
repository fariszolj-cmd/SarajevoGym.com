import type { Gym } from './types';

export const gyms: Gym[] = [
  {
    slug: 'iron-rhythm',
    name: 'Iron Rhythm',
    address: 'Mula Mustafe Bašeskije 11, Sarajevo',
    latitude: 43.8563,
    longitude: 18.4132,
    phone: '+387 33 641 190',
    website: 'https://example.com/iron-rhythm',
    instagram: '@ironrhythm',
    photos: ['https://images.unsplash.com/...'],
    recommended: true,
    lastVerified: '2026-11-01',
    description: {
      bs: 'Moderni teretani i funkcionalni trening centar sa fokusom na snagu, kondiciju i grupne treninge.',
      en: 'A modern strength and functional fitness centre focused on performance, conditioning, and group training.',
    },
    editorNote: {
      bs: 'Odličan izbor za one koji žele ozbiljan trening i solidan raspon opreme.',
      en: 'A strong choice for people who want serious training, quality equipment, and structured workouts.',
    },
    bestFor: ['strength', 'bodybuilding', 'women'],
    amenities: ['weights', 'cardio', 'lockers', 'group-classes'],
    prices: [
      { plan: 'month', amount: 120, currency: 'BAM', friendlyLabel: 'Mjesečno' },
      { plan: '3month', amount: 320, currency: 'BAM', friendlyLabel: '3 mjeseca' },
      { plan: 'year', amount: 1080, currency: 'BAM', friendlyLabel: 'Godišnje' },
    ],
    openingHours: {
      monday: '07:00 - 23:00',
      tuesday: '07:00 - 23:00',
      wednesday: '07:00 - 23:00',
      thursday: '07:00 - 23:00',
      friday: '07:00 - 22:00',
      saturday: '09:00 - 19:00',
      sunday: '10:00 - 17:00',
    },
    pros: {
      bs: ['Velika sala i kvalitetna oprema', 'Dobro za jačanje i bodybuilding', 'Prijateljski treneri'],
      en: ['Large training floor and modern equipment', 'Strong for strength and bodybuilding', 'Helpful coaching staff'],
    },
    cons: {
      bs: ['Malo skuplje od osnovnih opcija', 'Neke group klase popunjavaju se brzo'],
      en: ['Price sits above the budget range', 'Popular classes can fill up quickly'],
    },
  },
  {
    slug: 'city-fit',
    name: 'City Fit',
    address: 'Kovači 12, Sarajevo',
    latitude: 43.8526,
    longitude: 18.4018,
    phone: '+387 33 275 212',
    website: 'https://example.com/city-fit',
    instagram: '@cityfit.ba',
    photos: ['https://images.unsplash.com/...'],
    recommended: false,
    lastVerified: '2026-10-25',
    description: {
      bs: 'Udoban i pristupačan centar sa fokusom na kardio, funkcionalni trening i kondiciju.',
      en: 'A convenient and approachable gym focused on cardio, functional training, and conditioning.',
    },
    editorNote: {
      bs: 'Dobar izbor za ljude koji žele biti aktivni uz pristupačnu cijenu i dobar raspored.',
      en: 'A good fit for people who want an active routine at a fair price with friendly infrastructure.',
    },
    bestFor: ['beginners', 'students', 'budget'],
    amenities: ['cardio', 'sauna', 'lockers', 'parking'],
    prices: [
      { plan: 'month', amount: 95, currency: 'BAM', friendlyLabel: 'Mjesečno' },
      { plan: 'student_month', amount: 70, currency: 'BAM', friendlyLabel: 'Studenti' },
    ],
    openingHours: {
      monday: '06:30 - 22:00',
      tuesday: '06:30 - 22:00',
      wednesday: '06:30 - 22:00',
      thursday: '06:30 - 22:00',
      friday: '06:30 - 21:30',
      saturday: '09:00 - 18:00',
      sunday: '10:00 - 16:00',
    },
    pros: {
      bs: ['Pristupačna cijena', 'Dobra lokacija', 'Lagana atmosfera'],
      en: ['Affordable pricing', 'Easy city location', 'Friendly training atmosphere'],
    },
    cons: {
      bs: ['Manje napredne opreme', 'Manje varieteta u grupnim treninzima'],
      en: ['Less advanced equipment', 'Fewer premium classes'],
    },
  },
  {
    slug: 'harbor-strength',
    name: 'Harbor Strength',
    address: 'Maršala Tita 77, Sarajevo',
    latitude: 43.8612,
    longitude: 18.4228,
    phone: '+387 33 226 444',
    website: 'https://example.com/harbor-strength',
    instagram: '@harborstrength',
    photos: ['https://images.unsplash.com/...'],
    recommended: true,
    lastVerified: '2026-10-31',
    description: {
      bs: 'Premium fitness klub za ljude koji vole jačanje, kondiciju i personalni trening.',
      en: 'A premium fitness club for strength, conditioning and personalised training enthusiasts.',
    },
    editorNote: {
      bs: 'Vrlo dobar izbor ako tražite moderan atribut i veću dozu profesionalnog trenažnog programa.',
      en: 'A very strong option if you value a premium setup and more structured coaching.',
    },
    bestFor: ['bodybuilding', 'personal-training', 'women'],
    amenities: ['weights', 'cardio', 'sauna', 'personal-training'],
    prices: [
      { plan: 'month', amount: 150, currency: 'BAM', friendlyLabel: 'Mjesečno' },
      { plan: 'week', amount: 45, currency: 'BAM', friendlyLabel: 'Sedmično' },
      { plan: 'year', amount: 1500, currency: 'BAM', friendlyLabel: 'Godišnje' },
    ],
    openingHours: {
      monday: '06:00 - 23:00',
      tuesday: '06:00 - 23:00',
      wednesday: '06:00 - 23:00',
      thursday: '06:00 - 23:00',
      friday: '06:00 - 22:00',
      saturday: '08:00 - 18:00',
      sunday: '09:00 - 16:00',
    },
    pros: {
      bs: ['Vrlo premium atmosfera', 'Profesionalni treneri', 'Dobre javne usluge'],
      en: ['Premium atmosphere', 'Professional coaching', 'Strong service standards'],
    },
    cons: {
      bs: ['Viša cijena', 'Nešto manje pristupačna za početnike'],
      en: ['Higher monthly price', 'Less beginner-friendly budget pacing'],
    },
  },
  {
    slug: 'sundae-athletic',
    name: 'Sundae Athletic',
    address: 'Terezija 6, Sarajevo',
    latitude: 43.8607,
    longitude: 18.4281,
    phone: '+387 33 198 004',
    website: 'https://example.com/sundae-athletic',
    instagram: '@sundaeathletic',
    photos: ['https://images.unsplash.com/...'],
    recommended: true,
    lastVerified: '2026-11-02',
    description: {
      bs: 'Poludnevno fokusiran klub za kardio, hiit trening i fitnes zajednicu.',
      en: 'A community-focused club ideal for cardio, HIIT, and structured training sessions.',
    },
    editorNote: {
      bs: 'Najbolji izbor za ljude koji vole dinamičan trening i motivacijsku atmosferu.',
      en: 'Best for people who enjoy energetic sessions and a motivating community environment.',
    },
    bestFor: ['beginners', 'students', 'women'],
    amenities: ['cardio', 'group-classes', 'lockers', 'parking'],
    prices: [
      { plan: 'month', amount: 110, currency: 'BAM', friendlyLabel: 'Mjesečno' },
      { plan: 'day', amount: 25, currency: 'BAM', friendlyLabel: 'Dnevno' },
    ],
    openingHours: {
      monday: '06:00 - 22:00',
      tuesday: '06:00 - 22:00',
      wednesday: '06:00 - 22:00',
      thursday: '06:00 - 22:00',
      friday: '06:00 - 21:00',
      saturday: '09:00 - 17:00',
      sunday: '09:00 - 15:00',
    },
    pros: {
      bs: ['Dinamična atmosfera', 'Dobre grupne sesije', 'Praćenje rezultata'],
      en: ['Dynamic atmosphere', 'Good group sessions', 'Strong community energy'],
    },
    cons: {
      bs: ['Manje opreme od premium klubova', 'Kratko radno vrijeme vikendom'],
      en: ['Less equipment than premium clubs', 'Shorter weekend hours'],
    },
  },
];

export const amenities = {
  weights: { label: { bs: 'Težine', en: 'Weights' }, icon: '🏋️' },
  cardio: { label: { bs: 'Kardio', en: 'Cardio' }, icon: '🥇' },
  lockers: { label: { bs: 'Ormari', en: 'Lockers' }, icon: '🔒' },
  'group-classes': { label: { bs: 'Grupni treninzi', en: 'Group classes' }, icon: '🎯' },
  sauna: { label: { bs: 'Sauna', en: 'Sauna' }, icon: '♨️' },
  parking: { label: { bs: 'Parking', en: 'Parking' }, icon: '🚗' },
  'personal-training': { label: { bs: 'Personalni trening', en: 'Personal training' }, icon: '👟' },
};

export function findGymBySlug(slug: string): Gym | undefined {
  return gyms.find((gym) => gym.slug === slug);
}

export function getMonthlyPrice(gym: Gym): number {
  const monthOption = gym.prices.find((price) => price.plan === 'month') ?? gym.prices[0];
  return monthOption?.amount ?? 0;
}

export const defaultGymValues: Gym = {
  slug: '',
  name: '',
  address: '',
  latitude: 43.8598,
  longitude: 18.4313,
  phone: '',
  website: '',
  instagram: '',
  photos: [],
  recommended: false,
  lastVerified: new Date().toISOString().slice(0, 10),
  description: { bs: '', en: '' },
  editorNote: { bs: '', en: '' },
  bestFor: [],
  amenities: [],
  prices: [{ plan: 'month', amount: 0, currency: 'BAM', friendlyLabel: 'Mjesečno' }],
  openingHours: {
    monday: '06:00 - 22:00',
    tuesday: '06:00 - 22:00',
    wednesday: '06:00 - 22:00',
    thursday: '06:00 - 22:00',
    friday: '06:00 - 21:00',
    saturday: '09:00 - 17:00',
    sunday: '09:00 - 15:00',
  },
  pros: { bs: [], en: [] },
  cons: { bs: [], en: [] },
};
