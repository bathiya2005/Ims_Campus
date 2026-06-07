'use client'
import { useState, useEffect } from 'react'
import { ClipboardList, Calendar, CheckCircle, XCircle, Save, RefreshCw, UserX } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface Student {
  id: number; fullName: string; regNumber: string; photoPath: string | null; isActive: boolean
  attendance: Array<{ date: string; isPresent: boolean }>
}

interface Branch { id: number; name: string }

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [attendance, setAttendance] = useState<Record<number, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
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
      let url = `/api/students?level=${selectedLevel}&branchId=${selectedBranch}&year=${selectedYear}`
      const res = await fetch(url)
      const data = await res.json()
      if (Array.isArray(data)) {
        setStudents(data)
        // Pre-fill attendance for selected date
        const preAtt: Record<number, boolean> = {}
        data.forEach((s: Student) => {
          const rec = s.attendance?.find((a: any) => a.date?.startsWith(selectedDate))
          if (rec !== undefined) preAtt[s.id] = rec.isPresent
        })
        setAttendance(preAtt)
      }
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => {
    if (students.length > 0) {
      const preAtt: Record<number, boolean> = {}
      students.forEach(s => {
        const rec = s.attendance?.find((a: any) => a.date?.startsWith(selectedDate))
        if (rec !== undefined) preAtt[s.id] = rec.isPresent
      })
      setAttendance(preAtt)
    }
  }, [selectedDate, students])

  const handleMark = (studentId: number, present: boolean) => {
    setAttendance(prev => ({ ...prev, [studentId]: present }))
  }

  const handleMarkAll = (present: boolean) => {
    const all: Record<number, boolean> = {}
    students.forEach(s => { all[s.id] = present })
    setAttendance(all)
  }

  const handleSave = async () => {
    if (Object.keys(attendance).length === 0) { setMsg('❌ Mark attendance first'); setTimeout(() => setMsg(''), 3000); return }
    setSaving(true)
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, attendance }),
      })
      if (res.ok) {
        setSaved(true)
        setMsg('✅ Attendance saved!')
        setTimeout(() => { setSaved(false); setMsg('') }, 3000)
        loadStudents()
      } else {
        setMsg('❌ Failed to save')
        setTimeout(() => setMsg(''), 3000)
      }
    } catch {
      setMsg('❌ Error saving')
      setTimeout(() => setMsg(''), 3000)
    } finally { setSaving(false) }
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

  const presentCount = Object.values(attendance).filter(Boolean).length
  const absentCount = Object.values(attendance).filter(v => v === false).length
  const neverAttended = students.filter(s => !s.attendance || s.attendance.length === 0)

  // Attendance rate per student
  const getStudentAttPct = (s: Student) => {
    const total = s.attendance?.length || 0
    const present = s.attendance?.filter((a: any) => a.isPresent).length || 0
    return total > 0 ? Math.round((present / total) * 100) : 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Attendance Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">Mark and track daily student attendance</p>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${msg.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Select Class Session</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Date</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Program</label>
            <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none">
              <option value="">Select Program</option>
              <option value="CERTIFICATE">IT Certificate</option>
              <option value="DIPLOMA">IT Diploma</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Branch</label>
            <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none">
              <option value="">Select Branch</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Batch Year</label>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none">
              <option value="">Select Year</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        {selectedLevel && selectedBranch && selectedYear && (
          <button onClick={loadStudents} className="mt-3 flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <RefreshCw className="w-4 h-4"/>Refresh
          </button>
        )}
      </div>

      {/* Stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{students.length}</div>
            <div className="text-sm text-slate-500">Total</div>
          </div>
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-700">{presentCount}</div>
            <div className="text-sm text-emerald-600">Present</div>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{absentCount}</div>
            <div className="text-sm text-red-600">Absent</div>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">{students.length - presentCount - absentCount}</div>
            <div className="text-sm text-amber-600">Not Marked</div>
          </div>
        </div>
      )}

      {/* Attendance Sheet */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600"/>
            <h3 className="font-semibold text-slate-800">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
          </div>
          {students.length > 0 && (
            <div className="flex gap-2 sm:ml-auto">
              <button onClick={() => handleMarkAll(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100">
                <CheckCircle className="w-3.5 h-3.5"/>All Present
              </button>
              <button onClick={() => handleMarkAll(false)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100">
                <XCircle className="w-3.5 h-3.5"/>All Absent
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-60">
                <Save className="w-3.5 h-3.5"/>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3"/>
            <p className="text-slate-500 font-medium">Select program, branch and year to mark attendance</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left p-4 text-xs font-semibold text-slate-500">#</th>
                  <th className="text-left p-4 text-xs font-semibold text-slate-500">Student</th>
                  <th className="text-left p-4 text-xs font-semibold text-slate-500">Reg No.</th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-500">Today</th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-500">Total Days</th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-500">Present</th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-500">Rate</th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => {
                  const total = student.attendance?.length || 0
                  const present = student.attendance?.filter((a: any) => a.isPresent).length || 0
                  const pct = getStudentAttPct(student)
                  const neverCame = total === 0
                  return (
                    <tr key={student.id} className={`border-b border-slate-50 hover:bg-slate-50 ${!student.isActive ? 'opacity-50' : ''}`}>
                      <td className="p-4 text-sm text-slate-400">{i + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                            {student.photoPath ? <img src={student.photoPath} className="w-8 h-8 object-cover rounded-full"/> : <span className="text-xs font-semibold text-blue-700">{student.fullName.charAt(0)}</span>}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-slate-800">{student.fullName}</span>
                            {!student.isActive && <span className="ml-2 text-xs text-red-500">(Inactive)</span>}
                            {neverCame && <span className="ml-2 text-xs text-amber-500">(Never attended)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-mono text-slate-600">{student.regNumber}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleMark(student.id, true)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${attendance[student.id] === true ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}>
                            <CheckCircle className="w-3.5 h-3.5"/>P
                          </button>
                          <button onClick={() => handleMark(student.id, false)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${attendance[student.id] === false ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'}`}>
                            <XCircle className="w-3.5 h-3.5"/>A
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-center text-sm text-slate-600">{total}</td>
                      <td className="p-4 text-center text-sm text-emerald-600 font-medium">{present}</td>
                      <td className="p-4 text-center">
                        <Badge variant={pct >= 75 ? 'success' : pct > 0 ? 'warning' : 'danger'}>{pct}%</Badge>
                      </td>
                      <td className="p-4 text-center">
                        {student.isActive && neverCame && (
                          <button onClick={() => setInactive(student.id)} className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 mx-auto">
                            <UserX className="w-3 h-3"/>Inactive
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Never Attended Summary */}
      {neverAttended.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <UserX className="w-4 h-4"/>Never Attended ({neverAttended.length} students)
          </h4>
          <div className="space-y-2">
            {neverAttended.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-amber-100">
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
    </div>
  )
}