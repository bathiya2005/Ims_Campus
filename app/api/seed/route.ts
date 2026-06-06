import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const { getPrismaClient } = await import('@/lib/prisma'); const prisma = await getPrismaClient()

    // Seed course levels
    const certLevel = await prisma.courseLevel.upsert({
      where: { code: 'CERTIFICATE' },
      update: {},
      create: { name: 'IT Certificate', code: 'CERTIFICATE' },
    })

    const dipLevel = await prisma.courseLevel.upsert({
      where: { code: 'DIPLOMA' },
      update: {},
      create: { name: 'IT Diploma', code: 'DIPLOMA' },
    })

    // Seed branches
    const branchData = [
      { name: 'Galle', code: 'GLL' },
      { name: 'Matara', code: 'MTR' },
      { name: 'Nugegoda', code: 'NGD' },
      { name: 'Gampaha', code: 'GPH' },
      { name: 'Meegoda', code: 'MGD' },
      { name: 'Horana', code: 'HRN' },
      { name: 'Ratnapura', code: 'RTP' },
    ]

    const branches = await Promise.all(
      branchData.map(b =>
        prisma.branch.upsert({
          where: { code: b.code },
          update: {},
          create: b,
        })
      )
    )

    // Seed default exams
    const examData = [
      { name: 'Photoshop', fee: 1000 },
      { name: 'Typing Master', fee: 1000 },
      { name: 'Final Exam', fee: 1000 },
    ]

    const exams = await Promise.all(
      examData.map(e =>
        prisma.exam.upsert({
          where: { id: examData.indexOf(e) + 1 },
          update: {},
          create: e,
        }).catch(() =>
          prisma.exam.create({ data: e })
        )
      )
    )

    // Seed admin user
    await prisma.user.upsert({
      where: { email: 'admin@imscampus.lk' },
      update: {},
      create: {
        email: 'admin@imscampus.lk',
        password: 'admin123',
        name: 'IMS Admin',
        role: 'admin',
      },
    })

    return NextResponse.json({
      message: 'Database seeded successfully!',
      data: {
        courseLevels: [certLevel, dipLevel],
        branches: branches.map(b => b.name),
        exams: exams.map(e => e.name),
      },
    })
  } catch (error) {
    console.error('POST /api/seed error:', error)
    return NextResponse.json({
      message: 'Seed failed. Make sure DATABASE_URL is set and the schema is migrated.',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to seed the database',
    instructions: [
      '1. Set DATABASE_URL in .env',
      '2. Run: npx prisma migrate dev --name init',
      '3. POST to /api/seed to initialize data',
    ],
  })
}
