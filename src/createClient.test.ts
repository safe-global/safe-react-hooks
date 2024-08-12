import * as safeKit from '@safe-global/safe-kit'
import { createPublicClient, createSignerClient } from '@/createClient.js'
import { configExistingSafe, configPredictedSafe } from '@test/config.js'
import { signerPrivateKeys } from '@test/fixtures.js'

describe('createClient', () => {
  const safeClientMock = { safe: 'client' } as unknown as safeKit.SafeClient

  const createSafeClientSpy = jest
    .spyOn(safeKit, 'createSafeClient')
    .mockResolvedValue(safeClientMock)

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createPublicClient', () => {
    describe('for an existing Safe', () => {
      it('should call `createSafeClient` with the correct parameters', async () => {
        const publicClient = await createPublicClient(configExistingSafe)
        expect(publicClient).toBe(safeClientMock)

        expect(createSafeClientSpy).toHaveBeenCalledTimes(1)
        expect(createSafeClientSpy).toHaveBeenCalledWith({
          signer: undefined,
          provider: configExistingSafe.provider,
          safeAddress: configExistingSafe.safeAddress
        })
      })
    })

    describe('for a predicted Safe', () => {
      it('should call `createSafeClient` with the correct parameters', async () => {
        const publicClient = await createPublicClient(configPredictedSafe)
        expect(publicClient).toBe(safeClientMock)

        expect(createSafeClientSpy).toHaveBeenCalledTimes(1)
        expect(createSafeClientSpy).toHaveBeenCalledWith({
          signer: undefined,
          provider: configPredictedSafe.provider,
          safeOptions: configPredictedSafe.safeOptions
        })
      })
    })
  })

  describe('createSignerClient', () => {
    describe('for an existing Safe', () => {
      it('should call `createSafeClient` with the correct parameters', async () => {
        const config = { ...configExistingSafe, signer: signerPrivateKeys[0] }

        const signerClient = await createSignerClient(config)
        expect(signerClient).toBe(safeClientMock)

        expect(createSafeClientSpy).toHaveBeenCalledTimes(1)
        expect(createSafeClientSpy).toHaveBeenCalledWith({
          signer: config.signer,
          provider: config.provider,
          safeAddress: config.safeAddress
        })
      })
    })

    describe('for a predicted Safe', () => {
      it('should call `createSafeClient` with the correct parameters', async () => {
        const config = { ...configPredictedSafe, signer: signerPrivateKeys[0] }

        const signerClient = await createSignerClient(config)
        expect(signerClient).toBe(safeClientMock)

        expect(createSafeClientSpy).toHaveBeenCalledTimes(1)
        expect(createSafeClientSpy).toHaveBeenCalledWith({
          signer: config.signer,
          provider: config.provider,
          safeOptions: config.safeOptions
        })
      })
    })
  })
})
