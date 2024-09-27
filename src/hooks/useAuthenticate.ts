import { useCallback, useContext, useMemo } from 'react'
import { SafeContext } from '@/SafeContext.js'
import { useOwners } from '@/hooks/useSafeInfo/useOwners.js'
import { useSignerAddress } from '@/hooks/useSignerAddress.js'
import { AuthenticationError } from '@/errors/AuthenticationError.js'

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
  const { signerClient, setSigner } = useContext(SafeContext)
  const { data: owners } = useOwners()
  const signerAddress = useSignerAddress()

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

  const isOwnerConnected = useMemo(
    () => !!owners && !!signerAddress && owners.includes(signerAddress),
    [owners, signerAddress]
  )

  return { connect, disconnect, isSignerConnected, isOwnerConnected }
}
