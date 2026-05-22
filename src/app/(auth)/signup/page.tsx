import SignUpTabs from '@/components/auth/SignUpTabs';
import { getConfiguredProviders } from '@/lib/auth-providers';

export default function SignUpPage() {
  const providers = getConfiguredProviders();
  return <SignUpTabs providers={providers} />;
}
