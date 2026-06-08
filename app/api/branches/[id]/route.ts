export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma')
    const prisma = await getPrismaClient()
    const { id } = await params
    const branchId = parseInt(id)

    // Delete all related data first
    const batches = await prisma.batch.findMany({ where: { branchId } })
    for (const batch of batches) {
      const students = await prisma.student.findMany({ where: { batchId: batch.id } })
      for (const student of students) {
        await prisma.attendance.deleteMany({ where: { studentId: student.id } })
        await prisma.examResult.deleteMany({ where: { studentId: student.id } })
        await prisma.coursePayment.deleteMany({ where: { studentId: student.id } })
        await prisma.examPayment.deleteMany({ where: { studentId: student.id } })
        await prisma.repeatExam.deleteMany({ where: { studentId: student.id } })
      }
      await prisma.student.deleteMany({ where: { batchId: batch.id } })
    }
    await prisma.batch.deleteMany({ where: { branchId } })
    await prisma.branch.delete({ where: { id: branchId } })

    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    console.error('DELETE /api/branches/[id] error:', error)
    return NextResponse.json({ message: 'Failed to delete branch' }, { status: 500 })
  }
}