'use client'
import { useState } from 'react'
import { CreditCard, Plus, Search, DollarSign, AlertCircle, CheckCircle, Calendar } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<'course' | 'exam'>('course')
  const [showAddModal, setShowAddModal] = useState(false)
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    studentId: '', monthNumber: '', amount: '3000', paidDate: new Date().toISOString().split('T')[0]
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Payment Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">IMS Campus — Course fees and exam payment records</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="sm:ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Collection", value: 'Rs. 0', icon: DollarSign, color: 'bg-emerald-600' },
          { label: 'Monthly Income', value: 'Rs. 0', icon: Calendar, color: 'bg-blue-600' },
          { label: 'Total Arrears', value: 'Rs. 0', icon: AlertCircle, color: 'bg-red-500' },
          { label: 'Paid Students', value: '0', icon: CheckCircle, color: 'bg-violet-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="border-b border-slate-100 px-4">
          <div className="flex gap-1">
            {[
              { id: 'course', label: 'Course Payments' },
              { id: 'exam', label: 'Exam Payments' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'course' | 'exam')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name or reg number..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <select className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none">
              <option>All Branches</option>
              {['Galle', 'Matara', 'Nugegoda', 'Gampaha', 'Meegoda', 'Horana', 'Ratnapura'].map(b => <option key={b}>{b}</option>)}
            </select>
            <select className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none">
              <option>All Status</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Overdue</option>
            </select>
          </div>

          {activeTab === 'course' ? (
            <div>
              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Course Fee Structure:</strong> 6 months × Rs. 3,000 = Rs. 18,000 total per student
                </p>
              </div>
              <div className="py-12 text-center">
                <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">No payment records yet</p>
                <p className="text-sm text-slate-400 mt-1">Connect the database and add students to track payments</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-3 p-3 bg-violet-50 rounded-lg border border-violet-200">
                <p className="text-sm text-violet-700">
                  <strong>Exam Fee Structure:</strong> Photoshop Rs. 1,000 · Typing Master Rs. 1,000 · Final Exam Rs. 1,000
                </p>
              </div>
              <div className="py-12 text-center">
                <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">No exam payment records yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Record Payment</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Type</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="course">Course Payment</option>
                  <option value="exam">Exam Payment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Student (Reg Number) *</label>
                <input
                  type="text"
                  value={form.studentId}
                  onChange={e => setForm({...form, studentId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Enter registration number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Month Number *</label>
                <select
                  value={form.monthNumber}
                  onChange={e => setForm({...form, monthNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select Month</option>
                  {[1,2,3,4,5,6].map(m => <option key={m} value={m}>Month {m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (Rs.) *</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date *</label>
                <input
                  type="date"
                  value={form.paidDate}
                  onChange={e => setForm({...form, paidDate: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save Payment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
