import { GetBalanceData } from 'wagmi/query'
import { privateKeyToAddress } from 'viem/accounts'
import { Hex } from 'viem'
import { EIP1193Provider, SafeInfo } from '@/index.js'

export const safeAddress = '0x5AFEf9a179dCE37C9ddf3AE4Cad4aa9dd6B814C2'

export const signerPrivateKeys = [
  '0xb0652ca4a8ab9b7021288c0a68f30b6b2f0589f54fea72a2b310b12c5337c451' as Hex,
  '0x78bfa62f4f7d2885cc83c68141308ac5e00f2c10e91b4375117c6101da618bd8' as Hex,
  '0xb9d12ee94ab3bea741947feb261dd77d72f6c83a5dde5b9c6a44a965609d1b7a' as Hex
] as const

export const accounts = signerPrivateKeys.map(privateKeyToAddress)

export const safeInfo: SafeInfo = {
  address: safeAddress,
  nonce: 1,
  threshold: 2,
  isDeployed: true,
  owners: accounts
}

export const rpcProvider = 'https://rpc.provider.com'

export const eip1193Provider: EIP1193Provider = { request: jest.fn(async () => {}) }

export const balanceData: GetBalanceData = {
  decimals: 18,
  formatted: '0.8',
  symbol: 'ETH',
  value: 800000000000000000n
}

export const safeTxHash = '0x01bcd5ed292056cf2f2a6ed4bf9a49794b7f49f43b97b891d2605454297b2991'
export const ethereumTxHash = '0x19020cb4e050fba1fefe80320a286ba329a4ef7485baf9a0c28692b404d9d13e'
