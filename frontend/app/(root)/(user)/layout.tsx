import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Web3Modal from '@/context/Web3Modal'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Web3Modal>
      <div className="flex h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-400">{children}</main>
        <Footer />
      </div>
    </Web3Modal>
  )
}
