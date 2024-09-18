import * as wagmi from 'wagmi'
import { renderHook } from '@testing-library/react'
import { useBalance, UseBalanceReturnType } from '@/hooks/useBalance.js'
import * as useAddress from '@/hooks/useSafeInfo/useAddress.js'
import { configExistingSafe } from '@test/config.js'
import { balanceData, safeAddress } from '@test/fixtures.js'

describe('useBalance', () => {
  const mockBalanceResult = { data: balanceData }

  const useBalanceWagmiSpy = jest.spyOn(wagmi, 'useBalance')
  const useAddressSpy = jest.spyOn(useAddress, 'useAddress')

  beforeEach(() => {
    useAddressSpy.mockReturnValue({ data: safeAddress } as useAddress.UseAddressReturnType)
    useBalanceWagmiSpy.mockReturnValue(mockBalanceResult as UseBalanceReturnType)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the balance for the Safe provided by `useAddress`', () => {
    const { result } = renderHook(() => useBalance())

    expect(result.current).toEqual(mockBalanceResult)

    expect(useAddressSpy).toHaveBeenCalledTimes(1)
    expect(useAddressSpy).toHaveBeenCalledWith({ config: undefined })

    expect(useBalanceWagmiSpy).toHaveBeenCalledTimes(1)
    expect(useBalanceWagmiSpy).toHaveBeenCalledWith({ address: safeAddress })
  })

  it('should return the balance for the Safe using the passed config', () => {
    useAddressSpy.mockReturnValueOnce({
      data: configExistingSafe.safeAddress
    } as useAddress.UseAddressReturnType)

    const result = renderHook(() => useBalance({ config: configExistingSafe }))

    expect(result.result.current).toEqual(mockBalanceResult)

    expect(useAddressSpy).toHaveBeenCalledTimes(1)
    expect(useAddressSpy).toHaveBeenCalledWith({ config: configExistingSafe })

    expect(useBalanceWagmiSpy).toHaveBeenCalledTimes(1)
    expect(useBalanceWagmiSpy).toHaveBeenCalledWith({ address: configExistingSafe.safeAddress })
  })
})
