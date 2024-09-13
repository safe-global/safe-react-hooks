import { SafeConfig, SafeConfigWithSigner } from '@/types/index.js'

export function isSafeConfigWithSigner(config: SafeConfig): config is SafeConfigWithSigner {
  return config.signer != null
}
