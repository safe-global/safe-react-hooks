import { useCallback, useContext } from 'react'
import { SafeContext } from '@/SafeProvider.js'
import { AuthenticationError } from '@/errors/AuthenticationError.js'

export type UseConnectSignerReturnType = {
  connect: (signer: string) => Promise<void>
  disconnect: () => Promise<void>
  isConnected: boolean
}

/**
 * Hook to authenticate a signer.
 * @returns Functions to connect and disconnect a signer.
 */
export function useAuthenticate(): UseConnectSignerReturnType {
  const { signerClient, setSigner } = useContext(SafeContext)

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

  const isConnected = !!signerClient

  return { connect, disconnect, isConnected }
}
