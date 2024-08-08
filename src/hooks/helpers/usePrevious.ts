import { useEffect, useRef } from 'react'

/**
 * Hook to get the previous value of a given variable.
 * @param value Value to get the previous value from.
 * @returns Previous value of the given variable.
 */
export function usePrevious<T>(value?: T) {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}
