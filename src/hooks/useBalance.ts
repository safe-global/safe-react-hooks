import {
  type UseBalanceReturnType as UseBalanceReturnTypeWagmi,
  useBalance as useBalanceWagmi
} from 'wagmi'
import { type GetBalanceQueryFnData } from 'wagmi/query'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { useSafeInfo } from '@/hooks/useSafeInfo.js'

export type UseBalanceParams<Config extends SafeConfig = SafeConfig> = ConfigParam<Config>
export type UseBalanceReturnType = UseBalanceReturnTypeWagmi<GetBalanceQueryFnData>

/**
 * Hook to get the connected Safe's balance.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Query result object containing the Safe's balance.
 */
export function useBalance<Config extends SafeConfig = SafeConfig>(
  params: UseBalanceParams<Config> = {}
): UseBalanceReturnType {
  const { config } = params

  const { data: { address } = {} } = config ? useSafeInfo({ config }) : useSafeInfo()

  return useBalanceWagmi({ address }) as UseBalanceReturnType;
}
