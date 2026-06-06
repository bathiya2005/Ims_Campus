'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Users, GraduationCap, Building2, CreditCard, ClipboardList, BookOpen, Award, ArrowRight, BarChart2, Calendar, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, certificate: 0, diploma: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/students')
      .then(r => r.ok ? r.json() : [])
      .then((students: any[]) => {
        if (!Array.isArray(students)) return
        setStats({
          total: students.length,
          certificate: students.filter((s: any) => s.batch?.courseLevel?.code === 'CERTIFICATE').length,
          diploma: students.filter((s: any) => s.batch?.courseLevel?.code === 'DIPLOMA').length,
        })
      }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">IMS Campus Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Student Registration & Management System</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/certificate" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <GraduationCap className="w-4 h-4" />IT Certificate
          </Link>
          <Link href="/dashboard/diploma" className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
            <Award className="w-4 h-4" />IT Diploma
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/certificate" className="group bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white hover:from-blue-700 hover:to-blue-800 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium text-blue-200 uppercase tracking-wider mb-1">Course Level 1</div>
              <h3 className="text-xl font-bold">IT Certificate</h3>
              <p className="text-sm text-blue-100 mt-1">{loading ? '...' : stats.certificate} students enrolled</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-100 group-hover:text-white">
                Select Branch <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="w-14 h-14 bg-blue-500/40 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
        </Link>
        <Link href="/dashboard/diploma" className="group bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 text-white hover:from-slate-800 hover:to-slate-900 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Course Level 2</div>
              <h3 className="text-xl font-bold">IT Diploma</h3>
              <p className="text-sm text-slate-300 mt-1">{loading ? '...' : stats.diploma} students enrolled</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-slate-300 group-hover:text-white">
                Select Branch <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="w-14 h-14 bg-slate-600/50 rounded-xl flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.total, icon: Users, color: 'bg-blue-600' },
          { label: 'IT Certificate', value: stats.certificate, icon: GraduationCap, color: 'bg-emerald-600' },
          { label: 'IT Diploma', value: stats.diploma, icon: Award, color: 'bg-violet-600' },
          { label: 'Branches', value: 7, icon: Building2, color: 'bg-cyan-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-3">
            <div className={`w-11 h-11 ${s.color} rounded-xl flex items-center justify-center`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{loading ? '...' : s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Branches</h3>
          <div className="space-y-2">
            {['Galle', 'Matara', 'Nugegoda', 'Gampaha', 'Meegoda', 'Horana', 'Ratnapura'].map(b => (
              <div key={b} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><span className="text-sm text-slate-700">{b}</span></div>
                <span className="text-xs text-emerald-600 font-medium">Active</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { href: '/dashboard/students', label: 'View All Students', icon: Users, color: 'text-blue-600' },
              { href: '/dashboard/attendance', label: 'Mark Attendance', icon: ClipboardList, color: 'text-green-600' },
              { href: '/dashboard/payments', label: 'Record Payment', icon: CreditCard, color: 'text-purple-600' },
              { href: '/dashboard/exams', label: 'Manage Exams', icon: BookOpen, color: 'text-amber-600' },
              { href: '/dashboard/reports', label: 'View Reports', icon: BarChart2, color: 'text-cyan-600' },
              { href: '/dashboard/batches', label: 'Manage Batches', icon: Calendar, color: 'text-rose-600' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 group">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{item.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover:text-slate-500" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
