import {
  QueryObserverLoadingErrorResult,
  QueryObserverPendingResult,
  QueryObserverResult,
  QueryObserverSuccessResult
} from '@tanstack/react-query'

const refetchMock = jest.fn()

export const queryPendingResult: QueryObserverPendingResult = {
  data: undefined,
  error: null,
  isError: false,
  isPending: true,
  isLoading: true,
  isLoadingError: false,
  isRefetchError: false,
  isSuccess: false,
  status: 'pending',
  dataUpdatedAt: 0,
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
  errorUpdateCount: 0,
  isFetched: false,
  isFetchedAfterMount: false,
  isFetching: true,
  isInitialLoading: false,
  isPaused: false,
  isPlaceholderData: false,
  isRefetching: false,
  isStale: false,
  refetch: refetchMock,
  fetchStatus: 'fetching'
}

export const queryLoadingErrorResult: QueryObserverLoadingErrorResult = {
  ...queryPendingResult,
  error: new Error('Query failed :('),
  isError: true,
  isPending: false,
  isLoading: false,
  isLoadingError: true,
  isRefetchError: false,
  isSuccess: false,
  status: 'error',
  failureReason: new Error('Query failed :('),
  errorUpdateCount: 1,
  isFetched: false,
  isFetchedAfterMount: false,
  isFetching: false,
  isInitialLoading: false,
  isPaused: false,
  isPlaceholderData: false,
  isRefetching: false,
  isStale: false,
  fetchStatus: 'idle'
}

export const querySuccessResult: QueryObserverSuccessResult = {
  ...queryPendingResult,
  data: undefined,
  isPending: false,
  isLoading: false,
  isLoadingError: false,
  isRefetchError: false,
  isSuccess: true,
  status: 'success',
  isFetched: true,
  isFetchedAfterMount: true,
  isFetching: false,
  refetch: refetchMock,
  fetchStatus: 'idle'
}

const resultMapping = {
  pending: queryPendingResult,
  error: queryLoadingErrorResult,
  success: querySuccessResult
}

export function createCustomQueryResult<
  TStatus extends keyof typeof resultMapping,
  TData = TStatus extends 'success' ? unknown : undefined,
  TError extends Error = Error
>({ status, data, error }: { status: TStatus; data?: TData; error?: TError }) {
  const result = resultMapping[status]
  return {
    ...result,
    ...(status === 'success' && data ? { data } : {}),
    ...(status === 'error' && error ? { error, failureReason: error } : {})
  } as QueryObserverResult<TData, TError>
}
