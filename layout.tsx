import type { Metadata } from 'next'
 
// These styles apply to every route in the application
import './globals.css'

export const metadata: Metadata = {
  title: '栗世界 / Set of Chestnut',
  description: 'Interactive visual fictional novel about the post-Miracle Sylph Corridor world',
}
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
          {children}
      </body>
    </html>
  )
}
