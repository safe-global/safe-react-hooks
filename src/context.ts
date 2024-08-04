import { createContext, createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, WagmiProvider } from 'wagmi'
import { SafeConfig } from '@/types/index.js'

export const SafeContext = createContext<SafeConfig | undefined>(undefined)

export type SafeProviderProps = {
  config: SafeConfig
  initialState?: SafeConfig | undefined
  reconnectOnMount?: boolean | undefined
}

const queryClient = new QueryClient()

export function SafeProvider(params: React.PropsWithChildren<SafeProviderProps>) {
  const { children, config } = params

  const wagmiConfig = createConfig({
    chains: [config.chain],
    transports: { [config.chain.id]: config.transport }
  })

  const props = { value: config }

  return createElement(
    SafeContext.Provider,
    props,
    createElement(
      WagmiProvider,
      { config: wagmiConfig },
      createElement(QueryClientProvider, { client: queryClient }, children)
    )
  )
}
