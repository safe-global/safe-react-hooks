import { useCallback, useContext } from 'react'
import { SafeContext } from '@/SafeProvider.js'

export type UseConnectSignerReturnType = {
  connect: (signer: string) => Promise<void>
  disconnect: () => Promise<void>
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
        throw new Error('Signer must not be empty')
      }
      return setSigner(signer)
    },
    [setSigner]
  )

  const disconnect = useCallback(async () => {
    if (!signerClient) {
      throw new Error('Signer not connected')
    }
    return setSigner(undefined)
  }, [setSigner])

  return { connect, disconnect }
}
