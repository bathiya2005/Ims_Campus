'use client'
import { useState, useEffect, useRef } from 'react'
import { Download, Users, RefreshCw, FileText, GraduationCap, Award, Calendar, Search } from 'lucide-react'

interface Branch { id: number; name: string }
interface Student {
  id: number; fullName: string; regNumber: string; nicNumber: string; telephone: string
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

const MONTHLY_FEE = 3000
const TOTAL_MONTHS = 6

export default function ReportsPage() {
  const [tab, setTab] = useState<'certificate' | 'diploma' | 'individual'>('certificate')
  const [branches, setBranches] = useState<Branch[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentSearch, setStudentSearch] = useState('')
  const [studentResults, setStudentResults] = useState<Student[]>([])
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7))
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0])
  const printRef = useRef<HTMLDivElement>(null)
  const years = ['2023', '2024', '2025', '2026', '2027']

  useEffect(() => {
    fetch('/api/branches').then(r => r.json()).then(d => { if (Array.isArray(d)) setBranches(d) })
    fetch('/api/students').then(r => r.json()).then(d => { if (Array.isArray(d)) setAllStudents(d) })
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

  const searchStudents = (q: string) => {
    setStudentSearch(q)
    if (q.length < 2) { setStudentResults([]); return }
    const results = allStudents.filter(s =>
      s.fullName.toLowerCase().includes(q.toLowerCase()) ||
      s.regNumber.toLowerCase().includes(q.toLowerCase()) ||
      s.nicNumber.includes(q)
    ).slice(0, 10)
    setStudentResults(results)
  }

  const loadIndividualStudent = async (id: number) => {
    const res = await fetch(`/api/students/${id}`)
    if (res.ok) {
      setSelectedStudent(await res.json())
      setStudentResults([])
      setStudentSearch('')
    }
  }

  const getAttPct = (s: Student) => {
    const total = s.attendance?.length || 0
    const present = s.attendance?.filter((a: any) => a.isPresent).length || 0
    return total > 0 ? Math.round((present / total) * 100) : 0
  }

  const getPaidAmount = (s: Student) => s.coursePayments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
  const getExamFeesPaid = (s: Student) => s.examPayments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
  const getOutstanding = (s: Student) => {
    const isCert = s.batch?.courseLevel?.code === 'CERTIFICATE'
    if (isCert) return 0
    return Math.max(0, TOTAL_MONTHS * MONTHLY_FEE - getPaidAmount(s))
  }

  // Filter students by month or date for reports
  const getMonthlyStudents = () => {
    if (!reportMonth) return students
    return students.filter(s => {
      const payments = s.coursePayments || []
      return payments.some((p: any) => p.paidDate?.startsWith(reportMonth))
    })
  }

  const getDailyStudents = () => {
    if (!reportDate) return students
    return students.filter(s => {
      const att = s.attendance || []
      return att.some((a: any) => a.date?.startsWith(reportDate))
    })
  }

  const downloadPDF = (type: 'full' | 'monthly' | 'daily' | 'student') => {
    window.print()
  }

  const currentStudents = students

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable, #printable * { visibility: visible !important; }
          #printable { position: fixed; left: 0; top: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reports</h1>
          <p className="text-sm text-slate-500">IMS Campus — Program & Student Reports</p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <button onClick={() => downloadPDF('full')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 no-print">
        <div className="border-b border-slate-100 px-4 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
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

        {/* Filters for program tabs */}
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

        {/* Report type filters */}
        {tab !== 'individual' && (
          <div className="p-4 flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-slate-600">Report by:</span>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400"/>
              <label className="text-xs text-slate-600">Month:</label>
              <input type="month" value={reportMonth} onChange={e => setReportMonth(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none"/>
              <button onClick={() => downloadPDF('monthly')}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">
                <Download className="w-3 h-3"/>Monthly Report
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400"/>
              <label className="text-xs text-slate-600">Date:</label>
              <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none"/>
              <button onClick={() => downloadPDF('daily')}
                className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700">
                <Download className="w-3 h-3"/>Daily Report
              </button>
            </div>
          </div>
        )}

        {/* Individual student search */}
        {tab === 'individual' && (
          <div className="p-4 border-b border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Student</label>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
              <input type="text" placeholder="Type name, reg number or NIC..." value={studentSearch}
                onChange={e => searchStudents(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
            </div>
            {studentResults.length > 0 && (
              <div className="mt-2 max-w-sm border border-slate-200 rounded-xl bg-white shadow-lg overflow-hidden">
                {studentResults.map(s => (
                  <button key={s.id} onClick={() => loadIndividualStudent(s.id)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0">
                    <div className="text-sm font-medium text-slate-800">{s.fullName}</div>
                    <div className="text-xs text-slate-500">{s.regNumber} · {s.batch?.courseLevel?.name} · {s.batch?.branch?.name}</div>
                  </button>
                ))}
              </div>
            )}
            {selectedStudent && (
              <div className="mt-3 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl max-w-sm">
                <div>
                  <div className="text-sm font-medium text-blue-800">{selectedStudent.fullName}</div>
                  <div className="text-xs text-blue-600">{selectedStudent.regNumber}</div>
                </div>
                <button onClick={() => downloadPDF('student')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                  <Download className="w-3 h-3"/>PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Printable Report */}
      <div id="printable" ref={printRef}>
        {/* Program Report */}
        {(tab === 'certificate' || tab === 'diploma') && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className={`p-6 ${tab === 'certificate' ? 'bg-blue-600' : 'bg-slate-700'} text-white`}>
              <div className="flex items-center gap-3 mb-1">
                {tab === 'certificate' ? <GraduationCap className="w-6 h-6" /> : <Award className="w-6 h-6" />}
                <h2 className="text-lg font-bold">IMS Campus — {tab === 'certificate' ? 'IT Certificate' : 'IT Diploma'} Program Report</h2>
              </div>
              <p className="text-sm opacity-80">
                {selectedBranch !== 'all' ? branches.find(b => b.id.toString() === selectedBranch)?.name + ' Branch' : 'All Branches'}
                {selectedYear !== 'all' ? ` · ${selectedYear} Batch` : ''}
                {' · '}Generated: {new Date().toLocaleDateString('en-LK')}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{currentStudents.length}</div>
                  <div className="text-xs opacity-80">Total Students</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">
                    {currentStudents.length > 0 ? Math.round(currentStudents.reduce((s, st) => s + getAttPct(st), 0) / currentStudents.length) : 0}%
                  </div>
                  <div className="text-xs opacity-80">Avg Attendance</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">
                    Rs. {currentStudents.reduce((s, st) => s + getPaidAmount(st) + getExamFeesPaid(st), 0).toLocaleString()}
                  </div>
                  <div className="text-xs opacity-80">Total Fees Collected</div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400">Loading...</div>
            ) : currentStudents.length === 0 ? (
              <div className="py-12 text-center text-slate-400">No students found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-3 font-semibold text-slate-600">#</th>
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
                    {currentStudents.map((s, i) => {
                      const attPct = getAttPct(s)
                      const paid = getPaidAmount(s) + getExamFeesPaid(s)
                      const due = getOutstanding(s)
                      const passed = s.examResults?.filter((r: any) => r.isPassed).length || 0
                      const total = s.examResults?.length || 0
                      return (
                        <tr key={s.id} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                          <td className="p-3 text-slate-400">{i+1}</td>
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
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={6} className="p-3 font-semibold text-slate-700">Total</td>
                      <td className="p-3 text-center font-bold text-emerald-600">
                        Rs. {currentStudents.reduce((s, st) => s + getPaidAmount(st) + getExamFeesPaid(st), 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-center font-bold text-red-500">
                        Rs. {currentStudents.reduce((s, st) => s + getOutstanding(st), 0).toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Attendance', value: `${getAttPct(selectedStudent)}%`, color: getAttPct(selectedStudent) >= 75 ? 'text-emerald-600' : 'text-red-500' },
                  { label: 'Fees Paid', value: `Rs. ${(getPaidAmount(selectedStudent) + getExamFeesPaid(selectedStudent)).toLocaleString()}`, color: 'text-blue-600' },
                  { label: 'Outstanding', value: `Rs. ${getOutstanding(selectedStudent).toLocaleString()}`, color: getOutstanding(selectedStudent) > 0 ? 'text-red-500' : 'text-emerald-600' },
                  { label: 'Exams Passed', value: `${selectedStudent.examResults?.filter((r: any) => r.isPassed).length || 0}/${selectedStudent.examResults?.length || 0}`, color: 'text-violet-600' },
                ].map(s => (
                  <div key={s.label} className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

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

              {selectedStudent.batch?.courseLevel?.code !== 'CERTIFICATE' && (
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
              )}

              {selectedStudent.examPayments && selectedStudent.examPayments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Exam Fee Payments</h3>
                  <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 font-semibold text-slate-600">Exam</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Amount</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.examPayments.map((p: any) => (
                        <tr key={p.id} className="border-t border-slate-100">
                          <td className="p-3 text-slate-800">{p.exam?.name}</td>
                          <td className="p-3 text-center text-emerald-600 font-medium">Rs. {p.amount.toLocaleString()}</td>
                          <td className="p-3 text-center text-slate-600">{new Date(p.paidDate).toLocaleDateString('en-LK')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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