export function calculateGrade(marks: number): { grade: string; label: string; color: string } {
  if (marks >= 75) return { grade: 'A', label: 'First Class', color: 'text-emerald-600' }
  if (marks >= 65) return { grade: 'B+', label: 'Second Upper', color: 'text-blue-600' }
  if (marks >= 55) return { grade: 'B', label: 'Second Lower', color: 'text-cyan-600' }
  if (marks >= 40) return { grade: 'C', label: 'Pass', color: 'text-yellow-600' }
  return { grade: 'F', label: 'Fail', color: 'text-red-600' }
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK')}`
}

export function calculateAttendancePercentage(present: number, total: number): number {
  if (total === 0) return 0
  return Math.round((present / total) * 100)
}
