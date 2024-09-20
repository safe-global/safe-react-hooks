import { UseQueryResult } from '@tanstack/react-query'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useIsDeployed } from '@/hooks/useSafeInfo/useIsDeployed.js'
import * as usePublicClientQuery from '@/hooks/usePublicClientQuery.js'
import { configPredictedSafe } from '@test/config.js'
import { renderHookInQueryClientProvider } from '@test/utils.js'
import { QueryKey } from '@/constants.js'

describe('useIsDeployed', () => {
  const usePublicClientQuerySpy = jest.spyOn(usePublicClientQuery, 'usePublicClientQuery')

  const isSafeDeployedMock = jest.fn().mockResolvedValue(true)

  const isDeployedQueryResultMock = {
    data: true,
    status: 'success'
  } as unknown as UseQueryResult

  const publicClientMock = {
    protocolKit: { isSafeDeployed: isSafeDeployedMock }
  } as unknown as SafeClient

  beforeEach(() => {
    usePublicClientQuerySpy.mockImplementation(({ querySafeClientFn }) => {
      querySafeClientFn(publicClientMock)
      return isDeployedQueryResultMock
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return result of `usePublicClientQuery` call', () => {
    const { result } = renderHookInQueryClientProvider(() => useIsDeployed())

    expect(usePublicClientQuerySpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientQuerySpy).toHaveBeenCalledWith({
      querySafeClientFn: expect.any(Function),
      queryKey: [QueryKey.IsDeployed]
    })

    expect(isSafeDeployedMock).toHaveBeenCalledTimes(1)
    expect(isSafeDeployedMock).toHaveBeenCalledWith()

    expect(result.current).toEqual(isDeployedQueryResultMock)
  })

  it('should accept a config to override the one from the SafeProvider', async () => {
    renderHookInQueryClientProvider(() => useIsDeployed({ config: configPredictedSafe }))

    expect(usePublicClientQuerySpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientQuerySpy).toHaveBeenCalledWith({
      config: configPredictedSafe,
      querySafeClientFn: expect.any(Function),
      queryKey: [QueryKey.IsDeployed]
    })
  })
})
