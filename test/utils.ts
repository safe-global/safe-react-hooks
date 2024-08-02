import { createElement } from 'react'
import { renderHook } from '@testing-library/react'
import { SafeProvider, SafeProviderProps } from '@/context.js'

/**
 * Wrapper to render a hook in a SafeProvider.
 * @param hook Hook to render.
 * @param providerProps Props to pass to the SafeProvider.
 * @param options Additional options to pass to renderHook.
 * @returns RenderHookResult of the hook rendered in a SafeProvider.
 */
export function renderHookInSafeProvider(
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
