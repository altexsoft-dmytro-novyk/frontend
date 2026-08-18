/**
 * i18next configuration
 *
 * Features:
 * - TypeScript support with type-safe translation keys
 * - Single language (English) for initial implementation
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import translationEN from '../locales/en/translation.json'

// Translation resources
const resources = {
  en: {
    translation: translationEN,
  },
} as const

// Initialize i18next
i18n
  .use(initReactI18next) // Integrate with React
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback language

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Disable debug in production
    debug: import.meta.env.DEV,

    // React specific options
    react: {
      useSuspense: false, // Disable suspense to avoid loading issues
    },
  })

export default i18n
