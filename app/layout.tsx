import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IMS Campus Student Registration System',
  description: 'IMS Campus Student Registration and Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  )
}
