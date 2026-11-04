import { describe, expect, it } from 'vitest';
import { mapSupabaseGym } from './supabase-repositories';

describe('Supabase gym mapping', () => {
  it('maps database records and related prices, amenities, and photos to the app model', () => {
    const gym = mapSupabaseGym({
      slug: 'example-gym',
      name: 'Example Gym',
      address: 'Example address',
      latitude: '43.85',
      longitude: '18.41',
      phone: '',
      website: '',
      instagram: '',
      recommended: false,
      description: { bs: 'Opis', en: 'Description' },
      editor_note: { bs: 'Bilješka', en: 'Note' },
      best_for: ['strength'],
      opening_hours: { monday: '08:00 - 20:00' },
      pros: { bs: ['Prednost'], en: ['Pro'] },
      cons: { bs: [], en: [] },
      last_verified: '2026-11-04',
      gym_photos: [{ storage_path: 'https://example.com/gym.jpg', sort_order: 1 }],
      gym_amenities: [{ amenity_id: 'weights' }],
      gym_prices: [{
        amount: '99.50',
        currency: 'BAM',
        plan_type: 'month',
        friendly_label: { bs: 'Mjesečno', en: 'Monthly' },
      }],
    });

    expect(gym).toMatchObject({
      slug: 'example-gym',
      latitude: 43.85,
      description: { bs: 'Opis', en: 'Description' },
      editorNote: { bs: 'Bilješka', en: 'Note' },
      photos: ['https://example.com/gym.jpg'],
      amenities: ['weights'],
      prices: [{ plan: 'month', amount: 99.5, friendlyLabel: 'Mjesečno' }],
    });
  });

  it('rejects malformed rows rather than returning an incomplete listing', () => {
    expect(() => mapSupabaseGym({ slug: 'broken' })).toThrow();
  });
});
