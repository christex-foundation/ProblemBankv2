import { Navigation } from '@/components';
import { fetchIdeaBySlug, fetchAllIdeasMinimal } from '@/lib/airtable';
import IdeaSidebar from '@/components/IdeaSidebar';
import BuildersKitsClient from '@/components/BuildersKitsClient';
import GitHubRepoCard from '@/components/GitHubRepoCard';
import IdeaBottomNav from '@/components/IdeaBottomNav';

export default async function IdeaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idea = await fetchIdeaBySlug(slug);

  // Determine if this is a content track idea (no tools/builder kits needed)
  // Content track ideas are identified by specific category names
  const contentTrackCategories = [
    'Love Salone - Content Track',
    'Feed Salone - Content Track',
    'Clean Salone - Content Track',
    'Heal Salone - Content Track',
    'Digitise Salone - Content Track',
    'Salone Big Pas We All Content'
  ];
  const isContentTrack = idea?.category && contentTrackCategories.includes(idea.category);

  // Determine if this is a civic idea (for navigation purposes)
  const isCivicIdea = !!(idea?.category && (
    idea.category.includes('Salone') ||
    idea.category.includes('Content')
  ));

  // Determine if this is a Big 5 idea
  const big5Categories = [
    'Human Capital Development',
    'Youth Employment Scheme',
    'Public Service Architecture Revamp',
    'Tech and Infrastructure'
  ];
  const isBig5Idea = !!(idea?.category && big5Categories.includes(idea.category));

  // Fetch all ideas for navigation
  const allIdeas = await fetchAllIdeasMinimal();
  const currentIndex = allIdeas.findIndex(item => item.slug === slug);

  // Calculate previous and next ideas with circular navigation
  const previousIdea = currentIndex > 0 ? allIdeas[currentIndex - 1] :
                      allIdeas.length > 1 ? allIdeas[allIdeas.length - 1] : null;
  const nextIdea = currentIndex < allIdeas.length - 1 ? allIdeas[currentIndex + 1] :
                   allIdeas.length > 1 ? allIdeas[0] : null;

  return (
    <div className="min-h-screen bg-[#f9f2e9] pb-16">
      <Navigation />
      <main>
        {!idea ? (
          <section className="relative z-30 w-full">
            <div className="mx-auto max-w-3xl px-4 md:px-8 py-16 md:py-20 lg:py-24">
              <div className="text-center">
                <h1 className="text-3xl" style={{ fontFamily: 'Decoy, sans-serif', color: '#403f3e', fontWeight: 500 }}>
                  Idea not found
                </h1>
                <p className="mt-2" style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}>
                  We couldn&apos;t locate that idea. Try navigating back to the ideas list.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Two-column section: Main content + Sidebar */}
            <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-16 md:py-20 lg:py-24">
              <div className={`grid grid-cols-1 ${!isContentTrack || idea.repo ? 'lg:grid-cols-3' : ''} gap-8 lg:gap-12`}>
                {/* Main Content - Left Column */}
                <div className={!isContentTrack || idea.repo ? 'lg:col-span-2' : ''}>
                  <div className="mb-12 text-center lg:text-left">
                    <h1 className="uppercase tracking-tight text-5xl md:text-6xl lg:text-7xl text-center lg:text-left"
                        style={{ fontFamily: 'Decoy, sans-serif', color: '#403f3e', fontWeight: 500 }}>
                      {idea.title}
                    </h1>
                    {idea.category && (
                      <div className="mt-4 text-center lg:text-left">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
                              style={{ borderColor: '#d8cdbc', color: '#403f3e', backgroundColor: 'transparent' }}>
                          {idea.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Problem & Proposed Solution sections */}
                  {idea.problem && typeof idea.problem === 'string' && idea.problem.trim().length > 0 && (
                    <section className="mt-10 text-center lg:text-left">
                      <h2 className="text-3xl md:text-4xl text-center lg:text-left" style={{ fontFamily: 'Decoy, sans-serif', color: '#403f3e', fontWeight: 500 }}>
                        The Problem
                      </h2>
                      <p className="mt-3 text-lg leading-relaxed max-w-3xl text-center lg:text-left" style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}>
                        {idea.problem}
                      </p>
                    </section>
                  )}

                  {(() => {
                    const s = typeof idea.solution === 'string' ? idea.solution.trim() : '';
                    const b = typeof idea.blurb === 'string' ? idea.blurb.trim() : '';
                    const solutionText = s.length > 0 ? s : b;
                    return solutionText.length > 0 ? (
                      <section className="mt-10 text-center lg:text-left">
                        <h2 className="text-3xl md:text-4xl text-center lg:text-left" style={{ fontFamily: 'Decoy, sans-serif', color: '#403f3e', fontWeight: 500 }}>
                          Proposed Solution
                        </h2>
                        <p className="mt-3 text-lg leading-relaxed max-w-3xl text-center lg:text-left" style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}>
                          {solutionText}
                        </p>
                      </section>
                    ) : null;
                  })()}
                </div>

                {/* Sidebar - Right Column */}
                {!isContentTrack ? (
                  // For Big5 and Tech track: Show full sidebar with tools
                  <div className="lg:col-span-1">
                    <IdeaSidebar
                      category={idea.category}
                      problemText={idea.problem}
                      solutionText={idea.solution || idea.blurb}
                      repo={idea.repo}
                      ideaTitle={idea.title}
                    />
                  </div>
                ) : (
                  // For Content track: Only show GitHub repo if available
                  idea.repo && (
                    <div className="lg:col-span-1">
                      <GitHubRepoCard repoUrl={idea.repo} index={0} />
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Full-width Builder's Kits Section - Only for Big5 and Tech track */}
            {!isContentTrack && (() => {
              const s = typeof idea.solution === 'string' ? idea.solution.trim() : '';
              const b = typeof idea.blurb === 'string' ? idea.blurb.trim() : '';
              const solutionText = s.length > 0 ? s : b;
              const problemText = typeof idea.problem === 'string' && idea.problem.trim().length > 0 ? idea.problem.trim() : idea.title;
              return solutionText.length > 0 ? (
                <section className="relative z-30 w-full -mt-16">
                  <div className="mx-auto max-w-7xl px-4 md:px-8 py-10 md:py-14 lg:py-16">
                    <BuildersKitsClient
                      problemText={problemText}
                      solutionText={solutionText}
                      defaultBusinessName={idea.title}
                      category={idea.category || null}
                    />
                  </div>
                </section>
              ) : null;
            })()}
          </>
        )}
      </main>
      
      {/* Bottom Navigation */}
      <IdeaBottomNav
        previousIdea={previousIdea}
        nextIdea={nextIdea}
        isCivicIdea={isCivicIdea}
        isBig5Idea={isBig5Idea}
      />
    </div>
  );
}