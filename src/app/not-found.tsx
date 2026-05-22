import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="max-w-md mx-auto py-24 px-4 text-center">
      <p className="text-sm font-medium text-gray-500 mb-2">404</p>
      <h1 className="text-2xl font-bold mb-3">Page not found</h1>
      <p className="text-gray-600 mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3 justify-center text-sm">
        <Link href="/" className="bg-black text-white rounded px-4 py-2">
          Problem Bank home
        </Link>
        <Link href="/feed" className="border rounded px-4 py-2">
          Community feed
        </Link>
      </div>
    </main>
  );
}
