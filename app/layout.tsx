import type {Metadata} from 'next'
import {Newsreader} from 'next/font/google'
import './globals.css'

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-newsreader',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Estrella Magazine',
    template: '%s | Estrella Magazine',
  },
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={newsreader.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}