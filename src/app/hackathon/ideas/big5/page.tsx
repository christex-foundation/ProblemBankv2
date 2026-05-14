import { redirect } from 'next/navigation';

export default async function Big5IdeasPage() {
  // Redirect to /ideas with Big 5 categories filter
  const big5Categories = [
    'Human Capital Development',
    'Youth Employment Scheme',
    'Public Service Architecture Revamp',
    'Tech and Infrastructure'
  ];

  redirect(`/hackathon/ideas?categories=${encodeURIComponent(big5Categories.join(','))}`);
}
