import { Navigation } from '@/components';
import { fetchCombinedIdeasPage, fetchCombinedCategories } from '@/lib/airtable';
import Link from 'next/link';
import Image from 'next/image';
import IdeasInfiniteLoader from '../InfiniteLoader';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function getCategoryIcon(label?: string): string {
  const CATEGORY_ICON_MAP: Record<string, string> = {
    'Feed Salone': '/images/6707c6af78a3dd5acec5512e_flower_64.webp',
    'Human Capital Development': '/images/6707c6b0778d2c6671252c5f_book_64.webp',
    'Youth Employment Scheme': '/images/6708d7e1e82809f4e18f8e05_flag_120.webp',
    'Public Service Architecture Revamp': '/images/6708d8d8f169898f7bd83ed0_heart_120.webp',
    'Tech and Infrastructure': '/images/6708d8d83911c95f3000bbfa_star_120.webp',
  };
  const FALLBACK_ICON = '/images/6708d8d8b17e6d52f343b0d3_coffee_120.webp';
  if (!label) return FALLBACK_ICON;
  return CATEGORY_ICON_MAP[label] || FALLBACK_ICON;
}

function getBackgroundForGlobalIndex(index1Based: number): string {
  const LIGHT = '#fffaf3';
  const DARK = '#f2e8dc';
  const block = Math.floor((index1Based - 1) / 4);
  const startIsLight = block % 2 === 0;
  const pos = (index1Based - 1) % 4;
  const isLight = startIsLight ? (pos % 2 === 0) : (pos % 2 === 1);
  return isLight ? LIGHT : DARK;
}

function getRotationAngleForGlobalIndex(index1Based: number): number {
  const baseAngles = [-2, 1.4, -1.2, 1.8];
  const pos = (index1Based - 1) % 4;
  const block = Math.floor((index1Based - 1) / 4);
  const angle = baseAngles[pos];
  return block % 2 === 0 ? angle : -angle;
}

