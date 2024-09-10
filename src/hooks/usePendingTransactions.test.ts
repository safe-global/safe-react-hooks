import { waitFor } from '@testing-library/react'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { usePendingTransactions } from '@/hooks/usePendingTransactions.js'
import * as usePublicClient from '@/hooks/usePublicClient.js'
import * as useConfig from '@/hooks/useConfig.js'
import { safeTransaction } from '@test/fixtures.js'
import { renderHookInQueryClientProvider } from '@test/utils.js'
import { configExistingSafe, configPredictedSafe } from '@test/config.js'

describe('usePendingTransactions', () => {
  const useConfigSpy = jest.spyOn(useConfig, 'useConfig')
  const usePublicClientSpy = jest.spyOn(usePublicClient, 'usePublicClient')
  const publicClientMock = {
    getPendingTransactions: jest.fn().mockResolvedValue({ results: [safeTransaction], count: 1 })
  }

  beforeEach(() => {
    useConfigSpy.mockReturnValue([configExistingSafe, () => {}])
    usePublicClientSpy.mockReturnValue(publicClientMock as unknown as SafeClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return fetch and return pending Safe transactions via SafeClient', async () => {
    const { result } = renderHookInQueryClientProvider(() => usePendingTransactions())

    expect(result.current).toMatchObject({ data: undefined, status: 'pending' })

    await waitFor(() =>
      expect(result.current).toMatchObject({
        data: [safeTransaction],
        status: 'success'
      })
    )

    expect(publicClientMock.getPendingTransactions).toHaveBeenCalledTimes(1)

    expect(usePublicClientSpy).toHaveBeenCalledTimes(2)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: undefined })

    expect(publicClientMock.getPendingTransactions).toHaveBeenCalledTimes(1)
  })

  it('should accept a config to override the one from the SafeProvider', async () => {
    const { result } = renderHookInQueryClientProvider(() =>
      usePendingTransactions({ config: configPredictedSafe })
    )

    expect(usePublicClientSpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: configPredictedSafe })

    await waitFor(() =>
      expect(result.current).toMatchObject({ data: [safeTransaction], status: 'success' })
    )

    expect(usePublicClientSpy).toHaveBeenCalledTimes(2)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: configPredictedSafe })

    expect(publicClientMock.getPendingTransactions).toHaveBeenCalledTimes(1)
  })

  it('should return no data if request fails', async () => {
    publicClientMock.getPendingTransactions.mockRejectedValueOnce(
      new Error('Get pending transactions error')
    )

    const { result } = renderHookInQueryClientProvider(() => usePendingTransactions())

    expect(usePublicClientSpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: undefined })

    expect(result.current).toMatchObject({ data: undefined, status: 'pending' })

    expect(publicClientMock.getPendingTransactions).toHaveBeenCalledTimes(1)
  })
})
