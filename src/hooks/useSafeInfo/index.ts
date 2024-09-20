import type { ConfigParam, SafeConfig, SafeInfo } from '@/types/index.js'
import type { UseQueryResult } from '@tanstack/react-query'
import { useAddress } from './useAddress.js'
import { useNonce } from './useNonce.js'
import { useThreshold } from './useThreshold.js'
import { useIsDeployed } from './useIsDeployed.js'
import { useOwners } from './useOwners.js'

export type UseSafeInfoParams = ConfigParam<SafeConfig>
export type UseSafeInfoReturnType = Omit<UseQueryResult<Partial<SafeInfo>>, 'refetch'>

/**
 * Hook to get the connected Safe's information.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Query result object containing the Safe's information.
 */
export function useSafeInfo(params: UseSafeInfoParams = {}): UseSafeInfoReturnType {
  const { data: address, ...useAddressResult } = useAddress({ config: params.config })
  const { data: nonce, ...useNonceResult } = useNonce({ config: params.config })
  const { data: threshold, ...useThresholdResult } = useThreshold({ config: params.config })
  const { data: isDeployed, ...useIsDeployedResult } = useIsDeployed({ config: params.config })
  const { data: owners, ...useOwnersResult } = useOwners({ config: params.config })

  const results = [
    useAddressResult,
    useNonceResult,
    useThresholdResult,
    useIsDeployedResult,
    useOwnersResult
  ]

  return {
    data: {
      address,
      nonce,
      threshold,
      isDeployed,
      owners
    },
    ...results.reduce<Omit<UseSafeInfoReturnType, 'data' | 'refetch'>>(
      (acc, current) => ({
        error: acc.error || current.error,
        isError: acc.isError || current.isError,
        isPending: acc.isPending || current.isPending,
        isLoading: acc.isLoading || current.isLoading,
        isLoadingError: acc.isLoadingError || current.isLoadingError,
        isRefetchError: acc.isRefetchError || current.isRefetchError,
        isSuccess: acc.isSuccess && current.isSuccess,
        status: ['pending', 'error'].includes(acc.status) ? acc.status : current.status,
        dataUpdatedAt:
          acc.dataUpdatedAt > current.dataUpdatedAt ? acc.dataUpdatedAt : current.dataUpdatedAt,
        errorUpdatedAt:
          acc.errorUpdatedAt > current.errorUpdatedAt ? acc.errorUpdatedAt : current.errorUpdatedAt,
        failureCount: acc.failureCount + current.failureCount,
        failureReason: acc.failureReason || current.failureReason,
        errorUpdateCount: acc.errorUpdateCount + current.errorUpdateCount,
        isFetched: acc.isFetched && current.isFetched,
        isFetchedAfterMount: acc.isFetchedAfterMount && current.isFetchedAfterMount,
        isFetching: acc.isFetching || current.isFetching,
        isInitialLoading: acc.isInitialLoading || current.isInitialLoading,
        isPaused: acc.isPaused || current.isPaused,
        isPlaceholderData: acc.isPlaceholderData || current.isPlaceholderData,
        isRefetching: acc.isRefetching || current.isRefetching,
        isStale: acc.isStale || current.isStale,
        fetchStatus: ['paused', 'fetching'].includes(acc.fetchStatus)
          ? acc.fetchStatus
          : current.fetchStatus
      }),
      {
        error: null,
        isError: false,
        isPending: false,
        isLoading: false,
        isLoadingError: false,
        isRefetchError: false,
        isSuccess: true,
        status: 'success',
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isInitialLoading: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetching: false,
        isStale: false,
        fetchStatus: 'idle'
      }
    )
  }
}
