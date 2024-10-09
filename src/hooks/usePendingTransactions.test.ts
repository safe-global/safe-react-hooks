import { UseQueryResult } from '@tanstack/react-query'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import {
  usePendingTransactions,
  UsePendingTransactionsParams,
  UsePendingTransactionsReturnType
} from '@/hooks/usePendingTransactions.js'
import * as usePublicClientQuery from '@/hooks/usePublicClientQuery.js'
import * as useIsDeployed from '@/hooks/useSafeInfo/useIsDeployed.js'
import { safeMultisigTransaction } from '@test/fixtures/index.js'
import { renderHookInQueryClientProvider } from '@test/utils.js'
import { configPredictedSafe } from '@test/config.js'
import { SafeMultisigTransaction } from '@/types/index.js'
import { QueryKey } from '@/constants.js'

describe('usePendingTransactions', () => {
  const usePublicClientQuerySpy = jest.spyOn(usePublicClientQuery, 'usePublicClientQuery')
  const useIsDeployedSpy = jest.spyOn(useIsDeployed, 'useIsDeployed')

  const pendingTransactionsMock = [safeMultisigTransaction]
  const getPendingTransactionsMock = jest.fn().mockResolvedValue({
    results: pendingTransactionsMock,
    count: 1
  })

  const pendingTransactionsQueryResultMock = {
    data: pendingTransactionsMock,
    status: 'success'
  } as unknown as UseQueryResult<SafeMultisigTransaction[]>

  const publicClientMock = {
    getPendingTransactions: getPendingTransactionsMock
  } as unknown as SafeClient

  const renderUsePendingTransactions = (
    params?: UsePendingTransactionsParams,
    result: UsePendingTransactionsReturnType = pendingTransactionsQueryResultMock
  ) => {
    let querySafeClientFn: (safeClient: SafeClient) => unknown

    usePublicClientQuerySpy.mockImplementation(({ querySafeClientFn: _querySafeClientFn }) => {
      querySafeClientFn = _querySafeClientFn
      return result
    })

    const renderResult = renderHookInQueryClientProvider(() => usePendingTransactions(params))

    return { renderResult, querySafeClientFn: querySafeClientFn! }
  }

  beforeEach(() => {
    useIsDeployedSpy.mockReturnValue({ data: true } as useIsDeployed.UseIsDeployedReturnType)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return fetch and return pending Safe transactions via SafeClient', () => {
    const { renderResult, querySafeClientFn } = renderUsePendingTransactions()

    expect(renderResult.result.current).toMatchObject(pendingTransactionsQueryResultMock)

    expect(usePublicClientQuerySpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientQuerySpy).toHaveBeenCalledWith({
      querySafeClientFn: expect.any(Function),
      queryKey: [QueryKey.PendingTransactions]
    })

    expect(useIsDeployedSpy).toHaveBeenCalledTimes(1)
    expect(useIsDeployedSpy).toHaveBeenCalledWith({ config: undefined })

    expect(getPendingTransactionsMock).toHaveBeenCalledTimes(0)

    querySafeClientFn(publicClientMock)
    expect(getPendingTransactionsMock).toHaveBeenCalledTimes(1)
    expect(getPendingTransactionsMock).toHaveBeenCalledWith()
  })

  it('should accept a config to override the one from the SafeProvider', () => {
    const { renderResult, querySafeClientFn } = renderUsePendingTransactions({
      config: configPredictedSafe
    })

    expect(renderResult.result.current).toMatchObject(pendingTransactionsQueryResultMock)

    expect(usePublicClientQuerySpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientQuerySpy).toHaveBeenCalledWith({
      config: configPredictedSafe,
      querySafeClientFn: expect.any(Function),
      queryKey: [QueryKey.PendingTransactions]
    })

    expect(useIsDeployedSpy).toHaveBeenCalledTimes(1)
    expect(useIsDeployedSpy).toHaveBeenCalledWith({ config: configPredictedSafe })

    expect(getPendingTransactionsMock).toHaveBeenCalledTimes(0)

    querySafeClientFn(publicClientMock)
    expect(getPendingTransactionsMock).toHaveBeenCalledTimes(1)
    expect(getPendingTransactionsMock).toHaveBeenCalledWith()
  })

  it('should throw if Safe is not deployed', async () => {
    const errorResultMock = { data: undefined, status: 'error' } as UsePendingTransactionsReturnType

    useIsDeployedSpy.mockReturnValue({ data: false } as useIsDeployed.UseIsDeployedReturnType)

    const { renderResult, querySafeClientFn } = renderUsePendingTransactions(
      undefined,
      errorResultMock
    )

    expect(() => querySafeClientFn(publicClientMock)).rejects.toThrow('Safe is not deployed')

    expect(usePublicClientQuerySpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientQuerySpy).toHaveBeenCalledWith({
      querySafeClientFn: expect.any(Function),
      queryKey: [QueryKey.PendingTransactions]
    })

    expect(useIsDeployedSpy).toHaveBeenCalledTimes(1)
    expect(useIsDeployedSpy).toHaveBeenCalledWith({ config: undefined })

    expect(renderResult.result.current).toMatchObject(errorResultMock)

    expect(getPendingTransactionsMock).not.toHaveBeenCalled()
  })
})
