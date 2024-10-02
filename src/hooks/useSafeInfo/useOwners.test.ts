import { UseQueryResult } from '@tanstack/react-query'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useOwners } from '@/hooks/useSafeInfo/useOwners.js'
import * as usePublicClientQuery from '@/hooks/usePublicClientQuery.js'
import { configPredictedSafe } from '@test/config.js'
import { renderHookInQueryClientProvider } from '@test/utils.js'
import { QueryKey } from '@/constants.js'
import { accounts } from '@test/fixtures/index.js'

describe('useOwners', () => {
  const usePublicClientQuerySpy = jest.spyOn(usePublicClientQuery, 'usePublicClientQuery')

  const ownersMock = accounts
  const getOwnersMock = jest.fn().mockResolvedValue(ownersMock)

  const ownersQueryResultMock = {
    data: ownersMock,
    status: 'success'
  } as unknown as UseQueryResult

  const publicClientMock = { getOwners: getOwnersMock } as unknown as SafeClient

  beforeEach(() => {
    usePublicClientQuerySpy.mockImplementation(({ querySafeClientFn }) => {
      querySafeClientFn(publicClientMock)
      return ownersQueryResultMock
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return result of `usePublicClientQuery` call', () => {
    const { result } = renderHookInQueryClientProvider(() => useOwners())

    expect(usePublicClientQuerySpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientQuerySpy).toHaveBeenCalledWith({
      querySafeClientFn: expect.any(Function),
      queryKey: [QueryKey.Owners]
    })

    expect(getOwnersMock).toHaveBeenCalledTimes(1)
    expect(getOwnersMock).toHaveBeenCalledWith()

    expect(result.current).toEqual(ownersQueryResultMock)
  })

  it('should accept a config to override the one from the SafeProvider', async () => {
    renderHookInQueryClientProvider(() => useOwners({ config: configPredictedSafe }))

    expect(usePublicClientQuerySpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientQuerySpy).toHaveBeenCalledWith({
      config: configPredictedSafe,
      querySafeClientFn: expect.any(Function),
      queryKey: [QueryKey.Owners]
    })
  })
})
