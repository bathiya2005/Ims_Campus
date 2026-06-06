// app/dashboard/exams/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { BookOpen, Plus, Search, Award, AlertTriangle, Pencil, Trash2, GraduationCap } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface Exam {
  id: number
  name: string
  fee: number
  examDate?: string | null
  courseLevel?: string | null
}

function gradeInfo(marks: number) {
  if (marks >= 85) return { grade: 'A', label: 'First Class', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' }
  if (marks >= 75) return { grade: 'B', label: 'Second Upper', color: 'bg-blue-50 border-blue-200 text-blue-700' }
  if (marks >= 65) return { grade: 'C', label: 'Second Lower', color: 'bg-cyan-50 border-cyan-200 text-cyan-700' }
  if (marks >= 50) return { grade: 'D', label: 'Pass', color: 'bg-amber-50 border-amber-200 text-amber-700' }
  return { grade: 'F', label: 'Fail', color: 'bg-red-50 border-red-200 text-red-700' }
}

const CERTIFICATE_EXAMS_DEFAULT = [
  { name: 'Information Systems Assignment', fee: 1000 },
  { name: 'Typing Master', fee: 1000 },
  { name: 'Day today in ICT Poster', fee: 1000 },
  { name: 'Final Paper', fee: 1000 },
]

const DIPLOMA_EXAMS_DEFAULT = [
  { name: 'Photoshop Exam', fee: 1000 },
  { name: 'Software Engineering Assignment', fee: 1000 },
  { name: 'Websites Designing Exam', fee: 1000 },
  { name: 'Final Paper', fee: 1000 },
]

export default function ExamsPage() {
  const [activeTab, setActiveTab] = useState<'CERTIFICATE' | 'DIPLOMA'>('CERTIFICATE')
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [newExam, setNewExam] = useState({ name: '', fee: '', examDate: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [seeded, setSeeded] = useState(false)

  const fetchExams = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/exams?courseLevel=${activeTab}`)
      const data = await res.json()
      setExams(data)
    } catch {
      setError('Failed to load exams')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchExams() }, [activeTab])

  // Auto-seed default exams if none exist
  const seedDefaultExams = async () => {
    if (seeded) return
    const defaults = activeTab === 'CERTIFICATE' ? CERTIFICATE_EXAMS_DEFAULT : DIPLOMA_EXAMS_DEFAULT
    setSaving(true)
    for (const exam of defaults) {
      await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...exam, courseLevel: activeTab }),
      })
    }
    setSeeded(true)
    setSaving(false)
    fetchExams()
  }

  const handleAdd = async () => {
    if (!newExam.name || !newExam.fee) { setError('Name and fee required'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newExam.name, fee: parseFloat(newExam.fee), examDate: newExam.examDate || null, courseLevel: activeTab }),
      })
      if (!res.ok) throw new Error()
      setNewExam({ name: '', fee: '', examDate: '' })
      setShowAdd(false)
      fetchExams()
    } catch { setError('Failed to add exam') } finally { setSaving(false) }
  }

  const handleEdit = async () => {
    if (!editingExam) return
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/exams/${editingExam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingExam.name, fee: editingExam.fee, examDate: editingExam.examDate || null, courseLevel: editingExam.courseLevel }),
      })
      if (!res.ok) throw new Error()
      setShowEdit(false); setEditingExam(null)
      fetchExams()
    } catch { setError('Failed to update exam') } finally { setSaving(false) }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" delete කරන්නද?`)) return
    try {
      await fetch(`/api/exams/${id}`, { method: 'DELETE' })
      fetchExams()
    } catch { setError('Failed to delete') }
  }

  const filteredExams = exams.filter(e => e.courseLevel === activeTab || e.courseLevel === null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Exam Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">IMS Campus — Manage exams per program</p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <button onClick={() => { setShowAdd(true); setError('') }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Exam
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      {/* Grade System */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Grade System — IMS Campus</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { range: '85–100', grade: 'A', label: 'First Class' },
            { range: '75–84', grade: 'B', label: 'Second Upper' },
            { range: '65–74', grade: 'C', label: 'Second Lower' },
            { range: '50–64', grade: 'D', label: 'Pass' },
            { range: '0–49', grade: 'F', label: 'Fail' },
          ].map((g, i) => {
            const colors = [
              'bg-emerald-50 border-emerald-200 text-emerald-700',
              'bg-blue-50 border-blue-200 text-blue-700',
              'bg-cyan-50 border-cyan-200 text-cyan-700',
              'bg-amber-50 border-amber-200 text-amber-700',
              'bg-red-50 border-red-200 text-red-700',
            ]
            return (
              <div key={g.grade} className={`rounded-xl border p-3 text-center ${colors[i]}`}>
                <div className="text-2xl font-bold">{g.grade}</div>
                <div className="text-xs font-medium mt-0.5">{g.label}</div>
                <div className="text-xs mt-0.5 opacity-70">{g.range} marks</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Program Tabs */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="border-b border-slate-100 px-4">
          <div className="flex gap-1">
            {[
              { id: 'CERTIFICATE' as const, label: 'IT Certificate', icon: GraduationCap, color: 'border-blue-600 text-blue-600' },
              { id: 'DIPLOMA' as const, label: 'IT Diploma', icon: Award, color: 'border-slate-700 text-slate-700' },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? t.color : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">
              {activeTab === 'CERTIFICATE' ? 'IT Certificate' : 'IT Diploma'} Exams
            </h3>
            {filteredExams.length === 0 && !loading && (
              <button onClick={seedDefaultExams} disabled={saving}
                className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                {saving ? 'Adding...' : 'Add Default Exams'}
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">Loading...</div>
            ) : filteredExams.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No exams yet.</p>
              </div>
            ) : (
              filteredExams.map(exam => (
                <div key={exam.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 text-sm">{exam.name}</div>
                      <div className="text-xs text-slate-500">Fee: Rs. {exam.fee.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium">Active</span>
                    <button onClick={() => { setEditingExam(exam); setShowEdit(true) }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(exam.id, exam.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Add Exam — {activeTab === 'CERTIFICATE' ? 'IT Certificate' : 'IT Diploma'}</h2>
              <button onClick={() => { setShowAdd(false); setError('') }} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Exam Name *</label>
                <input type="text" value={newExam.name} onChange={e => setNewExam({ ...newExam, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g. Final Paper" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Exam Fee (Rs.) *</label>
                <input type="number" value={newExam.fee} onChange={e => setNewExam({ ...newExam, fee: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g. 1000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Exam Date (Optional)</label>
                <input type="date" value={newExam.examDate} onChange={e => setNewExam({ ...newExam, examDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowAdd(false); setError('') }} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={handleAdd} disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Adding...' : 'Add Exam'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && editingExam && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Edit Exam</h2>
              <button onClick={() => { setShowEdit(false); setError('') }} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Exam Name *</label>
                <input type="text" value={editingExam.name} onChange={e => setEditingExam({ ...editingExam, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Exam Fee (Rs.) *</label>
                <input type="number" value={editingExam.fee}
                  onChange={e => setEditingExam({ ...editingExam, fee: isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
                <select value={editingExam.courseLevel || ''} onChange={e => setEditingExam({ ...editingExam, courseLevel: e.target.value || null })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="CERTIFICATE">IT Certificate</option>
                  <option value="DIPLOMA">IT Diploma</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowEdit(false); setError('') }} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={handleEdit} disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}