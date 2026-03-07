import { useState, useEffect } from 'react'

/**
 * 入力値をデバウンスするフック
 * 検索入力に使用してパフォーマンスを確保する
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
