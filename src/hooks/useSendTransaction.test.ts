import * as wagmiQuery from 'wagmi/query'
import { waitFor } from '@testing-library/react'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useSendTransaction } from '@/hooks/useSendTransaction.js'
import * as useSignerClient from '@/hooks/useSignerClient.js'
import { configExistingSafe } from '@test/config.js'
import { ethereumTxHash, safeAddress, signerPrivateKeys } from '@test/fixtures.js'
import { renderHookInQueryClientProvider } from '@test/utils.js'

describe('useSendTransaction', () => {
  const transactionMock = { to: '0xABC', value: '0', data: '0x987' }

  const sendResponseMock = {
    safeAddress: safeAddress,
    description: 'Transaction sent',
    status: 'EXECUTED',
    transactions: {
      safeTxHash: undefined,
      ethereumTxHash: ethereumTxHash
    },
    messages: undefined,
    safeOperations: undefined,
    safeAccountDeployment: undefined
  }

  const useSignerClientSpy = jest.spyOn(useSignerClient, 'useSignerClient')
  const useMutationSpy = jest.spyOn(wagmiQuery, 'useMutation')

  const sendMock = jest.fn().mockResolvedValue(sendResponseMock)
  const safeClientMock = { send: sendMock }

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
    const { result } = renderHookInQueryClientProvider(() => useSendTransaction(params))
    await waitFor(() => expect(result.current.isIdle).toEqual(true))

    expect(useSignerClientSpy).toHaveBeenCalledTimes(1)
    expect(useSignerClientSpy).toHaveBeenCalledWith(params)

    expect(sendMock).toHaveBeenCalledTimes(0)
  })

  it('should return mutation result object with `send` and `sendAsync` functions', async () => {
    const { result } = renderHookInQueryClientProvider(() => useSendTransaction())
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
      sendTransaction: expect.any(Function),
      sendTransactionAsync: expect.any(Function)
    })

    expect(useMutationSpy).toHaveBeenCalledTimes(1)
    expect(useMutationSpy).toHaveBeenCalledWith({
      mutationFn: expect.any(Function),
      mutationKey: ['sendTransaction']
    })

    expect(sendMock).toHaveBeenCalledTimes(0)
  })

  describe('send', () => {
    it('should call `send` from signer client', async () => {
      const { result } = renderHookInQueryClientProvider(() => useSendTransaction())

      await waitFor(() => expect(result.current.sendTransaction).toEqual(expect.any(Function)))

      result.current.sendTransaction({ transactions: [transactionMock] })

      await waitFor(() => expect(result.current.isSuccess).toEqual(true))

      expect(result.current.isIdle).toEqual(false)
      expect(result.current.isPending).toEqual(false)
      expect(result.current.isError).toEqual(false)
      expect(result.current.isSuccess).toEqual(true)
      expect(result.current.data).toEqual(sendResponseMock)
      expect(result.current.error).toEqual(null)

      expect(sendMock).toHaveBeenCalledTimes(1)
      expect(sendMock).toHaveBeenCalledWith({ transactions: [transactionMock] })
    })

    it('should return error if signer client is not connected', async () => {
      useSignerClientSpy.mockReturnValueOnce(undefined)

      const { result } = renderHookInQueryClientProvider(() => useSendTransaction())

      await waitFor(() => expect(result.current.sendTransaction).toEqual(expect.any(Function)))

      result.current.sendTransaction({ transactions: [transactionMock] })

      await waitFor(() => expect(result.current.isError).toEqual(true))

      expect(result.current.isIdle).toEqual(false)
      expect(result.current.isPending).toEqual(false)
      expect(result.current.isError).toEqual(true)
      expect(result.current.isSuccess).toEqual(false)
      expect(result.current.data).toEqual(undefined)
      expect(result.current.error).toEqual(new Error('Signer client is not available'))

      expect(sendMock).toHaveBeenCalledTimes(0)
    })

    it('should return error if passed transaction list is empty', async () => {
      const { result } = renderHookInQueryClientProvider(() => useSendTransaction())

      await waitFor(() => expect(result.current.sendTransaction).toEqual(expect.any(Function)))

      result.current.sendTransaction({ transactions: [] })

      await waitFor(() => expect(result.current.isError).toEqual(true))

      expect(result.current.isIdle).toEqual(false)
      expect(result.current.isPending).toEqual(false)
      expect(result.current.isError).toEqual(true)
      expect(result.current.isSuccess).toEqual(false)
      expect(result.current.data).toEqual(undefined)
      expect(result.current.error).toEqual(new Error('No transactions provided'))

      expect(sendMock).toHaveBeenCalledTimes(0)
    })
  })

  describe('sendAsync', () => {
    it('should call `send` from signer client and resolve with result', async () => {
      const { result } = renderHookInQueryClientProvider(() => useSendTransaction())

      await waitFor(() => expect(result.current.sendTransactionAsync).toEqual(expect.any(Function)))

      const sendResult = await result.current.sendTransactionAsync({
        transactions: [transactionMock]
      })

      expect(sendResult).toEqual(sendResponseMock)

      expect(sendMock).toHaveBeenCalledTimes(1)
      expect(sendMock).toHaveBeenCalledWith({ transactions: [transactionMock] })
    })

    it('should return error if signer client is not connected', async () => {
      useSignerClientSpy.mockReturnValueOnce(undefined)

      const { result } = renderHookInQueryClientProvider(() => useSendTransaction())

      await waitFor(() => expect(result.current.sendTransactionAsync).toEqual(expect.any(Function)))

      expect(() =>
        result.current.sendTransactionAsync({ transactions: [transactionMock] })
      ).rejects.toThrow('Signer client is not available')

      expect(sendMock).toHaveBeenCalledTimes(0)
    })

    it('should return error if passed transaction list is empty', async () => {
      const { result } = renderHookInQueryClientProvider(() => useSendTransaction())

      await waitFor(() => expect(result.current.sendTransactionAsync).toEqual(expect.any(Function)))

      expect(() => result.current.sendTransactionAsync({ transactions: [] })).rejects.toThrow(
        'No transactions provided'
      )

      expect(sendMock).toHaveBeenCalledTimes(0)
    })
  })
})
