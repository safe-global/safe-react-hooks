import {  waitFor } from '@testing-library/react'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useSafeInfo } from '@/hooks/useSafeInfo.js'
import * as usePublicClient from '@/hooks/usePublicClient.js'
import * as useConfig from '@/hooks/useConfig.js'
import { configExistingSafe, configPredictedSafe } from '@test/config.js'
import { safeInfo, signerPrivateKeys } from '@test/fixtures.js'
import { renderHookInQueryClientProvider } from '@test/utils.js'

describe('useSafeInfo', () => {
  const useConfigSpy = jest.spyOn(useConfig, 'useConfig')
  const usePublicClientSpy = jest.spyOn(usePublicClient, 'usePublicClient')
  const publicClientMock = {
    protocolKit: {
      getAddress: jest.fn().mockResolvedValue(safeInfo.address),
      getNonce: jest.fn().mockResolvedValue(safeInfo.nonce),
      getThreshold: jest.fn().mockResolvedValue(safeInfo.threshold),
      isSafeDeployed: jest.fn().mockResolvedValue(safeInfo.isDeployed),
      getOwners: jest.fn().mockResolvedValue(safeInfo.owners)
    }
  }

  beforeEach(() => {
    useConfigSpy.mockReturnValue([configExistingSafe, () => {}])
    usePublicClientSpy.mockReturnValue(publicClientMock as unknown as SafeClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return fetch and return Safe infos via SafeClient', async () => {
    const { result } = renderHookInQueryClientProvider(() => useSafeInfo())

    expect(usePublicClientSpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: undefined })

    expect(result.current).toMatchObject({ data: undefined, status: 'pending' })

    await waitFor(() => expect(result.current).toMatchObject({ data: safeInfo, status: 'success' }))

    expect(publicClientMock.protocolKit.getAddress).toHaveBeenCalledTimes(1)
    expect(publicClientMock.protocolKit.getNonce).toHaveBeenCalledTimes(1)
    expect(publicClientMock.protocolKit.getThreshold).toHaveBeenCalledTimes(1)
    expect(publicClientMock.protocolKit.isSafeDeployed).toHaveBeenCalledTimes(1)
    expect(publicClientMock.protocolKit.getOwners).toHaveBeenCalledTimes(1)

    expect(usePublicClientSpy).toHaveBeenCalledTimes(2)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: undefined })
  })

  it('should accept a config to override the one from the SafeProvider', async () => {
    const { result } = renderHookInQueryClientProvider(() =>
      useSafeInfo({ config: configPredictedSafe })
    )

    expect(usePublicClientSpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: configPredictedSafe })

    await waitFor(() => expect(result.current).toMatchObject({ data: safeInfo, status: 'success' }))

    expect(usePublicClientSpy).toHaveBeenCalledTimes(2)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: configPredictedSafe })
  })

  it('should return no data if any request fails', async () => {
    useConfigSpy.mockReturnValueOnce([
      { ...configPredictedSafe, signer: signerPrivateKeys[1] },
      () => {}
    ])
    publicClientMock.protocolKit.getAddress.mockRejectedValue(new Error('Address error'))

    const { result } = renderHookInQueryClientProvider(() => useSafeInfo())

    expect(usePublicClientSpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: undefined })

    expect(result.current).toMatchObject({ data: undefined, status: 'pending' })
  })
})
