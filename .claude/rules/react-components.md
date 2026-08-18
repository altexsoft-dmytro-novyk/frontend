---
paths:
  - "src/components/**"
---

# Shared Component Conventions

## Structure

- One folder per component: `components/SideMenu/SideMenu.tsx`
- Child components go in a nested `components/` folder with the same structure:
  `components/SideMenu/components/SideMenuItem/SideMenuItem.tsx`
- Component-local hooks go in a `hooks/` folder, component-local helpers in `helpers/`
- Only shared, reusable components live here — feature-specific components belong to their page folder
- Avoid unnecessary component nesting — prefer loops and render functions within the main component over many tiny components in one file
- Always arrow functions for components: `export const SideMenu = () => {...}`, never `function` declarations
- Props type is an `interface` declared in the SAME file as the component, directly above the component function — named `<ComponentName>Props` (e.g. `SideMenuProps`). Don't move props types to separate files

## Component = UI only, logic in a custom hook

Same rule as for pages: if a component has business logic (local state, effects, API calls, data transformations, handlers with logic), extract it into a custom hook next to the component. The component file keeps only JSX, conditional rendering from hook state, and handler bindings.

```
components/
  SearchBox/
    SearchBox.tsx           # UI only
    hooks/
      useSearchBox.ts       # Business logic
```

```tsx
// hooks/useSearchBox.ts — logic
export const useSearchBox = (onSearch: (query: string) => void) => {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  const clear = () => setQuery('')
  return { query, setQuery, clear }
}

// SearchBox.tsx — UI only; props interface lives here, right above the component
interface SearchBoxProps {
  placeholder?: string
  onSearch: (query: string) => void
}

export const SearchBox = ({ placeholder, onSearch }: SearchBoxProps) => {
  const { query, setQuery, clear } = useSearchBox(onSearch)
  return (
    <div>
      <Input value={query} placeholder={placeholder} onChange={e => setQuery(e.target.value)} />
      <Button variant="ghost" onClick={clear}>×</Button>
    </div>
  )
}
```

Skip the hook for purely presentational components (props in, JSX out — e.g. `Logo`).

## shadcn/ui (`components/ui/`)

- `components/ui/` is managed by the shadcn CLI — flat files, do NOT restructure into per-component folders
- Add components only via `npx shadcn@latest add [component-name]` (config in `components.json`)
- Customize by editing the generated file directly, not by wrapping
- Import via alias: `import { Button } from '@/components/ui/button'`

## Icons

- Use Lucide React only — no SVG files, no other icon sets
- Size via Tailwind classes: `<Search className="h-4 w-4" />`
