'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  GraduationCap, Users, BookOpen, CreditCard, ClipboardList,
  BarChart3, Building2, Calendar, ChevronDown, ChevronRight,
  Home, Award, X
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  {
    label: 'Course Levels',
    icon: GraduationCap,
    children: [
      { href: '/dashboard/certificate', label: 'IT Certificate' },
      { href: '/dashboard/diploma', label: 'IT Diploma' },
    ]
  },
  { href: '/dashboard/branches', label: 'Branches', icon: Building2 },
  { href: '/dashboard/batches', label: 'Batches', icon: Calendar },
  { href: '/dashboard/students', label: 'All Students', icon: Users },
  { href: '/dashboard/attendance', label: 'Attendance', icon: ClipboardList },
  { href: '/dashboard/exams', label: 'Exams', icon: BookOpen },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/certificates', label: 'Certificates', icon: Award },
]

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string[]>(['Course Levels'])

  const toggleExpand = (label: string) => {
    setExpanded(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    )
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-slate-900 text-white z-30 flex flex-col
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="p-5 border-b border-slate-700/50 flex items-center gap-3">
          <div className="flex-shrink-0">
            <img
              src="/ims2 (1).jpeg"
              alt="IMS Campus Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">IMS Campus</div>
            <div className="text-xs text-slate-400 leading-tight">IT Management System</div>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            if ('children' in item && item.children) {
              const isExpanded = expanded.includes(item.label)
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-sm"
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-0.5 space-y-0.5">
                      {item.children.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                            pathname.startsWith(child.href)
                              ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500 pl-2.5'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
            const navItem = item as { href: string; label: string; icon: React.ComponentType<{ className?: string }> }
            const isActive = pathname === navItem.href
            return (
              <Link
                key={navItem.href}
                href={navItem.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <navItem.icon className="w-4 h-4 flex-shrink-0" />
                {navItem.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow">
              <span className="text-xs font-bold text-white">A</span>
            </div>
            <div>
              <div className="text-sm font-medium text-white">Admin</div>
              <div className="text-xs text-slate-400">admin@imscampus.lk</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}