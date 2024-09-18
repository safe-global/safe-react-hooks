import { waitForTransactionReceipt } from 'wagmi/actions'
import * as wagmiQuery from 'wagmi/query'
import { waitFor } from '@testing-library/react'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useSendTransaction } from '@/hooks/useSendTransaction.js'
import * as useWaitForTransaction from '@/hooks/useWaitForTransaction.js'
import * as useSignerClient from '@/hooks/useSignerClient.js'
import { configExistingSafe } from '@test/config.js'
import { ethereumTxHash, safeAddress, safeTxHash, signerPrivateKeys } from '@test/fixtures.js'
import { renderHookInQueryClientProvider } from '@test/utils.js'
import { MutationKey, QueryKey } from '@/constants.js'
import { queryClient } from '@/queryClient.js'

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

  const useWaitForTransactionSpy = jest.spyOn(useWaitForTransaction, 'useWaitForTransaction')
  const useSignerClientSpy = jest.spyOn(useSignerClient, 'useSignerClient')
  const useMutationSpy = jest.spyOn(wagmiQuery, 'useMutation')
  const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries')

  const sendMock = jest.fn().mockResolvedValue(sendResponseMock)
  const safeClientMock = { send: sendMock }

  const waitForTransactionReceiptMock = jest.fn(
    () =>
      Promise.resolve({ status: 'success' } as unknown) as ReturnType<
        typeof waitForTransactionReceipt
      >
  )
  const waitForTransactionIndexedMock = jest.fn(() => Promise.resolve())

  beforeEach(() => {
    useWaitForTransactionSpy.mockReturnValue({
      waitForTransactionIndexed: waitForTransactionIndexedMock,
      waitForTransactionReceipt: waitForTransactionReceiptMock
    })
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

  it('should return mutation result object with `sendTransaction` and `sendTransactionAsync` functions', async () => {
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
      mutationKey: [MutationKey.SendTransaction]
    })

    expect(sendMock).toHaveBeenCalledTimes(0)
  })

  describe('sendTransaction', () => {
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

    it('should invalidate queries for SafeInfo, PendingTransactions + Transactions if result contains `ethereumTxHash`', async () => {
      const { result } = renderHookInQueryClientProvider(() => useSendTransaction())

      await waitFor(() => expect(result.current.sendTransaction).toEqual(expect.any(Function)))

      result.current.sendTransaction({ transactions: [transactionMock] })

      await waitFor(() => expect(result.current.isSuccess).toEqual(true))

      expect(waitForTransactionReceiptMock).toHaveBeenCalledTimes(1)
      expect(waitForTransactionReceiptMock).toHaveBeenCalledWith(
        sendResponseMock.transactions.ethereumTxHash
      )

      expect(waitForTransactionIndexedMock).toHaveBeenCalledTimes(1)
      expect(waitForTransactionIndexedMock).toHaveBeenCalledWith(sendResponseMock.transactions)

      expect(invalidateQueriesSpy).toHaveBeenCalledTimes(3)
      expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(1, {
        queryKey: [QueryKey.PendingTransactions]
      })
      expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(2, {
        queryKey: [QueryKey.SafeInfo]
      })
      expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(3, {
        queryKey: [QueryKey.Transactions]
      })
    })

    it('should invalidate queries for PendingTransactions if result contains `safeTxHash`', async () => {
      sendMock.mockResolvedValueOnce({ ...sendResponseMock, transactions: { safeTxHash } })

      const { result } = renderHookInQueryClientProvider(() => useSendTransaction())

      await waitFor(() => expect(result.current.sendTransaction).toEqual(expect.any(Function)))

      result.current.sendTransaction({ transactions: [transactionMock] })

      await waitFor(() => expect(result.current.isSuccess).toEqual(true))

      expect(waitForTransactionReceiptMock).not.toHaveBeenCalled()
      expect(waitForTransactionIndexedMock).not.toHaveBeenCalled()

      expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1)
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: [QueryKey.PendingTransactions]
      })
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

  describe('sendTransactionAsync', () => {
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
