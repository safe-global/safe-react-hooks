import { renderHook, waitFor } from '@testing-library/react'
import * as safeKit from '@safe-global/safe-kit'
import { useSafeClient } from '@/hooks/useSafeClient.js'
import * as useConfig from '@/hooks/useConfig.js'

describe('useSafeClient', () => {
  const safeProviderConfig = {
    provider: 'https://rpc.provider.com',
    signer: '0x1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    safeAddress: '0x9a1148b5D6a2D34CA46111379d0FD1352a0ade4a'
  }
  const safeClientMock = {
    foo: 'bar'
  } as unknown as safeKit.SafeClient

  const createSafeClientSpy = jest.spyOn(safeKit, 'createSafeClient')
  const useConfigSpy = jest.spyOn(useConfig, 'useConfig')

  beforeEach(() => {
    useConfigSpy.mockReturnValue(safeProviderConfig)
    createSafeClientSpy.mockResolvedValue(safeClientMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return a SafeClient instance and a function to get it', async () => {
    const { result } = renderHook(() => useSafeClient())

    expect(useConfigSpy).toHaveBeenCalledTimes(1)
    expect(useConfigSpy).toHaveBeenCalledWith()

    expect(result.current).toBeUndefined()

    await waitFor(() => expect(result.current).toMatchObject(safeClientMock))

    expect(useConfigSpy).toHaveBeenCalledTimes(2)
    expect(useConfigSpy).toHaveBeenCalledWith()

    expect(createSafeClientSpy).toHaveBeenCalledTimes(1)
    expect(createSafeClientSpy).toHaveBeenCalledWith(safeProviderConfig)
  })

  it('should accept a config to override the one from the SafeProvider', async () => {
    const overrideConfig = {
      provider: 'https://rpc.provider2.com',
      signer: '0x321',
      safeAddress: '0x123'
    }

    const { result } = renderHook(() => useSafeClient({ config: overrideConfig }))

    expect(useConfigSpy).toHaveBeenCalledTimes(1)
    expect(useConfigSpy).toHaveBeenCalledWith({ config: overrideConfig })

    expect(result.current).toBeUndefined()

    await waitFor(() => expect(result.current).toMatchObject(safeClientMock))

    expect(useConfigSpy).toHaveBeenCalledTimes(2)
    expect(useConfigSpy).toHaveBeenCalledWith({ config: overrideConfig })
  })
})
