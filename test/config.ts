import { createConfig } from '@/index.js'
import { sepolia } from 'viem/chains'
import { accounts, rpcProvider, safeAddress } from './fixtures/index.js'

export const configParamsExistingSafe = {
  chain: sepolia,
  provider: rpcProvider,
  signer: undefined,
  safeAddress: safeAddress
}

export const configParamsPredictedSafe = {
  chain: sepolia,
  provider: rpcProvider,
  signer: undefined,
  safeOptions: {
    owners: accounts,
    threshold: 1
  }
}

export const configExistingSafe = createConfig(configParamsExistingSafe)

export const configPredictedSafe = createConfig(configParamsPredictedSafe)
