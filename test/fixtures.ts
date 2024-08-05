import { GetBalanceData } from 'wagmi/query'
import { EIP1193Provider, SafeInfo } from '@/index.js'

export const safeAddress = '0x5AFEf9a179dCE37C9ddf3AE4Cad4aa9dd6B814C2'

export const accounts = [
  '0x1111c45d8C3B30B9Cd9a21D7037F4fC39E99873f',
  '0x2222Af18a92EE40c3758E278ACeF5623fF2D339c',
  '0x3333A03730F9836D755c86952450A5188030a062'
]

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
