import * as wagmiQuery from 'wagmi/query'
import { waitFor } from '@testing-library/react'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useConfirm } from '@/hooks/useConfirm.js'
import * as useSignerClient from '@/hooks/useSignerClient.js'
import { configExistingSafe } from '@test/config.js'
import { ethereumTxHash, safeAddress, safeTxHash, signerPrivateKeys } from '@test/fixtures.js'
import { renderHookInQueryClientProvider } from '@test/utils.js'

describe('useConfirm', () => {
  const confirmResponseMock = {
    safeAddress: safeAddress,
    description: 'Transaction confirmed',
    status: 'EXECUTED',
    transactions: {
      safeTxHash: safeTxHash,
      ethereumTxHash: ethereumTxHash
    },
    messages: undefined,
    safeOperations: undefined,
    safeAccountDeployment: undefined
  }

  const useSignerClientSpy = jest.spyOn(useSignerClient, 'useSignerClient')
  const useMutationSpy = jest.spyOn(wagmiQuery, 'useMutation')

  const confirmMock = jest.fn().mockResolvedValue(confirmResponseMock)
  const safeClientMock = { confirm: confirmMock }

  beforeEach(() => {
    useSignerClientSpy.mockReturnValue(safeClientMock as unknown as SafeClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it.each([
    ['without config parameter', { config: undefined }],
    ['with config parameter', { config: { ...configExistingSafe, signer: signerPrivateKeys[0] } }]
  ])('should initialize signer client correctly when being called %s', async (_label, params) => {
    const { result } = renderHookInQueryClientProvider(() => useConfirm(params))
    await waitFor(() => expect(result.current.isIdle).toEqual(true))

    expect(useSignerClientSpy).toHaveBeenCalledTimes(1)
    expect(useSignerClientSpy).toHaveBeenCalledWith(params)

    expect(confirmMock).toHaveBeenCalledTimes(0)
  })

  it('should return mutation result object with `confirm` and `confirmAsync` functions', async () => {
    const { result } = renderHookInQueryClientProvider(() => useConfirm())
    await waitFor(() => expect(result.current.isIdle).toEqual(true))

    expect(result.current).toEqual({
      context: undefined,
      data: undefined,
      error: null,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      status: 'idle',
      variables: undefined,
      submittedAt: 0,
      isPending: false,
      isSuccess: false,
      isError: false,
      isIdle: true,
      reset: expect.any(Function),
      confirm: expect.any(Function),
      confirmAsync: expect.any(Function)
    })

    expect(useMutationSpy).toHaveBeenCalledTimes(1)
    expect(useMutationSpy).toHaveBeenCalledWith({
      mutationFn: expect.any(Function),
      mutationKey: ['confirmTransaction']
    })

    expect(confirmMock).toHaveBeenCalledTimes(0)
  })

  describe('cofirm', () => {
    it('should call `cofirm` from signer client', async () => {
      const { result } = renderHookInQueryClientProvider(() => useConfirm())

      await waitFor(() => expect(result.current.confirm).toEqual(expect.any(Function)))

      result.current.confirm({ safeTxHash })

      await waitFor(() => expect(result.current.isSuccess).toEqual(true))

      expect(result.current.isIdle).toEqual(false)
      expect(result.current.isPending).toEqual(false)
      expect(result.current.isError).toEqual(false)
      expect(result.current.isSuccess).toEqual(true)
      expect(result.current.data).toEqual(confirmResponseMock)
      expect(result.current.error).toEqual(null)

      expect(confirmMock).toHaveBeenCalledTimes(1)
      expect(confirmMock).toHaveBeenCalledWith({ safeTxHash })
    })

    it('should return error if signer client is not connected', async () => {
      useSignerClientSpy.mockReturnValueOnce(undefined)

      const { result } = renderHookInQueryClientProvider(() => useConfirm())

      await waitFor(() => expect(result.current.confirm).toEqual(expect.any(Function)))

      result.current.confirm({ safeTxHash })

      await waitFor(() => expect(result.current.isError).toEqual(true))

      expect(result.current.isIdle).toEqual(false)
      expect(result.current.isPending).toEqual(false)
      expect(result.current.isError).toEqual(true)
      expect(result.current.isSuccess).toEqual(false)
      expect(result.current.data).toEqual(undefined)
      expect(result.current.error).toEqual(new Error('Signer client is not available'))

      expect(confirmMock).toHaveBeenCalledTimes(0)
    })

    it('should return error if passed `safeTxHash` is an empty string', async () => {
      const { result } = renderHookInQueryClientProvider(() => useConfirm())

      await waitFor(() => expect(result.current.confirm).toEqual(expect.any(Function)))

      result.current.confirm({ safeTxHash: '' })

      await waitFor(() => expect(result.current.isError).toEqual(true))

      expect(result.current.isIdle).toEqual(false)
      expect(result.current.isPending).toEqual(false)
      expect(result.current.isError).toEqual(true)
      expect(result.current.isSuccess).toEqual(false)
      expect(result.current.data).toEqual(undefined)
      expect(result.current.error).toEqual(new Error('`safeTxHash` parameter must not be empty'))

      expect(confirmMock).toHaveBeenCalledTimes(0)
    })
  })

  describe('confirmAsync', () => {
    it('should call `confirm` from signer client and resolve with result', async () => {
      const { result } = renderHookInQueryClientProvider(() => useConfirm())

      await waitFor(() => expect(result.current.confirmAsync).toEqual(expect.any(Function)))

      const sendResult = await result.current.confirmAsync({ safeTxHash })

      expect(sendResult).toEqual(confirmResponseMock)

      expect(confirmMock).toHaveBeenCalledTimes(1)
      expect(confirmMock).toHaveBeenCalledWith({ safeTxHash })
    })

    it('should return error if signer client is not connected', async () => {
      useSignerClientSpy.mockReturnValueOnce(undefined)

      const { result } = renderHookInQueryClientProvider(() => useConfirm())

      await waitFor(() => expect(result.current.confirmAsync).toEqual(expect.any(Function)))

      expect(() => result.current.confirmAsync({ safeTxHash })).rejects.toThrow(
        'Signer client is not available'
      )

      expect(confirmMock).toHaveBeenCalledTimes(0)
    })

    it('should return error if passed `safeTxHash` is an empty string', async () => {
      const { result } = renderHookInQueryClientProvider(() => useConfirm())

      await waitFor(() => expect(result.current.confirmAsync).toEqual(expect.any(Function)))

      expect(() => result.current.confirmAsync({ safeTxHash: '' })).rejects.toThrow(
        '`safeTxHash` parameter must not be empty'
      )

      expect(confirmMock).toHaveBeenCalledTimes(0)
    })
  })
})
