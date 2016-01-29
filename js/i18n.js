import i18n from 'i18next/lib'
import XHR from 'i18next-xhr-backend/lib'
import LanguageDetector from 'i18next-browser-languagedetector/lib'


i18n
.use(XHR)
.use(LanguageDetector)
.init({
  fallbackLng: 'en',
  keySeparator: '~', // choose a rarely used separator as we don't nest keys!
  nsSeparator: '`', // choose a rarely used separator as we don't use namespace!
  backend: {
    loadPath: 'locale/{{lng}}.json',
  },
  interpolation: {
    escapeValue: false, // not needed for react!!
  },
})

export default i18n
