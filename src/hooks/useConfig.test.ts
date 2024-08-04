import { useConfig } from '@/hooks/useConfig.js'
import { safeConfig } from '@test/config.js'
import { catchHookError, renderHookInSafeProvider } from '@test/utils.js'

describe('useConfig', () => {
  it('should return the config from the SafeProvider', () => {
    const { result } = renderHookInSafeProvider(() => useConfig(), { config: safeConfig })

    expect(result.current).toBe(safeConfig)
  })

  it('should return the config passed to the hook', () => {
    const overrideConfig = { ...safeConfig, safeAddress: '0x123', safeOptions: undefined }

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
