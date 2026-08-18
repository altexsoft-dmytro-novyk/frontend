/**
 * TypeScript definitions for i18next
 * Enables type-safe translation keys with autocomplete
 */

import 'react-i18next'
import translation from '../locales/en/translation.json'

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof translation
    }
  }
}
