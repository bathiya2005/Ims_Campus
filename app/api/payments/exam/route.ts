import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma'); const prisma = await getPrismaClient()
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const examId = searchParams.get('examId')
    const date = searchParams.get('date')

    const where: Record<string, unknown> = {}
    if (studentId) where.studentId = parseInt(studentId)
    if (examId) where.examId = parseInt(examId)
    if (date) {
      const d = new Date(date)
      const nextDay = new Date(d)
      nextDay.setDate(nextDay.getDate() + 1)
      where.paidDate = { gte: d, lt: nextDay }
    }

    const payments = await prisma.examPayment.findMany({
      where,
      include: {
        student: { select: { id: true, fullName: true, regNumber: true } },
        exam: true,
      },
      orderBy: { paidDate: 'desc' },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('GET /api/payments/exam error:', error)
    return NextResponse.json({ message: 'Database error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma'); const prisma = await getPrismaClient()
    const body = await request.json()
    const { studentId, examId, amount, paidDate } = body

    if (!studentId || !examId || !amount) {
      return NextResponse.json({ message: 'studentId, examId and amount are required' }, { status: 400 })
    }

    const payment = await prisma.examPayment.create({
      data: {
        studentId: parseInt(studentId),
        examId: parseInt(examId),
        amount: parseFloat(amount),
        paidDate: paidDate ? new Date(paidDate) : new Date(),
      },
      include: {
        student: { select: { id: true, fullName: true, regNumber: true } },
        exam: true,
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('POST /api/payments/exam error:', error)
    return NextResponse.json({ message: 'Failed to record exam payment' }, { status: 500 })
  }
}
