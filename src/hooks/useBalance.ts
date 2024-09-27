import {
  type UseBalanceReturnType as UseBalanceReturnTypeWagmi,
  useBalance as useBalanceWagmi
} from 'wagmi'
import { type GetBalanceQueryFnData } from 'wagmi/query'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { useAddress } from '@/hooks/useSafeInfo/useAddress.js'

export type UseBalanceParams = ConfigParam<SafeConfig>
export type UseBalanceReturnType = UseBalanceReturnTypeWagmi<GetBalanceQueryFnData>

/**
 * Hook to get the connected Safe's balance.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Query result object containing the Safe's balance.
 */
export function useBalance(params: UseBalanceParams = {}): UseBalanceReturnType {
  const { config } = params

  const { data: address } = useAddress({ config })

  return useBalanceWagmi({ address }) as UseBalanceReturnType
}
