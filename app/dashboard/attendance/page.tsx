'use client'
import { useState, useEffect } from 'react'
import { ClipboardList, Calendar, CheckCircle, XCircle, Download, RefreshCw, UserX, Users } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface Student {
  id: number; fullName: string; regNumber: string; photoPath: string | null; isActive: boolean
  attendance: Array<{ date: string; isPresent: boolean }>
  batch: { year: number; branch: { name: string }; courseLevel: { code: string; name: string } }
}
interface Branch { id: number; name: string }

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [viewTab, setViewTab] = useState<'daily' | 'monthly' | 'absent'>('daily')
  const [students, setStudents] = useState<Student[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const years = ['2023', '2024', '2025', '2026', '2027']

  useEffect(() => {
    fetch('/api/branches').then(r => r.json()).then(d => { if (Array.isArray(d)) setBranches(d) })
  }, [])

  useEffect(() => {
    if (selectedLevel && selectedBranch && selectedYear) loadStudents()
  }, [selectedLevel, selectedBranch, selectedYear])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/students?level=${selectedLevel}&branchId=${selectedBranch}&year=${selectedYear}`)
      const data = await res.json()
      if (Array.isArray(data)) setStudents(data)
    } catch {} finally { setLoading(false) }
  }

  const setInactive = async (studentId: number) => {
    if (!confirm('Mark this student as Inactive?')) return
    const res = await fetch(`/api/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false }),
    })
    if (res.ok) { setMsg('✅ Student marked inactive'); setTimeout(() => setMsg(''), 3000); loadStudents() }
  }

  // Daily attendance for selected date
  const dailyData = students.map(s => {
    const rec = s.attendance?.find(a => a.date?.startsWith(selectedDate))
    return { ...s, todayPresent: rec ? rec.isPresent : null }
  })
  const dailyPresent = dailyData.filter(s => s.todayPresent === true)
  const dailyAbsent = dailyData.filter(s => s.todayPresent === false)
  const dailyNotMarked = dailyData.filter(s => s.todayPresent === null)

  // Monthly attendance
  const monthlyData = students.map(s => {
    const monthRecs = s.attendance?.filter(a => a.date?.startsWith(selectedMonth)) || []
    const present = monthRecs.filter(a => a.isPresent).length
    const absent = monthRecs.filter(a => !a.isPresent).length
    const total = monthRecs.length
    const pct = total > 0 ? Math.round((present / total) * 100) : 0
    return { ...s, present, absent, total, pct }
  })

  // Never/always absent
  const alwaysAbsent = students.filter(s => {
    const total = s.attendance?.length || 0
    const present = s.attendance?.filter(a => a.isPresent).length || 0
    return total > 0 && present === 0
  })
  const neverMarked = students.filter(s => !s.attendance || s.attendance.length === 0)

  const getOverallPct = (s: Student) => {
    const total = s.attendance?.length || 0
    const present = s.attendance?.filter(a => a.isPresent).length || 0
    return total > 0 ? Math.round((present / total) * 100) : 0
  }

  const downloadPDF = () => window.print()

  const programLabel = selectedLevel === 'CERTIFICATE' ? 'IT Certificate' : selectedLevel === 'DIPLOMA' ? 'IT Diploma' : ''
  const branchLabel = branches.find(b => b.id.toString() === selectedBranch)?.name || 'All Branches'

  return (
    <div className="space-y-6">
      <style>{`@media print { .no-print { display: none !important; } #printable, #printable * { visibility: visible; } #printable { position: fixed; left: 0; top: 0; width: 100%; padding: 20px; } }`}</style>

      <div className="no-print">
        <h1 className="text-xl font-bold text-slate-800">Attendance Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">View and track student attendance by branch and program</p>
      </div>

      {msg && <div className={`p-3 rounded-xl text-sm font-medium no-print ${msg.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{msg}</div>}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 no-print">
        <h3 className="font-semibold text-slate-800 mb-4">Select Class</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Program</label>
            <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
              <option value="">Select Program</option>
              <option value="CERTIFICATE">IT Certificate</option>
              <option value="DIPLOMA">IT Diploma</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Branch</label>
            <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
              <option value="">Select Branch</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Batch Year</label>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
              <option value="">Select Year</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={loadStudents} disabled={!selectedLevel || !selectedBranch || !selectedYear}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              <RefreshCw className="w-4 h-4"/>Refresh
            </button>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      {students.length > 0 && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 no-print">
            <div className="border-b border-slate-100 px-4">
              <div className="flex gap-1">
                {[
                  { id: 'daily', label: 'Daily View' },
                  { id: 'monthly', label: 'Monthly View' },
                  { id: 'absent', label: 'Always Absent' },
                ].map(t => (
                  <button key={t.id} onClick={() => setViewTab(t.id as any)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${viewTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily View */}
            {viewTab === 'daily' && (
              <div className="p-4 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400"/>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none"/>
                  </div>
                  <button onClick={downloadPDF} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                    <Download className="w-3 h-3"/>Download PDF
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-700">{dailyPresent.length}</div>
                    <div className="text-xs text-emerald-600">Present</div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center border border-red-200">
                    <div className="text-2xl font-bold text-red-700">{dailyAbsent.length}</div>
                    <div className="text-xs text-red-600">Absent</div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-200">
                    <div className="text-2xl font-bold text-amber-700">{dailyNotMarked.length}</div>
                    <div className="text-xs text-amber-600">Not Marked</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-3 font-semibold text-slate-600">#</th>
                        <th className="text-left p-3 font-semibold text-slate-600">Student</th>
                        <th className="text-left p-3 font-semibold text-slate-600">Reg No.</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Today</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Overall %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyData.map((s, i) => (
                        <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="p-3 text-slate-400">{i + 1}</td>
                          <td className="p-3 font-medium text-slate-800">{s.fullName}</td>
                          <td className="p-3 font-mono text-xs text-slate-600">{s.regNumber}</td>
                          <td className="p-3 text-center">
                            {s.todayPresent === true ? <Badge variant="success">Present</Badge>
                              : s.todayPresent === false ? <Badge variant="danger">Absent</Badge>
                              : <Badge variant="warning">Not Marked</Badge>}
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant={getOverallPct(s) >= 75 ? 'success' : 'danger'}>{getOverallPct(s)}%</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Monthly View */}
            {viewTab === 'monthly' && (
              <div className="p-4 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400"/>
                    <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none"/>
                  </div>
                  <button onClick={downloadPDF} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">
                    <Download className="w-3 h-3"/>Download PDF
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-3 font-semibold text-slate-600">#</th>
                        <th className="text-left p-3 font-semibold text-slate-600">Student</th>
                        <th className="text-left p-3 font-semibold text-slate-600">Reg No.</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Present</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Absent</th>
                        <th className="text-center p-3 font-semibold text-slate-600">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData.map((s, i) => (
                        <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="p-3 text-slate-400">{i + 1}</td>
                          <td className="p-3 font-medium text-slate-800">{s.fullName}</td>
                          <td className="p-3 font-mono text-xs text-slate-600">{s.regNumber}</td>
                          <td className="p-3 text-center text-emerald-600 font-medium">{s.present}</td>
                          <td className="p-3 text-center text-red-500 font-medium">{s.absent}</td>
                          <td className="p-3 text-center">
                            <Badge variant={s.pct >= 75 ? 'success' : 'danger'}>{s.pct}%</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Always Absent */}
            {viewTab === 'absent' && (
              <div className="p-4 space-y-4">
                <button onClick={downloadPDF} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">
                  <Download className="w-3 h-3"/>Download PDF
                </button>

                {alwaysAbsent.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                      <XCircle className="w-4 h-4"/>Always Absent ({alwaysAbsent.length})
                    </h4>
                    <div className="space-y-2">
                      {alwaysAbsent.map(s => (
                        <div key={s.id} className="flex items-center justify-between py-2.5 px-4 bg-red-50 rounded-xl border border-red-100">
                          <div>
                            <span className="text-sm font-medium text-slate-800">{s.fullName}</span>
                            <span className="ml-2 text-xs text-slate-500 font-mono">{s.regNumber}</span>
                          </div>
                          {s.isActive && (
                            <button onClick={() => setInactive(s.id)} className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200">
                              <UserX className="w-3 h-3"/>Mark Inactive
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {neverMarked.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4"/>Never Marked ({neverMarked.length})
                    </h4>
                    <div className="space-y-2">
                      {neverMarked.map(s => (
                        <div key={s.id} className="flex items-center justify-between py-2.5 px-4 bg-amber-50 rounded-xl border border-amber-100">
                          <div>
                            <span className="text-sm font-medium text-slate-800">{s.fullName}</span>
                            <span className="ml-2 text-xs text-slate-500 font-mono">{s.regNumber}</span>
                          </div>
                          {s.isActive && (
                            <button onClick={() => setInactive(s.id)} className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">
                              <UserX className="w-3 h-3"/>Mark Inactive
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {alwaysAbsent.length === 0 && neverMarked.length === 0 && (
                  <div className="py-8 text-center text-slate-400">
                    <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3"/>
                    <p>All students have attended at least once!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Printable Report */}
          <div id="printable" className="hidden print:block bg-white p-6">
            <h2 className="text-lg font-bold mb-1">IMS Campus — Attendance Report</h2>
            <p className="text-sm text-slate-500 mb-4">{programLabel} · {branchLabel} · {selectedYear} Batch · Generated: {new Date().toLocaleDateString('en-LK')}</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left">#</th>
                  <th className="border border-slate-300 p-2 text-left">Name</th>
                  <th className="border border-slate-300 p-2 text-left">Reg No.</th>
                  <th className="border border-slate-300 p-2 text-center">Present</th>
                  <th className="border border-slate-300 p-2 text-center">Absent</th>
                  <th className="border border-slate-300 p-2 text-center">Rate</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((s, i) => (
                  <tr key={s.id}>
                    <td className="border border-slate-200 p-2">{i + 1}</td>
                    <td className="border border-slate-200 p-2">{s.fullName}</td>
                    <td className="border border-slate-200 p-2 font-mono text-xs">{s.regNumber}</td>
                    <td className="border border-slate-200 p-2 text-center">{s.present}</td>
                    <td className="border border-slate-200 p-2 text-center">{s.absent}</td>
                    <td className="border border-slate-200 p-2 text-center">{s.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!selectedLevel || !selectedBranch || !selectedYear ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
          <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3"/>
          <p className="text-slate-500 font-medium">Select program, branch and year to view attendance</p>
        </div>
      ) : loading ? (
        <div className="py-16 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
      ) : students.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">No students found for this selection</p>
        </div>
      ) : null}
    </div>
  )
}
