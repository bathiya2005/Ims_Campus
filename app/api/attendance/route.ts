import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma'); const prisma = await getPrismaClient()
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const batchId = searchParams.get('batchId')
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: Record<string, unknown> = {}

    if (studentId) where.studentId = parseInt(studentId)
    if (date) where.date = new Date(date)
    if (startDate || endDate) {
      where.date = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      }
    }

    if (batchId) {
      where.student = { batchId: parseInt(batchId) }
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: { student: { select: { id: true, fullName: true, regNumber: true } } },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('GET /api/attendance error:', error)
    return NextResponse.json({ message: 'Database error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma'); const prisma = await getPrismaClient()
    const body = await request.json()
    const { date, attendance } = body

    // attendance: { [studentId]: boolean }
    const records = Object.entries(attendance).map(([studentId, isPresent]) => ({
      studentId: parseInt(studentId),
      date: new Date(date),
      isPresent: isPresent as boolean,
    }))

    // Upsert each attendance record
    const results = await Promise.all(
      records.map(record =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: record.studentId,
              date: record.date,
            },
          },
          update: { isPresent: record.isPresent },
          create: record,
        })
      )
    )

    return NextResponse.json({ saved: results.length, date })
  } catch (error) {
    console.error('POST /api/attendance error:', error)
    return NextResponse.json({ message: 'Failed to save attendance' }, { status: 500 })
  }
}
