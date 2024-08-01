import { createContext } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { sepolia } from 'wagmi/chains'

import { SafeConfig } from './types/index.js'

export const SafeContext = createContext<SafeConfig | undefined>(undefined)

export type SafeProviderProps = {
  config: SafeConfig
  initialState?: SafeConfig | undefined
  reconnectOnMount?: boolean | undefined
}

const queryClient = new QueryClient()

export const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http()
  }
})

export function SafeProvider(params: React.PropsWithChildren<SafeProviderProps>) {
  const { children, config } = params
  return (
    <SafeContext.Provider value={config}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </SafeContext.Provider>
  )
}
