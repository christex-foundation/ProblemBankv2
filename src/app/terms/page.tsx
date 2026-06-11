/* ──────────────────────────────────────────────────────────────────────────
 * DRAFT — placeholder legal copy, NOT reviewed by counsel.
 * The Terms of Use and Privacy Policy text below is on-brand boilerplate to
 * stand up the page and fix the dead Footer link. It must be reviewed and
 * adjusted by a qualified lawyer before public launch. This is not legal advice.
 * ────────────────────────────────────────────────────────────────────────── */

import type { Metadata } from 'next';
import Link from 'next/link';

import { Section, Container, RuleLine } from '@/design/primitives';
import { Eyebrow, Heading, Body, Lede } from '@/design/typography';
import { Reveal } from '@/design/motion';
import { SiteNav } from '@/components/SiteNav';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms & Privacy · Problem Bank',
  description:
    'Terms of use and privacy policy for Problem Bank by Christex Foundation.',
};

// Hardcoded so the legal document carries a fixed effective date rather than
// being stamped with whatever date it happens to be rendered on.
const LAST_UPDATED = '11 June 2026';

const CONTACT_EMAIL = 'hello@christex.foundation';

type Block = { heading: string; paras: string[] };
type Part = { id: string; eyebrow: string; title: string; intro: string; blocks: Block[] };

