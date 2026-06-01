import { GrainOverlay, Section } from '@/design/primitives';
import { SiteNav } from '@/components/SiteNav';
import { Footer } from '@/components/Footer';

/**
 * Shared shell for the auth routes (/signin, /signup, /reset, /reset/confirm).
 * Gives every auth page the same editorial chrome as the rest of the product
 * (background + grain, slim nav, footer) and a centred, focused form column.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative bg-background text-foreground min-h-screen flex flex-col">
      <GrainOverlay />
      <SiteNav active={null} />

      <div className="flex-1 flex flex-col">
        <Section pad="sm">
          <div className="mx-auto w-full max-w-[440px]">{children}</div>
        </Section>
      </div>

      <Footer />
    </main>
  );
}
