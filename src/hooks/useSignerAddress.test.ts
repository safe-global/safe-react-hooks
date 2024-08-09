import { renderHook, waitFor } from '@testing-library/react'
import { SafeClient } from '@safe-global/safe-kit'
import { useSignerAddress } from '@/hooks/useSignerAddress.js'
import * as useSignerClient from '@/hooks/useSignerClient.js'
import { configPredictedSafe } from '@test/config.js'
import { accounts, signerPrivateKeys } from '@test/fixtures.js'

describe('useSignerAddress', () => {
  const useSignerClientSpy = jest.spyOn(useSignerClient, 'useSignerClient')

  const getSignerAddressMock = jest.fn().mockResolvedValue(accounts[0])
  const safeClientMock = {
    protocolKit: {
      getSafeProvider: jest.fn().mockReturnValue({ getSignerAddress: getSignerAddressMock })
    }
  }

  beforeEach(() => {
    useSignerClientSpy.mockReturnValue(safeClientMock as unknown as SafeClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe.each([
    ['without config parameter', { config: undefined }],
    ['with config parameter', { config: { ...configPredictedSafe, signer: signerPrivateKeys[0] } }]
  ])('when being called %s', (_label, params) => {
    it(`should return the configured signer's address`, async () => {
      const { result } = renderHook(() => useSignerAddress(params))

      expect(useSignerClientSpy).toHaveBeenCalledTimes(1)
      expect(useSignerClientSpy).toHaveBeenCalledWith(params)

      await waitFor(() => expect(result.current).toEqual(accounts[0]))

      expect(safeClientMock.protocolKit.getSafeProvider).toHaveBeenCalledTimes(1)
      expect(getSignerAddressMock).toHaveBeenCalledTimes(1)
    })
  })

  it('should return `undefined` if no signer is configured', async () => {
    const { result } = renderHook(() => useSignerAddress())

    expect(useSignerClientSpy).toHaveBeenCalledTimes(1)
    expect(useSignerClientSpy).toHaveBeenCalledWith({ config: undefined })

    await waitFor(() => expect(result.current).toEqual(undefined))
  })
})
