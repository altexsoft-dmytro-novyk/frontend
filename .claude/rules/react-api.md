---
paths:
  - "src/api/**"
---

# API Layer Conventions

- Single configured axios instance: the `apiClient` singleton in `api/client.ts` (baseURL/timeout from `config/env.ts`). Don't create additional axios instances
- Auth headers are not implemented yet — there is a TODO stub in the request interceptor for when auth arrives
- Functions that make API requests are named with the `ApiCall` suffix: `getProjectsApiCall`, `createAgentApiCall`
- Shared API response types live in `src/types/api.ts`

## TanStack Query

- Use TanStack Query for all data fetching in components — never call `apiClient` directly from a component
- Query hooks live in `api/hooks/`, one hook per operation:

```tsx
// api/hooks/useProjects.ts
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: getProjectsApiCall,
  })
}
```

- Use stable, descriptive query keys (`['projects']`, `['project', id]`) — they drive caching and invalidation
- The `QueryClient` is configured in `src/main.tsx` (retry: 1, staleTime: 5 min)
