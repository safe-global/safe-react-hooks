import { waitFor } from '@testing-library/react'
import * as safeKit from '@safe-global/safe-kit'
import { usePublicClient } from '@/hooks/usePublicClient.js'
import { configExistingSafe, configPredictedSafe } from '@test/config.js'
import { renderHookInSafeProvider } from '@test/utils.js'

describe('usePublicClient', () => {
  const publicClientMock = { safeClient: 'public' } as unknown as safeKit.SafeClient
  const signerClientMock = { safeClient: 'signer' } as unknown as safeKit.SafeClient

  const createSafeClientSpy = jest.spyOn(safeKit, 'createSafeClient')

  beforeEach(() => {
    createSafeClientSpy.mockImplementation(({ signer }) =>
      Promise.resolve(signer ? signerClientMock : publicClientMock)
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return a SafeClient instance', async () => {
    const { result } = renderHookInSafeProvider(() => usePublicClient(), {
      config: configExistingSafe
    })

    const { provider, safeAddress } = configExistingSafe

    await waitFor(() => expect(result.current).toMatchObject(publicClientMock))

    expect(createSafeClientSpy).toHaveBeenCalledTimes(1)
    expect(createSafeClientSpy).toHaveBeenCalledWith({
      provider,
      safeAddress,
      signer: undefined
    })

    expect(result.current).toMatchObject(publicClientMock)
  })

  it('should accept a config to override the one from the SafeProvider', async () => {
    const { result } = renderHookInSafeProvider(
      () => usePublicClient({ config: configPredictedSafe }),
      {
        config: configExistingSafe
      }
    )

    await waitFor(() => expect(result.current).toMatchObject(publicClientMock))

    expect(createSafeClientSpy).toHaveBeenCalledTimes(2)

    expect(createSafeClientSpy).toHaveBeenCalledWith({
      provider: configExistingSafe.provider,
      safeAddress: configExistingSafe.safeAddress,
      signer: undefined
    })

    expect(createSafeClientSpy).toHaveBeenCalledWith({
      provider: configPredictedSafe.provider,
      safeOptions: configPredictedSafe.safeOptions,
      signer: undefined
    })

    expect(result.current).toMatchObject(publicClientMock)
  })
})
