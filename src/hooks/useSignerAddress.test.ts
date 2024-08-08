import { waitFor } from '@testing-library/react'
import { SafeClient } from '@safe-global/safe-kit'
import { useSignerAddress } from '@/hooks/useSignerAddress.js'
import * as useConfig from '@/hooks/useConfig.js'
import * as useSafeClient from '@/hooks/useSafeClient.js'
import { configExistingSafe, configPredictedSafe } from '@test/config.js'
import { accounts } from '@test/fixtures.js'
import { catchHookError, renderHookInSafeProvider } from '@test/utils.js'

describe('useSignerAddress', () => {
  const useConfigSpy = jest.spyOn(useConfig, 'useConfig')
  const useSafeClientSpy = jest.spyOn(useSafeClient, 'useSafeClient')

  const getSignerAddressMock = jest.fn().mockResolvedValue(accounts[0])
  const safeClientMock = {
    protocolKit: {
      getSafeProvider: jest.fn().mockReturnValue({ getSignerAddress: getSignerAddressMock })
    }
  }

  const configWithoutSigner = { ...configExistingSafe, signer: undefined }

  beforeEach(() => {
    useConfigSpy.mockReturnValue([configExistingSafe, () => {}])
    useSafeClientSpy.mockReturnValue(safeClientMock as unknown as SafeClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe.each([
    ['without config parameter', { config: undefined }],
    ['with config parameter', { config: configPredictedSafe }]
  ])('when being called %s', (_label, params) => {
    it(`should return the configured signer's address`, async () => {
      const { result } = renderHookInSafeProvider(() => useSignerAddress(params), {
        config: configExistingSafe
      })

      expect(useConfigSpy).toHaveBeenCalledTimes(1)
      expect(useConfigSpy).toHaveBeenCalledWith(params)

      expect(useSafeClientSpy).toHaveBeenCalledTimes(1)
      expect(useSafeClientSpy).toHaveBeenCalledWith(params)

      await waitFor(() => expect(result.current).toEqual(accounts[0]))

      expect(safeClientMock.protocolKit.getSafeProvider).toHaveBeenCalledTimes(1)
      expect(getSignerAddressMock).toHaveBeenCalledTimes(1)
    })
  })

  it('should throw if no signer is configured', async () => {
    useConfigSpy.mockReturnValue([configWithoutSigner, () => {}])

    const error = catchHookError(() => useSignerAddress())

    expect(error?.message).toEqual('Signer not configured')
  })
})
