import * as wagmi from 'wagmi'
import { sepolia } from 'viem/chains'
import { useChain } from '@/hooks//useChain.js'
import { renderHook } from '@testing-library/react'
import { configPredictedSafe } from '@test/config.js'
import { catchHookError } from '@test/utils.js'

describe('useChain', () => {
  const createConfigWagmiSpy = jest.spyOn(wagmi, 'createConfig')
  const useChainsWagmiSpy = jest.spyOn(wagmi, 'useChains')

  beforeEach(() => {
    useChainsWagmiSpy.mockReturnValue([sepolia])
    createConfigWagmiSpy.mockReturnValue({ foo: 'bar' } as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the currently selected chain', () => {
    const { result } = renderHook(() => useChain())

    expect(result.current).toMatchObject(sepolia)

    expect(useChainsWagmiSpy).toHaveBeenCalledTimes(1)
    expect(useChainsWagmiSpy).toHaveBeenCalledWith()
  })

  it('should return the currently selected chain by using the passed config', () => {
    const { result } = renderHook(() => useChain({ config: configPredictedSafe }))

    expect(result.current).toMatchObject(sepolia)

    expect(createConfigWagmiSpy).toHaveBeenCalledTimes(1)
    expect(createConfigWagmiSpy).toHaveBeenCalledWith({
      chains: [configPredictedSafe.chain],
      transports: { [configPredictedSafe.chain.id]: configPredictedSafe.transport }
    })

    expect(useChainsWagmiSpy).toHaveBeenCalledTimes(1)
    expect(useChainsWagmiSpy).toHaveBeenCalledWith({ config: { foo: 'bar' } })
  })

  it('should throw if not rendered inside a SafeProvider', () => {
    useChainsWagmiSpy.mockReturnValue([] as any)

    const error = catchHookError(() => useChain())

    expect(error?.message).toEqual('`useChain` must be used within `SafeProvider`.')
  })
})
