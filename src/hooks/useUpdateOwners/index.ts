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

export { type AddOwnerVariables } from './useAddOwner.js'
export { type RemoveOwnerVariables } from './useRemoveOwner.js'
export { type SwapOwnerVariables } from './useSwapOwner.js'

/**
 * Hook to manage the owners of the Safe account. It provides methods to add a new owner,
 * remove an existing one, and to swap an existing owner in favor of a new one.
 * @returns Object wrapping the hooks to update, remove or swap owners.
 */
export function useUpdateOwners(params: UseUpdateOwnersParams = {}): UseUpdateOwnersReturnType {
  const add = useAddOwner({ config: params.config })
  const remove = useRemoveOwner({ config: params.config })
  const swap = useSwapOwner({ config: params.config })

  return { add, remove, swap }
}
