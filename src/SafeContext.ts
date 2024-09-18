import { createContext } from 'react'
import { Config } from 'wagmi'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import type { SafeConfig } from '@/types/index.js'

export type SafeContextType = {
  isInitialized: boolean
  config: SafeConfig | undefined
  wagmiConfig: Config | undefined
  setConfig: (config: SafeConfig) => void
  setSigner: (signer: string | undefined) => Promise<void>
  publicClient: SafeClient | undefined
  signerClient: SafeClient | undefined
}

export const initialSafeContext: SafeContextType = {
  isInitialized: false,
  config: undefined,
  wagmiConfig: undefined,
  setConfig: () => {},
  setSigner: () => Promise.resolve(),
  publicClient: undefined,
  signerClient: undefined
}

export const SafeContext = createContext<SafeContextType>(initialSafeContext)
