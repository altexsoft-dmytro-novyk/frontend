---
paths:
  - "src/contexts/**"
---

# Context Conventions

- One context per file: `contexts/LayoutContext.tsx`
- Contexts are for global state shared across many components (layout, theme, future auth) — not for page-local state
- Each context file exports exactly two things: the `XProvider` component and a `useX` hook that throws when used outside the provider:

```tsx
export const useLayout = () => {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider')
  }
  return context
}
```

- Never export the raw context object — consumers go through the hook
- Providers are wired up in `src/App.tsx`
- Persist state to localStorage inside the provider when it must survive reloads (see `sidebarExpanded` in LayoutContext)
