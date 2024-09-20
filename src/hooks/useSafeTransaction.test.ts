import { waitFor } from '@testing-library/react'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useSafeTransaction } from '@/hooks/useSafeTransaction.js'
import * as usePublicClient from '@/hooks/usePublicClient.js'
import { safeTxHash, safeTransaction } from '@test/fixtures/index.js'
import { renderHookInQueryClientProvider } from '@test/utils.js'
import { configPredictedSafe } from '@test/config.js'

describe('useSafeTransaction', () => {
  const usePublicClientSpy = jest.spyOn(usePublicClient, 'usePublicClient')
  const publicClientMock = {
    apiKit: {
      getTransaction: jest.fn().mockResolvedValue(safeTransaction)
    }
  }

  beforeEach(() => {
    usePublicClientSpy.mockReturnValue(publicClientMock as unknown as SafeClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return fetch and return Safe transaction via SafeClient', async () => {
    const { result } = renderHookInQueryClientProvider(() => useSafeTransaction({ safeTxHash }))

    expect(usePublicClientSpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: undefined })

    expect(result.current).toMatchObject({ data: undefined, status: 'pending' })

    await waitFor(() =>
      expect(result.current).toMatchObject({ data: safeTransaction, status: 'success' })
    )

    expect(publicClientMock.apiKit.getTransaction).toHaveBeenCalledTimes(1)

    expect(usePublicClientSpy).toHaveBeenCalledTimes(2)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: undefined })

    expect(publicClientMock.apiKit.getTransaction).toHaveBeenCalledTimes(1)
    expect(publicClientMock.apiKit.getTransaction).toHaveBeenCalledWith(safeTxHash)
  })

  it('should accept a config to override the one from the SafeProvider', async () => {
    const { result } = renderHookInQueryClientProvider(() =>
      useSafeTransaction({ config: configPredictedSafe, safeTxHash })
    )

    expect(usePublicClientSpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: configPredictedSafe })

    await waitFor(() =>
      expect(result.current).toMatchObject({ data: safeTransaction, status: 'success' })
    )

    expect(usePublicClientSpy).toHaveBeenCalledTimes(2)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: configPredictedSafe })

    expect(publicClientMock.apiKit.getTransaction).toHaveBeenCalledTimes(1)
    expect(publicClientMock.apiKit.getTransaction).toHaveBeenCalledWith(safeTxHash)
  })

  it('should return no data if request fails', async () => {
    publicClientMock.apiKit.getTransaction.mockRejectedValue(new Error('Get transaction error'))

    const { result } = renderHookInQueryClientProvider(() => useSafeTransaction({ safeTxHash }))

    expect(usePublicClientSpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: undefined })

    expect(result.current).toMatchObject({ data: undefined, status: 'pending' })

    expect(publicClientMock.apiKit.getTransaction).toHaveBeenCalledTimes(1)
    expect(publicClientMock.apiKit.getTransaction).toHaveBeenCalledWith(safeTxHash)
  })
})
