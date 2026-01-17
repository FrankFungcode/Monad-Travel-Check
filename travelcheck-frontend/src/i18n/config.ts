/**
 * @file i18n Configuration
 * @description Internationalization setup with i18next
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enUS from './locales/en-US.json'
import zhCN from './locales/zh-CN.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': {
        translation: zhCN,
      },
      'en-US': {
        translation: enUS,
      },
    },
    lng: 'zh-CN', // Default language is Chinese
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  })

export default i18n
