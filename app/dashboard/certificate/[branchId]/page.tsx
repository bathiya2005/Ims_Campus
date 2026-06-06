// app/dashboard/certificate/[branchId]/page.tsx
'use client'
import Link from 'next/link'
import { useEffect, useState, use } from 'react'
import { Calendar, GraduationCap, Users } from 'lucide-react'

const currentYear = new Date().getFullYear()
const years = [2023, 2024, 2025, 2026, 2027]

export default function CertificateBranchPage({ params }: { params: Promise<{ branchId: string }> }) {
  const { branchId } = use(params)
  const [branchName, setBranchName] = useState('')
  const [yearCounts, setYearCounts] = useState<Record<number, number>>({})
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/branches').then(r => r.json()),
      fetch(`/api/students?branchId=${branchId}&level=CERTIFICATE`).then(r => r.json()),
    ]).then(([branches, students]) => {
      const branch = Array.isArray(branches) ? branches.find((b: any) => b.id === parseInt(branchId)) : null
      if (branch) setBranchName(branch.name)

      if (Array.isArray(students)) {
        const counts: Record<number, number> = {}
        students.forEach((s: any) => {
          const y = s.batch?.year
          if (y) counts[y] = (counts[y] || 0) + 1
        })
        setYearCounts(counts)
        setTotal(students.length)
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [branchId])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard" className="hover:text-slate-700">Dashboard</Link>
        <span>/</span>
        <Link href="/dashboard/certificate" className="hover:text-slate-700">IT Certificate</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">{branchName}</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-slate-500 uppercase tracking-wide">IT Certificate</div>
          <h1 className="text-lg font-bold text-slate-800">{branchName} Branch</h1>
          <p className="text-sm text-slate-500">Select a batch year to manage students</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{loading ? '...' : total}</div>
          <div className="text-xs text-slate-500">Total Students</div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-4">Available Batch Years</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {years.map(year => (
            <Link key={year} href={`/dashboard/certificate/${branchId}/${year}`}
              className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition-all text-center">
              <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors">
                <Calendar className="w-6 h-6 text-slate-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{year}</div>
              <div className="text-xs text-slate-500 mt-1">Batch</div>
              {year === currentYear && (
                <div className="mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Current</div>
              )}
              <div className="mt-3 flex items-center justify-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-sm font-semibold text-blue-600">{yearCounts[year] || 0}</span>
                <span className="text-xs text-slate-500">Students</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}