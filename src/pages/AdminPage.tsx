import { useTranslation } from 'react-i18next';

export function AdminPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="border border-stone-300 bg-white p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Admin</p>
        <h1 className="mt-4 text-4xl font-semibold text-stone-900">{t('admin.title')}</h1>
        <p className="mt-4 max-w-2xl text-stone-700">{t('admin.description')}</p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="border border-stone-300 bg-stone-50 p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-stone-500">Gyms</p>
            <p className="mt-4 text-3xl font-semibold text-stone-900">12</p>
          </div>
          <div className="border border-stone-300 bg-stone-50 p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-stone-500">Price updates</p>
            <p className="mt-4 text-3xl font-semibold text-stone-900">6</p>
          </div>
          <div className="border border-stone-300 bg-stone-50 p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-stone-500">Verified today</p>
            <p className="mt-4 text-3xl font-semibold text-stone-900">3</p>
          </div>
        </div>
      </section>
    </div>
  );
}
