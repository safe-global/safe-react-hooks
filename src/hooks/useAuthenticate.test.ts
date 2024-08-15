import { act } from 'react'
import { waitFor } from '@testing-library/react'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useAuthenticate } from '@/hooks/useAuthenticate.js'
import { renderHookInMockedSafeProvider } from '@test/utils.js'
import { signerPrivateKeys } from '@test/fixtures.js'
import { SafeContextType } from '@/SafeProvider.js'

describe('useAuthenticate', () => {
  const signerClientMock = { safeClient: 'signer' } as unknown as SafeClient
  const setSignerMock = jest.fn(() => Promise.resolve())

  const renderUseAuthenticate = async (context: Partial<SafeContextType> = {}) => {
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
        isConnected: !!renderOptions.signerClient
      })
    )

    return renderResult
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('connect', () => {
    it('should create a new signer client if being called with a valid private key', async () => {
      const { result } = await renderUseAuthenticate()

      await act(() => result.current.connect(signerPrivateKeys[1]))

      expect(setSignerMock).toHaveBeenCalledTimes(1)
      expect(setSignerMock).toHaveBeenCalledWith(signerPrivateKeys[1])
    })

    it('should throw if being called with an empty private key string', async () => {
      const { result } = await renderUseAuthenticate()

      expect(() => result.current.connect('')).rejects.toThrow(
        'Failed to connect because signer is empty'
      )

      expect(setSignerMock).toHaveBeenCalledTimes(0)
    })
  })

  describe('disconnect', () => {
    it('should set signer to `undefined` if connected', async () => {
      const { result } = await renderUseAuthenticate()

      await act(() => result.current.disconnect())

      expect(setSignerMock).toHaveBeenCalledTimes(1)
      expect(setSignerMock).toHaveBeenCalledWith(undefined)
    })

    it('should throw if being called when signerClient is not defined', async () => {
      const { result } = await renderUseAuthenticate({ signerClient: undefined })

      expect(() => result.current.disconnect()).rejects.toThrow(
        'Failed to disconnect because no signer is connected'
      )

      expect(setSignerMock).toHaveBeenCalledTimes(0)
    })
  })
})
