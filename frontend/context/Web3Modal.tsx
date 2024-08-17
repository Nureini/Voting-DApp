"use client"

import "@rainbow-me/rainbowkit/styles.css"
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { polygonAmoy } from "wagmi/chains"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"

const config = getDefaultConfig({
  appName: "Election DApp",
  projectId: "f004e7d4bbe846b8125d9ede1ffb3fb7",
  chains: [polygonAmoy],
  ssr: true,
})

const queryClient = new QueryClient()

export default function Web3Modal({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
