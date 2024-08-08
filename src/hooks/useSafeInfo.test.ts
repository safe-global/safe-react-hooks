import { waitFor } from '@testing-library/react'
import { SafeClient } from '@safe-global/safe-kit'
import { useSafeInfo } from '@/hooks/useSafeInfo.js'
import * as usePublicClient from '@/hooks/usePublicClient.js'
import { configExistingSafe, configPredictedSafe } from '@test/config.js'
import { safeInfo, signerPrivateKeys } from '@test/fixtures.js'
import { renderHookInSafeProvider } from '@test/utils.js'

describe('useSafeInfo', () => {
  const useSafeClientSpy = jest.spyOn(usePublicClient, 'usePublicClient')
  const safeClientMock = {
    protocolKit: {
      getAddress: jest.fn().mockResolvedValue(safeInfo.address),
      getNonce: jest.fn().mockResolvedValue(safeInfo.nonce),
      getThreshold: jest.fn().mockResolvedValue(safeInfo.threshold),
      isSafeDeployed: jest.fn().mockResolvedValue(safeInfo.isDeployed),
      getOwners: jest.fn().mockResolvedValue(safeInfo.owners)
    }
  }

  beforeEach(() => {
    useSafeClientSpy.mockReturnValue(safeClientMock as unknown as SafeClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return fetch and return Safe infos via SafeClient', async () => {
    const { result } = renderHookInSafeProvider(() => useSafeInfo(), {
      config: configExistingSafe
    })

    expect(useSafeClientSpy).toHaveBeenCalledTimes(1)
    expect(useSafeClientSpy).toHaveBeenCalledWith({ config: undefined })

    expect(result.current).toMatchObject({ data: undefined, status: 'pending' })

    await waitFor(() => expect(result.current).toMatchObject({ data: safeInfo, status: 'success' }))

    expect(safeClientMock.protocolKit.getAddress).toHaveBeenCalledTimes(1)
    expect(safeClientMock.protocolKit.getNonce).toHaveBeenCalledTimes(1)
    expect(safeClientMock.protocolKit.getThreshold).toHaveBeenCalledTimes(1)
    expect(safeClientMock.protocolKit.isSafeDeployed).toHaveBeenCalledTimes(1)
    expect(safeClientMock.protocolKit.getOwners).toHaveBeenCalledTimes(1)

    expect(useSafeClientSpy).toHaveBeenCalledTimes(2)
    expect(useSafeClientSpy).toHaveBeenCalledWith({ config: undefined })
  })

  it('should accept a config to override the one from the SafeProvider', async () => {
    const { result } = renderHookInSafeProvider(
      () => useSafeInfo({ config: configPredictedSafe }),
      { config: configExistingSafe }
    )

    expect(useSafeClientSpy).toHaveBeenCalledTimes(1)
    expect(useSafeClientSpy).toHaveBeenCalledWith({ config: configPredictedSafe })

    await waitFor(() => expect(result.current).toMatchObject({ data: safeInfo, status: 'success' }))

    expect(useSafeClientSpy).toHaveBeenCalledTimes(2)
    expect(useSafeClientSpy).toHaveBeenCalledWith({ config: configPredictedSafe })
  })

  it('should return no data if any request fails', async () => {
    safeClientMock.protocolKit.getAddress.mockRejectedValue(new Error('Address error'))

    const { result } = renderHookInSafeProvider(() => useSafeInfo(), {
      config: { ...configPredictedSafe, signer: signerPrivateKeys[1] }
    })

    expect(useSafeClientSpy).toHaveBeenCalledTimes(1)
    expect(useSafeClientSpy).toHaveBeenCalledWith({ config: undefined })

    expect(result.current).toMatchObject({ data: undefined, status: 'pending' })
  })
})
