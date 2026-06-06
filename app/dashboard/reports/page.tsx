// app/dashboard/reports/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { BarChart3, Download, Users, CreditCard, ClipboardList, RefreshCw, FileText, GraduationCap, Award } from 'lucide-react'

interface Branch { id: number; name: string }
interface Student {
  id: number; fullName: string; regNumber: string
  batch: { year: number; branch: { name: string }; courseLevel: { name: string; code: string } }
  attendance: any[]; examResults: any[]; coursePayments: any[]; examPayments: any[]
}

function gradeLabel(g: string) {
  if (g === 'A') return 'First Class'
  if (g === 'B') return 'Second Upper'
  if (g === 'C') return 'Second Lower'
  if (g === 'D') return 'Pass'
  return 'Fail'
}

export default function ReportsPage() {
  const [tab, setTab] = useState<'certificate' | 'diploma' | 'individual'>('certificate')
  const [branches, setBranches] = useState<Branch[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const years = ['2023', '2024', '2025', '2026', '2027']

  useEffect(() => {
    fetch('/api/branches').then(r => r.json()).then(d => { if (Array.isArray(d)) setBranches(d) })
  }, [])

  useEffect(() => {
    if (tab === 'individual') return
    loadStudents()
  }, [tab, selectedBranch, selectedYear])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const level = tab === 'certificate' ? 'CERTIFICATE' : 'DIPLOMA'
      let url = `/api/students?level=${level}`
      if (selectedBranch !== 'all') url += `&branchId=${selectedBranch}`
      if (selectedYear !== 'all') url += `&year=${selectedYear}`
      const res = await fetch(url)
      const data = await res.json()
      if (Array.isArray(data)) setStudents(data)
    } catch {} finally { setLoading(false) }
  }

  const loadIndividualStudent = async (id: string) => {
    if (!id) { setSelectedStudent(null); return }
    const res = await fetch(`/api/students/${id}`)
    if (res.ok) setSelectedStudent(await res.json())
  }

  const MONTHLY_FEE = 3000
  const TOTAL_MONTHS = 6

  const printReport = (type: 'program' | 'student') => {
    window.print()
  }

  const downloadPDF = async (type: 'program' | 'student') => {
    // Use browser print to PDF
    window.print()
  }

  const getAttPct = (s: Student) => {
    const total = s.attendance?.length || 0
    const present = s.attendance?.filter((a: any) => a.isPresent).length || 0
    return total > 0 ? Math.round((present / total) * 100) : 0
  }

  const getPaidAmount = (s: Student) => s.coursePayments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
  const getOutstanding = (s: Student) => Math.max(0, TOTAL_MONTHS * MONTHLY_FEE - getPaidAmount(s))

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable, #printable * { visibility: visible; }
          #printable { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reports</h1>
          <p className="text-sm text-slate-500">IMS Campus — Program & Student Reports</p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <button onClick={() => downloadPDF(tab === 'individual' ? 'student' : 'program')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 no-print">
        <div className="border-b border-slate-100 px-4">
          <div className="flex gap-1">
            {[
              { id: 'certificate', label: 'IT Certificate', icon: GraduationCap },
              { id: 'diploma', label: 'IT Diploma', icon: Award },
              { id: 'individual', label: 'Individual Student', icon: Users },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        {tab !== 'individual' && (
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3">
            <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none">
              <option value="all">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none">
              <option value="all">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={loadStudents} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        )}

        {tab === 'individual' && (
          <div className="p-4 border-b border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-1">Search Student</label>
            <input type="text" placeholder="Type reg number or name..."
              className="w-full max-w-sm px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              onChange={async e => {
                if (e.target.value.length < 2) return
                const res = await fetch(`/api/students?search=${e.target.value}`)
                const data = await res.json()
                if (Array.isArray(data) && data.length > 0) loadIndividualStudent(data[0].id)
              }} />
          </div>
        )}
      </div>

      {/* Printable Report */}
      <div id="printable">
        {/* Program Report */}
        {(tab === 'certificate' || tab === 'diploma') && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Report Header */}
            <div className={`p-6 ${tab === 'certificate' ? 'bg-blue-600' : 'bg-slate-700'} text-white`}>
              <div className="flex items-center gap-3 mb-1">
                {tab === 'certificate' ? <GraduationCap className="w-6 h-6" /> : <Award className="w-6 h-6" />}
                <h2 className="text-lg font-bold">IMS Campus — {tab === 'certificate' ? 'IT Certificate' : 'IT Diploma'} Program Report</h2>
              </div>
              <p className="text-sm opacity-80">
                {selectedBranch !== 'all' ? branches.find(b => b.id === parseInt(selectedBranch))?.name + ' Branch' : 'All Branches'}
                {selectedYear !== 'all' ? ` · ${selectedYear} Batch` : ''}
                {' · '}Generated: {new Date().toLocaleDateString('en-LK')}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{students.length}</div>
                  <div className="text-xs opacity-80">Total Students</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">
                    {students.length > 0 ? Math.round(students.reduce((s, st) => s + getAttPct(st), 0) / students.length) : 0}%
                  </div>
                  <div className="text-xs opacity-80">Avg Attendance</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">
                    Rs. {students.reduce((s, st) => s + getPaidAmount(st), 0).toLocaleString()}
                  </div>
                  <div className="text-xs opacity-80">Total Fees Collected</div>
                </div>
              </div>
            </div>

            {/* Student Table */}
            {loading ? (
              <div className="py-12 text-center text-slate-400">Loading...</div>
            ) : students.length === 0 ? (
              <div className="py-12 text-center text-slate-400">No students found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-3 font-semibold text-slate-600">Reg No.</th>
                      <th className="text-left p-3 font-semibold text-slate-600">Name</th>
                      <th className="text-left p-3 font-semibold text-slate-600">Branch</th>
                      <th className="text-left p-3 font-semibold text-slate-600">Batch</th>
                      <th className="text-center p-3 font-semibold text-slate-600">Attendance</th>
                      <th className="text-center p-3 font-semibold text-slate-600">Fees Paid</th>
                      <th className="text-center p-3 font-semibold text-slate-600">Outstanding</th>
                      <th className="text-center p-3 font-semibold text-slate-600">Exams</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => {
                      const attPct = getAttPct(s)
                      const paid = getPaidAmount(s)
                      const due = getOutstanding(s)
                      const passed = s.examResults?.filter((r: any) => r.isPassed).length || 0
                      const total = s.examResults?.length || 0
                      return (
                        <tr key={s.id} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                          <td className="p-3 font-mono text-xs text-slate-600">{s.regNumber}</td>
                          <td className="p-3 font-medium text-slate-800">{s.fullName}</td>
                          <td className="p-3 text-slate-600">{s.batch?.branch?.name}</td>
                          <td className="p-3 text-slate-600">{s.batch?.year}</td>
                          <td className="p-3 text-center">
                            <span className={`font-semibold ${attPct >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{attPct}%</span>
                          </td>
                          <td className="p-3 text-center text-emerald-600 font-medium">Rs. {paid.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className={due > 0 ? 'text-red-500 font-medium' : 'text-emerald-600 font-medium'}>
                              {due > 0 ? `Rs. ${due.toLocaleString()}` : '✓ Paid'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={total > 0 ? (passed === total ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium') : 'text-slate-400'}>
                              {total > 0 ? `${passed}/${total}` : '—'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Individual Student Report */}
        {tab === 'individual' && selectedStudent && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <h2 className="text-lg font-bold mb-1">Student Report — {selectedStudent.fullName}</h2>
              <p className="text-sm text-blue-100">
                {selectedStudent.regNumber} · {selectedStudent.batch?.courseLevel?.name} · {selectedStudent.batch?.branch?.name} · {selectedStudent.batch?.year} Batch
              </p>
              <p className="text-xs text-blue-200 mt-1">Generated: {new Date().toLocaleDateString('en-LK')}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Attendance', value: `${getAttPct(selectedStudent)}%`, color: getAttPct(selectedStudent) >= 75 ? 'text-emerald-600' : 'text-red-500' },
                  { label: 'Fees Paid', value: `Rs. ${getPaidAmount(selectedStudent).toLocaleString()}`, color: 'text-blue-600' },
                  { label: 'Outstanding', value: `Rs. ${getOutstanding(selectedStudent).toLocaleString()}`, color: getOutstanding(selectedStudent) > 0 ? 'text-red-500' : 'text-emerald-600' },
                  { label: 'Exams Passed', value: `${selectedStudent.examResults?.filter((r: any) => r.isPassed).length || 0}/${selectedStudent.examResults?.length || 0}`, color: 'text-violet-600' },
                ].map(s => (
                  <div key={s.label} className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Exam Results */}
              {selectedStudent.examResults && selectedStudent.examResults.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Exam Results</h3>
                  <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 font-semibold text-slate-600">Exam</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Marks</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Grade</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.examResults.map((r: any) => (
                        <tr key={r.id} className="border-t border-slate-100">
                          <td className="p-3 text-slate-800">{r.exam?.name}</td>
                          <td className="p-3 text-center text-slate-700">{r.marks}/100</td>
                          <td className="p-3 text-center">
                            <span className={`font-bold ${r.grade === 'A' ? 'text-emerald-600' : r.grade === 'B' ? 'text-blue-600' : r.grade === 'C' ? 'text-cyan-600' : r.grade === 'D' ? 'text-amber-600' : 'text-red-600'}`}>
                              {r.grade} — {gradeLabel(r.grade)}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${r.isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {r.isPassed ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Course Payments */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Course Fee Payments</h3>
                <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-slate-600">Month</th>
                      <th className="text-center p-3 font-semibold text-slate-600">Amount</th>
                      <th className="text-center p-3 font-semibold text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: TOTAL_MONTHS }, (_, i) => i + 1).map(m => {
                      const payment = selectedStudent.coursePayments?.find((p: any) => p.monthNumber === m)
                      return (
                        <tr key={m} className="border-t border-slate-100">
                          <td className="p-3 text-slate-700">Month {m}</td>
                          <td className="p-3 text-center text-slate-700">Rs. {MONTHLY_FEE.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            {payment
                              ? <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Paid — {new Date(payment.paidDate).toLocaleDateString('en-LK')}</span>
                              : <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">Pending</span>
                            }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'individual' && !selectedStudent && (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">Search for a student to generate their report</p>
          </div>
        )}
      </div>
    </div>
  )
}