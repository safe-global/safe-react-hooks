import {
  EthereumTransaction,
  SafeConfig,
  SafeConfigWithSigner,
  SafeModuleTransaction,
  SafeMultisigTransaction
} from '@/types/index.js'
import { SafeTransaction } from '@safe-global/safe-core-sdk-types'

export function isString(x: any): x is string {
  return typeof x === 'string'
}

export const isSafeTransaction = (tx: any): tx is SafeTransaction =>
  tx.data !== undefined &&
  tx.data.to !== undefined &&
  tx.data.value !== undefined &&
  tx.data.data !== undefined

export function isSafeConfigWithSigner(config: SafeConfig): config is SafeConfigWithSigner {
  return config.signer != null
}

export function isSafeModuleTransaction(transaction: any): transaction is SafeModuleTransaction {
  return transaction.to != null && transaction.safe != null && transaction.module != null
}

export function isSafeMultisigTransaction(
  transaction: any
): transaction is SafeMultisigTransaction {
  return (
    transaction?.safeTxHash != null &&
    transaction.nonce != null &&
    transaction.safe != null &&
    transaction.to != null &&
    transaction.submissionDate != null
  )
}

export function isEthereumTransaction(transaction: any): transaction is EthereumTransaction {
  return (
    transaction.executionDate != null &&
    transaction.to != null &&
    transaction.txHash != null &&
    transaction.from != null
  )
}
