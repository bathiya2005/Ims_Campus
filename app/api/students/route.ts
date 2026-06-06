// app/api/students/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma')
    const prisma = await getPrismaClient()
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batchId')
    const search = searchParams.get('search')
    const branchId = searchParams.get('branchId')
    const year = searchParams.get('year')
    const level = searchParams.get('level')

    const where: Record<string, unknown> = {}
    if (batchId) where.batchId = parseInt(batchId)
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { regNumber: { contains: search } },
        { nicNumber: { contains: search } },
        { telephone: { contains: search } },
      ]
    }
    if (branchId || year || level) {
      where.batch = {
        ...(branchId && { branchId: parseInt(branchId) }),
        ...(year && { year: parseInt(year) }),
        ...(level && { courseLevel: { code: level.toUpperCase() } }),
      }
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        batch: { include: { branch: true, courseLevel: true } },
        _count: { select: { attendance: true, coursePayments: true, examResults: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('GET /api/students error:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma')
    const prisma = await getPrismaClient()
    const formData = await request.formData()

    const fullName = formData.get('fullName') as string
    const regNumber = formData.get('regNumber') as string
    const nicNumber = formData.get('nicNumber') as string
    const telephone = formData.get('telephone') as string
    const branchId = formData.get('branchId') as string
    const year = formData.get('year') as string
    const level = formData.get('level') as string
    const photo = formData.get('photo') as File | null
    const isCrossAdd = formData.get('isCrossAdd') === 'true'

    if (!fullName || !regNumber || !nicNumber || !telephone || !branchId || !year || !level) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    const courseLevel = await prisma.courseLevel.findFirst({
      where: { code: level.toUpperCase() },
    })

    if (!courseLevel) {
      return NextResponse.json({ message: `Course level "${level}" not found` }, { status: 404 })
    }

    // Find or create batch
    let batch = await prisma.batch.findFirst({
      where: { year: parseInt(year), branchId: parseInt(branchId), courseLevelId: courseLevel.id },
    })
    if (!batch) {
      batch = await prisma.batch.create({
        data: { year: parseInt(year), branchId: parseInt(branchId), courseLevelId: courseLevel.id },
      })
    }

    // Handle photo upload
    let photoPath: string | null = null
    if (photo && photo.size > 0) {
      try {
        const bytes = await photo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'students')
        await mkdir(uploadsDir, { recursive: true })
        const filename = `${Date.now()}-${photo.name.replace(/\s/g, '-')}`
        await writeFile(join(uploadsDir, filename), buffer)
        photoPath = `/uploads/students/${filename}`
      } catch (e) {
        console.error('Photo upload error:', e)
      }
    }

    if (isCrossAdd) {
      // Cross-program: check already enrolled in this program
      const alreadyEnrolled = await prisma.student.findFirst({
        where: { nicNumber, batch: { courseLevel: { code: level.toUpperCase() } } },
      })
      if (alreadyEnrolled) {
        return NextResponse.json({ message: `Student already enrolled in ${level} program` }, { status: 409 })
      }

      // Reuse photo from original student if no new photo
      if (!photoPath) {
        const original = await prisma.student.findFirst({ where: { nicNumber } })
        if (original) photoPath = original.photoPath
      }

      const student = await prisma.student.create({
        data: { fullName, regNumber, nicNumber, telephone, batchId: batch.id, photoPath },
        include: { batch: { include: { branch: true, courseLevel: true } } },
      })
      return NextResponse.json(student, { status: 201 })
    }

    // Normal add — check reg number unique within same program
    const existingReg = await prisma.student.findFirst({
      where: { regNumber, batch: { courseLevel: { code: level.toUpperCase() } } },
    })
    if (existingReg) {
      return NextResponse.json({ message: 'Registration number already exists in this program' }, { status: 409 })
    }

    // Check NIC unique within same program
    const existingNic = await prisma.student.findFirst({
      where: { nicNumber, batch: { courseLevel: { code: level.toUpperCase() } } },
    })
    if (existingNic) {
      return NextResponse.json({ message: 'NIC already exists in this program' }, { status: 409 })
    }

    const student = await prisma.student.create({
      data: { fullName, regNumber, nicNumber, telephone, batchId: batch.id, photoPath },
      include: { batch: { include: { branch: true, courseLevel: true } } },
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error: unknown) {
    console.error('POST /api/students error:', error)
    const msg = error instanceof Error ? error.message : 'Failed to create student'
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}