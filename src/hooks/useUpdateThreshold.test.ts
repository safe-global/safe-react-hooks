import { useMutation } from '@tanstack/react-query'
import { waitFor } from '@testing-library/dom'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useUpdateThreshold } from '@/hooks/useUpdateThreshold.js'
import * as useSendTransaction from '@/hooks/useSendTransaction.js'
import * as useSignerClientMutation from '@/hooks/useSignerClientMutation.js'
import { ethereumTxHash, safeMultisigTransaction, signerPrivateKeys } from '@test/fixtures/index.js'
import { MutationKey } from '@/constants.js'
import { configPredictedSafe } from '@test/config.js'
import { renderHookInQueryClientProvider } from '@test/utils.js'

describe('useUpdateThreshold', () => {
  const threshold = 2

  const useSendTransactionSpy = jest.spyOn(useSendTransaction, 'useSendTransaction')
  const useSignerClientMutationSpy = jest.spyOn(useSignerClientMutation, 'useSignerClientMutation')

  const updateThresholdResultMock = safeMultisigTransaction
  const createChangeThresholdTxMock = jest.fn().mockResolvedValue(updateThresholdResultMock)

  const sendTransactionResultMock = ethereumTxHash
  const sendTransactionAsyncMock = jest.fn().mockResolvedValue(sendTransactionResultMock)

  const signerClientMock = {
    protocolKit: { createChangeThresholdTx: createChangeThresholdTxMock }
  } as unknown as SafeClient

  const mutationIdleResult = {
    updateThreshold: expect.any(Function),
    updateThresholdAsync: expect.any(Function),
    isIdle: true,
    isPaused: false,
    isPending: false,
    isSuccess: false,
    reset: expect.any(Function),
    status: 'idle',
    submittedAt: 0,
    variables: undefined,
    context: undefined,
    data: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    isError: false
  }

  beforeEach(() => {
    useSignerClientMutationSpy.mockImplementation(
      <SafeClientResult, UpdateThresholdVariables>({
        mutationSafeClientFn,
        mutationKey
      }: useSignerClientMutation.UseSignerClientMutationParams<
        SafeClientResult,
        UpdateThresholdVariables
      >) =>
        useMutation({
          mutationKey,
          mutationFn: (params: UpdateThresholdVariables) =>
            mutationSafeClientFn(signerClientMock, params)
        })
    )

    useSendTransactionSpy.mockReturnValue({
      sendTransactionAsync: sendTransactionAsyncMock
    } as unknown as useSendTransaction.UseSendTransactionReturnType)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return result of `useSignerClientMutation` call with `updateThreshold` + `updateThresholdAsync` functions', () => {
    const { result } = renderHookInQueryClientProvider(() => useUpdateThreshold())

    expect(useSendTransactionSpy).toHaveBeenCalledTimes(1)
    expect(useSendTransactionSpy).toHaveBeenCalledWith({ config: undefined })

    expect(useSignerClientMutationSpy).toHaveBeenCalledTimes(1)
    expect(useSignerClientMutationSpy).toHaveBeenCalledWith({
      mutationSafeClientFn: expect.any(Function),
      mutationKey: [MutationKey.UpdateThreshold]
    })

    expect(result.current).toEqual(mutationIdleResult)

    expect(useSignerClientMutationSpy).toHaveBeenCalledTimes(1)
    expect(useSignerClientMutationSpy).toHaveBeenCalledWith({
      mutationKey: [MutationKey.UpdateThreshold],
      mutationSafeClientFn: expect.any(Function)
    })

    expect(createChangeThresholdTxMock).toHaveBeenCalledTimes(0)
    expect(sendTransactionAsyncMock).toHaveBeenCalledTimes(0)
  })

  it('should accept a config to override the one from the SafeProvider', async () => {
    const config = { ...configPredictedSafe, signer: signerPrivateKeys[0] }

    const { result } = renderHookInQueryClientProvider(() => useUpdateThreshold({ config }))

    expect(useSendTransactionSpy).toHaveBeenCalledTimes(1)
    expect(useSendTransactionSpy).toHaveBeenCalledWith({ config })

    expect(useSignerClientMutationSpy).toHaveBeenCalledTimes(1)
    expect(useSignerClientMutationSpy).toHaveBeenCalledWith({
      config,
      mutationSafeClientFn: expect.any(Function),
      mutationKey: [MutationKey.UpdateThreshold]
    })

    expect(result.current).toEqual(mutationIdleResult)

    expect(createChangeThresholdTxMock).toHaveBeenCalledTimes(0)
    expect(sendTransactionAsyncMock).toHaveBeenCalledTimes(0)
  })

  it.each<'updateThreshold' | 'updateThresholdAsync'>(['updateThreshold', 'updateThresholdAsync'])(
    'calling `%s` should create and send a transaction to change the threshold',
    async (fnName) => {
      const { result } = renderHookInQueryClientProvider(() => useUpdateThreshold())

      expect(createChangeThresholdTxMock).toHaveBeenCalledTimes(0)
      expect(sendTransactionAsyncMock).toHaveBeenCalledTimes(0)

      const updateThresholdResult = await result.current[fnName]({ threshold })

      if (fnName === 'updateThresholdAsync') {
        expect(updateThresholdResult).toEqual(sendTransactionResultMock)
      }

      await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

      expect(result.current.data).toEqual(sendTransactionResultMock)

      expect(createChangeThresholdTxMock).toHaveBeenCalledTimes(1)
      expect(createChangeThresholdTxMock).toHaveBeenCalledWith(threshold)

      expect(sendTransactionAsyncMock).toHaveBeenCalledTimes(1)
      expect(sendTransactionAsyncMock).toHaveBeenCalledWith({
        transactions: [safeMultisigTransaction]
      })
    }
  )

  describe('should return error data', () => {
    const getMutationErrorResult = (error: Error) => ({
      context: undefined,
      isIdle: false,
      isPaused: false,
      isPending: false,
      isSuccess: false,
      status: 'error',
      data: undefined,
      error,
      failureCount: 1,
      failureReason: error,
      isError: true,
      reset: expect.any(Function),
      submittedAt: expect.any(Number),
      variables: { threshold },
      updateThreshold: expect.any(Function),
      updateThresholdAsync: expect.any(Function)
    })

    it.each<'updateThreshold' | 'updateThresholdAsync'>([
      'updateThreshold',
      'updateThresholdAsync'
    ])('if creating a transaction for updating the thresholds fails for `%s`', async (fnName) => {
      const error = new Error('Error creating transaction')

      createChangeThresholdTxMock.mockRejectedValueOnce(error)

      const { result } = renderHookInQueryClientProvider(() => useUpdateThreshold())

      if (fnName === 'updateThresholdAsync') {
        await expect(result.current.updateThresholdAsync({ threshold })).rejects.toEqual(error)
      } else {
        result.current.updateThreshold({ threshold })
      }

      await waitFor(() => expect(result.current.isError).toBeTruthy())

      expect(result.current).toEqual(getMutationErrorResult(error))

      expect(createChangeThresholdTxMock).toHaveBeenCalledTimes(1)
      expect(createChangeThresholdTxMock).toHaveBeenCalledWith(threshold)

      expect(sendTransactionAsyncMock).toHaveBeenCalledTimes(0)
    })

    it('if sending the threshold update transaction fails', async () => {
      const error = new Error('Error sending transaction')

      sendTransactionAsyncMock.mockRejectedValueOnce(error)

      const { result } = renderHookInQueryClientProvider(() => useUpdateThreshold())

      result.current.updateThreshold({ threshold })

      await waitFor(() => expect(result.current.isError).toBeTruthy())

      expect(result.current).toEqual(getMutationErrorResult(error))

      expect(createChangeThresholdTxMock).toHaveBeenCalledTimes(1)
      expect(createChangeThresholdTxMock).toHaveBeenCalledWith(threshold)

      expect(sendTransactionAsyncMock).toHaveBeenCalledTimes(1)
      expect(sendTransactionAsyncMock).toHaveBeenCalledWith({
        transactions: [safeMultisigTransaction]
      })
    })
  })
})
