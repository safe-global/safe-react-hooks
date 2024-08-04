import type { SafeKitConfig } from '@safe-global/safe-kit'
import type { Address, CustomTransport, HttpTransport } from 'viem'
import type { Chain as ChainType } from 'viem/chains'

export type EIP1193Provider = Exclude<SafeKitConfig['provider'], string>

export type CreateConfigParams<
  Provider extends SafeKitConfig['provider'] = SafeKitConfig['provider'],
  Chain extends ChainType = ChainType
> = {
  chain: Chain
  provider: Provider
} & Omit<SafeKitConfig, 'provider'>

export type SafeConfig<
  Provider extends SafeKitConfig['provider'] = SafeKitConfig['provider'],
  Chain extends ChainType = ChainType
> = {
  chain: Chain
  transport: Provider extends string ? HttpTransport : CustomTransport
} & SafeKitConfig

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
