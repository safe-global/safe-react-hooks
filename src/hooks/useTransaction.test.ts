import * as wagmi from 'wagmi'
import { waitFor } from '@testing-library/react'
import { UseQueryResult } from '@tanstack/react-query'
import { useTransaction } from '@/hooks/useTransaction.js'
import * as useSafeTransaction from '@/hooks/useSafeTransaction.js'
import { ethereumTxHash, safeTransaction, safeTxHash } from '@test/fixtures/index.js'
import { renderHookInQueryClientProvider } from '@test/utils.js'
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'
import { configPredictedSafe } from '@test/config.js'

describe('useTransaction', () => {
  const mockTransactionResult = { data: safeTransaction, status: 'success' }

  const useSafeTransactionSpy = jest.spyOn(useSafeTransaction, 'useSafeTransaction')
  const useTransactionWagmiSpy = jest.spyOn(wagmi, 'useTransaction')

  beforeEach(() => {
    useSafeTransactionSpy.mockReturnValue({
      data: safeTransaction,
      status: 'success'
    } as UseQueryResult<SafeMultisigTransactionResponse>)

    useTransactionWagmiSpy.mockReturnValue(
      mockTransactionResult as unknown as wagmi.UseTransactionReturnType
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when `safeTxHash` param is given', () => {
    it('should call the `useSafeTransaction` hook', async () => {
      const { result } = renderHookInQueryClientProvider(() => useTransaction({ safeTxHash }))

      expect(useSafeTransactionSpy).toHaveBeenCalledTimes(1)
      expect(useSafeTransactionSpy).toHaveBeenCalledWith({ config: undefined, safeTxHash })

      await waitFor(() =>
        expect(result.current).toMatchObject({ data: safeTransaction, status: 'success' })
      )
    })

    it('should accept a config to override the one from the SafeProvider', async () => {
      const { result } = renderHookInQueryClientProvider(() =>
        useTransaction({ config: configPredictedSafe, safeTxHash })
      )

      expect(useSafeTransactionSpy).toHaveBeenCalledTimes(1)
      expect(useSafeTransactionSpy).toHaveBeenCalledWith({
        config: configPredictedSafe,
        safeTxHash
      })

      await waitFor(() =>
        expect(result.current).toMatchObject({ data: safeTransaction, status: 'success' })
      )
    })
  })

  describe('when `ethereumTxHash` param is given', () => {
    it('should call the `useTransaction` hook from wagmi', async () => {
      const { result } = renderHookInQueryClientProvider(() => useTransaction({ ethereumTxHash }))

      expect(useTransactionWagmiSpy).toHaveBeenCalledTimes(1)
      expect(useTransactionWagmiSpy).toHaveBeenCalledWith({ hash: ethereumTxHash })

      await waitFor(() =>
        expect(result.current).toMatchObject({ data: safeTransaction, status: 'success' })
      )
    })
  })
})
