// app/api/students/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma')
    const prisma = await getPrismaClient()
    const { id } = await params

    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: {
        batch: { include: { branch: true, courseLevel: true } },
        attendance: { orderBy: { date: 'desc' } },
        examResults: { include: { exam: true }, orderBy: { createdAt: 'desc' } },
        coursePayments: { orderBy: { monthNumber: 'asc' } },
        examPayments: { include: { exam: true }, orderBy: { createdAt: 'desc' } },
        repeatExams: { include: { exam: true } },
      },
    })

    if (!student) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    return NextResponse.json(student)
  } catch (error) {
    console.error('GET /api/students/[id] error:', error)
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma')
    const prisma = await getPrismaClient()
    const { id } = await params
    const body = await request.json()
    const { fullName, nicNumber, telephone, regNumber, isActive, photoPath } = body

    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: {
        ...(fullName && { fullName }),
        ...(nicNumber && { nicNumber }),
        ...(telephone && { telephone }),
        ...(regNumber && { regNumber }),
        ...(isActive !== undefined && { isActive }),
        ...(photoPath !== undefined && { photoPath }),
      },
      include: {
        batch: { include: { branch: true, courseLevel: true } },
      },
    })

    return NextResponse.json(student)
  } catch (error: unknown) {
    console.error('PUT /api/students/[id] error:', error)
    const msg = error instanceof Error ? error.message : 'Failed to update student'
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma')
    const prisma = await getPrismaClient()
    const { id } = await params

    await prisma.student.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    console.error('DELETE /api/students/[id] error:', error)
    return NextResponse.json({ message: 'Failed to delete' }, { status: 500 })
  }
}