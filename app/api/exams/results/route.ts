// app/api/exams/results/route.ts
import { NextRequest, NextResponse } from 'next/server'

function calculateGrade(marks: number) {
  if (marks >= 85) return { grade: 'A', label: 'First Class', isPassed: true }
  if (marks >= 75) return { grade: 'B', label: 'Second Upper', isPassed: true }
  if (marks >= 65) return { grade: 'C', label: 'Second Lower', isPassed: true }
  if (marks >= 50) return { grade: 'D', label: 'Pass', isPassed: true }
  return { grade: 'F', label: 'Fail', isPassed: false }
}

export async function GET(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma')
    const prisma = await getPrismaClient()
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const examId = searchParams.get('examId')
    const batchId = searchParams.get('batchId')

    const where: Record<string, unknown> = {}
    if (studentId) where.studentId = parseInt(studentId)
    if (examId) where.examId = parseInt(examId)
    if (batchId) where.student = { batchId: parseInt(batchId) }

    const results = await prisma.examResult.findMany({
      where,
      include: {
        student: { select: { id: true, fullName: true, regNumber: true } },
        exam: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error('GET /api/exams/results error:', error)
    return NextResponse.json({ message: 'Database error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma')
    const prisma = await getPrismaClient()
    const body = await request.json()
    const { studentId, examId, marks } = body

    if (!studentId || !examId || marks === undefined) {
      return NextResponse.json({ message: 'studentId, examId and marks are required' }, { status: 400 })
    }

    const marksNum = parseFloat(marks)
    const { grade, isPassed } = calculateGrade(marksNum)

    const result = await prisma.examResult.upsert({
      where: {
        studentId_examId: {
          studentId: parseInt(studentId),
          examId: parseInt(examId),
        },
      },
      update: { marks: marksNum, grade, isPassed },
      create: {
        studentId: parseInt(studentId),
        examId: parseInt(examId),
        marks: marksNum,
        grade,
        isPassed,
      },
      include: {
        student: { select: { id: true, fullName: true, regNumber: true } },
        exam: true,
      },
    })

    if (!isPassed) {
      const existingRepeats = await prisma.repeatExam.count({
        where: { studentId: parseInt(studentId), examId: parseInt(examId) },
      })
      await prisma.repeatExam.create({
        data: {
          studentId: parseInt(studentId),
          examId: parseInt(examId),
          attemptNo: existingRepeats + 1,
          fee: 500,
        },
      })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('POST /api/exams/results error:', error)
    return NextResponse.json({ message: 'Failed to save exam result' }, { status: 500 })
  }
}