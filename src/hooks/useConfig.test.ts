import { useConfig } from '@/hooks/useConfig.js'
import { configExistingSafe, configPredictedSafe } from '@test/config.js'
import { catchHookError, renderHookInSafeProvider } from '@test/utils.js'

describe('useConfig', () => {
  it('should return the config from the SafeProvider', () => {
    const { result } = renderHookInSafeProvider(() => useConfig(), { config: configExistingSafe })

    expect(result.current).toBe(configExistingSafe)
  })

  it('should return the config passed to the hook instead of the one from the SafeProvider', () => {
    const { result } = renderHookInSafeProvider(() => useConfig({ config: configPredictedSafe }), {
      config: configExistingSafe
    })

    expect(result.current).toBe(configPredictedSafe)
  })

  it('should throw if not rendered inside a SafeProvider', () => {
    const error = catchHookError(() => useConfig())

    expect(error?.message).toEqual('`useConfig` must be used within `SafeProvider`.')
  })
})
