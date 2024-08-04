import { createConfig, CreateConfigParams } from '@/index.js'
import { sepolia } from 'viem/chains'
import { accounts, rpcProvider, safeAddress } from './fixtures.js'

export const configParamsExistingSafe: CreateConfigParams<string> = {
  chain: sepolia,
  provider: rpcProvider,
  signer: accounts[0],
  safeAddress: safeAddress
}

export const configParamsPredictedSafe: CreateConfigParams<string> = {
  chain: sepolia,
  provider: rpcProvider,
  signer: accounts[0],
  safeOptions: {
    owners: accounts,
    threshold: 1
  }
}

export const configExistingSafe = createConfig(configParamsExistingSafe)

export const configPredictedSafe = createConfig(configParamsPredictedSafe)
