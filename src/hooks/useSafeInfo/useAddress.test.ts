import { UseQueryResult } from '@tanstack/react-query'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useAddress } from '@/hooks/useSafeInfo/useAddress.js'
import * as usePublicClientQuery from '@/hooks/usePublicClientQuery.js'
import { configPredictedSafe } from '@test/config.js'
import { safeAddress } from '@test/fixtures/index.js'
import { renderHookInQueryClientProvider } from '@test/utils.js'
import { QueryKey } from '@/constants.js'

describe('useAddress', () => {
  const usePublicClientQuerySpy = jest.spyOn(usePublicClientQuery, 'usePublicClientQuery')

  const getAddressMock = jest.fn().mockResolvedValue(safeAddress)

  const addressQueryResultMock = {
    data: safeAddress,
    status: 'success'
  } as unknown as UseQueryResult

  const publicClientMock = { getAddress: getAddressMock } as unknown as SafeClient

  beforeEach(() => {
    usePublicClientQuerySpy.mockImplementation(({ querySafeClientFn }) => {
      querySafeClientFn(publicClientMock)
      return addressQueryResultMock
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return result of `usePublicClientQuery` call', () => {
    const { result } = renderHookInQueryClientProvider(() => useAddress())

    expect(usePublicClientQuerySpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientQuerySpy).toHaveBeenCalledWith({
      querySafeClientFn: expect.any(Function),
      queryKey: [QueryKey.Address]
    })

    expect(getAddressMock).toHaveBeenCalledTimes(1)
    expect(getAddressMock).toHaveBeenCalledWith()

    expect(result.current).toEqual(addressQueryResultMock)
  })

  it('should accept a config to override the one from the SafeProvider', async () => {
    renderHookInQueryClientProvider(() => useAddress({ config: configPredictedSafe }))

    expect(usePublicClientQuerySpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientQuerySpy).toHaveBeenCalledWith({
      config: configPredictedSafe,
      querySafeClientFn: expect.any(Function),
      queryKey: [QueryKey.Address]
    })
  })
})
