import * as wagmi from 'wagmi'
import { GetBalanceData } from 'wagmi/query'
import { renderHook } from '@testing-library/react'
import { useBalance } from '@/hooks/useBalance.js'
import * as useSafeInfo from '@/hooks/useSafeInfo.js'

describe('useBalance', () => {
  const mockSafeAddress = '0x123'
  const mockBalanceResult = {
    data: {
      decimals: 18,
      formatted: '0.8',
      symbol: 'ETH',
      value: 800000000000000000n
    }
  }

  const useBalanceWagmiSpy = jest.spyOn(wagmi, 'useBalance')
  const useSafeInfoSpy = jest.spyOn(useSafeInfo, 'useSafeInfo')

  beforeEach(() => {
    useSafeInfoSpy.mockReturnValue({
      data: { address: mockSafeAddress }
    } as useSafeInfo.UseSafeInfoReturnType)

    useBalanceWagmiSpy.mockReturnValue(
      mockBalanceResult as wagmi.UseBalanceReturnType<GetBalanceData>
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the balance for the Safe provided by `useSafeInfo`', () => {
    const result = renderHook(() => useBalance())

    expect(result.result.current).toEqual(mockBalanceResult)

    expect(useSafeInfoSpy).toHaveBeenCalledTimes(1)
    expect(useSafeInfoSpy).toHaveBeenCalledWith()

    expect(useBalanceWagmiSpy).toHaveBeenCalledTimes(1)
    expect(useBalanceWagmiSpy).toHaveBeenCalledWith({ address: mockSafeAddress })
  })

  it('should return the balance for the Safe using the passed config', () => {
    const config = {
      provider: 'https://rpc.provider.com',
      signer: '0x1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      safeAddress: '0x9a1148b5D6a2D34CA46111379d0FD1352a0ade4a'
    }

    useSafeInfoSpy.mockReturnValueOnce({
      data: { address: config.safeAddress }
    } as useSafeInfo.UseSafeInfoReturnType)

    const result = renderHook(() => useBalance({ config }))

    expect(result.result.current).toEqual(mockBalanceResult)

    expect(useSafeInfoSpy).toHaveBeenCalledTimes(1)
    expect(useSafeInfoSpy).toHaveBeenCalledWith({ config })

    expect(useBalanceWagmiSpy).toHaveBeenCalledTimes(1)
    expect(useBalanceWagmiSpy).toHaveBeenCalledWith({ address: config.safeAddress })
  })
})
