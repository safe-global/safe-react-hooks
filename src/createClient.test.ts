import * as sdkStarterKit from '@safe-global/sdk-starter-kit'
import { createPublicClient, createSignerClient } from '@/createClient.js'
import { configExistingSafe, configPredictedSafe } from '@test/config.js'
import { signerPrivateKeys } from '@test/fixtures/index.js'

jest.mock('@safe-global/sdk-starter-kit', () => ({
  createSafeClient: jest.fn()
}))

describe('createClient', () => {
  const safeClientMock = { safe: 'client' } as unknown as sdkStarterKit.SafeClient

  const createSafeClientSpy = jest
    .spyOn(sdkStarterKit, 'createSafeClient')
    .mockResolvedValue(safeClientMock)

  beforeEach(() => {
    ;(sdkStarterKit.createSafeClient as jest.Mock).mockResolvedValue(safeClientMock)
  })

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
