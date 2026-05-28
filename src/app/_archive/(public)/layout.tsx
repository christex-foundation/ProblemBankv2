import ProblemBankNav from '@/components/ProblemBankNav';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProblemBankNav />
      {children}
    </>
  );
}
