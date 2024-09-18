import {
  EthereumTransaction,
  SafeConfig,
  SafeConfigWithSigner,
  SafeModuleTransaction,
  SafeMultisigTransaction,
  Transaction
} from '@/types/index.js'

export function isString(x: any): x is string {
  return typeof x === 'string'
}

export function isSafeConfigWithSigner(config: SafeConfig): config is SafeConfigWithSigner {
  return config.signer != null
}

export function isSafeModuleTransaction(
  transaction: Transaction
): transaction is SafeModuleTransaction {
  return transaction.txType === 'MODULE_TRANSACTION'
}

export function isSafeMultisigTransaction(
  transaction: Transaction
): transaction is SafeMultisigTransaction {
  return transaction.txType === 'MULTISIG_TRANSACTION'
}

export function isEthereumTransaction(
  transaction: Transaction
): transaction is EthereumTransaction {
  return transaction.txType === 'ETHEREUM_TRANSACTION'
}
