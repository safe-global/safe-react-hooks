import { createElement, useCallback, useEffect, useMemo, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createConfig, WagmiProvider } from 'wagmi'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { InitializeSafeProviderError } from '@/errors/InitializeSafeProviderError.js'
import type { SafeConfig } from '@/types/index.js'
import { isSafeConfigWithSigner } from '@/types/guards.js'
import { createPublicClient, createSignerClient } from '@/createClient.js'
import { queryClient } from '@/queryClient.js'
import { SafeContext } from '@/SafeContext.js'

export type SafeProviderProps = {
  config: SafeConfig
}

export function SafeProvider(params: React.PropsWithChildren<SafeProviderProps>) {
  const [config, setConfig] = useState(params.config)
  const [isInitialized, setIsInitialized] = useState(false)
  const [publicClient, setPublicClient] = useState<SafeClient>()
  const [signerClient, setSignerClient] = useState<SafeClient>()

  const wagmiConfig = useMemo(
    () =>
      createConfig({
        chains: [config.chain],
        transports: { [config.chain.id]: config.transport }
      }),
    [config.chain, config.transport]
  )

  useEffect(() => {
    setIsInitialized(false)
    Promise.all([
      createPublicClient(config).then(setPublicClient),
      isSafeConfigWithSigner(config) ? setSigner(config.signer) : Promise.resolve()
    ])
      .then(() => {
        setIsInitialized(true)
      })
      .catch((err) => {
        throw new InitializeSafeProviderError('Failed to initialize clients.', err)
      })
  }, [config])

  const setSigner = useCallback(
    async (signer: string | undefined) => {
      if (signer) {
        try {
          const newSignerClient = await createSignerClient({ ...config, signer })
          setSignerClient(newSignerClient)
        } catch (err) {
          throw new InitializeSafeProviderError('Failed to initialize signer client.', err)
        }
      } else if (signerClient) {
        setSignerClient(undefined)
      }
    },
    [config, signerClient]
  )

  if (!config.provider) {
    throw new InitializeSafeProviderError('Provider not set in config.')
  }

  const props = {
    value: {
      isInitialized,
      config,
      wagmiConfig,
      setConfig,
      setSigner,
      publicClient,
      signerClient
    }
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
