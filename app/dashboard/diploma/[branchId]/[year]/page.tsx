// app/dashboard/diploma/[branchId]/[year]/page.tsx
'use client'
import Link from 'next/link'
import { useState, use, useEffect, useCallback } from 'react'
import { Users, Plus, Search, Edit2, Trash2, Eye, Calendar, RefreshCw, GraduationCap, UserPlus } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface Student {
  id: number; regNumber: string; fullName: string; nicNumber: string; telephone: string; photoPath: string | null; isActive: boolean
}
interface Branch { id: number; name: string; code: string }

export default function DiplomaBatchPage({ params }: { params: Promise<{ branchId: string; year: string }> }) {
  const { branchId, year } = use(params)
  const [branch, setBranch] = useState<Branch | null>(null)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [branchRes, studentsRes] = await Promise.all([
        fetch('/api/branches'),
        fetch(`/api/students?branchId=${branchId}&year=${year}&level=DIPLOMA`),
      ])
      const branches: Branch[] = await branchRes.json()
      const b = Array.isArray(branches) ? branches.find(b => b.id === parseInt(branchId)) : null
      if (b) setBranch(b)
      if (studentsRes.ok) setStudents(await studentsRes.json())
    } catch {} finally { setLoading(false) }
  }, [branchId, year])

  useEffect(() => { loadData() }, [loadData])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete ${name}?`)) return
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
    if (res.ok) setStudents(prev => prev.filter(s => s.id !== id))
  }

  const filtered = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.regNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.nicNumber.includes(search) || s.telephone.includes(search)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
        <Link href="/dashboard" className="hover:text-slate-700">Dashboard</Link><span>/</span>
        <Link href="/dashboard/diploma" className="hover:text-slate-700">IT Diploma</Link><span>/</span>
        <Link href={`/dashboard/diploma/${branchId}`} className="hover:text-slate-700">{branch?.name || '...'}</Link><span>/</span>
        <span className="text-slate-800 font-medium">{year} Batch</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{branch?.name || '...'} — {year} Batch</h1>
            <p className="text-sm text-slate-500">IT Diploma · IMS Campus</p>
          </div>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: students.length, bg: 'bg-slate-700' },
          { label: 'Active Students', value: students.filter(s => s.isActive).length, bg: 'bg-emerald-600' },
          { label: 'Payments Pending', value: 0, bg: 'bg-amber-500' },
          { label: 'Exams Completed', value: 0, bg: 'bg-violet-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, reg number, NIC, phone..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{filtered.length} students</span>
          </div>
        </div>
        {loading ? (
          <div className="py-12 text-center"><div className="w-8 h-8 border-2 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No students yet</p>
            <p className="text-sm text-slate-400 mt-1">Add students to this batch to get started</p>
            <button onClick={() => setShowAddModal(true)} className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium mx-auto">
              <Plus className="w-4 h-4" /> Add Student
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['#', 'Student', 'Reg No.', 'NIC', 'Phone', 'Status', 'Actions'].map(h => (
                    <th key={h} className={`p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((student, i) => (
                  <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4 text-sm text-slate-400">{i + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {student.photoPath ? <img src={student.photoPath} className="w-9 h-9 rounded-full object-cover" /> : <span className="text-slate-600 font-semibold text-sm">{student.fullName.charAt(0)}</span>}
                        </div>
                        <span className="font-medium text-slate-800 text-sm">{student.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-600">{student.regNumber}</td>
                    <td className="p-4 text-sm text-slate-600">{student.nicNumber}</td>
                    <td className="p-4 text-sm text-slate-600">{student.telephone}</td>
                    <td className="p-4"><Badge variant={student.isActive ? 'success' : 'default'}>{student.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/students/${student.id}`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></Link>
                        <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(student.id, student.fullName)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); loadData() }}
          branchId={branchId} year={year} program="DIPLOMA"
        />
      )}
    </div>
  )
}

function AddStudentModal({ onClose, onSuccess, branchId, year, program }: {
  onClose: () => void; onSuccess: () => void; branchId: string; year: string; program: 'CERTIFICATE' | 'DIPLOMA'
}) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [form, setForm] = useState({ fullName: '', regNumber: '', nicNumber: '', telephone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [addToBoth, setAddToBoth] = useState(false)
  const [otherBranchId, setOtherBranchId] = useState(branchId)
  const [otherYear, setOtherYear] = useState(year)
  const [branches, setBranches] = useState<Branch[]>([])

  const otherProgram: 'CERTIFICATE' | 'DIPLOMA' = program === 'DIPLOMA' ? 'CERTIFICATE' : 'DIPLOMA'
  const otherProgramLabel = program === 'DIPLOMA' ? 'IT Certificate' : 'IT Diploma'
  const years = ['2023', '2024', '2025', '2026', '2027']

  useEffect(() => {
    fetch('/api/branches').then(r => r.json()).then(d => { if (Array.isArray(d)) setBranches(d) })
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setPhoto(file); const r = new FileReader(); r.onload = () => setPhotoPreview(r.result as string); r.readAsDataURL(file) }
  }

  const submitStudent = async (bid: string, yr: string, lvl: string, isCross: boolean) => {
    const fd = new FormData()
    if (photo) fd.append('photo', photo)
    fd.append('fullName', form.fullName)
    fd.append('regNumber', form.regNumber)
    fd.append('nicNumber', form.nicNumber)
    fd.append('telephone', form.telephone)
    fd.append('branchId', bid)
    fd.append('year', yr)
    fd.append('level', lvl)
    fd.append('isCrossAdd', isCross ? 'true' : 'false')
    const res = await fetch('/api/students', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed')
    return data
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await submitStudent(branchId, year, program, false)
      if (addToBoth) {
        try { await submitStudent(otherBranchId, otherYear, otherProgram, true) }
        catch (err: any) { console.warn('Cross-add failed:', err.message) }
      }
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to add student')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-slate-800">Add New Student</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300">
              {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <Users className="w-8 h-8 text-slate-400" />}
            </div>
            <label className="cursor-pointer text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>

          {[
            { label: 'Full Name', key: 'fullName', placeholder: 'Enter full name', type: 'text' },
            { label: 'Registration Number', key: 'regNumber', placeholder: 'e.g. IMS-NGD-2026-001', type: 'text' },
            { label: 'NIC Number', key: 'nicNumber', placeholder: 'e.g. 200012345678', type: 'text' },
            { label: 'Telephone', key: 'telephone', placeholder: 'e.g. 0712345678', type: 'tel' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{f.label} *</label>
              <input type={f.type} required value={form[f.key as keyof typeof form]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder={f.placeholder} />
            </div>
          ))}

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={addToBoth} onChange={e => setAddToBoth(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-blue-600" />
              <div>
                <div className="text-sm font-medium text-slate-700">Also add to {otherProgramLabel}</div>
                <div className="text-xs text-slate-500">Student will be enrolled in both programs</div>
              </div>
            </label>

            {addToBoth && (
              <div className="mt-4 space-y-3 pt-3 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{otherProgramLabel} — Select Branch & Year</p>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Branch</label>
                  <select value={otherBranchId} onChange={e => setOtherBranchId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none bg-white">
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Batch Year</label>
                  <select value={otherYear} onChange={e => setOtherYear(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none bg-white">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Adding...</>
                : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}