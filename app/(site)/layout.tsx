import {Suspense} from 'react'
import {Header} from '@/components/Header'
import {Footer} from '@/components/Footer'

export default function SiteLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="site flex min-h-screen flex-col">
      <Suspense fallback={<div className="h-24" />}>
        <Header />
      </Suspense>
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}