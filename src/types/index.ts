import type { SafeKitConfig } from '@safe-global/safe-kit'
import type { Address, CustomTransport, HttpTransport } from 'viem'
import type { Chain as ChainType } from 'viem/chains'

export type EIP1193Provider = Exclude<SafeKitConfig['provider'], string>

export type CreateConfigParams<
  Provider extends SafeKitConfig['provider'] = SafeKitConfig['provider'],
  Signer extends SafeKitConfig['signer'] = SafeKitConfig['signer'],
  Chain extends ChainType = ChainType
> = { chain: Chain; provider: Provider; signer: Signer } & SafeKitConfig

export type SafeConfig<
  Provider extends SafeKitConfig['provider'] = SafeKitConfig['provider'],
  Signer extends SafeKitConfig['signer'] = SafeKitConfig['signer'],
  Chain extends ChainType = ChainType
> = SafeKitConfig & { chain: Chain; provider: Provider; signer: Signer } & (Provider extends string
    ? { transport: HttpTransport }
    : { transport: CustomTransport })

export type SafeConfigWithSigner = SafeConfig & { signer: string }

export type ConfigParam<Config extends SafeConfig = SafeConfig> = {
  config?: Config
}

export type SafeInfo = {
  address: Address
  isDeployed: boolean
  nonce: number
  owners: Address[]
  threshold: number
}
