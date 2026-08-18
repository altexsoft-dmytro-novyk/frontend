---
paths:
  - "src/locales/**"
  - "src/i18n/**"
  - "src/@types/**"
---

# i18n Conventions

- Library: i18next / react-i18next (no ICU plugin). Config: `src/i18n/config.ts`; translations: `src/locales/en/translation.json`; English only for now
- Translation keys are type-safe via `src/@types/i18next.d.ts` — invalid keys fail typecheck

## Rules

1. Never hardcode user-facing text in components — always `t('key')`
2. Add the key to `translation.json` FIRST, then use it in the component
3. Nested keys grouped by feature: `home.title`, `error.errorDetails`, `sidebar.home`
4. Semantic key names — describe what the text is for, not what it says: `home.welcome.title`, not `title.welcome`
5. Interpolation uses i18next `{{var}}` syntax; plurals use suffix convention (`items_one`, `items_other`)
