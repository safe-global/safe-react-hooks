import { renderHook, waitFor } from '@testing-library/react'
import { SafeClient } from '@safe-global/sdk-starter-kit'
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

      expect(safeClientMock.protocolKit.getSafeProvider).toHaveBeenCalledTimes(2)
      expect(getSignerAddressMock).toHaveBeenCalledTimes(2)
    })
  })

  it('should return `undefined` if no signer is configured', async () => {
    useSignerClientSpy.mockReturnValueOnce(undefined)

    const { result } = renderHook(() => useSignerAddress())

    expect(useSignerClientSpy).toHaveBeenCalledTimes(1)
    expect(useSignerClientSpy).toHaveBeenCalledWith({ config: undefined })

    await waitFor(() => expect(result.current).toEqual(undefined))
  })

  it('should update returned value to `undefined` if signerClient changes to undefined on rerender', async () => {
    const { result, rerender } = renderHook(() => useSignerAddress())

    await waitFor(() => expect(result.current).toEqual(accounts[0]))

    expect(useSignerClientSpy).toHaveBeenCalledTimes(2)
    expect(useSignerClientSpy).toHaveBeenNthCalledWith(1, { config: undefined })
    expect(useSignerClientSpy).toHaveBeenNthCalledWith(2, { config: undefined })

    useSignerClientSpy.mockReturnValueOnce(undefined)
    useSignerClientSpy.mockReturnValueOnce(undefined)

    rerender()
    await waitFor(() => expect(result.current).toEqual(undefined))

    expect(useSignerClientSpy).toHaveBeenCalledTimes(4)
    expect(useSignerClientSpy).toHaveBeenNthCalledWith(3, { config: undefined })
    expect(useSignerClientSpy).toHaveBeenNthCalledWith(4, { config: undefined })
  })
})
