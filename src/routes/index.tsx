import { createFileRoute } from '@tanstack/react-router'

import { CustomApp } from '#/components/landing/CustomApp'
import { Footer } from '#/components/landing/Footer'
import { Hero } from '#/components/landing/Hero'
import { Navbar } from '#/components/landing/Navbar'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <CustomApp />
      </main>
      <Footer />
    </div>
  )
}
