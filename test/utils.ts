import React, { createContext, createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, RenderHookOptions } from '@testing-library/react'
import * as safeContext from '@/SafeContext.js'
import * as safeProvider from '@/SafeProvider.js'

/**
 * Wrapper to render a hook in a SafeProvider.
 * @param hook Hook to render.
 * @param providerProps Props to pass to the SafeProvider.
 * @param options Additional options to pass to renderHook.
 * @returns RenderHookResult of the hook rendered in a SafeProvider.
 */
export function renderHookInSafeProvider<Result, Props>(
  hook: (initialProps: Props) => Result,
  providerProps: safeProvider.SafeProviderProps,
  options: RenderHookOptions<Props> = {}
) {
  return renderHook<Result, Props>(hook, {
    ...options,
    wrapper: ({ children }) => createElement(safeProvider.SafeProvider, providerProps, children)
  })
}

/**
 * Wrapper to render a hook in a mocked SafeProvider.
 * @param hook Hook to render.
 * @param context Mocked SafeContext properties.
 * @param options Additional options to pass to renderHook.
 * @returns RenderHookResult of the hook rendered in a mocked SafeProvider.
 */
export function renderHookInMockedSafeProvider<Result, Props>(
  hook: (initialProps: Props) => Result,
  context: Partial<safeContext.SafeContextType> = {},
  options: RenderHookOptions<Props> = {}
) {
  const contextValue = {
    isInitialized: false,
    isSignerConnected: false,
    config: undefined,
    setConfig: () => {},
    setSigner: () => Promise.resolve(),
    publicClient: undefined,
    signerClient: undefined,
    wagmiConfig: undefined,
    ...context
  }

  const SafeContext = createContext<safeContext.SafeContextType>(contextValue)

  const originalUseContext = React.useContext

  jest
    .spyOn(React, 'useContext')
    .mockImplementation((context) =>
      context === safeContext.SafeContext ? contextValue : originalUseContext(context)
    )

  const renderResult = renderHook<Result, Props>(hook, {
    ...options,
    wrapper: ({ children }) =>
      createElement(SafeContext.Provider, { value: contextValue }, children)
  })

  return renderResult
}

/**
 * Wrapper to render a hook in a QueryClientProvider.
 * @param hook Hook to render.
 * @param options Additional options to pass to renderHook.
 * @returns RenderHookResult of the hook rendered in a SafeProvider.
 */
export function renderHookInQueryClientProvider<Result, Props>(
  hook: (initialProps: Props) => Result,
  options: RenderHookOptions<Props> = {}
) {
  const queryClient = new QueryClient()
  return renderHook<Result, Props>(hook, {
    ...options,
    wrapper: ({ children }) => createElement(QueryClientProvider, { client: queryClient }, children)
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
