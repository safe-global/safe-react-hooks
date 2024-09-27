import { useSafeInfo } from '@/hooks/useSafeInfo/index.js'
import * as useAddress from '@/hooks/useSafeInfo/useAddress.js'
import * as useNonce from '@/hooks/useSafeInfo/useNonce.js'
import * as useThreshold from '@/hooks/useSafeInfo/useThreshold.js'
import * as useIsDeployed from '@/hooks/useSafeInfo/useIsDeployed.js'
import * as useOwners from '@/hooks/useSafeInfo/useOwners.js'
import { configPredictedSafe } from '@test/config.js'
import { renderHookInQueryClientProvider } from '@test/utils.js'
import {
  createQuerySuccessResult,
  queryLoadingErrorResult,
  queryPendingResult
} from '@test/fixtures/queryResult.js'
import { safeInfo } from '@test/fixtures/index.js'

describe('useSafeInfo', () => {
  const useAddressSpy = jest.spyOn(useAddress, 'useAddress')
  const useNonceSpy = jest.spyOn(useNonce, 'useNonce')
  const useThresholdSpy = jest.spyOn(useThreshold, 'useThreshold')
  const useIsDeployedSpy = jest.spyOn(useIsDeployed, 'useIsDeployed')
  const useOwnersSpy = jest.spyOn(useOwners, 'useOwners')

  const addressQueryResultMock = createQuerySuccessResult(safeInfo.address)
  const nonceQueryResultMock = createQuerySuccessResult(safeInfo.nonce)
  const thresholdQueryResultMock = createQuerySuccessResult(safeInfo.threshold)
  const isDeployedQueryResultMock = createQuerySuccessResult(safeInfo.isDeployed)
  const ownersQueryResultMock = createQuerySuccessResult(safeInfo.owners)

  beforeEach(() => {
    useAddressSpy.mockReturnValue(addressQueryResultMock)
    useNonceSpy.mockReturnValue(nonceQueryResultMock)
    useThresholdSpy.mockReturnValue(thresholdQueryResultMock)
    useIsDeployedSpy.mockReturnValue(isDeployedQueryResultMock)
    useOwnersSpy.mockReturnValue(ownersQueryResultMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return fetch and return Safe infos using individual hooks', () => {
    const { refetch, ...expectedResult } = createQuerySuccessResult(safeInfo)

    const { result } = renderHookInQueryClientProvider(() => useSafeInfo())

    expect(useAddressSpy).toHaveBeenCalledTimes(1)
    expect(useAddressSpy).toHaveBeenCalledWith({ config: undefined })

    expect(useNonceSpy).toHaveBeenCalledTimes(1)
    expect(useNonceSpy).toHaveBeenCalledWith({ config: undefined })

    expect(useThresholdSpy).toHaveBeenCalledTimes(1)
    expect(useThresholdSpy).toHaveBeenCalledWith({ config: undefined })

    expect(useIsDeployedSpy).toHaveBeenCalledTimes(1)
    expect(useIsDeployedSpy).toHaveBeenCalledWith({ config: undefined })

    expect(useOwnersSpy).toHaveBeenCalledTimes(1)
    expect(useOwnersSpy).toHaveBeenCalledWith({ config: undefined })

    expect(result.current).toEqual(expectedResult)
  })

  it('should accept a config to override the one from the SafeProvider', () => {
    renderHookInQueryClientProvider(() => useSafeInfo({ config: configPredictedSafe }))

    expect(useAddressSpy).toHaveBeenCalledTimes(1)
    expect(useAddressSpy).toHaveBeenCalledWith({ config: configPredictedSafe })

    expect(useNonceSpy).toHaveBeenCalledTimes(1)
    expect(useNonceSpy).toHaveBeenCalledWith({ config: configPredictedSafe })

    expect(useThresholdSpy).toHaveBeenCalledTimes(1)
    expect(useThresholdSpy).toHaveBeenCalledWith({ config: configPredictedSafe })

    expect(useIsDeployedSpy).toHaveBeenCalledTimes(1)
    expect(useIsDeployedSpy).toHaveBeenCalledWith({ config: configPredictedSafe })

    expect(useOwnersSpy).toHaveBeenCalledTimes(1)
    expect(useOwnersSpy).toHaveBeenCalledWith({ config: configPredictedSafe })
  })

  it('should return with loading state + partial data if any individual hook returns with loading state', async () => {
    useThresholdSpy.mockReturnValueOnce(queryPendingResult)

    const { refetch, ...expectedResult } = {
      ...queryPendingResult,
      data: { ...safeInfo, threshold: undefined }
    }

    const { result } = renderHookInQueryClientProvider(() => useSafeInfo())

    expect(useAddressSpy).toHaveBeenCalledTimes(1)
    expect(useAddressSpy).toHaveBeenCalledWith({ config: undefined })

    expect(useNonceSpy).toHaveBeenCalledTimes(1)
    expect(useNonceSpy).toHaveBeenCalledWith({ config: undefined })

    expect(useThresholdSpy).toHaveBeenCalledTimes(1)
    expect(useThresholdSpy).toHaveBeenCalledWith({ config: undefined })

    expect(useIsDeployedSpy).toHaveBeenCalledTimes(1)
    expect(useIsDeployedSpy).toHaveBeenCalledWith({ config: undefined })

    expect(useOwnersSpy).toHaveBeenCalledTimes(1)
    expect(useOwnersSpy).toHaveBeenCalledWith({ config: undefined })

    expect(result.current).toEqual(expectedResult)
  })

  it('should return error state + partial data if any individual hook returns with error state', async () => {
    useAddressSpy.mockReturnValueOnce(queryLoadingErrorResult)
    useOwnersSpy.mockReturnValueOnce(queryLoadingErrorResult)

    const { refetch, ...expectedResult } = {
      ...queryLoadingErrorResult,
      errorUpdateCount: 2,
      data: { ...safeInfo, address: undefined, owners: undefined }
    }

    const { result } = renderHookInQueryClientProvider(() => useSafeInfo())

    expect(useAddressSpy).toHaveBeenCalledTimes(1)
    expect(useAddressSpy).toHaveBeenCalledWith({ config: undefined })

    expect(useNonceSpy).toHaveBeenCalledTimes(1)
    expect(useNonceSpy).toHaveBeenCalledWith({ config: undefined })

    expect(useThresholdSpy).toHaveBeenCalledTimes(1)
    expect(useThresholdSpy).toHaveBeenCalledWith({ config: undefined })

    expect(useIsDeployedSpy).toHaveBeenCalledTimes(1)
    expect(useIsDeployedSpy).toHaveBeenCalledWith({ config: undefined })

    expect(useOwnersSpy).toHaveBeenCalledTimes(1)
    expect(useOwnersSpy).toHaveBeenCalledWith({ config: undefined })

    expect(result.current).toEqual(expectedResult)
  })
})
