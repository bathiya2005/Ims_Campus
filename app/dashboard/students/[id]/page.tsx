'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { User, Phone, CreditCard, ClipboardList, BookOpen, ArrowLeft, Award, AlertCircle, DollarSign, CheckCircle, XCircle, Plus, Save } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface Exam { id: number; name: string; fee: number; courseLevel?: string | null }

interface Student {
  id: number; fullName: string; regNumber: string; nicNumber: string; telephone: string; photoPath: string | null; isActive: boolean
  batch: { year: number; branch: { name: string }; courseLevel: { name: string; code: string } }
  attendance: Array<{ id: number; date: string; isPresent: boolean }>
  examResults: Array<{ id: number; marks: number; grade: string; isPassed: boolean; exam: { id: number; name: string; fee: number } }>
  coursePayments: Array<{ id: number; monthNumber: number; amount: number; paidDate: string }>
  examPayments: Array<{ id: number; amount: number; paidDate: string; exam: { id: number; name: string } }>
  repeatExams: Array<{ id: number; attemptNo: number; isPassed: boolean; fee: number; isPaid: boolean; exam: { name: string } }>
}

const TOTAL_MONTHS = 6

function gradeColor(g: string) {
  if (g === 'A') return 'text-emerald-600'
  if (g === 'B') return 'text-blue-600'
  if (g === 'C') return 'text-cyan-600'
  if (g === 'D') return 'text-amber-600'
  return 'text-red-600'
}

function gradeLabel(g: string) {
  if (g === 'A') return 'First Class'
  if (g === 'B') return 'Second Upper'
  if (g === 'C') return 'Second Lower'
  if (g === 'D') return 'Pass'
  return 'Fail'
}

