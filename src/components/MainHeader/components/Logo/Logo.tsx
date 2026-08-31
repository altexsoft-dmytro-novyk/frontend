import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'

export const Logo = () => {
  return (
    <Link
      to="/"
      className="flex h-full items-center gap-2 px-4 text-lg font-semibold text-sidebar-foreground transition-opacity hover:opacity-80"
    >
      <Users className="h-5 w-5 text-primary" />
      People
    </Link>
  )
}
