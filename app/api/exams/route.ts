// app/api/exams/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma')
    const prisma = await getPrismaClient()
    const { searchParams } = new URL(request.url)
    const courseLevel = searchParams.get('courseLevel') // CERTIFICATE | DIPLOMA | null

    const where: Record<string, unknown> = {}
    if (courseLevel) {
      where.OR = [{ courseLevel }, { courseLevel: null }]
    }

    const exams = await prisma.exam.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(exams)
  } catch (error) {
    console.error('GET /api/exams error:', error)
    return NextResponse.json({ message: 'Database error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma')
    const prisma = await getPrismaClient()
    const body = await request.json()
    const { name, fee, examDate, courseLevel } = body

    if (!name) {
      return NextResponse.json({ message: 'Exam name is required' }, { status: 400 })
    }

    const exam = await prisma.exam.create({
      data: {
        name,
        fee: parseFloat(fee) || 0,
        examDate: examDate ? new Date(examDate) : null,
        courseLevel: courseLevel || null,
      },
    })

    return NextResponse.json(exam, { status: 201 })
  } catch (error) {
    console.error('POST /api/exams error:', error)
    return NextResponse.json({ message: 'Failed to create exam' }, { status: 500 })
  }
}