
export function isString(x: any): x is string {
  return typeof x === 'string'
}

export function isSafeConfigWithSigner(config: SafeConfig): config is SafeConfigWithSigner {
  return config.signer != null
}
