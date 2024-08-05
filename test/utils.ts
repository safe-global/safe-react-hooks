import { createElement } from 'react'
import { renderHook, RenderHookOptions } from '@testing-library/react'
import { SafeProvider, SafeProviderProps } from '@/SafeProvider.js'

/**
 * Wrapper to render a hook in a SafeProvider.
 * @param hook Hook to render.
 * @param providerProps Props to pass to the SafeProvider.
 * @param options Additional options to pass to renderHook.
 * @returns RenderHookResult of the hook rendered in a SafeProvider.
 */
export function renderHookInSafeProvider<Result, Props>(
  hook: (initialProps: Props) => Result,
  providerProps: SafeProviderProps,
  options: RenderHookOptions<Props> = {}
) {
  return renderHook<Result, Props>(hook, {
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
