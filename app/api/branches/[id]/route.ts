// app/api/branches/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma')
    const prisma = await getPrismaClient()
    const { id } = await params
    const body = await request.json()
    const { name, code, isActive } = body

    const branch = await prisma.branch.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(code && { code: code.toUpperCase() }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(branch)
  } catch (error: unknown) {
    console.error('PUT /api/branches/[id] error:', error)
    const msg = error instanceof Error ? error.message : 'Failed to update branch'
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { getPrismaClient } = await import('@/lib/prisma')
    const prisma = await getPrismaClient()
    const { id } = await params

    await prisma.branch.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    console.error('DELETE /api/branches/[id] error:', error)
    return NextResponse.json({ message: 'Failed to delete branch' }, { status: 500 })
  }
}