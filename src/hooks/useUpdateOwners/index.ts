import { ConfigParam, SafeConfigWithSigner } from '@/types/index.js'
import { useAddOwner } from './useAddOwner.js'
import { useRemoveOwner } from './useRemoveOwner.js'
import { useSwapOwner } from './useSwapOwner.js'

export type UseUpdateOwnersParams = ConfigParam<SafeConfigWithSigner>

export type UseUpdateOwnersReturnType = {
  add: ReturnType<typeof useAddOwner>
  remove: ReturnType<typeof useRemoveOwner>
  swap: ReturnType<typeof useSwapOwner>
}

/**
 * Hook to add, remove or swap owners of the connected Safe.
 * @returns Object wrapping the hooks to update, remove or swap owners.
 */
export function useUpdateOwners(params: UseUpdateOwnersParams = {}): UseUpdateOwnersReturnType {
  const add = useAddOwner({ config: params.config })
  const remove = useRemoveOwner({ config: params.config })
  const swap = useSwapOwner({ config: params.config })

  return { add, remove, swap }
}
