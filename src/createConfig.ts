import type { SafeKitConfig } from '@safe-global/safe-kit'
import { Chain as ChainType, custom, http } from 'viem'
import { CreateConfigParams, SafeConfig } from '@/types/index.js'
import { isString } from '@/utils.js'

/**
 * Create a SafeConfig object for the given parameters.
 * @param param Config parameter object
 * @returns Config object
 */
export function createConfig<
  Provider extends SafeKitConfig['provider'] = SafeKitConfig['provider'],
  Chain extends ChainType = ChainType
>({ provider, signer, ...rest }: CreateConfigParams<Provider, Chain>): SafeConfig<Provider, Chain> {
  return {
    transport: isString(provider) ? http(provider) : custom(provider),
    provider,
    signer,
    ...rest
  }
}
