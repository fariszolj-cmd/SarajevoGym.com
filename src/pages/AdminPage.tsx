import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { defaultGymValues } from '@/features/gyms/data';
import { readGyms, removeGym, upsertGym } from '@/features/gyms/repository';
import { gymSchema } from '@/features/gyms/schema';
import type { Gym } from '@/features/gyms/types';

const emptyForm = {
  ...defaultGymValues,
  bestForText: '',
  amenitiesText: '',
  prosBsText: '',
  prosEnText: '',
  consBsText: '',
  consEnText: '',
  priceAmount: '120',
  priceLabel: 'Mjesečno',
};

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function AdminPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const currentGyms = readGyms();

  const updateField = (field: string, value: unknown) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const loadGym = (gym: Gym) => {
    setSelectedSlug(gym.slug);
    setForm({
      ...defaultGymValues,
      ...gym,
      slug: gym.slug,
      bestForText: gym.bestFor.join(', '),
      amenitiesText: gym.amenities.join(', '),
      prosBsText: gym.pros.bs.join(', '),
      prosEnText: gym.pros.en.join(', '),
      consBsText: gym.cons.bs.join(', '),
      consEnText: gym.cons.en.join(', '),
      priceAmount: String(gym.prices[0]?.amount ?? 0),
      priceLabel: gym.prices[0]?.friendlyLabel ?? 'Mjesečno',
    });
  };

  const resetForm = () => {
    setSelectedSlug(null);
    setForm(emptyForm);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const nextGym: Gym = {
      ...defaultGymValues,
      ...form,
      slug: form.slug || slugify(form.name),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      phone: form.phone,
      website: form.website,
      instagram: form.instagram,
      bestFor: parseList(form.bestForText),
      amenities: parseList(form.amenitiesText),
      prices: [
        {
          plan: 'month',
          amount: Number(form.priceAmount) || 0,
          currency: 'BAM',
          friendlyLabel: form.priceLabel || 'Mjesečno',
        },
      ],
      pros: {
        bs: parseList(form.prosBsText),
        en: parseList(form.prosEnText),
      },
      cons: {
        bs: parseList(form.consBsText),
        en: parseList(form.consEnText),
      },
      description: {
        bs: form.description.bs,
        en: form.description.en,
      },
      editorNote: {
        bs: form.editorNote.bs,
        en: form.editorNote.en,
      },
      photos: form.photos,
      openingHours: form.openingHours,
      recommended: form.recommended,
      lastVerified: form.lastVerified,
    };

    const parsed = gymSchema.safeParse(nextGym);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'The gym details are invalid.';
      setError(message);
      return;
    }

    upsertGym(parsed.data);
    setSuccess('Gym saved successfully.');
    resetForm();
  };

  const handleDelete = (slug: string) => {
    removeGym(slug);
    if (selectedSlug === slug) {
      resetForm();
    }
    setSuccess('Gym removed.');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 border border-stone-300 bg-white p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Admin</p>
        <h1 className="mt-4 text-4xl font-semibold text-stone-900">{t('admin.title')}</h1>
        <p className="mt-4 max-w-2xl text-stone-700">{t('admin.description')}</p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.4fr]">
        <aside className="border border-stone-300 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold text-stone-900">Saved gyms</h2>
          <div className="space-y-3">
            {currentGyms.map((gym) => (
              <div key={gym.slug} className="flex items-center justify-between border border-stone-200 p-3">
                <button type="button" onClick={() => loadGym(gym)} className="text-left text-sm font-medium text-stone-800">
                  {gym.name}
                </button>
                <button type="button" onClick={() => handleDelete(gym.slug)} className="text-xs uppercase tracking-[0.12em] text-red-700">
                  Delete
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={resetForm} className="mt-5 border border-stone-300 px-4 py-2 text-sm uppercase tracking-[0.12em] text-stone-800">
            New gym
          </button>
        </aside>

        <form onSubmit={handleSubmit} className="space-y-6 border border-stone-300 bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>Name</span>
              <input value={form.name} onChange={(event) => updateField('name', event.target.value)} className="border border-stone-300 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>Slug</span>
              <input value={form.slug} onChange={(event) => updateField('slug', event.target.value)} className="border border-stone-300 px-3 py-2" />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>Address</span>
            <input value={form.address} onChange={(event) => updateField('address', event.target.value)} className="border border-stone-300 px-3 py-2" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>Latitude</span>
              <input type="number" step="0.0001" value={form.latitude} onChange={(event) => updateField('latitude', Number(event.target.value))} className="border border-stone-300 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>Longitude</span>
              <input type="number" step="0.0001" value={form.longitude} onChange={(event) => updateField('longitude', Number(event.target.value))} className="border border-stone-300 px-3 py-2" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>Phone</span>
              <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} className="border border-stone-300 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>Instagram</span>
              <input value={form.instagram} onChange={(event) => updateField('instagram', event.target.value)} className="border border-stone-300 px-3 py-2" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>Website</span>
              <input value={form.website} onChange={(event) => updateField('website', event.target.value)} className="border border-stone-300 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>Last verified</span>
              <input type="date" value={form.lastVerified} onChange={(event) => updateField('lastVerified', event.target.value)} className="border border-stone-300 px-3 py-2" />
            </label>
          </div>

          <label className="flex items-center gap-3 text-sm text-stone-700">
            <input type="checkbox" checked={form.recommended} onChange={(event) => updateField('recommended', event.target.checked)} className="h-4 w-4 accent-[#d97706]" />
            Recommended gym
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>Best for tags</span>
              <input value={form.bestForText} onChange={(event) => updateField('bestForText', event.target.value)} className="border border-stone-300 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>Amenities</span>
              <input value={form.amenitiesText} onChange={(event) => updateField('amenitiesText', event.target.value)} className="border border-stone-300 px-3 py-2" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>Monthly price</span>
              <input type="number" min="0" value={form.priceAmount} onChange={(event) => updateField('priceAmount', event.target.value)} className="border border-stone-300 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>Price label</span>
              <input value={form.priceLabel} onChange={(event) => updateField('priceLabel', event.target.value)} className="border border-stone-300 px-3 py-2" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>BS description</span>
              <textarea value={form.description.bs} onChange={(event) => updateField('description', { ...form.description, bs: event.target.value })} className="min-h-28 border border-stone-300 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>EN description</span>
              <textarea value={form.description.en} onChange={(event) => updateField('description', { ...form.description, en: event.target.value })} className="min-h-28 border border-stone-300 px-3 py-2" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>BS editor note</span>
              <textarea value={form.editorNote.bs} onChange={(event) => updateField('editorNote', { ...form.editorNote, bs: event.target.value })} className="min-h-24 border border-stone-300 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>EN editor note</span>
              <textarea value={form.editorNote.en} onChange={(event) => updateField('editorNote', { ...form.editorNote, en: event.target.value })} className="min-h-24 border border-stone-300 px-3 py-2" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>Pros (BS)</span>
              <textarea value={form.prosBsText} onChange={(event) => updateField('prosBsText', event.target.value)} className="min-h-24 border border-stone-300 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>Pros (EN)</span>
              <textarea value={form.prosEnText} onChange={(event) => updateField('prosEnText', event.target.value)} className="min-h-24 border border-stone-300 px-3 py-2" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>Cons (BS)</span>
              <textarea value={form.consBsText} onChange={(event) => updateField('consBsText', event.target.value)} className="min-h-24 border border-stone-300 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span>Cons (EN)</span>
              <textarea value={form.consEnText} onChange={(event) => updateField('consEnText', event.target.value)} className="min-h-24 border border-stone-300 px-3 py-2" />
            </label>
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {success ? <p className="text-sm text-green-700">{success}</p> : null}

          <div className="flex gap-3">
            <button type="submit" className="bg-[#171717] px-4 py-3 text-sm uppercase tracking-[0.12em] text-stone-50">
              {selectedSlug ? 'Save changes' : 'Create gym'}
            </button>
            <button type="button" onClick={resetForm} className="border border-stone-300 px-4 py-3 text-sm uppercase tracking-[0.12em] text-stone-800">
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
