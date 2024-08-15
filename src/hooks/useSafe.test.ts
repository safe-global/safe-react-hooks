import { waitFor } from '@testing-library/dom'
import { sepolia } from 'viem/chains'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import * as useBalance from '@/hooks/useBalance.js'
import * as useChain from '@/hooks/useChain.js'
import * as useSafeInfo from '@/hooks/useSafeInfo.js'
import * as useSignerAddress from '@/hooks/useSignerAddress.js'
import { useSafe } from '@/hooks/useSafe.js'
import { configExistingSafe } from '@test/config.js'
import { accounts, balanceData, safeInfo } from '@test/fixtures.js'
import { catchHookError, renderHookInSafeProvider } from '@test/utils.js'
import * as createClient from '@/createClient.js'

describe('useSafe', () => {
  const publicClientMock = { safeClient: 'public' } as unknown as SafeClient
  const signerClientMock = { safeClient: 'signer' } as unknown as SafeClient

  const useChainSpy = jest.spyOn(useChain, 'useChain')
  const useBalanceSpy = jest.spyOn(useBalance, 'useBalance')
  const useSafeInfoSpy = jest.spyOn(useSafeInfo, 'useSafeInfo')
  const useSignerAddressSpy = jest.spyOn(useSignerAddress, 'useSignerAddress')

  const createPublicClientSpy = jest.spyOn(createClient, 'createPublicClient')
  const createSignerClientSpy = jest.spyOn(createClient, 'createSignerClient')

  beforeEach(() => {
    createPublicClientSpy.mockResolvedValue(publicClientMock)
    createSignerClientSpy.mockResolvedValue(signerClientMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return object containing functions to call other hooks and `initialized` flag', async () => {
    const { result } = renderHookInSafeProvider(() => useSafe(), { config: configExistingSafe })

    await waitFor(() => result.current.isInitialized === true)

    expect(result.current).toMatchObject({
      connect: expect.any(Function),
      disconnect: expect.any(Function),
      getBalance: expect.any(Function),
      getChain: expect.any(Function),
      getSafeInfo: expect.any(Function),
      getSignerAddress: expect.any(Function),
      isInitialized: true,
    })
  })

  it('should throw if not used within a `SafeProvider`', async () => {
    const error = catchHookError(() => useSafe())

    expect(error?.message).toEqual('`useSafe` must be used within `SafeProvider`.')
  })

  describe('getBalance', () => {
    it('should internally call "useBalance" hook', async () => {
      useBalanceSpy.mockReturnValue({ data: balanceData } as useBalance.UseBalanceReturnType)

      const { result } = renderHookInSafeProvider(() => useSafe(), {
        config: configExistingSafe
      })

      await waitFor(() => result.current.isInitialized === true)

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

      const { result } = renderHookInSafeProvider(() => useSafe(), {
        config: configExistingSafe
      })

      await waitFor(() => result.current.isInitialized === true)

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

      const { result } = renderHookInSafeProvider(() => useSafe(), {
        config: configExistingSafe
      })

      await waitFor(() => result.current.isInitialized === true)

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

      const { result } = renderHookInSafeProvider(() => useSafe(), {
        config: configExistingSafe
      })

      await waitFor(() => result.current.isInitialized === true)

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
})
