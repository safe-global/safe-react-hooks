import { useContext } from 'react'
import { Hash } from 'viem'
import { waitForTransactionReceipt as waitForTransactionReceiptWagmi } from 'wagmi/actions'
import { ConfigParam, SafeConfig } from '@/types/index.js'
import {
  isEthereumTransaction,
  isSafeModuleTransaction,
  isSafeMultisigTransaction
} from '@/types/guards.js'
import { poll } from '@/utils/poll.js'
import { useAddress } from '@/hooks/useSafeInfo/useAddress.js'
import { usePublicClient } from '@/hooks/usePublicClient.js'
import { SafeContext } from '@/SafeContext.js'

type WaitForTransactionIndexedParams = { ethereumTxHash?: string; safeTxHash?: string }

export type UseWaitForTransactionParams = ConfigParam<SafeConfig> & { pollingInterval?: number }
export type UseWaitForTransactionReturnType = {
  waitForTransactionReceipt: (
    ethereumTxHash: string
  ) => ReturnType<typeof waitForTransactionReceiptWagmi>
  waitForTransactionIndexed: (params: WaitForTransactionIndexedParams) => Promise<void>
}

/**
 * Hook to wait for a transaction to be executed or indexed by the Transaction Service.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @param params.pollingInterval Interval in milliseconds to poll the Transaction Service.
 * @returns Object containing functions to synchronously wait for transactions.
 */
export function useWaitForTransaction(
  params: UseWaitForTransactionParams = {}
): UseWaitForTransactionReturnType {
  const { wagmiConfig } = useContext(SafeContext)

  const { data: address } = useAddress({ config: params.config })
  const publicClient = usePublicClient({ config: params.config })

  const waitForTransactionReceipt = async (ethereumTxHash: string) => {
    if (!wagmiConfig) {
      throw new Error('WagmiConfig is not available')
    }

    if (!ethereumTxHash) {
      throw new Error('Ethereum transaction hash must not be empty')
    }

    return waitForTransactionReceiptWagmi(wagmiConfig, {
      hash: ethereumTxHash as Hash
    })
  }

  const waitForTransactionIndexed = async ({
    ethereumTxHash,
    safeTxHash
  }: WaitForTransactionIndexedParams) => {
    if (!publicClient) {
      throw new Error('Public client is not available')
    }

    if (!ethereumTxHash && !safeTxHash) {
      throw new Error('Either ethereumTxHash or safeTxHash must be provided')
    }

    if (safeTxHash) {
      await poll(
        () => publicClient.apiKit.getTransaction(safeTxHash).catch(() => undefined),
        (transaction) => transaction === undefined || !transaction.isExecuted,
        params.pollingInterval
      )
      return
    }

    if (!address) {
      throw new Error('Safe address is not available')
    }

    await poll(
      () => publicClient.apiKit.getAllTransactions(address),
      (transactions) =>
        !transactions.results.some((tx) => {
          if (isSafeModuleTransaction(tx) || isSafeMultisigTransaction(tx)) {
            return tx.transactionHash === ethereumTxHash
          }
          if (isEthereumTransaction(tx)) {
            return tx.txHash === ethereumTxHash
          }
          return false
        }),
      params.pollingInterval
    )
  }

  return { waitForTransactionReceipt, waitForTransactionIndexed }
}
