'use client'
import { useState, useEffect } from 'react'
import { Download, Users, RefreshCw, FileText, GraduationCap, Award, Calendar, Search } from 'lucide-react'

interface Branch { id: number; name: string }
interface Student {
  id: number; fullName: string; regNumber: string; nicNumber: string; telephone: string
  batch: { year: number; branch: { id: number; name: string }; courseLevel: { name: string; code: string } }
  attendance: any[]; examResults: any[]; coursePayments: any[]; examPayments: any[]
}

function gradeLabel(g: string) {
  if (g === 'A') return 'First Class'
  if (g === 'B') return 'Second Upper'
  if (g === 'C') return 'Second Lower'
  if (g === 'D') return 'Pass'
  return 'Fail'
}

const TOTAL_MONTHS = 6

export default function ReportsPage() {
  const [tab, setTab] = useState<'certificate' | 'diploma' | 'individual'>('certificate')
  const [reportType, setReportType] = useState<'full' | 'payments' | 'attendance'>('full')
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
  const years = ['2023', '2024', '2025', '2026', '2027']

  useEffect(() => {
    fetch('/api/branches').then(r => r.json()).then(d => { if (Array.isArray(d)) setBranches(d) })
    fetch('/api/students').then(r => r.json()).then(d => { if (Array.isArray(d)) setAllStudents(d) })
  }, [])

  useEffect(() => {
    if (tab !== 'individual') loadStudents()
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
    if (res.ok) { setSelectedStudent(await res.json()); setStudentResults([]); setStudentSearch('') }
  }

  const getAttPct = (s: Student) => {
    const total = s.attendance?.length || 0
    const present = s.attendance?.filter((a: any) => a.isPresent).length || 0
    return total > 0 ? Math.round((present / total) * 100) : 0
  }

  const getMonthlyAttPct = (s: Student, month: string) => {
    const recs = s.attendance?.filter((a: any) => a.date?.startsWith(month)) || []
    const present = recs.filter((a: any) => a.isPresent).length
    return recs.length > 0 ? Math.round((present / recs.length) * 100) : 0
  }

  const getDailyAtt = (s: Student, date: string) => {
    const rec = s.attendance?.find((a: any) => a.date?.startsWith(date))
    return rec ? (rec.isPresent ? 'Present' : 'Absent') : 'Not Marked'
  }

  const getPaidAmount = (s: Student) => s.coursePayments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
  const getExamFeesPaid = (s: Student) => s.examPayments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
  const getOutstanding = (s: Student) => {
    if (s.batch?.courseLevel?.code === 'CERTIFICATE') return 0
    const paid = getPaidAmount(s)
    return 0 // No fixed fee - manual amounts
  }

  // Monthly payments filter
  const getMonthlyPayments = (s: Student, month: string) => {
    return s.coursePayments?.filter((p: any) => p.paidDate?.startsWith(month)) || []
  }

  const getDailyPayments = (s: Student, date: string) => {
    return s.coursePayments?.filter((p: any) => p.paidDate?.startsWith(date)) || []
  }

  const branchLabel = selectedBranch !== 'all' ? branches.find(b => b.id.toString() === selectedBranch)?.name + ' Branch' : 'All Branches'

  const downloadPDF = () => window.print()

  return (
    <div className="space-y-6">
      <style>{`@media print { .no-print { display: none !important; } #printable, #printable * { visibility: visible !important; } #printable { position: fixed; left: 0; top: 0; width: 100%; padding: 20px; background: white; } }`}</style>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reports</h1>
          <p className="text-sm text-slate-500">IMS Campus — Program, Payment & Attendance Reports</p>
        </div>
        <button onClick={downloadPDF} className="sm:ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Download className="w-4 h-4"/>Download PDF
        </button>
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
                <t.icon className="w-4 h-4"/>{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Program Filters */}
        {tab !== 'individual' && (
          <>
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
                <RefreshCw className="w-3.5 h-3.5"/>Refresh
              </button>
            </div>

            {/* Report Type */}
            <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
              <span className="text-sm font-medium text-slate-600">Report Type:</span>
              {[
                { id: 'full', label: 'Full Report' },
                { id: 'payments', label: 'Payments Report' },
                { id: 'attendance', label: 'Attendance Report' },
              ].map(rt => (
                <button key={rt.id} onClick={() => setReportType(rt.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${reportType === rt.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {rt.label}
                </button>
              ))}
            </div>

            {/* Date filters */}
            <div className="p-4 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400"/>
                <label className="text-xs text-slate-600 font-medium">Month:</label>
                <input type="month" value={reportMonth} onChange={e => setReportMonth(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none"/>
                <button onClick={downloadPDF} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">
                  <Download className="w-3 h-3"/>Monthly PDF
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400"/>
                <label className="text-xs text-slate-600 font-medium">Date:</label>
                <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none"/>
                <button onClick={downloadPDF} className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700">
                  <Download className="w-3 h-3"/>Daily PDF
                </button>
              </div>
            </div>
          </>
        )}

        {/* Individual Search */}
        {tab === 'individual' && (
          <div className="p-4 border-b border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Student</label>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
              <input type="text" placeholder="Name, reg number or NIC..." value={studentSearch}
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
                  <div className="text-xs text-blue-600">{selectedStudent.regNumber} · {selectedStudent.batch?.courseLevel?.name}</div>
                </div>
                <button onClick={downloadPDF} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                  <Download className="w-3 h-3"/>PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Printable Report */}
      <div id="printable">
        {(tab === 'certificate' || tab === 'diploma') && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className={`p-6 ${tab === 'certificate' ? 'bg-blue-600' : 'bg-slate-700'} text-white`}>
              <div className="flex items-center gap-3 mb-1">
                {tab === 'certificate' ? <GraduationCap className="w-6 h-6"/> : <Award className="w-6 h-6"/>}
                <h2 className="text-lg font-bold">IMS Campus — {tab === 'certificate' ? 'IT Certificate' : 'IT Diploma'} {reportType === 'payments' ? 'Payment' : reportType === 'attendance' ? 'Attendance' : 'Full'} Report</h2>
              </div>
              <p className="text-sm opacity-80">
                {branchLabel}{selectedYear !== 'all' ? ` · ${selectedYear} Batch` : ''} · Generated: {new Date().toLocaleDateString('en-LK')}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{students.length}</div>
                  <div className="text-xs opacity-80">Total Students</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{students.length > 0 ? Math.round(students.reduce((s, st) => s + getAttPct(st), 0) / students.length) : 0}%</div>
                  <div className="text-xs opacity-80">Avg Attendance</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">Rs. {students.reduce((s, st) => s + getPaidAmount(st) + getExamFeesPaid(st), 0).toLocaleString()}</div>
                  <div className="text-xs opacity-80">Total Fees Collected</div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400">Loading...</div>
            ) : students.length === 0 ? (
              <div className="py-12 text-center text-slate-400">No students found</div>
            ) : (
              <div className="overflow-x-auto">
                {/* Full / Payments Report */}
                {(reportType === 'full' || reportType === 'payments') && (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-3 font-semibold text-slate-600">#</th>
                        <th className="text-left p-3 font-semibold text-slate-600">Reg No.</th>
                        <th className="text-left p-3 font-semibold text-slate-600">Name</th>
                        <th className="text-left p-3 font-semibold text-slate-600">Branch</th>
                        <th className="text-left p-3 font-semibold text-slate-600">Batch</th>
                        {reportType === 'full' && <th className="text-center p-3 font-semibold text-slate-600">Attendance</th>}
                        <th className="text-center p-3 font-semibold text-slate-600">Fees Paid</th>
                        <th className="text-left p-3 font-semibold text-slate-600">Payment Dates</th>
                        {reportType === 'full' && <th className="text-center p-3 font-semibold text-slate-600">Exams</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => {
                        const attPct = getAttPct(s)
                        const paid = getPaidAmount(s) + getExamFeesPaid(s)
                        const passed = s.examResults?.filter((r: any) => r.isPassed).length || 0
                        const total = s.examResults?.length || 0
                        const paymentDates = [
                          ...(s.coursePayments || []).map((p: any) => `Month ${p.monthNumber}: Rs.${p.amount?.toLocaleString()} (${new Date(p.paidDate).toLocaleDateString('en-LK')})`),
                          ...(s.examPayments || []).map((p: any) => `${p.exam?.name}: Rs.${p.amount?.toLocaleString()} (${new Date(p.paidDate).toLocaleDateString('en-LK')})`),
                        ]
                        return (
                          <tr key={s.id} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                            <td className="p-3 text-slate-400">{i + 1}</td>
                            <td className="p-3 font-mono text-xs text-slate-600">{s.regNumber}</td>
                            <td className="p-3 font-medium text-slate-800">{s.fullName}</td>
                            <td className="p-3 text-slate-600">{s.batch?.branch?.name}</td>
                            <td className="p-3 text-slate-600">{s.batch?.year}</td>
                            {reportType === 'full' && (
                              <td className="p-3 text-center">
                                <span className={`font-semibold ${attPct >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{attPct}%</span>
                              </td>
                            )}
                            <td className="p-3 text-center text-emerald-600 font-medium">Rs. {paid.toLocaleString()}</td>
                            <td className="p-3 text-xs text-slate-500">
                              {paymentDates.length > 0 ? paymentDates.join(' | ') : '—'}
                            </td>
                            {reportType === 'full' && (
                              <td className="p-3 text-center">
                                <span className={total > 0 ? (passed === total ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium') : 'text-slate-400'}>
                                  {total > 0 ? `${passed}/${total}` : '—'}
                                </span>
                              </td>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                      <tr>
                        <td colSpan={reportType === 'full' ? 6 : 5} className="p-3 font-semibold text-slate-700">Total</td>
                        <td className="p-3 text-center font-bold text-emerald-600">
                          Rs. {students.reduce((s, st) => s + getPaidAmount(st) + getExamFeesPaid(st), 0).toLocaleString()}
                        </td>
                        <td colSpan={reportType === 'full' ? 2 : 1}></td>
                      </tr>
                    </tfoot>
                  </table>
                )}

                {/* Attendance Report */}
                {reportType === 'attendance' && (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-3 font-semibold text-slate-600">#</th>
                        <th className="text-left p-3 font-semibold text-slate-600">Reg No.</th>
                        <th className="text-left p-3 font-semibold text-slate-600">Name</th>
                        <th className="text-left p-3 font-semibold text-slate-600">Branch</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Overall %</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Month ({reportMonth})</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Date ({reportDate})</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <tr key={s.id} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                          <td className="p-3 text-slate-400">{i + 1}</td>
                          <td className="p-3 font-mono text-xs text-slate-600">{s.regNumber}</td>
                          <td className="p-3 font-medium text-slate-800">{s.fullName}</td>
                          <td className="p-3 text-slate-600">{s.batch?.branch?.name}</td>
                          <td className="p-3 text-center">
                            <span className={`font-semibold ${getAttPct(s) >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{getAttPct(s)}%</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-semibold ${getMonthlyAttPct(s, reportMonth) >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{getMonthlyAttPct(s, reportMonth)}%</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={getDailyAtt(s, reportDate) === 'Present' ? 'text-emerald-600 font-medium' : getDailyAtt(s, reportDate) === 'Absent' ? 'text-red-500 font-medium' : 'text-amber-500'}>
                              {getDailyAtt(s, reportDate)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* Individual Report */}
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
                  { label: 'Course Fees', value: `Rs. ${getPaidAmount(selectedStudent).toLocaleString()}`, color: 'text-blue-600' },
                  { label: 'Exam Fees', value: `Rs. ${getExamFeesPaid(selectedStudent).toLocaleString()}`, color: 'text-violet-600' },
                  { label: 'Exams Passed', value: `${selectedStudent.examResults?.filter((r: any) => r.isPassed).length || 0}/${selectedStudent.examResults?.length || 0}`, color: 'text-emerald-600' },
                ].map(s => (
                  <div key={s.label} className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Course Payments with dates */}
              {selectedStudent.coursePayments && selectedStudent.coursePayments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Course Fee Payments</h3>
                  <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 font-semibold text-slate-600">Month</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Amount</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Paid Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.coursePayments.map((p: any) => (
                        <tr key={p.id} className="border-t border-slate-100">
                          <td className="p-3 text-slate-700">Month {p.monthNumber}</td>
                          <td className="p-3 text-center text-emerald-600 font-medium">Rs. {p.amount?.toLocaleString()}</td>
                          <td className="p-3 text-center text-slate-600">{new Date(p.paidDate).toLocaleDateString('en-LK')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Exam Payments with dates */}
              {selectedStudent.examPayments && selectedStudent.examPayments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Exam Fee Payments</h3>
                  <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 font-semibold text-slate-600">Exam</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Amount</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Paid Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.examPayments.map((p: any) => (
                        <tr key={p.id} className="border-t border-slate-100">
                          <td className="p-3 text-slate-800">{p.exam?.name}</td>
                          <td className="p-3 text-center text-emerald-600 font-medium">Rs. {p.amount?.toLocaleString()}</td>
                          <td className="p-3 text-center text-slate-600">{new Date(p.paidDate).toLocaleDateString('en-LK')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

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
            </div>
          </div>
        )}

        {tab === 'individual' && !selectedStudent && (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3"/>
            <p className="text-slate-500">Search for a student to generate their report</p>
          </div>
        )}
      </div>
    </div>
  )
}
