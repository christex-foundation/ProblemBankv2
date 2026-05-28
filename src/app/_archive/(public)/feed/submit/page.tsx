import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import SubmissionForm from '@/components/feed/SubmissionForm';

export const dynamic = 'force-dynamic';

export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/signin?callbackUrl=/feed/submit');
  }
  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2">Submit a Problem</h1>
      <p className="text-sm text-gray-600 mb-6">
        Raise something you experience in Sierra Leone and suggest what could be done. The
        community votes and the most-felt problems inform what Christex Foundation researches next.
      </p>
      <SubmissionForm />
    </main>
  );
}
