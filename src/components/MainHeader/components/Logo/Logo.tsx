import { Link } from 'react-router-dom'

export const Logo = () => {
  return (
    <Link
      to="/"
      className="flex h-full items-center px-4 text-2xl font-semibold text-sidebar-foreground hover:opacity-80 transition-opacity"
    >
      STARTER
    </Link>
  )
}
