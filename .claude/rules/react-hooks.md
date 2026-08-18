---
paths:
  - "src/hooks/**"
---

# Global Hook Conventions

- `src/hooks/` is only for reusable hooks not tied to a specific page or component (e.g. `useLocalStorage`, `useDebounce`, `useWindowSize`)
- Page-specific hooks belong in that page's `hooks/` folder, not here
- One hook per file, file named after the hook: `useLocalStorage.ts`
- Type generically where it makes sense (`useLocalStorage<T>`)
- No JSX in these hooks — if a hook needs to render something, it's a component
