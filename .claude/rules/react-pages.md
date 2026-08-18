---
paths:
  - "src/pages/**"
---

# Page Conventions

## Structure

Each page is a scoped folder containing everything page-specific:

```
pages/
  ProjectsPage/
    ProjectsPage.tsx        # Component — UI only
    hooks/
      useProjectsPage.ts    # Business logic
    components/             # Page-local child components (same folder-per-component structure)
    helpers/                # Page-local helpers, split by purpose (e.g. textHelper.ts)
```

- Naming: page `ProjectsPage` → hook `useProjectsPage`
- Register routes in `src/router/index.tsx`; app routes render inside `AppLayout`
- Only create `hooks/`, `components/`, `helpers/` folders when there are files to put in them

## Components = UI only, hooks = business logic

The page component contains ONLY: JSX markup, conditional rendering from hook state, event handler bindings.

The page hook contains: `useState`/`useReducer`, `useEffect`, API calls, form logic, data transformations, navigation (`useNavigate`), location/params reading (`useLocation`).

```tsx
// hooks/useFeedbackPage.ts — logic
export const useFeedbackPage = () => {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting'>('idle')
  const handleSubmit = async (message: string) => {
    setSubmitStatus('submitting')
    await apiClient.post('/feedback', { message })
    setSubmitStatus('success')
  }
  return { submitStatus, handleSubmit }
}

// FeedbackPage.tsx — UI only
export const FeedbackPage = () => {
  const { t } = useTranslation()
  const { submitStatus, handleSubmit } = useFeedbackPage()
  return <Button onClick={() => handleSubmit('...')}>{t('feedback.submit')}</Button>
}
```

## When a page hook is NOT needed

Skip the hook if the page only renders static content, uses only global context, and has no local state, side effects, or API calls (e.g. current `HomePage`).
