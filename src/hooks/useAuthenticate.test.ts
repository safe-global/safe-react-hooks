import { act } from 'react'
import { waitFor } from '@testing-library/react'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useAuthenticate, UseConnectSignerReturnType } from '@/hooks/useAuthenticate.js'
import * as useOwners from '@/hooks/useSafeInfo/useOwners.js'
import * as useSignerAddress from '@/hooks/useSignerAddress.js'
import { renderHookInMockedSafeProvider } from '@test/utils.js'
import { safeInfo, signerPrivateKeys } from '@test/fixtures/index.js'
import { createCustomQueryResult } from '@test/fixtures/queryResult.js'
import { SafeContextType } from '@/SafeContext.js'

describe('useAuthenticate', () => {
  const signerClientMock = { safeClient: 'signer' } as unknown as SafeClient
  const setSignerMock = jest.fn(() => Promise.resolve())
  const useOwnersSpy = jest.spyOn(useOwners, 'useOwners')
  const useSignerAddressSpy = jest.spyOn(useSignerAddress, 'useSignerAddress')

  const renderUseAuthenticate = async (
    context: Partial<SafeContextType> = {},
    expected: Partial<UseConnectSignerReturnType> = {}
  ) => {
    const renderOptions = {
      signerClient: signerClientMock,
      setSigner: setSignerMock,
      ...context
    }

    const renderResult = renderHookInMockedSafeProvider(() => useAuthenticate(), renderOptions)

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

  const ownersQueryResultMock = createCustomQueryResult({
    status: 'success',
    data: safeInfo.owners
  })

  beforeEach(() => {
    useOwnersSpy.mockReturnValue(ownersQueryResultMock)
    useSignerAddressSpy.mockReturnValue(safeInfo.owners[1])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('if connected signer is not owner of the Safe `isOwnerConnected` should be false', async () => {
    useSignerAddressSpy.mockReturnValueOnce(safeInfo.owners[0])
    useOwnersSpy.mockReturnValueOnce(
      createCustomQueryResult({ status: 'success', data: safeInfo.owners.slice(1) })
    )

    const {
      result: {
        current: { isSignerConnected, isOwnerConnected }
      }
    } = await renderUseAuthenticate(undefined, {
      isSignerConnected: true,
      isOwnerConnected: false
    })

    expect(isSignerConnected).toBe(true)
    expect(isOwnerConnected).toBe(false)
  })

  describe('connect', () => {
    it('should create a new signer client if being called with a valid private key', async () => {
      const { result } = await renderUseAuthenticate(undefined, {
        isSignerConnected: true,
        isOwnerConnected: true
      })

      await act(() => result.current.connect(signerPrivateKeys[1]))

      expect(useOwnersSpy).toHaveBeenCalledTimes(1)
      expect(useSignerAddressSpy).toHaveBeenCalledTimes(1)

      expect(setSignerMock).toHaveBeenCalledTimes(1)
      expect(setSignerMock).toHaveBeenCalledWith(signerPrivateKeys[1])
    })

    it('should throw if being called with an empty private key string', async () => {
      useSignerAddressSpy.mockReturnValueOnce(undefined)

      const { result } = await renderUseAuthenticate()

      expect(() => result.current.connect('')).rejects.toThrow(
        'Failed to connect because signer is empty'
      )

      expect(useOwnersSpy).toHaveBeenCalledTimes(1)
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

      expect(useOwnersSpy).toHaveBeenCalledTimes(1)
      expect(useSignerAddressSpy).toHaveBeenCalledTimes(1)

      expect(setSignerMock).toHaveBeenCalledTimes(1)
      expect(setSignerMock).toHaveBeenCalledWith(undefined)
    })

    it('should throw if being called when signerClient is not defined', async () => {
      useSignerAddressSpy.mockReturnValueOnce(undefined)

      const { result } = await renderUseAuthenticate({ signerClient: undefined })

      expect(() => result.current.disconnect()).rejects.toThrow(
        'Failed to disconnect because no signer is connected'
      )

      expect(useOwnersSpy).toHaveBeenCalledTimes(1)
      expect(useSignerAddressSpy).toHaveBeenCalledTimes(1)

      expect(setSignerMock).toHaveBeenCalledTimes(0)
    })
  })
})
