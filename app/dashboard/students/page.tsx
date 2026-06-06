'use client'
import { useState, useEffect } from 'react'
import { Users, Search, Eye, Edit2, Trash2, GraduationCap, Building2, RefreshCw } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'

interface Student {
  id: number; regNumber: string; fullName: string; nicNumber: string; telephone: string
  photoPath: string | null; isActive: boolean
  batch: { year: number; branch: { name: string }; courseLevel: { name: string; code: string } }
}

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterBranch, setFilterBranch] = useState('all')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const branches = ['Galle','Matara','Nugegoda','Gampaha','Meegoda','Horana','Ratnapura']

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/students')
      if (res.ok) setStudents(await res.json())
    } catch(e){} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !search || s.fullName.toLowerCase().includes(q) || s.regNumber.toLowerCase().includes(q) || s.nicNumber.includes(search) || s.telephone.includes(search)
    const matchLevel = filterLevel === 'all' || s.batch.courseLevel.code.toLowerCase() === filterLevel
    const matchBranch = filterBranch === 'all' || s.batch.branch.name.toLowerCase() === filterBranch
    return matchSearch && matchLevel && matchBranch
  })

  const del = async (id: number, name: string) => {
    if (!confirm(`Delete ${name}?`)) return
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
    if (res.ok) setStudents(p => p.filter(s => s.id !== id))
    else alert('Delete failed')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">All Students</h1>
          <p className="text-sm text-slate-500">IMS Campus — All registered students</p>
        </div>
        <button onClick={load} className="sm:ml-auto flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
          <RefreshCw className="w-4 h-4"/>Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: students.length, color: 'bg-blue-600' },
          { label: 'Certificate', value: students.filter(s => s.batch.courseLevel.code === 'CERTIFICATE').length, color: 'bg-emerald-600' },
          { label: 'Diploma', value: students.filter(s => s.batch.courseLevel.code === 'DIPLOMA').length, color: 'bg-violet-600' },
          { label: 'Active', value: students.filter(s => s.isActive).length, color: 'bg-amber-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-2 h-2 ${s.color} rounded-full mb-2`}></div>
            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <input type="text" placeholder="Search name, reg, NIC, phone..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
        </div>
        <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none">
          <option value="all">All Levels</option>
          <option value="certificate">IT Certificate</option>
          <option value="diploma">IT Diploma</option>
        </select>
        <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none">
          <option value="all">All Branches</option>
          {branches.map(b => <option key={b} value={b.toLowerCase()}>{b}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Student Records</h3>
          <span className="text-sm text-slate-500">{filtered.length} found</span>
        </div>
        {loading ? (
          <div className="py-16 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div><p className="text-sm text-slate-500">Loading...</p></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-3"/>
            <p className="text-slate-500 font-medium">No students found</p>
            <div className="mt-4 flex gap-3 justify-center">
              <Link href="/dashboard/certificate" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"><GraduationCap className="w-4 h-4"/>IT Certificate</Link>
              <Link href="/dashboard/diploma" className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-800"><Building2 className="w-4 h-4"/>IT Diploma</Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['#','Student','Reg No.','NIC','Phone','Branch','Level','Batch','Status','Actions'].map(h => (
                    <th key={h} className={`p-4 text-xs font-semibold text-slate-500 uppercase ${h==='Actions'?'text-right':'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4 text-sm text-slate-400">{i+1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {s.photoPath ? <img src={s.photoPath} alt={s.fullName} className="w-9 h-9 rounded-full object-cover"/> : <span className="text-blue-700 font-bold text-sm">{s.fullName.charAt(0)}</span>}
                        </div>
                        <span className="font-medium text-slate-800 text-sm">{s.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-600">{s.regNumber}</td>
                    <td className="p-4 text-sm text-slate-600">{s.nicNumber}</td>
                    <td className="p-4 text-sm text-slate-600">{s.telephone}</td>
                    <td className="p-4 text-sm text-slate-600">{s.batch.branch.name}</td>
                    <td className="p-4"><Badge variant="info">{s.batch.courseLevel.name}</Badge></td>
                    <td className="p-4 text-sm text-slate-600">{s.batch.year}</td>
                    <td className="p-4"><Badge variant={s.isActive?'success':'default'}>{s.isActive?'Active':'Inactive'}</Badge></td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/students/${s.id}`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4"/></Link>
                        <button onClick={() => del(s.id, s.fullName)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
