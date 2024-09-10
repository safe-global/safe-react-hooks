import { waitFor } from '@testing-library/react'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useTransactions } from '@/hooks/useTransactions.js'
import * as usePublicClient from '@/hooks/usePublicClient.js'
import * as useSafeInfo from '@/hooks/useSafeInfo.js'
import * as useConfig from '@/hooks/useConfig.js'
import { safeAddress, safeTransaction } from '@test/fixtures.js'
import { renderHookInQueryClientProvider } from '@test/utils.js'
import { configExistingSafe, configPredictedSafe } from '@test/config.js'

describe('useTransactions', () => {
  const useConfigSpy = jest.spyOn(useConfig, 'useConfig')
  const useSafeInfoSpy = jest.spyOn(useSafeInfo, 'useSafeInfo')
  const usePublicClientSpy = jest.spyOn(usePublicClient, 'usePublicClient')
  const publicClientMock = {
    apiKit: {
      getAllTransactions: jest.fn().mockResolvedValue({ results: [safeTransaction], count: 1 })
    }
  }

  beforeEach(() => {
    useConfigSpy.mockReturnValue([configExistingSafe, () => {}])

    useSafeInfoSpy.mockReturnValue({
      data: { address: safeAddress }
    } as useSafeInfo.UseSafeInfoReturnType)

    usePublicClientSpy.mockReturnValue(publicClientMock as unknown as SafeClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return fetch and return Safe transactions via SafeClient', async () => {
    const { result } = renderHookInQueryClientProvider(() => useTransactions())

    expect(result.current).toMatchObject({ data: undefined, status: 'pending' })

    await waitFor(() =>
      expect(result.current).toMatchObject({
        data: [safeTransaction],
        status: 'success'
      })
    )

    expect(publicClientMock.apiKit.getAllTransactions).toHaveBeenCalledTimes(1)

    expect(usePublicClientSpy).toHaveBeenCalledTimes(2)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: undefined })

    expect(publicClientMock.apiKit.getAllTransactions).toHaveBeenCalledTimes(1)
    expect(publicClientMock.apiKit.getAllTransactions).toHaveBeenCalledWith(safeAddress)
  })

  it('should accept a config to override the one from the SafeProvider', async () => {
    const { result } = renderHookInQueryClientProvider(() =>
      useTransactions({ config: configPredictedSafe })
    )

    expect(usePublicClientSpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: configPredictedSafe })

    await waitFor(() =>
      expect(result.current).toMatchObject({ data: [safeTransaction], status: 'success' })
    )

    expect(usePublicClientSpy).toHaveBeenCalledTimes(2)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: configPredictedSafe })

    expect(publicClientMock.apiKit.getAllTransactions).toHaveBeenCalledTimes(1)
    expect(publicClientMock.apiKit.getAllTransactions).toHaveBeenCalledWith(safeAddress)
  })

  it('should return no data if request fails', async () => {
    publicClientMock.apiKit.getAllTransactions.mockRejectedValueOnce(
      new Error('Get all transactions error')
    )

    const { result } = renderHookInQueryClientProvider(() => useTransactions())

    expect(usePublicClientSpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: undefined })

    expect(result.current).toMatchObject({ data: undefined, status: 'pending' })

    expect(publicClientMock.apiKit.getAllTransactions).toHaveBeenCalledTimes(1)
    expect(publicClientMock.apiKit.getAllTransactions).toHaveBeenCalledWith(safeAddress)
  })

  it('should return no data if no Safe address provided by `useSafeInfo` hook', async () => {
    useSafeInfoSpy.mockReturnValueOnce({ data: {} } as useSafeInfo.UseSafeInfoReturnType)

    const { result } = renderHookInQueryClientProvider(() => useTransactions())

    expect(usePublicClientSpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: undefined })

    expect(result.current).toMatchObject({ data: undefined, status: 'pending' })

    expect(publicClientMock.apiKit.getAllTransactions).not.toHaveBeenCalled()
  })
})
