import { act } from 'react'
import { Config } from 'wagmi'
import * as wagmiActions from 'wagmi/actions'
import { waitFor } from '@testing-library/react'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import {
  useWaitForTransaction,
  UseWaitForTransactionParams
} from '@/hooks/useWaitForTransaction.js'
import * as usePublicClient from '@/hooks/usePublicClient.js'
import * as useAddress from '@/hooks/useSafeInfo/useAddress.js'
import { renderHookInMockedSafeProvider } from '@test/utils.js'
import { ethereumTxHash, safeAddress, safeTxHash } from '@test/fixtures.js'
import { SafeContextType } from '@/SafeContext.js'
import { configExistingSafe } from '@test/config.js'

describe('useWaitForTransaction', () => {
  const getTransactionMock = jest.fn()
  const getAllTransactionsMock = jest.fn()

  const publicClientMock = {
    apiKit: { getTransaction: getTransactionMock, getAllTransactions: getAllTransactionsMock }
  } as unknown as SafeClient

  const usePublicClientSpy = jest.spyOn(usePublicClient, 'usePublicClient')
  const useAddressSpy = jest.spyOn(useAddress, 'useAddress')
  const waitForTransactionReceiptSpy = jest.spyOn(wagmiActions, 'waitForTransactionReceipt')

  const wagmiConfigMock = { foo: 'bar' } as unknown as Config
  const waitForTransactionReceiptReturnMock = {
    status: 'success'
  } as wagmiActions.WaitForTransactionReceiptReturnType

  const renderUseWaitForTransaction = async (
    context: Partial<SafeContextType> = {},
    params?: UseWaitForTransactionParams
  ) => {
    const renderOptions = {
      wagmiConfig: wagmiConfigMock,
      ...context
    }

    const renderResult = renderHookInMockedSafeProvider(
      () => useWaitForTransaction(params),
      renderOptions
    )

    await waitFor(() =>
      expect(renderResult.result.current).toEqual({
        waitForTransactionReceipt: expect.any(Function),
        waitForTransactionIndexed: expect.any(Function)
      })
    )

    return renderResult
  }

  beforeEach(() => {
    usePublicClientSpy.mockReturnValue(publicClientMock as unknown as SafeClient)

    useAddressSpy.mockReturnValue({
      data: safeAddress
    } as unknown as useAddress.UseAddressReturnType)

    waitForTransactionReceiptSpy.mockResolvedValue(waitForTransactionReceiptReturnMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call `useAddress` and `usePublicClient` with passed config', async () => {
    await renderUseWaitForTransaction({}, { config: configExistingSafe })

    expect(usePublicClientSpy).toHaveBeenCalledTimes(1)
    expect(usePublicClientSpy).toHaveBeenCalledWith({ config: configExistingSafe })

    expect(useAddressSpy).toHaveBeenCalledTimes(1)
    expect(useAddressSpy).toHaveBeenCalledWith({ config: configExistingSafe })
  })

  describe('waitForTransactionReceipt', () => {
    it('should call wagmi`s waitForTransactionReceipt with passed transaction hash', async () => {
      const { result } = await renderUseWaitForTransaction()

      await act(() => result.current.waitForTransactionReceipt(ethereumTxHash))

      expect(waitForTransactionReceiptSpy).toHaveBeenCalledTimes(1)
      expect(waitForTransactionReceiptSpy).toHaveBeenCalledWith(wagmiConfigMock, {
        hash: ethereumTxHash
      })
    })

    it('should throw if wagmi config is not available', async () => {
      const { result } = await renderUseWaitForTransaction({ wagmiConfig: undefined })

      expect(() => result.current.waitForTransactionReceipt(ethereumTxHash)).rejects.toThrow(
        'WagmiConfig is not available'
      )

      expect(waitForTransactionReceiptSpy).not.toHaveBeenCalled()
    })

    it('should throw if the passed transaction hash is empty', async () => {
      const { result } = await renderUseWaitForTransaction()

      expect(() => result.current.waitForTransactionReceipt('')).rejects.toThrow(
        'Ethereum transaction hash must not be empty'
      )

      expect(waitForTransactionReceiptSpy).not.toHaveBeenCalled()
    })
  })

  describe('waitForTransactionIndexed', () => {
    it('should poll `getTransaction` if `safeTxHash` is passed until the transaction is found and executed', async () => {
      getTransactionMock.mockResolvedValueOnce(undefined)
      getTransactionMock.mockResolvedValueOnce({ isExecuted: false })
      getTransactionMock.mockResolvedValueOnce({ isExecuted: true })

      const { result } = await renderUseWaitForTransaction({}, { pollingInterval: 0 })

      await act(() => result.current.waitForTransactionIndexed({ safeTxHash }))

      expect(getTransactionMock).toHaveBeenCalledTimes(3)
      expect(getTransactionMock).toHaveBeenCalledWith(safeTxHash)

      expect(getAllTransactionsMock).not.toHaveBeenCalled()
    })

    it('should poll `getAllTransactions` until the transaction is found if `ethereumTxHash` is passed but not `safeTxHash`', async () => {
      getAllTransactionsMock.mockResolvedValueOnce({
        results: [{ txHash: '0x123', txType: 'ETHEREUM_TRANSACTION' }]
      })
      getAllTransactionsMock.mockResolvedValueOnce({
        results: [
          { transactionHash: ethereumTxHash, txType: 'MODULE_TRANSACTION' },
          { txHash: '0x123', txType: 'ETHEREUM_TRANSACTION' }
        ]
      })

      const { result } = await renderUseWaitForTransaction({}, { pollingInterval: 0 })

      await act(() => result.current.waitForTransactionIndexed({ ethereumTxHash }))

      expect(getAllTransactionsMock).toHaveBeenCalledTimes(2)
      expect(getAllTransactionsMock).toHaveBeenCalledWith(safeAddress)

      expect(getTransactionMock).not.toHaveBeenCalled()
    })

    it('should throw if publicClient is not available', async () => {
      usePublicClientSpy.mockReturnValueOnce(undefined)

      const { result } = await renderUseWaitForTransaction()

      expect(() => result.current.waitForTransactionIndexed({ ethereumTxHash })).rejects.toThrow(
        'Public client is not available'
      )

      expect(getTransactionMock).not.toHaveBeenCalled()
      expect(getAllTransactionsMock).not.toHaveBeenCalled()
    })

    it('should throw if Safe address is not available', async () => {
      useAddressSpy.mockReturnValueOnce({
        data: undefined
      } as unknown as useAddress.UseAddressReturnType)

      const { result } = await renderUseWaitForTransaction()

      expect(() => result.current.waitForTransactionIndexed({ ethereumTxHash })).rejects.toThrow(
        'Safe address is not available'
      )

      expect(getTransactionMock).not.toHaveBeenCalled()
      expect(getAllTransactionsMock).not.toHaveBeenCalled()
    })

    it('should throw if neither `ethereumTxHash` nor `safeTxHash` are provided', async () => {
      const { result } = await renderUseWaitForTransaction()

      expect(() => result.current.waitForTransactionIndexed({})).rejects.toThrow(
        'Either ethereumTxHash or safeTxHash must be provided'
      )

      expect(getTransactionMock).not.toHaveBeenCalled()
      expect(getAllTransactionsMock).not.toHaveBeenCalled()
    })
  })
})
