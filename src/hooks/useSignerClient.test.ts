import { waitFor } from '@testing-library/react'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import * as createClient from '@/createClient.js'
import { useSignerClient, UseSignerClientParams } from '@/hooks/useSignerClient.js'
import { configExistingSafe, configPredictedSafe } from '@test/config.js'
import { renderHookInSafeProvider } from '@test/utils.js'
import { signerPrivateKeys } from '@test/fixtures/index.js'

describe('useSignerClient', () => {
  const signerClientExistingSafeMock = { safeClient: 'existing' } as unknown as SafeClient
  const signerClientPredictedSafeMock = { safeClient: 'predicted' } as unknown as SafeClient

  const createSignerClientSpy = jest.spyOn(createClient, 'createSignerClient')
  const createPublicClientSpy = jest.spyOn(createClient, 'createPublicClient')

  beforeEach(() => {
    createSignerClientSpy.mockImplementation(({ safeOptions }) =>
      Promise.resolve(safeOptions ? signerClientPredictedSafeMock : signerClientExistingSafeMock)
    )
    createPublicClientSpy.mockResolvedValue({ safeClient: 'public' } as unknown as SafeClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('if called without config param', () => {
    it('should return the SafeClient instance from the nearest SafeProvider', async () => {
      const config = { ...configExistingSafe, signer: signerPrivateKeys[0] }
      const { result } = renderHookInSafeProvider(() => useSignerClient(), { config })

      await waitFor(() => expect(result.current).toMatchObject(signerClientExistingSafeMock))

      expect(createSignerClientSpy).toHaveBeenCalledTimes(1)
      expect(createSignerClientSpy).toHaveBeenCalledWith(config)

      expect(result.current).toMatchObject(signerClientExistingSafeMock)
    })

    it('should return `undefined` if nearest SafeProvider has been initialized without a signer', async () => {
      const { result } = renderHookInSafeProvider(() => useSignerClient(), {
        config: configExistingSafe
      })

      await waitFor(() => expect(result.current).toBe(undefined))

      expect(createSignerClientSpy).toHaveBeenCalledTimes(0)

      expect(result.current).toBe(undefined)
    })
  })

  describe('if a config param is passed to the hook', () => {
    it('should create a new SafeClient instance and return it instead of the one from the context', async () => {
      const config = { ...configPredictedSafe, signer: signerPrivateKeys[0] }

      const { result } = renderHookInSafeProvider(() => useSignerClient({ config }), {
        config: configExistingSafe
      })

      await waitFor(() => expect(result.current).toMatchObject(signerClientPredictedSafeMock))

      expect(createSignerClientSpy).toHaveBeenCalledTimes(1)
      expect(createSignerClientSpy).toHaveBeenCalledWith(config)

      expect(result.current).toMatchObject(signerClientPredictedSafeMock)
    })

    it('should create a new SafeClient client if the passed config changes', async () => {
      const { result, rerender } = renderHookInSafeProvider(
        ({
          config = { ...configPredictedSafe, signer: signerPrivateKeys[0] }
        }: UseSignerClientParams = {}) => useSignerClient({ config }),
        { config: configExistingSafe }
      )

      await waitFor(() => expect(result.current).toMatchObject(signerClientPredictedSafeMock))

      expect(createSignerClientSpy).toHaveBeenCalledTimes(1)

      const newConfig = {
        ...configExistingSafe,
        provider: 'newProvider',
        signer: signerPrivateKeys[1]
      }
      rerender({ config: newConfig })

      await waitFor(() => expect(result.current).toMatchObject(signerClientExistingSafeMock))

      expect(createSignerClientSpy).toHaveBeenCalledTimes(2)
      expect(createSignerClientSpy).toHaveBeenNthCalledWith(2, newConfig)

      expect(result.current).toMatchObject(signerClientExistingSafeMock)
    })

    it('should NOT create a new SafeClient client if the config param matches the one from previous render', async () => {
      const initialConfig = { ...configPredictedSafe, signer: signerPrivateKeys[0] }

      const { result, rerender } = renderHookInSafeProvider(
        ({ config = initialConfig }: UseSignerClientParams = {}) => useSignerClient({ config }),
        { config: configExistingSafe }
      )

      await waitFor(() => expect(result.current).toMatchObject(signerClientPredictedSafeMock))

      expect(createSignerClientSpy).toHaveBeenCalledTimes(1)

      const newConfig = { ...configPredictedSafe, signer: signerPrivateKeys[0] }

      expect(initialConfig === newConfig).toBe(false)

      rerender({ config: newConfig })

      await waitFor(() => expect(result.current).toMatchObject(signerClientPredictedSafeMock))

      expect(createSignerClientSpy).toHaveBeenCalledTimes(1)
      expect(result.current).toMatchObject(signerClientPredictedSafeMock)
    })
  })
})
