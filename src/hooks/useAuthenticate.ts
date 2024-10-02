import { useCallback, useContext, useEffect, useState } from 'react'
import { SafeContext } from '@/SafeContext.js'
import { useSignerAddress } from '@/hooks/useSignerAddress.js'
import { AuthenticationError } from '@/errors/AuthenticationError.js'
import { ConfigParam, SafeConfig } from '@/types/index.js'
import { MissingSafeProviderError } from '@/errors/MissingSafeProviderError.js'

export type UseAuthenticateParams = ConfigParam<SafeConfig>

export type UseConnectSignerReturnType = {
  connect: (signer: string) => Promise<void>
  disconnect: () => Promise<void>
  isSignerConnected: boolean
  isOwnerConnected: boolean
}

/**
 * Hook to authenticate a signer.
 * @returns Functions to connect and disconnect a signer.
 */
export function useAuthenticate(): UseConnectSignerReturnType {
  const { signerClient, setSigner, config } = useContext(SafeContext) || {}

  if (!config) {
    throw new MissingSafeProviderError('`useAuthenticate` must be used within `SafeProvider`.')
  }

  const signerAddress = useSignerAddress()

  const [isOwnerConnected, setIsOwnerConnected] = useState(false)

  const connect = useCallback(
    async (signer: string) => {
      if (!signer) {
        throw new AuthenticationError('Failed to connect because signer is empty')
      }
      return setSigner(signer)
    },
    [setSigner]
  )

  const disconnect = useCallback(async () => {
    if (!signerClient) {
      throw new AuthenticationError('Failed to disconnect because no signer is connected')
    }
    return setSigner(undefined)
  }, [setSigner])

  const isSignerConnected = !!signerAddress

  useEffect(() => {
    if (signerClient && signerAddress) {
      signerClient.isOwner(signerAddress).then(setIsOwnerConnected)
    }
  }, [signerClient, signerAddress])

  return { connect, disconnect, isSignerConnected, isOwnerConnected }
}
