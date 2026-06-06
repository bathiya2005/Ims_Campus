'use client'
import { useState } from 'react'
import { ClipboardList, Calendar, CheckCircle, XCircle, Save, Search } from 'lucide-react'
import Badge from '@/components/ui/Badge'

const today = new Date().toISOString().split('T')[0]

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedBatch, setSelectedBatch] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('')
  const [attendance, setAttendance] = useState<Record<number, boolean>>({})
  const [saved, setSaved] = useState(false)

  const branches = ['Galle', 'Matara', 'Nugegoda', 'Gampaha', 'Meegoda', 'Horana', 'Ratnapura']
  const years = [2023, 2024, 2025, 2026, 2027]

  // Demo students - in production loaded from DB based on selection
  const students: Array<{ id: number; fullName: string; regNumber: string; photoPath: null }> = []

  const handleMark = (studentId: number, present: boolean) => {
    setAttendance(prev => ({ ...prev, [studentId]: present }))
  }

  const handleMarkAll = (present: boolean) => {
    const all: Record<number, boolean> = {}
    students.forEach(s => { all[s.id] = present })
    setAttendance(all)
  }

  const handleSave = async () => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, attendance }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      alert('Failed to save. Check DB connection.')
    }
  }

  const presentCount = Object.values(attendance).filter(Boolean).length
  const absentCount = Object.values(attendance).filter(v => v === false).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Attendance Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">IMS Campus — Mark and track daily student attendance</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Select Class Session</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Course Level</label>
            <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option value="">Select Level</option>
              <option value="certificate">IT Certificate</option>
              <option value="diploma">IT Diploma</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Branch</label>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select Branch</option>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Batch Year</label>
            <select
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select Year</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{students.length}</div>
            <div className="text-sm text-slate-500">Total Students</div>
          </div>
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-700">{presentCount}</div>
            <div className="text-sm text-emerald-600">Present</div>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{absentCount}</div>
            <div className="text-sm text-red-600">Absent</div>
          </div>
        </div>
      )}

      {/* Attendance Sheet */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-800">
              Attendance Sheet — {new Date(selectedDate).toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
          </div>
          {students.length > 0 && (
            <div className="flex gap-2 sm:ml-auto">
              <button
                onClick={() => handleMarkAll(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                All Present
              </button>
              <button
                onClick={() => handleMarkAll(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100"
              >
                <XCircle className="w-3.5 h-3.5" />
                All Absent
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
              >
                <Save className="w-3.5 h-3.5" />
                {saved ? 'Saved!' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {students.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Select a branch and batch to mark attendance</p>
            <p className="text-sm text-slate-400 mt-1">Students will appear here once you select the class details above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase">#</th>
                  <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase">Student</th>
                  <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase">Reg No.</th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-500 uppercase">Attendance</th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-500 uppercase">Total Days</th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-500 uppercase">Present</th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-500 uppercase">%</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4 text-sm text-slate-500">{i + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-blue-700">{student.fullName.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium text-slate-800">{student.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-600">{student.regNumber}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleMark(student.id, true)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            attendance[student.id] === true
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Present
                        </button>
                        <button
                          onClick={() => handleMark(student.id, false)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            attendance[student.id] === false
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Absent
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center text-sm text-slate-600">0</td>
                    <td className="p-4 text-center text-sm text-slate-600">0</td>
                    <td className="p-4 text-center">
                      <Badge variant="default">0%</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
