import { createContext, createElement, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, WagmiProvider } from 'wagmi'
import { SafeConfig } from '@/types/index.js'

export type SafeContextType = {
  config: SafeConfig | undefined
  setConfig: (config: SafeConfig) => void
}

export const SafeContext = createContext<SafeContextType>({
  config: undefined,
  setConfig: () => {}
})

export type SafeProviderProps = {
  config: SafeConfig
}

const queryClient = new QueryClient()

export function SafeProvider(params: React.PropsWithChildren<SafeProviderProps>) {
  const [config, setConfig] = useState(params.config)

  const wagmiConfig = createConfig({
    chains: [config.chain],
    transports: { [config.chain.id]: config.transport }
  })

  const props = {
    value: { config, setConfig }
  }

  return createElement(
    SafeContext.Provider,
    props,
    createElement(
      WagmiProvider,
      { config: wagmiConfig },
      createElement(QueryClientProvider, { client: queryClient }, params.children)
    )
  )
}