const SECTIONS: Part[] = [
  {
    id: 'terms',
    eyebrow: 'Part I',
    title: 'Terms of Use',
    intro:
      'These terms govern your use of Problem Bank. By accessing or using the site, you agree to them.',
    blocks: [
      {
        heading: 'Acceptance of these terms',
        paras: [
          'Problem Bank is operated by Christex Foundation. By accessing or using the site, creating an account, or submitting content, you agree to be bound by these Terms of Use and by the Privacy Policy below. If you do not agree, please do not use the site.',
          'If you use Problem Bank on behalf of an organisation, you represent that you are authorised to accept these terms on its behalf.',
        ],
      },
      {
        heading: 'About Problem Bank',
        paras: [
          "Problem Bank is a research-backed library of Sierra Leone's unsolved problems, sourced, studied, and documented by Christex Foundation. It exists to inform builders, partners, and investors and to help connect them around real, well-defined problems.",
          'We may add, change, or remove features at any time. We may also limit, suspend, or discontinue all or part of the service.',
        ],
      },
      {
        heading: 'Accounts & eligibility',
        paras: [
          'Some features require an account. You agree to provide accurate information, to keep your credentials secure, and to be responsible for activity that occurs under your account. Notify us promptly of any unauthorised use.',
          'You must be old enough to form a binding contract in your jurisdiction to create an account. If you are under the age of majority, you may use Problem Bank only with the involvement of a parent or guardian.',
        ],
      },
      {
        heading: 'Acceptable use',
        paras: [
          'You agree not to misuse Problem Bank. In particular, you will not: post unlawful, misleading, defamatory, or infringing content; harass or impersonate others; attempt to gain unauthorised access to the site or its systems; scrape, overload, or disrupt the service; or use it to violate the rights of others or any applicable law.',
          'We may remove content or suspend accounts that we reasonably believe breach these terms, without prior notice.',
        ],
      },
      {
        heading: 'Your submissions & content licence',
        paras: [
          'Problem Bank lets you submit problems, comments, profile details, and other contributions ("submissions"). You retain ownership of your submissions.',
          'By submitting content, you grant Christex Foundation a worldwide, non-exclusive, royalty-free licence to host, store, reproduce, adapt for display, publish, and distribute that content in connection with operating and promoting Problem Bank. You represent that you have the rights necessary to grant this licence and that your submissions do not infringe the rights of any third party.',
        ],
      },
      {
        heading: 'Intellectual property',
        paras: [
          'Except for user submissions, the Problem Bank name, branding, design, text, and software are owned by or licensed to Christex Foundation and are protected by intellectual-property laws. You may not copy, modify, or create derivative works from them except as permitted by these terms or by law.',
        ],
      },
      {
        heading: 'Third-party links',
        paras: [
          'Problem Bank may link to third-party sites, profiles, or resources that we do not control. We are not responsible for their content, policies, or practices, and including a link does not imply endorsement.',
        ],
      },
      {
        heading: 'Disclaimers',
        paras: [
          'Problem Bank, including its research and library content, is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied, including fitness for a particular purpose and non-infringement. We do not warrant that the content is complete, accurate, or up to date, or that the service will be uninterrupted or error-free. Nothing on the site constitutes professional, financial, or legal advice.',
        ],
      },
      {
        heading: 'Limitation of liability',
        paras: [
          'To the fullest extent permitted by law, Christex Foundation and its contributors will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of data, revenue, or goodwill, arising out of or in connection with your use of Problem Bank.',
        ],
      },
      {
        heading: 'Changes to these terms',
        paras: [
          'We may update these terms from time to time. When we do, we will revise the "last updated" date above. Material changes may be highlighted on the site. Your continued use after changes take effect constitutes acceptance of the revised terms.',
        ],
      },
      {
        heading: 'Governing law',
        paras: [
          'These terms are governed by the laws of Sierra Leone, without regard to its conflict-of-laws rules. The courts of Sierra Leone will have jurisdiction over any dispute arising from these terms or your use of Problem Bank.',
        ],
      },
      {
        heading: 'Contact',
        paras: [
          `Questions about these terms? Write to us at ${CONTACT_EMAIL}.`,
        ],
      },
    ],
  },
  {
    id: 'privacy',
    eyebrow: 'Part II',
    title: 'Privacy Policy',
    intro:
      'This policy explains what information Problem Bank collects, how we use it, and the choices you have.',
    blocks: [
      {
        heading: 'Information we collect',
        paras: [
          'Account information: when you create an account, we collect details such as your name, email address, and the credentials or third-party sign-in identifiers you choose.',
          'Content you provide: the problems, comments, profile details, and other submissions you contribute, along with any information you include in them.',
          'Usage information: basic technical data such as your device and browser type, pages viewed, and approximate location derived from your IP address, collected to operate and improve the service.',
        ],
      },
      {
        heading: 'How we use information',
        paras: [
          'We use the information we collect to provide and maintain Problem Bank; to create and manage your account; to display your submissions; to communicate with you about the service; to keep the site secure and prevent abuse; to understand how the library is used and improve it; and to comply with our legal obligations.',
        ],
      },
      {
        heading: 'Sharing of information',
        paras: [
          'We do not sell your personal information. We may share it with service providers who help us operate Problem Bank (for example hosting and infrastructure providers), bound by confidentiality obligations; with other users where you choose to make content public, such as published submissions or profile details; and where required by law or to protect the rights, safety, and property of Christex Foundation and others.',
        ],
      },
      {
        heading: 'Cookies & analytics',
        paras: [
          'Problem Bank uses cookies and similar technologies to keep you signed in, remember your preferences, and understand how the site is used. You can control cookies through your browser settings, though disabling them may affect some features.',
        ],
      },
      {
        heading: 'Data retention',
        paras: [
          'We keep personal information for as long as your account is active or as needed to provide the service, and afterwards as required to comply with our legal obligations, resolve disputes, and enforce our agreements. Published submissions may remain visible after an account is closed unless you ask us to remove them.',
        ],
      },
      {
        heading: 'Your rights & choices',
        paras: [
          'Depending on your location, you may have the right to access, correct, export, or delete your personal information, and to object to or restrict certain processing. You can update much of your information directly in your account, or contact us to make a request. We will respond in line with applicable law.',
        ],
      },
      {
        heading: 'Security',
        paras: [
          'We take reasonable technical and organisational measures to protect personal information against loss, misuse, and unauthorised access. No method of transmission or storage is completely secure, however, and we cannot guarantee absolute security.',
        ],
      },
      {
        heading: "Children's privacy",
        paras: [
          'Problem Bank is not directed to children, and we do not knowingly collect personal information from children below the age of majority without appropriate consent. If you believe a child has provided us with personal information, please contact us so we can remove it.',
        ],
      },
      {
        heading: 'Changes to this policy',
        paras: [
          'We may update this Privacy Policy from time to time. When we do, we will revise the "last updated" date above and, where appropriate, notify you. Your continued use of Problem Bank after changes take effect constitutes acceptance of the revised policy.',
        ],
      },
      {
        heading: 'Contact',
        paras: [
          `Questions about your privacy or this policy? Write to us at ${CONTACT_EMAIL}.`,
        ],
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="relative bg-background text-foreground min-h-screen flex flex-col">
      <SiteNav />

      <article className="flex-1">
        {/* Hero */}
        <Section pad="sm">
          <Container size="narrow">
            <Reveal>
              <Eyebrow tone="accent" className="mb-5">
                Legal
              </Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <Heading level={1} size="h1">
                Terms &amp; Privacy
              </Heading>
            </Reveal>
            <Reveal delay={160}>
              <Body tone="muted" size="sm" className="mt-6 uppercase tracking-[0.22em]">
                Last updated: {LAST_UPDATED}
              </Body>
            </Reveal>
            <Reveal delay={220}>
              <Lede tone="muted" className="mt-8">
                These terms and this privacy policy explain how Problem Bank works, what
                you agree to when you use it, and how Christex Foundation handles your
                information.
              </Lede>
            </Reveal>

            {/* In-page anchor nav */}
            <Reveal delay={280}>
              <nav
                aria-label="On this page"
                className="mt-10 flex flex-wrap gap-x-8 gap-y-2"
              >
                {SECTIONS.map((part) => (
                  <Link
                    key={part.id}
                    href={`#${part.id}`}
                    className="text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground/55 hover:text-accent transition-soft link-underline"
                  >
                    {part.title}
                  </Link>
                ))}
              </nav>
            </Reveal>
          </Container>
        </Section>

        {/* Body */}
        <Section pad="md" className="pt-0">
          <Container size="narrow">
            {SECTIONS.map((part, partIndex) => (
              <section key={part.id} id={part.id} className="scroll-mt-28">
                {partIndex > 0 && <RuleLine className="mb-[10vh]" />}

                <Reveal>
                  <Eyebrow tone="accent" className="mb-4">
                    {part.eyebrow}
                  </Eyebrow>
                  <Heading level={2} size="h2">
                    {part.title}
                  </Heading>
                  <Lede tone="muted" className="mt-6">
                    {part.intro}
                  </Lede>
                </Reveal>

                <div className="mt-12 flex flex-col gap-10">
                  {part.blocks.map((block) => (
                    <Reveal key={block.heading}>
                      <Heading level={3} size="h3" className="mb-4">
                        {block.heading}
                      </Heading>
                      <div className="flex flex-col gap-4">
                        {block.paras.map((para, i) => (
                          <Body key={i}>{para}</Body>
                        ))}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </section>
            ))}
          </Container>
        </Section>
      </article>

      <Footer />
    </main>
  );
}
