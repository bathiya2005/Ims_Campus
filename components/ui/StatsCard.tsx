import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan'
}

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-600' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-600' },
  yellow: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'bg-amber-500' },
  red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'bg-red-600' },
  purple: { bg: 'bg-violet-50', text: 'text-violet-600', icon: 'bg-violet-600' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'bg-cyan-600' },
}

export default function StatsCard({ title, value, icon: Icon, trend, trendUp, color = 'blue' }: StatsCardProps) {
  const colors = colorMap[color]
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 card-hover`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className={`w-11 h-11 ${colors.icon} rounded-xl flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  )
}
