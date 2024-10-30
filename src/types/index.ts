import {
  SafeMultisigTransactionResponse,
  SafeOperationResponse,
  ListResponse
} from '@safe-global/types-kit'
import type { SdkStarterKitConfig } from '@safe-global/sdk-starter-kit'
import type { PaymasterOptions } from '@safe-global/relay-kit'
import type { Address, CustomTransport, HttpTransport } from 'viem'
import type { Chain as ChainType } from 'viem/chains'
import {
  ConfirmSafeOperationProps,
  SafeClient as SafeClientType,
  SafeClientResult,
  SendSafeOperationProps
} from '@safe-global/sdk-starter-kit'
import { ListOptions } from '@safe-global/api-kit'

type BundlerOptions = {
  bundlerUrl: string
}

export * from './guards.js'

export type EIP1193Provider = Exclude<SdkStarterKitConfig['provider'], string>

type SafeOperationsClient = {
  sendSafeOperation?: (props: SendSafeOperationProps) => Promise<SafeClientResult>
  confirmSafeOperation?: (props: ConfirmSafeOperationProps) => Promise<SafeClientResult>
  getPendingSafeOperations?: (options?: ListOptions) => Promise<ListResponse<SafeOperationResponse>>
}

export type SafeClient = SafeClientType & SafeOperationsClient

export type SafeOperationOptions = BundlerOptions & PaymasterOptions

export type CreateConfigParams<
  Provider extends SdkStarterKitConfig['provider'] = SdkStarterKitConfig['provider'],
  Signer extends SdkStarterKitConfig['signer'] = SdkStarterKitConfig['signer'],
  Chain extends ChainType = ChainType
> = {
  chain: Chain
  provider: Provider
  signer: Signer
  safeOperationOptions?: SafeOperationOptions
} & SdkStarterKitConfig

export type SafeConfig<
  Provider extends SdkStarterKitConfig['provider'] = SdkStarterKitConfig['provider'],
  Signer extends SdkStarterKitConfig['signer'] = SdkStarterKitConfig['signer'],
  Chain extends ChainType = ChainType
> = SdkStarterKitConfig & {
  chain: Chain
  provider: Provider
  signer: Signer
  safeOperationOptions?: SafeOperationOptions
} & (Provider extends string ? { transport: HttpTransport } : { transport: CustomTransport })

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

export type SafeModuleTransaction = {
  readonly created?: string
  readonly executionDate: string
  readonly blockNumber?: number
  readonly isSuccessful?: boolean
  readonly transactionHash?: string
  readonly safe: string
  readonly module: string
  readonly to: string
  readonly value: string
  readonly data: string
  readonly operation: number
  readonly dataDecoded?: string
}

export type SafeMultisigTransaction = SafeMultisigTransactionResponse

export type EthereumTransaction = {
  readonly executionDate: string
  readonly to: string
  readonly data: string
  readonly txHash: string
  readonly blockNumber?: number
  readonly from: string
}

export type Transaction = SafeModuleTransaction | SafeMultisigTransaction | EthereumTransaction
