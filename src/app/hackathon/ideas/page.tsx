import { Navigation } from '@/components';
import { fetchCombinedIdeasPage, fetchCombinedCategories } from '@/lib/airtable';
import Link from 'next/link';
import Image from 'next/image';
import IdeasInfiniteLoader from './InfiniteLoader';

// Category captions mapping
const CATEGORY_CAPTIONS: Record<string, string> = {
  'All': '',
  'Feed Salone': 'This initiative aims to revolutionize Sierra Leone\'s agricultural sector by leveraging AI and other technologies to boost food security, increase production, and build resilience against climate change.',
  'Human Capital Development': 'By leveraging inclusive educational technology (EdTech), this initiative is empowering Sierra Leoneans with the skills needed to thrive in the digital age, ensuring a competitive and future-ready workforce.',
  'Youth Employment Scheme': 'The YES! initiative aims to combat youth unemployment by fostering the gig economy and building robust digital employment platforms to connect young Sierra Leoneans with local and global opportunities.',
  'Public Service Architecture Revamp': 'Centered on the comprehensive reform of public administration, this initiative establishes a new standard of governance through digital transformation. The core objective is to improve the citizen-government relationship by implementing a secure Digital ID system, creating a foundation for efficient and transparent services.',
  'Tech and Infrastructure': 'As the enabling pillar for all national priorities, this initiative is dedicated to developing a resilient and scalable digital infrastructure. The strategy involves implementing blockchain technology to guarantee transparency and applying AI to optimize efficiency, creating a secure foundation for a modern, digital-first economy.',
};

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

// Compute background color in blocks of four, alternating block start color
function getBackgroundForGlobalIndex(index1Based: number): string {
  const LIGHT = '#fffaf3';
  const DARK = '#f2e8dc';
  const block = Math.floor((index1Based - 1) / 4); // 0-based block
  const startIsLight = block % 2 === 0; // even block starts light, odd block starts dark
  const pos = (index1Based - 1) % 4; // position within block 0..3
  const isLight = startIsLight ? (pos % 2 === 0) : (pos % 2 === 1);
  return isLight ? LIGHT : DARK;
}

// Compute rotation angle per global index with block-wise sign alternation
function getRotationAngleForGlobalIndex(index1Based: number): number {
  const baseAngles = [-2, 1.4, -1.2, 1.8];
  const pos = (index1Based - 1) % 4;
  const block = Math.floor((index1Based - 1) / 4);
  const angle = baseAngles[pos];
  return block % 2 === 0 ? angle : -angle;
}

