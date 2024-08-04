import * as wagmi from 'wagmi'
import { GetBalanceData } from 'wagmi/query'
import { renderHook } from '@testing-library/react'
import { useBalance } from '@/hooks/useBalance.js'
import * as useSafeInfo from '@/hooks/useSafeInfo.js'
import { safeConfig } from '@test/config.js'
import { safeAddress } from '@test/fixtures.js'

describe('useBalance', () => {
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
      data: { address: safeAddress }
    } as useSafeInfo.UseSafeInfoReturnType)

    useBalanceWagmiSpy.mockReturnValue(
      mockBalanceResult as wagmi.UseBalanceReturnType<GetBalanceData>
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the balance for the Safe provided by `useSafeInfo`', () => {
    const { result } = renderHook(() => useBalance())

    expect(result.current).toEqual(mockBalanceResult)

    expect(useSafeInfoSpy).toHaveBeenCalledTimes(1)
    expect(useSafeInfoSpy).toHaveBeenCalledWith()

    expect(useBalanceWagmiSpy).toHaveBeenCalledTimes(1)
    expect(useBalanceWagmiSpy).toHaveBeenCalledWith({ address: safeAddress })
  })

  it('should return the balance for the Safe using the passed config', () => {
    useSafeInfoSpy.mockReturnValueOnce({
      data: { address: safeConfig.safeAddress }
    } as useSafeInfo.UseSafeInfoReturnType)

    const result = renderHook(() => useBalance({ config: safeConfig }))

    expect(result.result.current).toEqual(mockBalanceResult)

    expect(useSafeInfoSpy).toHaveBeenCalledTimes(1)
    expect(useSafeInfoSpy).toHaveBeenCalledWith({ config: safeConfig })

    expect(useBalanceWagmiSpy).toHaveBeenCalledTimes(1)
    expect(useBalanceWagmiSpy).toHaveBeenCalledWith({ address: safeConfig.safeAddress })
  })
})
