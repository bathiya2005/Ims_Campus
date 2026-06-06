// app/api/branches/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma')
    const prisma = await getPrismaClient()
    const { searchParams } = new URL(request.url)
    const withStudents = searchParams.get('withStudents') === 'true'
    const level = searchParams.get('level') // CERTIFICATE | DIPLOMA

    const branches = await prisma.branch.findMany({
      orderBy: { name: 'asc' },
      include: {
        batches: withStudents ? {
          where: level ? { courseLevel: { code: level } } : {},
          include: {
            _count: { select: { students: { where: { isActive: true } } } },
          },
        } : false,
        _count: { select: { batches: true } },
      },
    })

    const result = branches.map(b => ({
      id: b.id,
      name: b.name,
      code: b.code,
      isActive: b.isActive,
      studentCount: withStudents && b.batches
        ? b.batches.reduce((sum: number, batch: any) => sum + (batch._count?.students || 0), 0)
        : 0,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/branches error:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma')
    const prisma = await getPrismaClient()
    const body = await request.json()
    const { name, code } = body

    if (!name || !code) {
      return NextResponse.json({ message: 'Name and code are required' }, { status: 400 })
    }

    const branch = await prisma.branch.create({
      data: { name, code: code.toUpperCase() },
    })

    return NextResponse.json(branch, { status: 201 })
  } catch (error: unknown) {
    console.error('POST /api/branches error:', error)
    const msg = error instanceof Error ? error.message : 'Failed to create branch'
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ message: 'Branch name or code already exists' }, { status: 409 })
    }
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}