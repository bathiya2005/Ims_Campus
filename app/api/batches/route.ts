import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma'); const prisma = await getPrismaClient()
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId')
    const year = searchParams.get('year')
    const level = searchParams.get('level')

    const where: Record<string, unknown> = {}
    if (branchId) where.branchId = parseInt(branchId)
    if (year) where.year = parseInt(year)
    if (level) where.courseLevel = { code: level.toUpperCase() }

    const batches = await prisma.batch.findMany({
      where,
      include: {
        branch: true,
        courseLevel: true,
        _count: { select: { students: true } },
      },
      orderBy: [{ year: 'desc' }, { branch: { name: 'asc' } }],
    })

    return NextResponse.json(batches)
  } catch (error) {
    console.error('GET /api/batches error:', error)
    return NextResponse.json({ message: 'Database error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma'); const prisma = await getPrismaClient()
    const body = await request.json()
    const { year, branchId, level } = body

    const courseLevel = await prisma.courseLevel.findFirst({
      where: { code: level.toUpperCase() },
    })

    if (!courseLevel) {
      return NextResponse.json({ message: 'Course level not found' }, { status: 404 })
    }

    const batch = await prisma.batch.create({
      data: {
        year: parseInt(year),
        branchId: parseInt(branchId),
        courseLevelId: courseLevel.id,
      },
      include: { branch: true, courseLevel: true },
    })

    return NextResponse.json(batch, { status: 201 })
  } catch (error: unknown) {
    console.error('POST /api/batches error:', error)
    const msg = error instanceof Error ? error.message : 'Failed to create batch'
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ message: 'Batch already exists for this branch/year/level' }, { status: 409 })
    }
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
