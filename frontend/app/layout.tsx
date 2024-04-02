import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import AuthContext from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '0xDemocracy',
  description:
    'Introducing 0xDemocracy, the new blockchain-powered solution ensuring a safe, secure and reliable voting system.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContext>{children}</AuthContext>
      </body>
    </html>
  )
}
