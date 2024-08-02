import { useConfig } from '@/hooks/useConfig.js'
import { safeConfig } from '@test/fixtures.js'
import { catchHookError, renderHookInSafeProvider } from '@test/utils.js'

describe('useConfig', () => {
  it('should return the config from the SafeProvider', () => {
    const { result } = renderHookInSafeProvider(() => useConfig(), { config: safeConfig })

    expect(result.current).toBe(safeConfig)
  })

  it('should return the config passed to the hook', () => {
    const overrideConfig = {
      provider: 'https://rpc.provider2.com',
      signer: '0x321',
      safeAddress: '0x123'
    }

    const { result } = renderHookInSafeProvider(() => useConfig({ config: overrideConfig }), {
      config: safeConfig
    })

    expect(result.current).toBe(overrideConfig)
  })

  it('should throw if not rendered inside a SafeProvider', () => {
    const error = catchHookError(() => useConfig())

    expect(error?.message).toEqual('`useConfig` must be used within `SafeProvider`.')
  })
})
