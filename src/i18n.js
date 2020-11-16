
import i18n from 'i18next'
import Backend from 'i18next-xhr-backend'
import { initReactI18next } from 'react-i18next'

const supportedLangs = ['en', 'zh'];

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem('i18nextLng'),
    backend: {
      /* translation file path */
      loadPath: '/assets/i18n/{{ns}}/{{lng}}.json'
    },
    fallbackLng: 'en',
    debug: true,
    /* can have multiple namespace, in case you want to divide a huge translation into smaller pieces and load them on demand */
    ns: ['translations'],
    defaultNS: 'translations',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
      formatSeparator: ','
    },
    react: {
      wait: true
    }
	})
	
export function getCurrentLocale() {
  return i18n.language || window.localStorage.i18nextLng || '';
}

export default i18n