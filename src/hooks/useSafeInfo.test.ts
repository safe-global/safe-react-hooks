import { waitFor } from '@testing-library/react'
import { useSafeInfo } from '@/hooks/useSafeInfo.js'
import * as useSafeClient from '@/hooks/useSafeClient.js'
import { safeConfig, safeInfo } from '@test/fixtures.js'
import { renderHookInSafeProvider } from '@test/utils.js'
import { SafeClient } from '@safe-global/safe-kit'

describe('useSafeInfo', () => {
  const useSafeClientSpy = jest.spyOn(useSafeClient, 'useSafeClient')
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
    jest.resetAllMocks()
  })

  it('should return fetch and return Safe infos via SafeClient', async () => {
    const { result } = renderHookInSafeProvider(() => useSafeInfo(), { config: safeConfig })

    expect(useSafeClientSpy).toHaveBeenCalledTimes(1)
    expect(useSafeClientSpy).toHaveBeenCalledWith()

    expect(result.current).toMatchObject({ data: undefined, status: 'pending' })

    await waitFor(() => expect(result.current).toMatchObject({ data: safeInfo, status: 'success' }))

    expect(useSafeClientSpy).toHaveBeenCalledTimes(2)
    expect(useSafeClientSpy).toHaveBeenCalledWith()

    expect(safeClientMock.protocolKit.getAddress).toHaveBeenCalledTimes(1)
    expect(safeClientMock.protocolKit.getNonce).toHaveBeenCalledTimes(1)
    expect(safeClientMock.protocolKit.getThreshold).toHaveBeenCalledTimes(1)
    expect(safeClientMock.protocolKit.isSafeDeployed).toHaveBeenCalledTimes(1)
    expect(safeClientMock.protocolKit.getOwners).toHaveBeenCalledTimes(1)
  })

  it('should accept a config to override the one from the SafeProvider', async () => {
    const overrideConfig = { ...safeConfig, safeAddress: '0x123' }

    renderHookInSafeProvider(() => useSafeInfo({ config: overrideConfig }), {
      config: safeConfig
    })

    expect(useSafeClientSpy).toHaveBeenCalledTimes(1)
    expect(useSafeClientSpy).toHaveBeenCalledWith({ config: overrideConfig })
  })

  // TODO: fix this failing test
  it.skip('should return no data if any request fails', async () => {
    safeClientMock.protocolKit.getAddress.mockRejectedValue(new Error('Address error'))

    const { result } = renderHookInSafeProvider(() => useSafeInfo(), { config: safeConfig })

    expect(useSafeClientSpy).toHaveBeenCalledTimes(1)
    expect(useSafeClientSpy).toHaveBeenCalledWith()

    expect(result.current).toMatchObject({ data: undefined, status: 'pending' })
  })
})
