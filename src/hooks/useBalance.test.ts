import * as wagmi from 'wagmi'
import { renderHook } from '@testing-library/react'
import { useBalance, UseBalanceReturnType } from '@/hooks/useBalance.js'
import * as useSafeInfo from '@/hooks/useSafeInfo.js'
import { configExistingSafe } from '@test/config.js'
import { balanceData, safeAddress } from '@test/fixtures.js'

describe('useBalance', () => {
  const mockBalanceResult = { data: balanceData }

  const useBalanceWagmiSpy = jest.spyOn(wagmi, 'useBalance')
  const useSafeInfoSpy = jest.spyOn(useSafeInfo, 'useSafeInfo')

  beforeEach(() => {
    useSafeInfoSpy.mockReturnValue({
      data: { address: safeAddress }
    } as useSafeInfo.UseSafeInfoReturnType)

    useBalanceWagmiSpy.mockReturnValue(mockBalanceResult as UseBalanceReturnType)
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
      data: { address: configExistingSafe.safeAddress }
    } as useSafeInfo.UseSafeInfoReturnType)

    const result = renderHook(() => useBalance({ config: configExistingSafe }))

    expect(result.result.current).toEqual(mockBalanceResult)

    expect(useSafeInfoSpy).toHaveBeenCalledTimes(1)
    expect(useSafeInfoSpy).toHaveBeenCalledWith({ config: configExistingSafe })

    expect(useBalanceWagmiSpy).toHaveBeenCalledTimes(1)
    expect(useBalanceWagmiSpy).toHaveBeenCalledWith({ address: configExistingSafe.safeAddress })
  })
})