// Calculate final result from all exam marks (average / 4 based)
function calcFinalResult(examResults: Array<{ marks: number; grade: string; isPassed: boolean }>) {
  if (examResults.length === 0) return null
  const total = examResults.reduce((s, r) => s + (r.marks || 0), 0)
  const avg = total / examResults.length
  const scaled = avg / 4 // divide by 4 as per requirement
  if (scaled >= 21.25) return { grade: 'A', label: 'First Class' }
  if (scaled >= 18.75) return { grade: 'B', label: 'Second Upper' }
  if (scaled >= 16.25) return { grade: 'C', label: 'Second Lower' }
  if (scaled >= 12.5) return { grade: 'D', label: 'Pass' }
  return { grade: 'F', label: 'Fail' }
}

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [student, setStudent] = useState<Student | null>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('attendance')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0])
  const [attPresent, setAttPresent] = useState(true)

  const [cpMonth, setCpMonth] = useState(1)
  const [cpAmount, setCpAmount] = useState(3000)
  const [cpDate, setCpDate] = useState(new Date().toISOString().split('T')[0])

  const [epExam, setEpExam] = useState('')
  const [epAmount, setEpAmount] = useState(1000)
  const [epDate, setEpDate] = useState(new Date().toISOString().split('T')[0])

  const [erExam, setErExam] = useState('')
  const [erMarks, setErMarks] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [stuRes, exRes] = await Promise.all([
        fetch(`/api/students/${id}`),
        fetch('/api/exams'),
      ])
      if (stuRes.ok) setStudent(await stuRes.json())
      if (exRes.ok) setExams(await exRes.json())
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  useEffect(() => {
    const exam = exams.find(e => e.name === epExam)
    if (exam) setEpAmount(exam.fee)
  }, [epExam, exams])

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3500) }

  const isCertificate = student?.batch?.courseLevel?.code === 'CERTIFICATE'

  const programExams = exams.filter(e =>
    e.courseLevel === student?.batch?.courseLevel?.code || e.courseLevel === null || e.courseLevel === undefined
  )

  const markAttendance = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: attDate, attendance: { [id]: attPresent } }),
      })
      if (res.ok) { showMsg('✅ Attendance saved!'); load() }
      else showMsg('❌ Failed to save attendance')
    } catch { showMsg('❌ Error') } finally { setSaving(false) }
  }

  const addCoursePayment = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/payments/course', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: id, monthNumber: cpMonth, amount: cpAmount, paidDate: cpDate }),
      })
      if (res.ok) { showMsg('✅ Payment recorded!'); load() }
      else { const d = await res.json(); showMsg('❌ ' + (d.message || 'Failed')) }
    } catch { showMsg('❌ Error') } finally { setSaving(false) }
  }

  const addExamPayment = async () => {
    if (!epExam) { showMsg('❌ Select an exam'); return }
    setSaving(true)
    try {
      const exam = programExams.find(e => e.name === epExam)
      if (!exam) { showMsg('❌ Exam not found'); setSaving(false); return }
      const res = await fetch('/api/payments/exam', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: id, examId: exam.id, amount: epAmount, paidDate: epDate }),
      })
      if (res.ok) { showMsg('✅ Exam payment recorded!'); load() }
      else { const d = await res.json(); showMsg('❌ ' + (d.message || 'Failed')) }
    } catch { showMsg('❌ Error') } finally { setSaving(false) }
  }

  const addExamResult = async () => {
    if (!erExam || !erMarks) { showMsg('❌ Fill all fields'); return }
    setSaving(true)
    try {
      const exam = programExams.find(e => e.name === erExam)
      if (!exam) { showMsg('❌ Exam not found'); setSaving(false); return }
      const res = await fetch('/api/exams/results', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: id, examId: exam.id, marks: erMarks }),
      })
      if (res.ok) { showMsg('✅ Result saved!'); load() }
      else { const d = await res.json(); showMsg('❌ ' + (d.message || 'Failed')) }
    } catch { showMsg('❌ Error') } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
  if (!student) return <div className="text-center py-16 text-slate-500">Student not found</div>

  const totalDays = student.attendance.length
  const presentDays = student.attendance.filter(a => a.isPresent).length
  const attPct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
  const paidMonths = student.coursePayments.length
  const paidAmount = student.coursePayments.reduce((s, p) => s + p.amount, 0)
  const totalMonthlyFee = student.coursePayments.reduce((s, p) => s + p.amount, 0)
  const passedExams = student.examResults.filter(r => r.isPassed).length
  const totalExams = student.examResults.length
  const totalExamFeesPaid = student.examPayments.reduce((s, p) => s + p.amount, 0)
  const finalResult = calcFinalResult(student.examResults)

  const tabs = [
    { id: 'attendance', label: 'Attendance', icon: ClipboardList },
    ...(!isCertificate ? [{ id: 'course-payment', label: 'Course Fees', icon: DollarSign }] : []),
    { id: 'exam-payment', label: 'Exam Fees', icon: BookOpen },
    { id: 'exam-result', label: 'Exam Results', icon: Award },
    { id: 'progress', label: 'Progress', icon: CheckCircle },
  ]

  const stats = isCertificate ? [
    { label: 'Attendance', value: `${attPct}%`, sub: `${presentDays}/${totalDays} days`, icon: ClipboardList, color: attPct >= 75 ? 'bg-emerald-600' : 'bg-red-500' },
    { label: 'Exam Fees Paid', value: `Rs.${totalExamFeesPaid.toLocaleString()}`, sub: `${student.examPayments.length} payments`, icon: DollarSign, color: 'bg-blue-600' },
    { label: 'Exams Passed', value: `${passedExams}/${totalExams}`, sub: totalExams === 0 ? 'No exams yet' : passedExams === totalExams ? 'All passed!' : 'In progress', icon: BookOpen, color: 'bg-violet-600' },
    { label: 'Final Result', value: finalResult ? finalResult.grade : '—', sub: finalResult ? finalResult.label : 'No results yet', icon: Award, color: finalResult?.grade === 'A' ? 'bg-emerald-600' : finalResult?.grade === 'F' ? 'bg-red-500' : 'bg-blue-600' },
  ] : [
    { label: 'Attendance', value: `${attPct}%`, sub: `${presentDays}/${totalDays} days`, icon: ClipboardList, color: attPct >= 75 ? 'bg-emerald-600' : 'bg-red-500' },
    { label: 'Course Paid', value: `Rs.${paidAmount.toLocaleString()}`, sub: `${paidMonths} months paid`, icon: DollarSign, color: 'bg-blue-600' },
    { label: 'Exams Passed', value: `${passedExams}/${totalExams}`, sub: totalExams === 0 ? 'No exams yet' : passedExams === totalExams ? 'All passed!' : 'In progress', icon: BookOpen, color: 'bg-violet-600' },
    { label: 'Final Result', value: finalResult ? finalResult.grade : '—', sub: finalResult ? finalResult.label : 'No results yet', icon: Award, color: finalResult?.grade === 'A' ? 'bg-emerald-600' : finalResult?.grade === 'F' ? 'bg-red-500' : 'bg-blue-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/students" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />All Students
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-sm text-slate-800">{student.fullName}</span>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${msg.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
            {student.photoPath ? <img src={student.photoPath} alt={student.fullName} className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-blue-400" />}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{student.fullName}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-sm text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">{student.regNumber}</span>
                  <Badge variant="info">{student.batch.courseLevel.name}</Badge>
                  <Badge variant="default">{student.batch.branch.name}</Badge>
                  <Badge variant="default">{student.batch.year} Batch</Badge>
                  {isCertificate && <Badge variant="warning">Certificate — Exam Fees Only</Badge>}
                </div>
              </div>
              <Badge variant={student.isActive ? 'success' : 'default'}>{student.isActive ? 'Active' : 'Inactive'}</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-slate-400" /><div><div className="text-xs text-slate-500">NIC</div><div className="text-sm font-medium">{student.nicNumber}</div></div></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /><div><div className="text-xs text-slate-500">Phone</div><div className="text-sm font-medium">{student.telephone}</div></div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center`}><s.icon className="w-4 h-4 text-white" /></div>
              <span className="text-xs text-slate-500 font-medium">{s.label}</span>
            </div>
            <div className="text-xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="border-b border-slate-100 px-4 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <t.icon className="w-3.5 h-3.5" />{t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {/* ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 rounded-xl p-3"><div className="text-2xl font-bold text-slate-800">{totalDays}</div><div className="text-xs text-slate-500">Total Days</div></div>
                <div className="bg-emerald-50 rounded-xl p-3"><div className="text-2xl font-bold text-emerald-700">{presentDays}</div><div className="text-xs text-emerald-600">Present</div></div>
                <div className="bg-red-50 rounded-xl p-3"><div className="text-2xl font-bold text-red-700">{totalDays - presentDays}</div><div className="text-xs text-red-600">Absent</div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">Attendance Rate</span><span className={attPct >= 75 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>{attPct}%</span></div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${attPct >= 75 ? 'bg-emerald-500' : 'bg-red-400'}`} style={{ width: `${attPct}%` }}></div></div>
              </div>
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Mark Attendance</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                    <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                    <select value={attPresent ? 'present' : 'absent'} onChange={e => setAttPresent(e.target.value === 'present')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none">
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button onClick={markAttendance} disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                      <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Mark'}
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Attendance History</h4>
                {student.attendance.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No attendance records yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-slate-100"><th className="text-left p-3 text-xs font-semibold text-slate-500">Date</th><th className="text-left p-3 text-xs font-semibold text-slate-500">Status</th></tr></thead>
                      <tbody>
                        {student.attendance.slice().reverse().slice(0, 20).map(a => (
                          <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="p-3 text-sm text-slate-700">{new Date(a.date).toLocaleDateString('en-LK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                            <td className="p-3"><Badge variant={a.isPresent ? 'success' : 'danger'}>{a.isPresent ? 'Present' : 'Absent'}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* COURSE PAYMENT — Diploma only, manual amount */}
          {activeTab === 'course-payment' && !isCertificate && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-emerald-50 rounded-xl p-3"><div className="text-2xl font-bold text-emerald-700">{paidMonths}</div><div className="text-xs text-emerald-600">Paid Months</div></div>
                <div className="bg-amber-50 rounded-xl p-3"><div className="text-2xl font-bold text-amber-700">{TOTAL_MONTHS - paidMonths}</div><div className="text-xs text-amber-600">Remaining</div></div>
                <div className="bg-blue-50 rounded-xl p-3"><div className="text-xl font-bold text-blue-700">Rs.{totalMonthlyFee.toLocaleString()}</div><div className="text-xs text-blue-600">Total Paid</div></div>
              </div>
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Record Course Payment</h4>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 mb-3">
                  Enter the actual fee amount — it can vary per month.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Month</label>
                    <select value={cpMonth} onChange={e => setCpMonth(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none">
                      {Array.from({ length: TOTAL_MONTHS }, (_, i) => i + 1).map(m => {
                        const paid = student.coursePayments.find(p => p.monthNumber === m)
                        return <option key={m} value={m}>Month {m} {paid ? '✓' : '⏳'}</option>
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Amount (Rs.) *</label>
                    <input type="number" value={cpAmount} onChange={e => setCpAmount(Number(e.target.value))} placeholder="Enter amount" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                    <input type="date" value={cpDate} onChange={e => setCpDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-end">
                    <button onClick={addCoursePayment} disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60">
                      <Plus className="w-4 h-4" />{saving ? 'Saving...' : 'Record'}
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Payment Summary</h4>
                <div className="space-y-2">
                  {Array.from({ length: TOTAL_MONTHS }, (_, i) => i + 1).map(m => {
                    const payment = student.coursePayments.find(p => p.monthNumber === m)
                    return (
                      <div key={m} className="flex items-center justify-between py-2.5 px-4 bg-slate-50 rounded-xl">
                        <span className="text-sm font-medium text-slate-700">Month {m}</span>
                        <div className="flex items-center gap-3">
                          {payment ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-emerald-600">Rs. {payment.amount.toLocaleString()}</span>
                              <Badge variant="success">Paid</Badge>
                              <span className="text-xs text-slate-400">{new Date(payment.paidDate).toLocaleDateString('en-LK')}</span>
                            </div>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 p-3 bg-slate-100 rounded-xl flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Total Paid</span>
                  <span className="text-emerald-600 font-bold">Rs. {totalMonthlyFee.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* EXAM PAYMENT */}
          {activeTab === 'exam-payment' && (
            <div className="space-y-4">
              {isCertificate && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                  IT Certificate students pay exam fees only — no monthly course fees.
                </div>
              )}
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Record Exam Fee Payment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Exam</label>
                    <select value={epExam} onChange={e => setEpExam(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none">
                      <option value="">Select Exam</option>
                      {programExams.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Amount (Rs.)</label>
                    <input type="number" value={epAmount} onChange={e => setEpAmount(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                    <input type="date" value={epDate} onChange={e => setEpDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-end">
                    <button onClick={addExamPayment} disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-60">
                      <Plus className="w-4 h-4" />{saving ? 'Saving...' : 'Record'}
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Exam Fee Summary</h4>
                <div className="space-y-2">
                  {programExams.map(exam => {
                    const payments = student.examPayments.filter(p => p.exam.name === exam.name)
                    const paid = payments.length > 0
                    return (
                      <div key={exam.id} className="flex items-center justify-between py-2.5 px-4 bg-slate-50 rounded-xl">
                        <span className="text-sm font-medium text-slate-700">{exam.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-600">Rs. {exam.fee.toLocaleString()}</span>
                          {paid ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="success">Paid</Badge>
                              <span className="text-xs text-slate-400">{new Date(payments[0].paidDate).toLocaleDateString('en-LK')}</span>
                            </div>
                          ) : <Badge variant="warning">Pending</Badge>}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {student.examPayments.length > 0 && (
                  <div className="mt-3 p-3 bg-violet-50 rounded-xl border border-violet-200">
                    <div className="text-sm font-medium text-violet-700">Total Exam Fees Paid: Rs. {totalExamFeesPaid.toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EXAM RESULT */}
          {activeTab === 'exam-result' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Add Exam Result</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Exam</label>
                    <select value={erExam} onChange={e => setErExam(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none">
                      <option value="">Select Exam</option>
                      {programExams.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Marks (0-100)</label>
                    <input type="number" min="0" max="100" value={erMarks} onChange={e => setErMarks(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none" placeholder="e.g. 75" />
                  </div>
                  <div className="flex items-end">
                    <button onClick={addExamResult} disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-60">
                      <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Result'}
                    </button>
                  </div>
                </div>
                {erMarks && Number(erMarks) >= 0 && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-600">Grade Preview: </span>
                    {(() => {
                      const m = Number(erMarks)
                      let g = 'F', l = 'Fail', c = 'text-red-600'
                      if (m >= 85) { g = 'A'; l = 'First Class'; c = 'text-emerald-600' }
                      else if (m >= 75) { g = 'B'; l = 'Second Upper'; c = 'text-blue-600' }
                      else if (m >= 65) { g = 'C'; l = 'Second Lower'; c = 'text-cyan-600' }
                      else if (m >= 50) { g = 'D'; l = 'Pass'; c = 'text-amber-600' }
                      return <span className={`font-bold text-lg ${c}`}>{g} — {l}</span>
                    })()}
                  </div>
                )}
              </div>

              {/* Final Result Banner */}
              {finalResult && (
                <div className={`p-4 rounded-xl border-2 ${finalResult.grade === 'A' ? 'bg-emerald-50 border-emerald-300' : finalResult.grade === 'B' ? 'bg-blue-50 border-blue-300' : finalResult.grade === 'C' ? 'bg-cyan-50 border-cyan-300' : finalResult.grade === 'D' ? 'bg-amber-50 border-amber-300' : 'bg-red-50 border-red-300'}`}>
                  <div className="flex items-center gap-3">
                    <Award className={`w-6 h-6 ${gradeColor(finalResult.grade)}`} />
                    <div>
                      <div className="text-xs font-medium text-slate-500 mb-0.5">Final Result (Average / 4)</div>
                      <div className={`text-xl font-bold ${gradeColor(finalResult.grade)}`}>{finalResult.grade} — {finalResult.label}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <div className="text-2xl font-bold text-emerald-700">{passedExams}</div>
                  <div className="text-xs text-emerald-600">Exams Passed</div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-center">
                  <div className="text-2xl font-bold text-red-700">{totalExams - passedExams}</div>
                  <div className="text-xs text-red-600">Exams Failed</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Individual Results</h4>
                {student.examResults.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No results yet</p>
                ) : (
                  <div className="space-y-2">
                    {student.examResults.map(r => (
                      <div key={r.id} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl">
                        <div>
                          <div className="text-sm font-medium text-slate-800">{r.exam.name}</div>
                          <div className="text-xs text-slate-500">Marks: {r.marks}/100</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-lg font-bold ${gradeColor(r.grade)}`}>{r.grade}</span>
                          <div className="text-right">
                            <div className={`text-xs font-medium ${gradeColor(r.grade)}`}>{gradeLabel(r.grade)}</div>
                            {r.isPassed ? <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto mt-0.5" /> : <XCircle className="w-4 h-4 text-red-500 ml-auto mt-0.5" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROGRESS */}
          {activeTab === 'progress' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">Attendance</h4>
                  <div className="flex justify-between text-sm mb-1"><span>Rate</span><span className={attPct >= 75 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>{attPct}%</span></div>
                  <div className="h-4 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${attPct >= 75 ? 'bg-emerald-500' : 'bg-red-400'}`} style={{ width: `${attPct}%` }}></div></div>
                  <div className="text-xs text-slate-500 mt-1">{presentDays} present / {totalDays - presentDays} absent</div>
                </div>

                {!isCertificate && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">Course Fee Progress</h4>
                    <div className="flex justify-between text-sm mb-1"><span>Paid</span><span className="text-blue-600 font-bold">{paidMonths}/{TOTAL_MONTHS} months</span></div>
                    <div className="h-4 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${(paidMonths / TOTAL_MONTHS) * 100}%` }}></div></div>
                    <div className="text-xs text-slate-500 mt-1">Rs. {paidAmount.toLocaleString()} paid total</div>
                  </div>
                )}

                {isCertificate && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">Exam Fees</h4>
                    <div className="flex justify-between text-sm mb-1"><span>Paid</span><span className="text-violet-600 font-bold">{student.examPayments.length}/{programExams.length} exams</span></div>
                    <div className="h-4 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{ width: programExams.length > 0 ? `${(student.examPayments.length / programExams.length) * 100}%` : '0%' }}></div></div>
                    <div className="text-xs text-slate-500 mt-1">Rs. {totalExamFeesPaid.toLocaleString()} paid</div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">Exam Progress</h4>
                  <div className="flex justify-between text-sm mb-1"><span>Passed</span><span className="text-violet-600 font-bold">{passedExams}/{programExams.length} exams</span></div>
                  <div className="h-4 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{ width: programExams.length > 0 ? `${(passedExams / programExams.length) * 100}%` : '0%' }}></div></div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">Overall Status</h4>
                  {finalResult && (
                    <div className={`mb-3 p-2 rounded-lg text-center ${gradeColor(finalResult.grade)} font-bold`}>
                      Final: {finalResult.grade} — {finalResult.label}
                    </div>
                  )}
                  {(() => {
                    const feesOk = isCertificate
                      ? student.examPayments.length >= programExams.length && programExams.length > 0
                      : paidMonths === TOTAL_MONTHS
                    const examsOk = passedExams >= programExams.length && programExams.length > 0
                    const attOk = attPct >= 75
                    if (feesOk && examsOk && attOk) {
                      return <div className="flex items-center gap-2 text-emerald-600 font-bold"><Award className="w-5 h-5" />Eligible for Certificate!</div>
                    }
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">{feesOk ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-400" />}<span className="text-slate-600">{isCertificate ? 'Exam fees paid' : 'Course fees complete'}</span></div>
                        <div className="flex items-center gap-2 text-sm">{examsOk ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-400" />}<span className="text-slate-600">All exams passed</span></div>
                        <div className="flex items-center gap-2 text-sm">{attOk ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-400" />}<span className="text-slate-600">Attendance above 75%</span></div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {student.examResults.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">Grade Summary</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {student.examResults.map(r => (
                      <div key={r.id} className="text-center p-3 bg-white rounded-xl border border-slate-200">
                        <div className="text-xs text-slate-500 mb-1">{r.exam.name}</div>
                        <div className={`text-3xl font-bold ${gradeColor(r.grade)}`}>{r.grade}</div>
                        <div className={`text-xs font-medium mt-0.5 ${gradeColor(r.grade)}`}>{gradeLabel(r.grade)}</div>
                        <div className="text-xs text-slate-400 mt-1">{r.marks}/100</div>
                      </div>
                    ))}
                  </div>
                  {finalResult && (
                    <div className={`mt-3 p-3 rounded-xl text-center border-2 ${finalResult.grade === 'A' ? 'bg-emerald-50 border-emerald-300' : finalResult.grade === 'B' ? 'bg-blue-50 border-blue-300' : finalResult.grade === 'C' ? 'bg-cyan-50 border-cyan-300' : finalResult.grade === 'D' ? 'bg-amber-50 border-amber-300' : 'bg-red-50 border-red-300'}`}>
                      <div className="text-xs text-slate-500 mb-1">Final Result (Total Average ÷ 4)</div>
                      <div className={`text-2xl font-bold ${gradeColor(finalResult.grade)}`}>{finalResult.grade} — {finalResult.label}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