export default async function CivicIdeasPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const categoriesCsv = (params?.categories as string) || '';
  const categories = categoriesCsv.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

  // Get all categories
  const allCats = await fetchCombinedCategories();

  // Filter to only civic categories (with "Salone" in the name)
  const civicCategories = allCats.filter(cat =>
    cat.includes('Salone') || cat.includes('Content')
  );

  // Fetch ideas filtered to civic categories
  const { items, offset } = await fetchCombinedIdeasPage(
    50,
    undefined,
    categories.length ? categories : civicCategories
  );

  // Extract unique civic main categories (without the track suffixes)
  const civicMainCategories = ['Love Salone', 'Heal Salone', 'Digitise Salone', 'Feed Salone', 'Clean Salone', 'Salone Big Pas We All'];

  // Build chip links: single-select (replaces current selection)
  const chipHref = (label: string, isCivicMainCategory = false): string => {
    if (label === 'All') return '/hackathon/ideas/civic';

    // For civic main categories (e.g., "Love Salone"), include all related subcategories
    if (isCivicMainCategory) {
      const relatedCategories = civicCategories.filter(cat => cat.startsWith(label));
      return `/hackathon/ideas/civic?categories=${encodeURIComponent(relatedCategories.join(','))}`;
    }

    // Single-select: clicking a subcategory shows only that category
    return `/hackathon/ideas/civic?categories=${encodeURIComponent(label)}`;
  };

  // Check if all civic categories are selected
  const isAllCivicSelected = categories.length === 0 || (categories.length === civicCategories.length);

  const initialCount = items.length;

  return (
    <div className="min-h-screen bg-[#f9f2e9]">
      <Navigation />

      <main>
        {/* Header */}
        <section className="relative z-30 w-full">
          <div className="mx-auto max-w-7xl px-4 md:px-8 py-16 md:py-20 lg:py-24">
            <h1
              className="text-center uppercase tracking-tight text-5xl md:text-6xl lg:text-7xl"
              style={{ fontFamily: 'Decoy, sans-serif', color: '#403f3e', fontWeight: 500 }}
            >
              <div>Civic</div> <div>Ideas</div>
            </h1>

            {/* Main Group Navigation */}
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/hackathon/ideas"
                className="px-6 py-2 rounded-full border-2 text-base font-semibold transition-all"
                style={{
                  borderColor: '#d8cdbc',
                  color: '#403f3e',
                  backgroundColor: '#fffaf3'
                }}
              >
                All
              </Link>
              <Link
                href="/hackathon/ideas/big5"
                className="px-6 py-2 rounded-full border-2 text-base font-semibold transition-all"
                style={{
                  borderColor: '#d8cdbc',
                  color: '#403f3e',
                  backgroundColor: '#fffaf3'
                }}
              >
                Big 5
              </Link>
              <Link
                href="/hackathon/ideas/civic"
                className="px-6 py-2 rounded-full border-2 text-base font-semibold transition-all ring-2 ring-[#d8cdbc] scale-105"
                style={{
                  borderColor: '#d8cdbc',
                  color: '#403f3e',
                  backgroundColor: '#f2e8dc'
                }}
              >
                Civic
              </Link>
            </div>

            {/* Category chips */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {/* All chip */}
              <Link
                href="/hackathon/ideas/civic"
                className={`px-3 py-1 rounded-full border text-sm font-semibold ${
                  isAllCivicSelected ? 'ring-2 ring-[#d8cdbc]' : ''
                }`}
                style={{
                  borderColor: '#d8cdbc',
                  color: '#403f3e',
                  backgroundColor: isAllCivicSelected ? '#f2e8dc' : '#fffaf3'
                }}
              >
                All
              </Link>
              {civicMainCategories.map((mainCat) => {
                // Check if this main category is selected (all its related subcategories are in the URL)
                const relatedCategories = civicCategories.filter(cat => cat.startsWith(mainCat));
                const isSelected = relatedCategories.length > 0 &&
                  relatedCategories.every(cat => categories.includes(cat)) &&
                  categories.every(cat => relatedCategories.includes(cat));

                return (
                  <Link
                    key={mainCat}
                    href={chipHref(mainCat, true)}
                    className={`px-3 py-1 rounded-full border text-sm ${isSelected ? 'ring-2 ring-[#d8cdbc]' : ''}`}
                    style={{ borderColor: '#d8cdbc', color: '#403f3e', backgroundColor: isSelected ? '#f2e8dc' : '#fffaf3' }}
                  >
                    {mainCat}
                  </Link>
                );
              })}
            </div>

            {/* Cards Grid */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 items-stretch">
              {items.map((item, idx) => (
                <Link key={item.id} href={`/hackathon/ideas/${slugify(item.title)}`} className="block">
                  <div
                    className="relative border border-[#e8ddd0] shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#d8cdbc] overflow-hidden rounded-[28px] md:rounded-[34px] lg:rounded-[38px]"
                    style={{
                      height: '400px',
                      backgroundColor: getBackgroundForGlobalIndex(idx + 1),
                      transform: `rotate(${getRotationAngleForGlobalIndex(idx + 1)}deg)`,
                      transformOrigin: 'center center',
                      willChange: 'transform',
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                        backgroundSize: '200px 200px',
                        backgroundRepeat: 'repeat',
                      }}
                    />
                    <div className="relative flex flex-col h-full px-6 pt-6 pb-6">
                      <div>
                        {item.category && (
                          <div className="mb-2 flex justify-center">
                            <span
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
                              style={{ borderColor: '#d8cdbc', color: '#403f3e', backgroundColor: 'transparent' }}
                            >
                              {item.category}
                            </span>
                          </div>
                        )}
                        <h3
                          className="text-2xl mb-3 text-center"
                          style={{ fontFamily: 'Decoy', fontWeight: 500, color: '#403f3e' }}
                        >
                          {item.title}
                        </h3>
                      </div>
                      <div className="mt-auto">
                        <div className="flex justify-center mb-2">
                          <Image
                            src={getCategoryIcon(item.category)}
                            alt={item.category ? `${item.category} icon` : 'Category icon'}
                            width={56}
                            height={56}
                            style={{ display: 'block' }}
                            loading="lazy"
                            quality={85}
                          />
                        </div>
                        <p
                          className="text-sm leading-relaxed text-center line-clamp-5"
                          style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
                        >
                          {item.blurb}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Infinite scroll loader */}
            <IdeasInfiniteLoader initialOffset={offset} initialCount={initialCount} />
          </div>
        </section>
      </main>
    </div>
  );
}
