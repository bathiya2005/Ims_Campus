import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma'); const prisma = await getPrismaClient()
    const { id } = await params

    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: {
        batch: { include: { branch: true, courseLevel: true } },
        attendance: { orderBy: { date: 'desc' } },
        examResults: { include: { exam: true } },
        coursePayments: { orderBy: { monthNumber: 'asc' } },
        examPayments: { include: { exam: true } },
        repeatExams: { include: { exam: true } },
      },
    })

    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('GET /api/students/[id] error:', error)
    return NextResponse.json({ message: 'Database error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma'); const prisma = await getPrismaClient()
    const { id } = await params
    const body = await request.json()
    const { fullName, nicNumber, telephone } = body

    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { fullName, nicNumber, telephone },
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error('PUT /api/students/[id] error:', error)
    return NextResponse.json({ message: 'Failed to update student' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma'); const prisma = await getPrismaClient()
    const { id } = await params

    await prisma.student.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/students/[id] error:', error)
    return NextResponse.json({ message: 'Failed to delete student' }, { status: 500 })
  }
}
