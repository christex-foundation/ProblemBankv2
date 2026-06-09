import { ButtonLink } from '@/design/primitives';
import { Eyebrow } from '@/design/typography';

export default function NotFound() {
  return (
    <main className="max-w-md mx-auto py-24 px-4 text-center">
      <Eyebrow tone="accent" align="center" className="mb-2">404</Eyebrow>
      <h1 className="text-2xl font-bold mb-3">Page not found</h1>
      <p className="text-foreground/60 mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3 justify-center">
        <ButtonLink href="/" variant="primary" size="sm">
          Problem Bank home
        </ButtonLink>
      </div>
    </main>
  );
}
