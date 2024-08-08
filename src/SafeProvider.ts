import { createContext, createElement, useCallback, useEffect, useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, WagmiProvider } from 'wagmi'
import { createSafeClient, SafeClient, SafeKitConfig } from '@safe-global/safe-kit'
import { SafeConfig } from '@/types/index.js'

export type SafeContextType = {
  config: SafeConfig | undefined
  setConfig: (config: SafeConfig) => void
  setSigner: (signer: string | undefined) => Promise<void>
  publicClient: SafeClient | undefined
  signerClient: SafeClient | undefined
}

export const SafeContext = createContext<SafeContextType>({
  config: undefined,
  setConfig: () => {},
  setSigner: () => Promise.resolve(),
  publicClient: undefined,
  signerClient: undefined
})

export type SafeProviderProps = {
  config: SafeConfig
}

const queryClient = new QueryClient()

export function SafeProvider(params: React.PropsWithChildren<SafeProviderProps>) {
  const [config, setConfig] = useState(params.config)
  const [publicClient, setPublicClient] = useState<SafeClient>()
  const [signerClient, setSignerClient] = useState<SafeClient>()

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
    Promise.all([
      createSafeClient(publicClientConfig).then(setPublicClient),
      config.signer ? setSigner(config.signer) : Promise.resolve()
    ])
  }, [publicClientConfig])

  const setSigner = useCallback(
    async (signer: string | undefined) => {
      if (signer) {
        const newSignerClient = await createSafeClient({ ...publicClientConfig, signer })
        setSignerClient(newSignerClient)
      } else if (signerClient) {
        setSignerClient(undefined)
      }
    },
    [signerClient, publicClientConfig]
  )

  const props = {
    value: { config, setConfig, setSigner, publicClient, signerClient }
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
