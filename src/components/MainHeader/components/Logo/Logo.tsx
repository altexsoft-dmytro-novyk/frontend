import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/BrandMark/BrandMark'

export const Logo = () => {
  return (
    <Link
      to="/"
      className="flex h-full items-center px-3 text-sidebar-foreground transition-opacity hover:opacity-80"
    >
      <BrandMark />
    </Link>
  )
}
