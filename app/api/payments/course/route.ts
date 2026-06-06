import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma'); const prisma = await getPrismaClient()
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const batchId = searchParams.get('batchId')
    const date = searchParams.get('date')

    const where: Record<string, unknown> = {}
    if (studentId) where.studentId = parseInt(studentId)
    if (batchId) where.student = { batchId: parseInt(batchId) }
    if (date) {
      const d = new Date(date)
      const nextDay = new Date(d)
      nextDay.setDate(nextDay.getDate() + 1)
      where.paidDate = { gte: d, lt: nextDay }
    }

    const payments = await prisma.coursePayment.findMany({
      where,
      include: {
        student: { select: { id: true, fullName: true, regNumber: true } },
      },
      orderBy: { paidDate: 'desc' },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('GET /api/payments/course error:', error)
    return NextResponse.json({ message: 'Database error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma'); const prisma = await getPrismaClient()
    const body = await request.json()
    const { studentId, monthNumber, amount, paidDate } = body

    if (!studentId || !monthNumber || !amount) {
      return NextResponse.json({ message: 'studentId, monthNumber and amount are required' }, { status: 400 })
    }

    const payment = await prisma.coursePayment.upsert({
      where: {
        studentId_monthNumber: {
          studentId: parseInt(studentId),
          monthNumber: parseInt(monthNumber),
        },
      },
      update: {
        amount: parseFloat(amount),
        paidDate: paidDate ? new Date(paidDate) : new Date(),
      },
      create: {
        studentId: parseInt(studentId),
        monthNumber: parseInt(monthNumber),
        amount: parseFloat(amount),
        paidDate: paidDate ? new Date(paidDate) : new Date(),
      },
      include: {
        student: { select: { id: true, fullName: true, regNumber: true } },
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('POST /api/payments/course error:', error)
    return NextResponse.json({ message: 'Failed to record payment' }, { status: 500 })
  }
}
