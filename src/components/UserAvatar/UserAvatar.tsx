import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  firstName?: string
  lastName?: string
  name?: string
  photo?: string | null
  className?: string
}

function initials(first?: string, last?: string, name?: string): string {
  if (first || last) return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?'
  if (name) {
    const parts = name.trim().split(/\s+/)
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase() || '?'
  }
  return '?'
}

export const UserAvatar = ({ firstName, lastName, name, photo, className }: UserAvatarProps) => {
  return (
    <Avatar className={cn('h-8 w-8', className)}>
      {photo && <AvatarImage src={photo} alt="" />}
      <AvatarFallback className="text-xs">{initials(firstName, lastName, name)}</AvatarFallback>
    </Avatar>
  )
}
