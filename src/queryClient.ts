import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()

export const invalidateQueries = (queryKeys: string[]) => {
  queryKeys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: [key] })
  })
}
