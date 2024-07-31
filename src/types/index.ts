import type { SafeKitConfig } from '@safe-global/safe-kit'

export type SafeConfig = SafeKitConfig

export type ConfigParam<Config extends SafeConfig = SafeConfig> = {
  config?: SafeConfig | Config
}
