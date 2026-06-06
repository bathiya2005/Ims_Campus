'use client'
import { useState, useEffect } from 'react'
import { Building2, Plus, Search, Edit2, Trash2, X, Save, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface Branch {
  id: number; name: string; code: string; isActive: boolean; studentCount?: number
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editBranch, setEditBranch] = useState<Branch | null>(null)
  const [form, setForm] = useState({ name: '', code: '' })
  const [editForm, setEditForm] = useState({ name: '', code: '', isActive: true })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/branches?withStudents=true')
      if (res.ok) setBranches(await res.json())
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const addBranch = async () => {
    if (!form.name || !form.code) { showMsg('❌ Name and code required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        await load()
        setForm({ name: '', code: '' })
        setShowAdd(false)
        showMsg('✅ Branch added!')
      } else {
        const d = await res.json()
        showMsg('❌ ' + (d.message || 'Failed'))
      }
    } catch { showMsg('❌ Error') } finally { setSaving(false) }
  }

  const openEdit = (b: Branch) => {
    setEditBranch(b)
    setEditForm({ name: b.name, code: b.code, isActive: b.isActive })
  }

  const saveEdit = async () => {
    if (!editBranch) return
    setSaving(true)
    try {
      const res = await fetch(`/api/branches/${editBranch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        await load()
        setEditBranch(null)
        showMsg('✅ Branch updated!')
      } else {
        const d = await res.json()
        showMsg('❌ ' + (d.message || 'Failed'))
      }
    } catch { showMsg('❌ Error') } finally { setSaving(false) }
  }

  const deleteBranch = async (b: Branch) => {
    if (!confirm(`Delete "${b.name}" branch?`)) return
    try {
      const res = await fetch(`/api/branches/${b.id}`, { method: 'DELETE' })
      if (res.ok) { await load(); showMsg('✅ Branch deleted!') }
      else { const d = await res.json(); showMsg('❌ ' + (d.message || 'Failed')) }
    } catch { showMsg('❌ Error') }
  }

  const filtered = branches.filter(b =>
    !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Branches</h1>
          <p className="text-sm text-slate-500">Manage IMS Campus branch locations</p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <RefreshCw className="w-4 h-4"/>
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4"/>Add Branch
          </button>
        </div>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${msg.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <input type="text" placeholder="Search branches..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Branch List</h3>
          <span className="text-sm text-slate-500">{filtered.length} branches</span>
        </div>
        {loading ? (
          <div className="py-16 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['#', 'Branch Name', 'Code', 'Students', 'Status', 'Actions'].map(h => (
                    <th key={h} className={`p-4 text-xs font-semibold text-slate-500 uppercase ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4 text-sm text-slate-400">{i + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-blue-600"/>
                        </div>
                        <span className="font-medium text-slate-800">{b.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-600">{b.code}</td>
                    <td className="p-4 text-sm text-slate-600">{b.studentCount || 0} students</td>
                    <td className="p-4">
                      <Badge variant={b.isActive ? 'success' : 'default'}>{b.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(b)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                          <Edit2 className="w-4 h-4"/>
                        </button>
                        <button onClick={() => deleteBranch(b)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Add New Branch</h3>
              <button onClick={() => setShowAdd(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Branch Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g. Colombo" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Branch Code *</label>
                <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  placeholder="e.g. CMB" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={addBranch} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                  <Plus className="w-4 h-4"/>{saving ? 'Adding...' : 'Add Branch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editBranch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Edit Branch</h3>
              <button onClick={() => setEditBranch(null)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Branch Name *</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Branch Code *</label>
                <input type="text" value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <select value={editForm.isActive ? 'active' : 'inactive'} onChange={e => setEditForm({...editForm, isActive: e.target.value === 'active'})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditBranch(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={saveEdit} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                  <Save className="w-4 h-4"/>{saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}