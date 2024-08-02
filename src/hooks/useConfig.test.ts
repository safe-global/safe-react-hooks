import { createElement } from 'react'
import { renderHook } from '@testing-library/react'
import { useConfig } from '@/hooks/useConfig.js'
import { SafeProvider, SafeProviderProps } from '@/context.js'

const safeProviderConfig = {
  provider: 'https://rpc.provider.com',
  signer: '0x1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  safeAddress: '0x9a1148b5D6a2D34CA46111379d0FD1352a0ade4a'
}

/**
 * Wrapper to render a hook in a SafeProvider.
 * @param hook Hook to render.
 * @param providerProps Props to pass to the SafeProvider.
 * @param options Additional options to pass to renderHook.
 * @returns RenderHookResult of the hook rendered in a SafeProvider.
 */
function renderHookInSafeProvider(
  hook: Parameters<typeof renderHook>[0],
  providerProps: SafeProviderProps,
  options: Parameters<typeof renderHook>[1] = {}
) {
  return renderHook(hook, {
    ...options,
    wrapper: ({ children }) => createElement(SafeProvider, providerProps, children)
  })
}

/**
 * Render a hook and catch any error thrown.
 * @param args Arguments to pass to renderHook.
 * @returns Error thrown by the hook or undefined if no error was thrown.
 */
export function catchHookError(...args: Parameters<typeof renderHook>) {
  const logErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

  try {
    renderHook(...args)
  } catch (error) {
    logErrorSpy.mockRestore()
    return error as Error
  }

  logErrorSpy.mockRestore()
  return
}

describe('useConfig', () => {
  it('should return the config from the SafeProvider', async () => {
    const { result } = renderHookInSafeProvider(() => useConfig(), { config: safeProviderConfig })

    expect(result.current).toBe(safeProviderConfig)
  })

  it('should return the config passed to the hook', async () => {
    const overrideConfig = {
      provider: 'https://rpc.provider2.com',
      signer: '0x321',
      safeAddress: '0x123'
    }

    const { result } = renderHookInSafeProvider(() => useConfig({ config: overrideConfig }), {
      config: safeProviderConfig
    })

    expect(result.current).toBe(overrideConfig)
  })

  it('should throw if not rendered inside a SafeProvider', async () => {
    const error = catchHookError(() => useConfig())

    expect(error?.message).toEqual('`useConfig` must be used within `SafeProvider`.')
  })
})
