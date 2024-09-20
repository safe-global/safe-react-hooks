import { UseQueryResult } from '@tanstack/react-query'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useThreshold } from '@/hooks/useSafeInfo/useThreshold.js'
import * as usePublicClientQuery from '@/hooks/usePublicClientQuery.js'
import { configPredictedSafe } from '@test/config.js'
import { renderHookInQueryClientProvider } from '@test/utils.js'
import { QueryKey } from '@/constants.js'

describe('useThreshold', () => {
  const usePublicClientQuerySpy = jest.spyOn(usePublicClientQuery, 'usePublicClientQuery')

  const thresholdMock = 2
  const getThresholdMock = jest.fn().mockResolvedValue(thresholdMock)

  const thresholdQueryResultMock = {
    data: thresholdMock,
    status: 'success'
  } as unknown as UseQueryResult

  const publicClientMock = {
    protocolKit: { getThreshold: getThresholdMock }
  } as unknown as SafeClient

  beforeEach(() => {
    usePublicClientQuerySpy.mockImplementation(({ querySafeClientFn }) => {
      querySafeClientFn(publicClientMock)
      return thresholdQueryResultMock
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return result of `usePublicClientQuery` call', () => {
    const { result } = renderHookInQueryClientProvider(() => useThreshold())

    expect(usePublicClientQuerySpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientQuerySpy).toHaveBeenCalledWith({
      querySafeClientFn: expect.any(Function),
      queryKey: [QueryKey.Threshold]
    })

    expect(getThresholdMock).toHaveBeenCalledTimes(1)
    expect(getThresholdMock).toHaveBeenCalledWith()

    expect(result.current).toEqual(thresholdQueryResultMock)
  })

  it('should accept a config to override the one from the SafeProvider', async () => {
    renderHookInQueryClientProvider(() => useThreshold({ config: configPredictedSafe }))

    expect(usePublicClientQuerySpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientQuerySpy).toHaveBeenCalledWith({
      config: configPredictedSafe,
      querySafeClientFn: expect.any(Function),
      queryKey: [QueryKey.Threshold]
    })
  })
})
