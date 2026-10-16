import { cn } from 'cn'
import { describe, expect, it } from 'vitest'

describe('cn', () => {
  it('joins only the truthy class names', () => {
    const result: string = cn('p-2', false, undefined, 'text-sm')

    expect(result).toBe('p-2 text-sm')
  })

  it('keeps the last Tailwind class when two of them conflict', () => {
    const result: string = cn('p-2', 'p-4')

    expect(result).toBe('p-4')
  })
})
