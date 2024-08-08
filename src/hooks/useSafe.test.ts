import { sepolia } from 'viem/chains'
import * as useBalance from '@/hooks/useBalance.js'
import * as useChain from '@/hooks/useChain.js'
import * as useSafeInfo from '@/hooks/useSafeInfo.js'
import { useSafe } from '@/hooks/useSafe.js'
import { configExistingSafe, configPredictedSafe } from '@test/config.js'
import { balanceData, safeInfo } from '@test/fixtures.js'
import { renderHookInSafeProvider } from '@test/utils.js'

describe('useSafe', () => {
  const useChainSpy = jest.spyOn(useChain, 'useChain')
  const useBalanceSpy = jest.spyOn(useBalance, 'useBalance')
  const useSafeInfoSpy = jest.spyOn(useSafeInfo, 'useSafeInfo')

  beforeEach(() => {})

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return functions to call other hooks', () => {
    const { result } = renderHookInSafeProvider(() => useSafe(), { config: configExistingSafe })

    expect(result.current).toEqual({
      getBalance: expect.any(Function),
      getChain: expect.any(Function),
      getSafeInfo: expect.any(Function)
    })
  })

  describe.each([
    ['without config parameter', undefined],
    ['with config parameter', { config: configPredictedSafe }]
  ])('when being called %s', (label, params) => {
    it(`should internally call "useBalance" hook ${label} as well`, () => {
      useBalanceSpy.mockReturnValue({ data: balanceData } as useBalance.UseBalanceReturnType)

      const { result } = renderHookInSafeProvider(() => useSafe(params), {
        config: configExistingSafe
      })

      const { result: getBalanceResult } = renderHookInSafeProvider(
        () => result.current.getBalance(),
        { config: configExistingSafe }
      )

      expect(getBalanceResult.current).toMatchObject({ data: balanceData })
      expect(useBalanceSpy).toHaveBeenCalledTimes(1)
      expect(useBalanceSpy).toHaveBeenCalledWith(params || {})
    })

    it(`should internally call "useChain" hook ${label} as well`, () => {
      useChainSpy.mockReturnValue(sepolia)

      const { result } = renderHookInSafeProvider(() => useSafe(params), {
        config: configExistingSafe
      })

      const { result: getChainResult } = renderHookInSafeProvider(() => result.current.getChain(), {
        config: configExistingSafe
      })

      expect(getChainResult.current).toMatchObject(sepolia)
      expect(useChainSpy).toHaveBeenCalledTimes(1)
      expect(useChainSpy).toHaveBeenCalledWith(params || {})
    })

    it(`should internally call "useSafeInfo" hook ${label} as well`, () => {
      useSafeInfoSpy.mockReturnValue({ data: safeInfo } as useSafeInfo.UseSafeInfoReturnType)

      const { result } = renderHookInSafeProvider(() => useSafe(params), {
        config: configExistingSafe
      })

      const { result: getSafeInfoResult } = renderHookInSafeProvider(
        () => result.current.getSafeInfo(),
        { config: configExistingSafe }
      )

      expect(getSafeInfoResult.current).toMatchObject({ data: safeInfo })
      expect(useSafeInfoSpy).toHaveBeenCalledTimes(1)
      expect(useSafeInfoSpy).toHaveBeenCalledWith(params || {})
    })
  })
})
