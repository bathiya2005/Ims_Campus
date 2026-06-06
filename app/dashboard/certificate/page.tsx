// app/dashboard/certificate/page.tsx
'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Building2, ArrowRight, GraduationCap, Users } from 'lucide-react'

interface Branch {
  id: number
  name: string
  code: string
  studentCount: number
}

export default function CertificatePage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/branches?withStudents=true&level=CERTIFICATE')
      .then(r => r.json())
      .then((data: Branch[]) => {
        if (!Array.isArray(data)) return
        setBranches(data)
        setTotal(data.reduce((s, b) => s + (b.studentCount || 0), 0))
      }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard" className="hover:text-slate-700">Dashboard</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">IT Certificate</span>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="w-7 h-7" />
              <h1 className="text-xl font-bold">IT Certificate Program</h1>
            </div>
            <p className="text-blue-100 text-sm">Select a branch to manage students and batches</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{loading ? '...' : total}</div>
            <div className="text-blue-200 text-sm">Total Students</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-4">Select Branch</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {branches.map(branch => (
              <Link key={branch.id} href={`/dashboard/certificate/${branch.id}`}
                className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all mt-1" />
                </div>
                <h3 className="font-semibold text-slate-800">{branch.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Code: {branch.code}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-600">{branch.studentCount || 0}</span>
                  <span className="text-xs text-slate-500">Students</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}