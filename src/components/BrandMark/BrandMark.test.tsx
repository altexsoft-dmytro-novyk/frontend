import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BrandMark } from './BrandMark'

describe('BrandMark', () => {
  it('renders the wordmark by default', () => {
    render(<BrandMark />)
    expect(screen.getByText('PeoplePlatform')).toBeInTheDocument()
  })

  it('hides the wordmark when glyphOnly is set', () => {
    render(<BrandMark glyphOnly />)
    expect(screen.queryByText('PeoplePlatform')).not.toBeInTheDocument()
  })
})
