'use client'
import { useState } from 'react'
import { Building2, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react'
import Badge from '@/components/ui/Badge'

const defaultBranches = [
  { id: 1, name: 'Galle', code: 'GLL', isActive: true, students: 0 },
  { id: 2, name: 'Matara', code: 'MTR', isActive: true, students: 0 },
  { id: 3, name: 'Nugegoda', code: 'NGD', isActive: true, students: 0 },
  { id: 4, name: 'Gampaha', code: 'GPH', isActive: true, students: 0 },
  { id: 5, name: 'Meegoda', code: 'MGD', isActive: true, students: 0 },
  { id: 6, name: 'Horana', code: 'HRN', isActive: true, students: 0 },
  { id: 7, name: 'Ratnapura', code: 'RTP', isActive: true, students: 0 },
]

export default function BranchesPage() {
  const [branches, setBranches] = useState(defaultBranches)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', code: '' })

  const handleAdd = async () => {
    if (!form.name || !form.code) return
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const data = await res.json()
        setBranches(prev => [...prev, { ...data, students: 0 }])
        setForm({ name: '', code: '' })
        setShowAdd(false)
      }
    } catch {
      // Add locally for demo
      setBranches(prev => [...prev, { id: Date.now(), name: form.name, code: form.code.toUpperCase(), isActive: true, students: 0 }])
      setForm({ name: '', code: '' })
      setShowAdd(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Branch Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">IMS Campus — Manage all branches and districts</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="sm:ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {branches.map(branch => (
          <div key={branch.id} className="bg-white rounded-xl border border-slate-200 p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-slate-800">{branch.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Code: {branch.code}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">{branch.students} Students</span>
              <Badge variant={branch.isActive ? 'success' : 'default'}>
                {branch.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Add New Branch</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g. Kandy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g. KDY"
                  maxLength={5}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={handleAdd} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Add Branch</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
