'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Plus, Users, GraduationCap, Award, ArrowRight, X, RefreshCw } from 'lucide-react'

interface Branch { id: number; name: string }
interface Batch {
  id: number; year: number; isActive: boolean
  branch: { id: number; name: string }
  courseLevel: { name: string; code: string }
  _count: { students: number }
}

const currentYear = new Date().getFullYear()
const years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]

export default function BatchesPage() {
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterBranch, setFilterBranch] = useState('all')
  const [batches, setBatches] = useState<Batch[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ year: String(currentYear), branchId: '', level: 'CERTIFICATE' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [batchRes, branchRes] = await Promise.all([
        fetch('/api/batches'),
        fetch('/api/branches'),
      ])
      if (batchRes.ok) setBatches(await batchRes.json())
      if (branchRes.ok) setBranches(await branchRes.json())
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = batches.filter(b => {
    const matchLevel = filterLevel === 'all' || b.courseLevel.code.toLowerCase() === filterLevel
    const matchBranch = filterBranch === 'all' || b.branch.id.toString() === filterBranch
    return matchLevel && matchBranch
  })

  const certBatches = filtered.filter(b => b.courseLevel.code === 'CERTIFICATE')
  const dipBatches = filtered.filter(b => b.courseLevel.code === 'DIPLOMA')

  const createBatch = async () => {
    if (!form.branchId) { setMsg('❌ Select a branch'); setTimeout(() => setMsg(''), 3000); return }
    setSaving(true)
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: form.year, branchId: form.branchId, level: form.level }),
      })
      if (res.ok) {
        setMsg('✅ Batch created!')
        setShowAdd(false)
        load()
        setTimeout(() => setMsg(''), 3000)
      } else {
        const d = await res.json()
        setMsg('❌ ' + (d.message || 'Failed'))
        setTimeout(() => setMsg(''), 3000)
      }
    } catch { setMsg('❌ Error') } finally { setSaving(false) }
  }

  const BatchCard = ({ batch }: { batch: Batch }) => {
    const level = batch.courseLevel.code === 'CERTIFICATE' ? 'certificate' : 'diploma'
    return (
      <Link href={`/dashboard/${level}/${batch.branch.id}/${batch.year}`}
        className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 ${level === 'certificate' ? 'bg-blue-50' : 'bg-slate-100'} rounded-xl flex items-center justify-center`}>
            <Calendar className={`w-5 h-5 ${level === 'certificate' ? 'text-blue-600' : 'text-slate-600'}`}/>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-all mt-1"/>
        </div>
        <div className="font-bold text-slate-800 text-lg">{batch.year}</div>
        <div className="text-sm text-slate-600">{batch.branch.name}</div>
        <div className="text-xs text-slate-400 mt-0.5">{batch.courseLevel.name}</div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5"/>
            <span>{batch._count.students} Students</span>
          </div>
          {batch.year === currentYear && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Current</span>}
        </div>
      </Link>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Batch Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">IMS Campus — All batches across branches</p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <RefreshCw className="w-4 h-4"/>
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4"/>Create Batch
          </button>
        </div>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${msg.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none">
          <option value="all">All Levels</option>
          <option value="certificate">IT Certificate</option>
          <option value="diploma">IT Diploma</option>
        </select>
        <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none">
          <option value="all">All Branches</option>
          {branches.map(b => <option key={b.id} value={b.id.toString()}>{b.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="py-16 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3"/>
          <p className="text-slate-500 font-medium">No batches found</p>
          <button onClick={() => setShowAdd(true)} className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 mx-auto">
            <Plus className="w-4 h-4"/>Create First Batch
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {(filterLevel === 'all' || filterLevel === 'certificate') && certBatches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 text-blue-600"/>
                <h2 className="font-semibold text-slate-800">IT Certificate ({certBatches.length})</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {certBatches.map(b => <BatchCard key={b.id} batch={b}/>)}
              </div>
            </div>
          )}
          {(filterLevel === 'all' || filterLevel === 'diploma') && dipBatches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-slate-600"/>
                <h2 className="font-semibold text-slate-800">IT Diploma ({dipBatches.length})</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {dipBatches.map(b => <BatchCard key={b.id} batch={b}/>)}
              </div>
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Create New Batch</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Program *</label>
                <select value={form.level} onChange={e => setForm({...form, level: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none">
                  <option value="CERTIFICATE">IT Certificate</option>
                  <option value="DIPLOMA">IT Diploma</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Branch *</label>
                <select value={form.branchId} onChange={e => setForm({...form, branchId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none">
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Batch Year *</label>
                <select value={form.year} onChange={e => setForm({...form, year: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={createBatch} disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                  {saving ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
