import { createContext, createElement, useEffect, useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, WagmiProvider } from 'wagmi'
import { createSafeClient, SafeClient, SafeKitConfig } from '@safe-global/safe-kit'
import { SafeConfig } from '@/types/index.js'

export type SafeContextType = {
  config: SafeConfig | undefined
  setConfig: (config: SafeConfig) => void
  publicClient: SafeClient | undefined
}

export const SafeContext = createContext<SafeContextType>({
  config: undefined,
  publicClient: undefined,
})

export type SafeProviderProps = {
  config: SafeConfig
}

const queryClient = new QueryClient()

export function SafeProvider(params: React.PropsWithChildren<SafeProviderProps>) {
  const [config, setConfig] = useState(params.config)
  const [publicClient, setPublicClient] = useState<SafeClient>()

  const wagmiConfig = createConfig({
    chains: [config.chain],
    transports: { [config.chain.id]: config.transport }
  })

  const publicClientConfig = useMemo<SafeKitConfig>(
    () => ({
      signer: undefined,
      provider: config.provider,
      ...(config.safeAddress
        ? { safeAddress: config.safeAddress }
        : { safeOptions: config.safeOptions })
    }),
    [config.provider, config.safeAddress, config.safeOptions]
  )

  useEffect(() => {
    createSafeClient(publicClientConfig).then(setPublicClient)
  }, [publicClientConfig])

  const props = {
    value: { config, setConfig, publicClient }
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
