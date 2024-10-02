import { act } from 'react'
import { waitFor } from '@testing-library/react'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useAuthenticate, UseConnectSignerReturnType } from '@/hooks/useAuthenticate.js'
import * as useSignerAddress from '@/hooks/useSignerAddress.js'
import { catchHookError, renderHookInMockedSafeProvider } from '@test/utils.js'
import { safeInfo, signerPrivateKeys } from '@test/fixtures/index.js'
import { SafeContextType } from '@/SafeContext.js'
import { configExistingSafe } from '@test/config.js'

describe('useAuthenticate', () => {
  const isOwnerMock = jest.fn()
  const signerClientMock = { isOwner: isOwnerMock } as unknown as SafeClient
  const setSignerMock = jest.fn(() => Promise.resolve())
  const useSignerAddressSpy = jest.spyOn(useSignerAddress, 'useSignerAddress')

  const renderUseAuthenticate = async (
    context: Partial<SafeContextType> = {},
    expected: Partial<UseConnectSignerReturnType> = {}
  ) => {
    const renderOptions = {
      signerClient: signerClientMock,
      setSigner: setSignerMock,
      config: configExistingSafe,
      ...context
    }

    const renderResult = renderHookInMockedSafeProvider(useAuthenticate, renderOptions)

    await waitFor(() =>
      expect(renderResult.result.current).toEqual({
        connect: expect.any(Function),
        disconnect: expect.any(Function),
        isSignerConnected: false,
        isOwnerConnected: false,
        ...expected
      })
    )

    return renderResult
  }

  beforeEach(() => {
    isOwnerMock.mockResolvedValue(true)
    useSignerAddressSpy.mockReturnValue(safeInfo.owners[1])
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('isOwnerConnected', () => {
    it('should be true if connected signer is not owner of the Safe', async () => {
      useSignerAddressSpy.mockReturnValue(safeInfo.owners[0])

      const {
        result: {
          current: { isSignerConnected, isOwnerConnected }
        }
      } = await renderUseAuthenticate(undefined, {
        isSignerConnected: true,
        isOwnerConnected: true
      })

      expect(isSignerConnected).toBeTruthy()
      expect(isOwnerConnected).toBeTruthy()
    })

    it('should be false if connected signer is not owner of the Safe', async () => {
      useSignerAddressSpy.mockReturnValueOnce(safeInfo.owners[0])
      isOwnerMock.mockResolvedValueOnce(false)

      const {
        result: {
          current: { isSignerConnected, isOwnerConnected }
        }
      } = await renderUseAuthenticate(undefined, {
        isSignerConnected: true
      })

      expect(isSignerConnected).toBeTruthy()
      expect(isOwnerConnected).toBeFalsy()
    })
  })

  describe('connect', () => {
    it('should create a new signer client if being called with a valid private key', async () => {
      const { result } = await renderUseAuthenticate(undefined, {
        isSignerConnected: true,
        isOwnerConnected: true
      })

      await act(() => result.current.connect(signerPrivateKeys[1]))

      expect(isOwnerMock).toHaveBeenCalledTimes(1)
      expect(useSignerAddressSpy).toHaveBeenCalledTimes(2)

      expect(setSignerMock).toHaveBeenCalledTimes(1)
      expect(setSignerMock).toHaveBeenCalledWith(signerPrivateKeys[1])
    })

    it('should throw if being called with an empty private key string', async () => {
      useSignerAddressSpy.mockReturnValueOnce(undefined)

      const { result } = await renderUseAuthenticate()

      expect(() => result.current.connect('')).rejects.toThrow(
        'Failed to connect because signer is empty'
      )

      expect(isOwnerMock).toHaveBeenCalledTimes(0)
      expect(useSignerAddressSpy).toHaveBeenCalledTimes(1)

      expect(setSignerMock).toHaveBeenCalledTimes(0)
    })
  })

  describe('disconnect', () => {
    it('should set signer to `undefined` if connected', async () => {
      const { result } = await renderUseAuthenticate(undefined, {
        isSignerConnected: true,
        isOwnerConnected: true
      })

      await act(() => result.current.disconnect())

      expect(isOwnerMock).toHaveBeenCalledTimes(1)
      expect(useSignerAddressSpy).toHaveBeenCalledTimes(2)

      expect(setSignerMock).toHaveBeenCalledTimes(1)
      expect(setSignerMock).toHaveBeenCalledWith(undefined)
    })

    it('should throw if being called when signerClient is not defined', async () => {
      useSignerAddressSpy.mockReturnValueOnce(undefined)

      const { result } = await renderUseAuthenticate({ signerClient: undefined })

      expect(() => result.current.disconnect()).rejects.toThrow(
        'Failed to disconnect because no signer is connected'
      )

      expect(isOwnerMock).toHaveBeenCalledTimes(0)
      expect(useSignerAddressSpy).toHaveBeenCalledTimes(1)

      expect(setSignerMock).toHaveBeenCalledTimes(0)
    })
  })

  it('should throw if not used within a `SafeProvider`', async () => {
    const error = catchHookError(() => useAuthenticate())

    expect(error?.message).toEqual('`useAuthenticate` must be used within `SafeProvider`.')
  })
})
