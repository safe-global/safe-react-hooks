import { DependencyList, useEffect, useState } from 'react'

/**
 * Hook that memoizes the result of an async function.
 * @param factory Async function of which the result should be memoized.
 * @param deps Dependency list
 * @returns Current result or `undefined` if not available.
 */
export function useAsyncMemo<T>(factory: () => Promise<T>, deps: DependencyList): T | undefined {
  const [result, setResult] = useState<T | undefined>(undefined)

  useEffect(() => {
    factory().then((newResult) => {
      if (newResult !== result) {
        setResult(newResult)
      }
    })
  }, [...deps, factory])

  return result
}
