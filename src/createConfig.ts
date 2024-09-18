import type { SdkStarterKitConfig } from '@safe-global/sdk-starter-kit'
import { Chain as ChainType, custom, http } from 'viem'
import { CreateConfigParams, SafeConfig } from '@/types/index.js'
import { isString } from '@/types/guards.js'

/**
 * Create a SafeConfig object for the given parameters.
 * @param param Config parameter object
 * @returns Config object
 */
export function createConfig<
  Provider extends SdkStarterKitConfig['provider'] = SdkStarterKitConfig['provider'],
  Signer extends SdkStarterKitConfig['signer'] = SdkStarterKitConfig['signer'],
  Chain extends ChainType = ChainType
>({
  provider,
  signer,
  ...rest
}: CreateConfigParams<Provider, Signer, Chain>): SafeConfig<Provider, Signer, Chain> {
  return {
    transport: isString(provider) ? http(provider) : custom(provider),
    provider,
    signer,
    ...rest
  }
}
