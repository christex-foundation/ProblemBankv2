import SignInTabs from '@/components/auth/SignInTabs';
import { getConfiguredProviders } from '@/lib/auth-providers';

export default function SignInPage() {
  const providers = getConfiguredProviders();
  return <SignInTabs providers={providers} />;
}
