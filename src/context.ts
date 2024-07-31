import { createContext, createElement } from 'react'

import { SafeConfig } from './types/index.js'

export const SafeContext = createContext<SafeConfig | undefined>(undefined)

export type SafeProviderProps = {
  config: SafeConfig
  initialState?: SafeConfig | undefined
  reconnectOnMount?: boolean | undefined
}

export function SafeProvider(params: React.PropsWithChildren<SafeProviderProps>) {
  const { children, config } = params
  return createElement(SafeContext.Provider, { value: config }, children)
}
