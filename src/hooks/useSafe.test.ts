import { waitFor } from '@testing-library/dom'
import { sepolia } from 'viem/chains'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import * as useAuthenticate from '@/hooks/useAuthenticate.js'
import * as useBalance from '@/hooks/useBalance.js'
import * as useChain from '@/hooks/useChain.js'
import * as useSafeInfo from '@/hooks/useSafeInfo/index.js'
import * as useSignerAddress from '@/hooks/useSignerAddress.js'
import * as useTransaction from '@/hooks/useTransaction.js'
import * as usePendingTransactions from '@/hooks/usePendingTransactions.js'
import * as useTransactions from '@/hooks/useTransactions.js'
import { UseSafeTransactionReturnType } from '@/hooks/useSafeTransaction.js'
import { useSafe } from '@/hooks/useSafe.js'
import { configExistingSafe } from '@test/config.js'
import {
  accounts,
  balanceData,
  safeInfo,
  safeMultisigTransaction,
  safeTxHash,
  signerPrivateKeys
} from '@test/fixtures/index.js'
import { catchHookError, renderHookInSafeProvider } from '@test/utils.js'
import * as createClient from '@/createClient.js'

describe('useSafe', () => {
  const publicClientMock = { safeClient: 'public' } as unknown as SafeClient
  const signerClientMock = { safeClient: 'signer' } as unknown as SafeClient

  const useAuthenticateSpy = jest.spyOn(useAuthenticate, 'useAuthenticate')
  const useChainSpy = jest.spyOn(useChain, 'useChain')
  const useBalanceSpy = jest.spyOn(useBalance, 'useBalance')
  const useSafeInfoSpy = jest.spyOn(useSafeInfo, 'useSafeInfo')
  const useSignerAddressSpy = jest.spyOn(useSignerAddress, 'useSignerAddress')
  const useTransactionSpy = jest.spyOn(useTransaction, 'useTransaction')
  const usePendingTransactionsSpy = jest.spyOn(usePendingTransactions, 'usePendingTransactions')
  const useTransactionsSpy = jest.spyOn(useTransactions, 'useTransactions')

  const createPublicClientSpy = jest.spyOn(createClient, 'createPublicClient')
  const createSignerClientSpy = jest.spyOn(createClient, 'createSignerClient')

  const renderUseSafeHook = async () => {
    const renderResult = renderHookInSafeProvider(() => useSafe(), {
      config: configExistingSafe
    })

    await waitFor(() => renderResult.result.current.isInitialized === true)
    return renderResult
  }

  beforeEach(() => {
    createPublicClientSpy.mockResolvedValue(publicClientMock)
    createSignerClientSpy.mockResolvedValue(signerClientMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return object containing functions to call other hooks and `isInitialized`, `isOwnerConnected` + `isSignerConnected` flags', async () => {
    const { result } = await renderUseSafeHook()

    expect(result.current).toMatchObject({
      connect: expect.any(Function),
      disconnect: expect.any(Function),
      getBalance: expect.any(Function),
      getChain: expect.any(Function),
      getSafeInfo: expect.any(Function),
      getSignerAddress: expect.any(Function),
      getPendingTransactions: expect.any(Function),
      getTransaction: expect.any(Function),
      getTransactions: expect.any(Function),
      isInitialized: true,
      isSignerConnected: false,
      isOwnerConnected: false
    })
  })

  it('should throw if not used within a `SafeProvider`', async () => {
    const error = catchHookError(() => useSafe())

    expect(error?.message).toEqual('`useSafe` must be used within `SafeProvider`.')
  })

  describe('authentication', () => {
    const connectMock = jest.fn(() => Promise.resolve())
    const disconnectMock = jest.fn(() => Promise.resolve())

    useAuthenticateSpy.mockReturnValue({
      connect: connectMock,
      disconnect: disconnectMock,
      isSignerConnected: false,
      isOwnerConnected: false
    })

    describe('connect', () => {
      it('should internally call `connect` from "useAuthenticate" hook', async () => {
        const { result } = await renderUseSafeHook()

        renderHookInSafeProvider(() => result.current.connect(signerPrivateKeys[0]), {
          config: configExistingSafe
        })

        await waitFor(() => connectMock.mock.calls.length === 1)

        expect(useAuthenticateSpy).toHaveBeenCalledTimes(2)
        expect(useAuthenticateSpy).toHaveBeenCalledWith()
        expect(connectMock).toHaveBeenCalledTimes(1)
        expect(connectMock).toHaveBeenCalledWith(signerPrivateKeys[0])
      })
    })

    describe('disconnect', () => {
      it('should internally call `disconnect` from "useAuthenticate" hook', async () => {
        const { result } = await renderUseSafeHook()

        renderHookInSafeProvider(() => result.current.disconnect(), {
          config: configExistingSafe
        })

        await waitFor(() => disconnectMock.mock.calls.length === 1)

        expect(useAuthenticateSpy).toHaveBeenCalledTimes(2)
        expect(useAuthenticateSpy).toHaveBeenCalledWith()
        expect(disconnectMock).toHaveBeenCalledTimes(1)
        expect(disconnectMock).toHaveBeenCalledWith()
      })
    })
  })

  describe('getBalance', () => {
    it('should internally call "useBalance" hook', async () => {
      useBalanceSpy.mockReturnValue({ data: balanceData } as useBalance.UseBalanceReturnType)

      const { result } = await renderUseSafeHook()

      const { result: getBalanceResult } = renderHookInSafeProvider(
        () => result.current.getBalance(),
        { config: configExistingSafe }
      )

      await waitFor(() => getBalanceResult.current.data === balanceData)

      expect(getBalanceResult.current).toMatchObject({ data: balanceData })
      expect(useBalanceSpy).toHaveBeenCalledTimes(1)
      expect(useBalanceSpy).toHaveBeenCalledWith()
    })
  })

  describe('getChain', () => {
    it('should internally call "useChain" hook', async () => {
      useChainSpy.mockReturnValue(sepolia)

      const { result } = await renderUseSafeHook()

      const { result: getChainResult } = renderHookInSafeProvider(() => result.current.getChain(), {
        config: configExistingSafe
      })

      await waitFor(() => getChainResult.current === sepolia)

      expect(getChainResult.current).toMatchObject(sepolia)
      expect(useChainSpy).toHaveBeenCalledTimes(1)
      expect(useChainSpy).toHaveBeenCalledWith()
    })
  })

  describe('getSafeInfo', () => {
    it('should internally call "useSafeInfo" hook', async () => {
      useSafeInfoSpy.mockReturnValue({ data: safeInfo } as useSafeInfo.UseSafeInfoReturnType)

      const { result } = await renderUseSafeHook()

      const { result: getSafeInfoResult } = renderHookInSafeProvider(
        () => result.current.getSafeInfo(),
        { config: configExistingSafe }
      )
      await waitFor(() => getSafeInfoResult.current.data === safeInfo)

      expect(getSafeInfoResult.current).toMatchObject({ data: safeInfo })
      expect(useSafeInfoSpy).toHaveBeenCalledTimes(1)
      expect(useSafeInfoSpy).toHaveBeenCalledWith()
    })
  })

  describe('getSignerAddress', () => {
    it(`should internally call "useSignerAddress" hook`, async () => {
      useSignerAddressSpy.mockReturnValue(accounts[0])

      const { result } = await renderUseSafeHook()

      const { result: getSignerAddressResult } = renderHookInSafeProvider(
        () => result.current.getSignerAddress(),
        { config: configExistingSafe }
      )

      await waitFor(() => getSignerAddressResult.current === accounts[0])

      expect(getSignerAddressResult.current).toEqual(accounts[0])
      expect(useSignerAddressSpy).toHaveBeenCalledTimes(1)
      expect(useSignerAddressSpy).toHaveBeenCalledWith()
    })
  })

  describe('getPendingTransactions', () => {
    it(`should internally call "usePendingTransactions" hook`, async () => {
      usePendingTransactionsSpy.mockReturnValue({
        data: [safeMultisigTransaction],
        status: 'success'
      } as usePendingTransactions.UsePendingTransactionsReturnType)

      const { result } = await renderUseSafeHook()

      const { result: getPendingTransactionsResult } = renderHookInSafeProvider(
        () => result.current.getPendingTransactions(),
        { config: configExistingSafe }
      )

      await waitFor(() => getPendingTransactionsResult.current.data?.length)

      expect(getPendingTransactionsResult.current.data).toEqual([safeMultisigTransaction])
      expect(usePendingTransactionsSpy).toHaveBeenCalledTimes(1)
      expect(usePendingTransactionsSpy).toHaveBeenCalledWith()
    })
  })

  describe('getTransactions', () => {
    it(`should internally call "useTransactions" hook`, async () => {
      useTransactionsSpy.mockReturnValue({
        data: [safeMultisigTransaction],
        status: 'success'
      } as useTransactions.UseTransactionsReturnType)

      const { result } = await renderUseSafeHook()

      const { result: getTransactionsResult } = renderHookInSafeProvider(
        () => result.current.getTransactions(),
        { config: configExistingSafe }
      )

      await waitFor(() => getTransactionsResult.current.data?.length)

      expect(getTransactionsResult.current.data).toEqual([safeMultisigTransaction])
      expect(useTransactionsSpy).toHaveBeenCalledTimes(1)
      expect(useTransactionsSpy).toHaveBeenCalledWith()
    })
  })

  describe('getTransaction', () => {
    it(`should internally call "useTransaction" hook`, async () => {
      useTransactionSpy.mockReturnValue({
        data: safeMultisigTransaction,
        status: 'success'
      } as UseSafeTransactionReturnType)

      const { result } = await renderUseSafeHook()

      const { result: getTransactionResult } = renderHookInSafeProvider(
        () => result.current.getTransaction({ safeTxHash }),
        { config: configExistingSafe }
      )

      await waitFor(() => getTransactionResult.current.data != null)

      expect(getTransactionResult.current.data).toEqual(safeMultisigTransaction)
      expect(useTransactionSpy).toHaveBeenCalledTimes(1)
      expect(useTransactionSpy).toHaveBeenCalledWith({ safeTxHash })
    })
  })
})
