import { createConfig, CreateConfigParams } from '@/index.js'
import { SafeKitConfig } from '@safe-global/safe-kit'
import { sepolia } from 'viem/chains'

type EIP1193Provider = Exclude<SafeKitConfig['provider'], string>

export const createConfigProps: CreateConfigParams<string> = {
  chain: sepolia,
  provider: 'https://rpc.provider.com',
  signer: '0x1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  safeAddress: '0x5AFEd4047b12B5a6688D5A631f4c027E6827ba8a'
}

export const createConfigEip1193Props: CreateConfigParams<EIP1193Provider> = {
  chain: sepolia,
  provider: { request: async () => {} },
  signer: '0x1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  safeAddress: '0x5AFEd4047b12B5a6688D5A631f4c027E6827ba8a'
}

export const safeConfig = createConfig(createConfigProps)
