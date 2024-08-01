import type { SafeKitConfig } from '@safe-global/safe-kit'
import type { Address } from 'viem'

export type SafeConfig = SafeKitConfig

export type ConfigParam<Config extends SafeConfig = SafeConfig> = {
  config?: SafeConfig | Config
}

export type SafeInfo = {
  address: Address
  isDeployed: boolean
  nonce: number
  owners: Address[]
  threshold: number
}
