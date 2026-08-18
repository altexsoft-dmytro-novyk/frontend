---
paths:
  - "src/**/*.tsx"
  - "src/index.css"
---

# Styling Rules

Theme: Zinc base + Blue accent (official shadcn/ui combination), OKLCH color space, CSS variables in `src/index.css`.

## Semantic color tokens — CRITICAL

**NEVER use hardcoded colors.** Always use semantic tokens; they adapt to dark mode automatically.

```tsx
// ✅ CORRECT
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground border border-border">
<p className="text-muted-foreground">
<p className="text-destructive">
<Button variant="default">   // or secondary / outline / ghost / destructive

// ❌ FORBIDDEN
<div className="bg-blue-600">          // no palette colors
<p className="text-white">             // no white/black
<div className="bg-[#3b82f6]">         // no hex
<div style={{ color: 'blue' }}>        // no inline styles
<div className="bg-white dark:bg-gray-900">  // no manual dark variants
```

Available tokens: `background`/`foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive` (each with `-foreground` pair), `border`, `input`, `ring`, `chart-1..5`, sidebar tokens (`sidebar`, `sidebar-border`, `sidebar-foreground`, `sidebar-accent`).

Which token when:
- Page background → `bg-background`; main text → `text-foreground`
- Cards/containers → `bg-card` + `text-card-foreground`
- De-emphasized → `bg-muted` / `text-muted-foreground`
- CTA → `<Button variant="default">`; errors → `text-destructive` or `<Button variant="destructive">`
- Borders → `border-border`; focus → `ring-ring`

## Tailwind usage

- Tailwind utility classes for all styling; custom CSS only in `index.css` for true globals
- Conditional classes via `cn()` from `@/lib/utils`:
  `<div className={cn('base', isActive && 'active', className)}>`
- Layout dimensions shared between components use CSS variables (`--header-height`, `--sidebar-width`)
