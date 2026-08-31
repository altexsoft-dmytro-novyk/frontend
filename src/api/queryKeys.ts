import type { UserListQuery } from '@/types/domain'

/** Stable, descriptive query keys — they drive caching and invalidation. */
export const queryKeys = {
  me: ['me'] as const,
  magicLinkConsume: (token: string) => ['magic-link-consume', token] as const,
  users: (query: UserListQuery) => ['users', query] as const,
  user: (id: string) => ['user', id] as const,
  section: (id: string, section: string) => ['user', id, section] as const,
  actionItems: (assigneeId: string) => ['action-items', assigneeId] as const,
  mentorshipPairs: (userId: string) => ['mentorship-pairs', userId] as const,
  roles: ['roles'] as const,
}
