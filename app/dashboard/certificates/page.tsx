'use client'
import { useState } from 'react'
import { Award, Search, Download, Printer, GraduationCap, CheckCircle, XCircle } from 'lucide-react'
import Badge from '@/components/ui/Badge'

export default function CertificatesPage() {
  const [search, setSearch] = useState('')
  const [filterBranch, setFilterBranch] = useState('all')
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterYear, setFilterYear] = useState('all')

  const branches = ['Galle', 'Matara', 'Nugegoda', 'Gampaha', 'Meegoda', 'Horana', 'Ratnapura']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Certificate & Diploma Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">IMS Campus — Manage and issue student certificates and diplomas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Eligible Students', value: '0', icon: CheckCircle, color: 'bg-emerald-600' },
          { label: 'Certificates Issued', value: '0', icon: Award, color: 'bg-blue-600' },
          { label: 'Diplomas Issued', value: '0', icon: GraduationCap, color: 'bg-violet-600' },
          { label: 'Pending Issue', value: '0', icon: XCircle, color: 'bg-amber-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Eligibility Criteria */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4" />
          Certificate / Diploma Eligibility Criteria
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-amber-700">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>All 6 course fee months paid</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>All exam fees paid</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>All exams passed (or repeat exams cleared)</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student by name or registration number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
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
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none">
            <option value="all">All Batches</option>
            {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Eligible Students</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs hover:bg-slate-50">
            <Download className="w-3.5 h-3.5" />
            Export List
          </button>
        </div>

        <div className="py-16 text-center">
          <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-slate-600 font-semibold">No eligible students yet</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            Students who complete all payments and pass all exams will appear here for certificate/diploma issuance.
          </p>
        </div>
      </div>

      {/* Certificate Preview Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Printer className="w-4 h-4 text-blue-600" />
          Certificate Template Preview
        </h3>
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50">
          <div className="max-w-md mx-auto">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">IMS Campus</div>
            <div className="text-2xl font-bold text-slate-800 mb-1">Certificate of Completion</div>
            <div className="text-sm text-slate-500 mb-4">IT Certificate Program</div>
            <div className="text-slate-400 text-sm">
              This is to certify that
            </div>
            <div className="text-lg font-bold text-slate-700 my-2">[Student Full Name]</div>
            <div className="text-sm text-slate-500">
              has successfully completed the IT Certificate program at IMS Campus, [Branch] branch,
              [Year] Batch with <span className="font-medium">[Grade]</span>.
            </div>
            <div className="mt-4 text-xs text-slate-400">[Date of Completion]</div>
          </div>
        </div>
      </div>
    </div>
  )
}
