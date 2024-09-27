import { UseQueryResult } from '@tanstack/react-query'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useNonce } from '@/hooks/useSafeInfo/useNonce.js'
import * as usePublicClientQuery from '@/hooks/usePublicClientQuery.js'
import { configPredictedSafe } from '@test/config.js'
import { renderHookInQueryClientProvider } from '@test/utils.js'
import { QueryKey } from '@/constants.js'

describe('useNonce', () => {
  const usePublicClientQuerySpy = jest.spyOn(usePublicClientQuery, 'usePublicClientQuery')

  const nonceMock = 123
  const getNonceMock = jest.fn().mockResolvedValue(nonceMock)

  const nonceQueryResultMock = {
    data: nonceMock,
    status: 'success'
  } as unknown as UseQueryResult

  const publicClientMock = {
    protocolKit: { getNonce: getNonceMock }
  } as unknown as SafeClient

  beforeEach(() => {
    usePublicClientQuerySpy.mockImplementation(({ querySafeClientFn }) => {
      querySafeClientFn(publicClientMock)
      return nonceQueryResultMock
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return result of `usePublicClientQuery` call', () => {
    const { result } = renderHookInQueryClientProvider(() => useNonce())

    expect(usePublicClientQuerySpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientQuerySpy).toHaveBeenCalledWith({
      querySafeClientFn: expect.any(Function),
      queryKey: [QueryKey.Nonce]
    })

    expect(getNonceMock).toHaveBeenCalledTimes(1)
    expect(getNonceMock).toHaveBeenCalledWith()

    expect(result.current).toEqual(nonceQueryResultMock)
  })

  it('should accept a config to override the one from the SafeProvider', async () => {
    renderHookInQueryClientProvider(() => useNonce({ config: configPredictedSafe }))

    expect(usePublicClientQuerySpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientQuerySpy).toHaveBeenCalledWith({
      config: configPredictedSafe,
      querySafeClientFn: expect.any(Function),
      queryKey: [QueryKey.Nonce]
    })
  })
})
