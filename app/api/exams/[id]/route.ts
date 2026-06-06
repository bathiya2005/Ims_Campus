// app/api/exams/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma')
    const prisma = await getPrismaClient()
    const { id } = await params
    const body = await request.json()
    const { name, fee, examDate, courseLevel } = body

    const exam = await prisma.exam.update({
      where: { id: parseInt(id) },
      data: {
        name,
        fee: parseFloat(fee) || 0,
        examDate: examDate ? new Date(examDate) : null,
        courseLevel: courseLevel || null,
      },
    })
    return NextResponse.json(exam)
  } catch (error) {
    console.error('PUT /api/exams/[id] error:', error)
    return NextResponse.json({ message: 'Failed to update exam' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma')
    const prisma = await getPrismaClient()
    const { id } = await params
    const examId = parseInt(id)

    // Delete related records first to avoid foreign key errors
    await prisma.examResult.deleteMany({ where: { examId } })
    await prisma.examPayment.deleteMany({ where: { examId } })
    await prisma.repeatExam.deleteMany({ where: { examId } })
    await prisma.exam.delete({ where: { id: examId } })

    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    console.error('DELETE /api/exams/[id] error:', error)
    return NextResponse.json({ message: 'Failed to delete exam' }, { status: 500 })
  }
}