export default async function IdeasPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const categoriesCsv = (params?.categories as string) || '';
  const categories = categoriesCsv.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

  // Server-side rendering: fetch first page with filters from BOTH bases
  // Fetch more items initially to show all available ideas (we have ~30 total)
  const { items, offset } = await fetchCombinedIdeasPage(50, undefined, categories.length ? categories : undefined);

  // Dynamic chips from Airtable - combined from both bases
  const allCats = await fetchCombinedCategories();

  // Separate categories into Big 5 and Civic
  const big5Categories = allCats.filter(cat =>
    ['Human Capital Development', 'Youth Employment Scheme', 'Public Service Architecture Revamp', 'Tech and Infrastructure'].includes(cat)
  );

  // Extract unique civic main categories (without the track suffixes)
  const civicMainCategories = ['Love Salone', 'Heal Salone', 'Digitise Salone', 'Feed Salone', 'Clean Salone', 'Salone Big Pas We All'];

  // Get all civic subcategories (with track suffixes)
  const civicCategories = allCats.filter(cat =>
    cat.includes('Salone') || cat.includes('Content')
  );

  // Detect which group is active based on selected categories
  const isBig5Active = categories.length > 0 && categories.every(cat => big5Categories.includes(cat));
  const isCivicActive = categories.length > 0 && categories.every(cat => civicCategories.includes(cat));
  const isAllActive = categories.length === 0;

  // Check if "All Big 5" or "All Civic" should be selected (when all subcategories of that group are selected)
  const isAllBig5Selected = isBig5Active && categories.length === big5Categories.length;
  const isAllCivicSelected = isCivicActive && categories.length === civicCategories.length;

  // active map for highlighting
  const active = new Set(categories);

  // Build chip links: single-select (replaces current selection)
  const chipHref = (label: string, isCivicMainCategory = false): string => {
    if (label === 'All') return '/hackathon/ideas';

    // For civic main categories (e.g., "Love Salone"), include all related subcategories
    if (isCivicMainCategory) {
      const relatedCategories = civicCategories.filter(cat => cat.startsWith(label));
      return `/ideas?categories=${encodeURIComponent(relatedCategories.join(','))}`;
    }

    // Single-select: clicking a subcategory shows only that category
    return `/ideas?categories=${encodeURIComponent(label)}`;
  };

  // Group link builder
  const groupHref = (groupName: string): string => {
    if (groupName === 'all') return '/hackathon/ideas';
    if (groupName === 'big5') {
      return '/hackathon/ideas/big5';
    }
    if (groupName === 'civic') {
      return '/hackathon/ideas/civic';
    }
    return '/hackathon/ideas';
  };

  // SSR global index starts at 1 for the first item on a filtered page
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
              <div>All</div> <div>Ideas</div>
            </h1>

            {/* Main Group Navigation */}
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/hackathon/ideas"
                className={`px-6 py-2 rounded-full border-2 text-base font-semibold transition-all ${
                  isAllActive ? 'ring-2 ring-[#d8cdbc] scale-105' : ''
                }`}
                style={{
                  borderColor: '#d8cdbc',
                  color: '#403f3e',
                  backgroundColor: isAllActive ? '#f2e8dc' : '#fffaf3'
                }}
              >
                All
              </Link>
              <Link
                href={groupHref('big5')}
                className={`px-6 py-2 rounded-full border-2 text-base font-semibold transition-all ${
                  isBig5Active ? 'ring-2 ring-[#d8cdbc] scale-105' : ''
                }`}
                style={{
                  borderColor: '#d8cdbc',
                  color: '#403f3e',
                  backgroundColor: isBig5Active ? '#f2e8dc' : '#fffaf3'
                }}
              >
                Big 5
              </Link>
              <Link
                href={groupHref('civic')}
                className={`px-6 py-2 rounded-full border-2 text-base font-semibold transition-all ${
                  isCivicActive ? 'ring-2 ring-[#d8cdbc] scale-105' : ''
                }`}
                style={{
                  borderColor: '#d8cdbc',
                  color: '#403f3e',
                  backgroundColor: isCivicActive ? '#f2e8dc' : '#fffaf3'
                }}
              >
                Civic
              </Link>
            </div>

            {/* Subcategory chips - show Big 5 subcategories when Big 5 is active */}
            {isBig5Active && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {/* All chip */}
                <Link
                  href={groupHref('big5')}
                  className={`px-3 py-1 rounded-full border text-sm font-semibold ${
                    isAllBig5Selected ? 'ring-2 ring-[#d8cdbc]' : ''
                  }`}
                  style={{
                    borderColor: '#d8cdbc',
                    color: '#403f3e',
                    backgroundColor: isAllBig5Selected ? '#f2e8dc' : '#fffaf3'
                  }}
                >
                  All
                </Link>
                {big5Categories.map((label) => {
                  const isSelected = categories.length === 1 && categories[0] === label;
                  return (
                    <Link
                      key={label}
                      href={chipHref(label)}
                      className={`px-3 py-1 rounded-full border text-sm ${isSelected ? 'ring-2 ring-[#d8cdbc]' : ''}`}
                      style={{ borderColor: '#d8cdbc', color: '#403f3e', backgroundColor: isSelected ? '#f2e8dc' : '#fffaf3' }}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Subcategory chips - show Civic subcategories when Civic is active */}
            {isCivicActive && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {/* All chip */}
                <Link
                  href={groupHref('civic')}
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
            )}

            {/* Category Caption */}
            {(categories.length > 0 || active.size === 0) && (
              <div className="mt-6 text-center max-w-2xl mx-auto">
                <p
                  className="text-lg md:text-xl"
                  style={{
                    fontFamily: 'Raleway, sans-serif',
                    color: '#403f3e',
                    fontStyle: 'italic'
                  }}
                >
                  {categories.length === 0
                    ? CATEGORY_CAPTIONS['All']
                    : categories.length === 1
                      ? CATEGORY_CAPTIONS[categories[0]]
                      : CATEGORY_CAPTIONS['All']
                  }
                </p>
              </div>
            )}

            {/* Cards Grid - reuse featured card design */}
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

            {/* Infinite scroll loader; pass offset and SSR count */}
            <IdeasInfiniteLoader initialOffset={offset} initialCount={initialCount} />
          </div>
        </section>
      </main>
    </div>
  );
}