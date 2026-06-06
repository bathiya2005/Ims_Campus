'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Plus, Users, GraduationCap, Award, ArrowRight } from 'lucide-react'
import Badge from '@/components/ui/Badge'

const branches = [
  { id: 1, name: 'Galle' }, { id: 2, name: 'Matara' }, { id: 3, name: 'Nugegoda' },
  { id: 4, name: 'Gampaha' }, { id: 5, name: 'Meegoda' }, { id: 6, name: 'Horana' },
  { id: 7, name: 'Ratnapura' },
]
const years = [2023, 2024, 2025, 2026, 2027]
const currentYear = new Date().getFullYear()

export default function BatchesPage() {
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterBranch, setFilterBranch] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ year: String(currentYear), branchId: '', level: 'certificate' })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Batch Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">IMS Campus — All batches across branches and course levels</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="sm:ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Batch
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterLevel}
          onChange={e => setFilterLevel(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Levels</option>
          <option value="certificate">IT Certificate</option>
          <option value="diploma">IT Diploma</option>
        </select>
        <select
          value={filterBranch}
          onChange={e => setFilterBranch(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Branches</option>
          {branches.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
        </select>
      </div>

      {/* Batch Grid */}
      <div className="space-y-6">
        {['certificate', 'diploma'].filter(l => filterLevel === 'all' || filterLevel === l).map(level => (
          <div key={level}>
            <div className="flex items-center gap-2 mb-3">
              {level === 'certificate'
                ? <GraduationCap className="w-5 h-5 text-blue-600" />
                : <Award className="w-5 h-5 text-slate-600" />
              }
              <h2 className="font-semibold text-slate-800">
                IT {level === 'certificate' ? 'Certificate' : 'Diploma'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {branches
                .filter(b => filterBranch === 'all' || String(b.id) === filterBranch)
                .map(branch => (
                  years.map(year => (
                    <Link
                      key={`${branch.id}-${year}`}
                      href={`/dashboard/${level}/${branch.id}/${year}`}
                      className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all card-hover"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 ${level === 'certificate' ? 'bg-blue-50' : 'bg-slate-100'} rounded-xl flex items-center justify-center`}>
                          <Calendar className={`w-5 h-5 ${level === 'certificate' ? 'text-blue-600' : 'text-slate-600'}`} />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all mt-1" />
                      </div>
                      <div className="font-bold text-slate-800 text-lg">{year}</div>
                      <div className="text-sm text-slate-600">{branch.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        IT {level === 'certificate' ? 'Certificate' : 'Diploma'}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Users className="w-3.5 h-3.5" />
                          <span>0 Students</span>
                        </div>
                        {year === currentYear && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Current</span>
                        )}
                      </div>
                    </Link>
                  ))
                ))
              }
            </div>
          </div>
        ))}
      </div>

      {/* Add Batch Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Create New Batch</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Level *</label>
                <select
                  value={form.level}
                  onChange={e => setForm({ ...form, level: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="certificate">IT Certificate</option>
                  <option value="diploma">IT Diploma</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch *</label>
                <select
                  value={form.branchId}
                  onChange={e => setForm({ ...form, branchId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Batch Year *</label>
                <select
                  value={form.year}
                  onChange={e => setForm({ ...form, year: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Create Batch</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
