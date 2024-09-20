import { QueryClient } from '@tanstack/react-query'
import { QueryKey } from './constants.js'

export const queryClient = new QueryClient()

export const invalidateQueries = (queryKeys: string[]) => {
  queryKeys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: [key] })

    if (key === QueryKey.SafeInfo) {
      invalidateQueries([
        QueryKey.Address,
        QueryKey.Nonce,
        QueryKey.Threshold,
        QueryKey.IsDeployed,
        QueryKey.Owners
      ])
    }
  })
}
