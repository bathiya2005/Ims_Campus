import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma'); const prisma = await getPrismaClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'daily'
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const month = searchParams.get('month')
    const branchId = searchParams.get('branchId')

    if (type === 'daily') {
      const targetDate = new Date(date)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)

      const studentFilter = branchId
        ? { student: { batch: { branchId: parseInt(branchId) } } }
        : {}

      const [attendance, coursePayments, examPayments] = await Promise.all([
        prisma.attendance.findMany({
          where: {
            date: { gte: targetDate, lt: nextDay },
            isPresent: true,
            ...studentFilter,
          },
          include: {
            student: { select: { id: true, fullName: true, regNumber: true } },
          },
        }),
        prisma.coursePayment.findMany({
          where: {
            paidDate: { gte: targetDate, lt: nextDay },
            ...studentFilter,
          },
          include: {
            student: { select: { id: true, fullName: true, regNumber: true } },
          },
        }),
        prisma.examPayment.findMany({
          where: {
            paidDate: { gte: targetDate, lt: nextDay },
            ...studentFilter,
          },
          include: {
            student: { select: { id: true, fullName: true, regNumber: true } },
            exam: true,
          },
        }),
      ])

      const totalCourseCollection = coursePayments.reduce((sum, p) => sum + p.amount, 0)
      const totalExamCollection = examPayments.reduce((sum, p) => sum + p.amount, 0)

      return NextResponse.json({
        date,
        attendance: { count: attendance.length, students: attendance },
        coursePayments: { count: coursePayments.length, total: totalCourseCollection, records: coursePayments },
        examPayments: { count: examPayments.length, total: totalExamCollection, records: examPayments },
        totalCollection: totalCourseCollection + totalExamCollection,
      })
    }

    if (type === 'monthly') {
      const [year, mon] = (month || `${new Date().getFullYear()}-${new Date().getMonth() + 1}`).split('-').map(Number)
      const startDate = new Date(year, mon - 1, 1)
      const endDate = new Date(year, mon, 0, 23, 59, 59)

      const branchFilter = branchId ? { batch: { branchId: parseInt(branchId) } } : {}

      const [students, coursePayments, examPayments] = await Promise.all([
        prisma.student.findMany({
          where: branchFilter,
          include: { coursePayments: true },
        }),
        prisma.coursePayment.findMany({
          where: {
            paidDate: { gte: startDate, lte: endDate },
            ...(branchId ? { student: branchFilter } : {}),
          },
          include: { student: { select: { id: true, fullName: true, regNumber: true } } },
        }),
        prisma.examPayment.findMany({
          where: {
            paidDate: { gte: startDate, lte: endDate },
            ...(branchId ? { student: branchFilter } : {}),
          },
          include: { student: { select: { id: true, fullName: true, regNumber: true } }, exam: true },
        }),
      ])

      const TOTAL_MONTHS = 6
      const MONTHLY_FEE = 3000

      const studentsWithArrears = students.filter(s => s.coursePayments.length < TOTAL_MONTHS)
      const totalArrears = studentsWithArrears.reduce((sum, s) =>
        sum + ((TOTAL_MONTHS - s.coursePayments.length) * MONTHLY_FEE), 0)

      return NextResponse.json({
        month: `${year}-${String(mon).padStart(2, '0')}`,
        totalStudents: students.length,
        studentsPaid: coursePayments.map(p => p.studentId).filter((v, i, a) => a.indexOf(v) === i).length,
        studentsNotPaid: students.length - coursePayments.map(p => p.studentId).filter((v, i, a) => a.indexOf(v) === i).length,
        studentsWithArrears: studentsWithArrears.length,
        totalArrears,
        totalCourseIncome: coursePayments.reduce((sum, p) => sum + p.amount, 0),
        totalExamIncome: examPayments.reduce((sum, p) => sum + p.amount, 0),
        coursePayments,
        examPayments,
      })
    }

    if (type === 'branch') {
      const branches = await prisma.branch.findMany({
        include: {
          batches: {
            include: {
              students: {
                include: { coursePayments: true },
              },
            },
          },
        },
      })

      const TOTAL_MONTHS = 6
      const MONTHLY_FEE = 3000

      const report = branches.map(branch => {
        const allStudents = branch.batches.flatMap(b => b.students)
        const totalCollection = allStudents.reduce((sum, s) =>
          sum + s.coursePayments.reduce((ps, p) => ps + p.amount, 0), 0)
        const totalArrears = allStudents.reduce((sum, s) =>
          sum + Math.max(0, (TOTAL_MONTHS - s.coursePayments.length) * MONTHLY_FEE), 0)

        return {
          branchId: branch.id,
          branchName: branch.name,
          totalStudents: allStudents.length,
          paid: allStudents.filter(s => s.coursePayments.length >= TOTAL_MONTHS).length,
          unpaid: allStudents.filter(s => s.coursePayments.length < TOTAL_MONTHS).length,
          totalCollection,
          totalArrears,
        }
      })

      return NextResponse.json(report)
    }

    return NextResponse.json({ message: 'Invalid report type' }, { status: 400 })
  } catch (error) {
    console.error('GET /api/reports error:', error)
    return NextResponse.json({ message: 'Database error' }, { status: 500 })
  }
}
