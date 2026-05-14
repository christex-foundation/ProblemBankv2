import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@christex.foundation' },
    update: { role: 'admin' },
    create: {
      email: 'admin@christex.foundation',
      name: 'Christex Admin',
      role: 'admin',
    },
  });

  // Sample submissions across multiple sectors / urgencies / statuses.
  const samples = [
    {
      title: 'Cold-chain logistics for vaccines in Bonthe District',
      description:
        '<p>Vaccines often spoil due to inconsistent refrigeration in remote chiefdoms.</p>',
      potentialSolution:
        '<p>Solar-powered cold storage hubs at chiefdom level, monitored by SMS alerts.</p>',
      urgency: 'high' as const,
      category: 'Health',
    },
    {
      title: 'Smallholder farmers struggle to verify input quality',
      description:
        '<p>Counterfeit fertilizer and seed reach markets in Kambia, hurting yields and trust.</p>',
      potentialSolution:
        '<p>QR codes on bagged inputs that link to an authenticity record.</p>',
      urgency: 'medium' as const,
      category: 'Agriculture',
    },
    {
      title: 'Out-of-school youth in Pujehun lack assessable trades training',
      description:
        '<p>Existing trades programs do not certify completion in a way employers recognise.</p>',
      urgency: 'high' as const,
      category: 'Education',
    },
  ];

  for (const s of samples) {
    await prisma.submission.upsert({
      where: { id: `seed-${s.title.slice(0, 30).replace(/\s+/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `seed-${s.title.slice(0, 30).replace(/\s+/g, '-').toLowerCase()}`,
        userId: admin.id,
        title: s.title,
        description: s.description,
        potentialSolution: s.potentialSolution,
        urgency: s.urgency,
        category: s.category,
      },
    });
  }

  // A sample Library entry the admin already published.
  const entry = await prisma.libraryEntry.upsert({
    where: { slug: 'cold-chain-bonthe' },
    update: {},
    create: {
      slug: 'cold-chain-bonthe',
      title: 'Cold-chain logistics for vaccines in Bonthe District',
      problemStatement:
        '<p>Vaccines often spoil due to inconsistent refrigeration in remote chiefdoms of Bonthe District.</p>',
      sector: 'Health',
      urgency: 'high',
      kitUrl: 'https://github.com/christexfoundation/cold-chain-starter',
      demoUrl: 'https://cold-chain-demo.vercel.app',
      publishedAt: new Date(),
      createdBy: admin.id,
    },
  });

  const docTypes = [
    'concept_note',
    'prd',
    'technical_design',
    'user_flows',
    'roadmap',
    'pitch_deck',
  ] as const;

  for (const t of docTypes) {
    await prisma.document.upsert({
      where: { libraryEntryId_docType: { libraryEntryId: entry.id, docType: t } },
      update: {},
      create: {
        libraryEntryId: entry.id,
        docType: t,
        cloudinaryUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
        fileName: `${t}.pdf`,
      },
    });
  }

  console.log('Seed complete.');
  console.log(`Admin user id: ${admin.id}`);
  console.log(`Library entry id: ${entry.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
