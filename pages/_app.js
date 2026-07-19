import '../styles/global.css'
import '../styles/world-archive.css'
import '../styles/interactive-world.css'
import { useEffect, useState } from 'react'
import { I18nProvider } from '../lib/i18n'
import SiteEffects from '../components/SiteEffects'

const SETTINGS_EVENT = 'index-settings-changed'

function AppFrame({ Component, pageProps }) {
  const [backgroundImage, setBackgroundImage] = useState('')

  useEffect(() => {
    const syncBackgroundSettings = () => {
      setBackgroundImage(localStorage.getItem('backgroundImage') || '')
    }

    syncBackgroundSettings()
    window.addEventListener('storage', syncBackgroundSettings)
    window.addEventListener(SETTINGS_EVENT, syncBackgroundSettings)

    return () => {
      window.removeEventListener('storage', syncBackgroundSettings)
      window.removeEventListener(SETTINGS_EVENT, syncBackgroundSettings)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    root.classList.add('light')
    root.style.colorScheme = 'light'
  }, [])

  return (
    <div className="app-shell">
      <div
        className="app-background"
        style={backgroundImage ? { backgroundImage: `url('${backgroundImage}')` } : undefined}
      />
      <SiteEffects />
      <div className="app-content">
        <Component {...pageProps} />
      </div>
    </div>
  )
}

export default function MyApp({ Component, pageProps }) {
  return (
    <I18nProvider>
      <AppFrame Component={Component} pageProps={pageProps} />
    </I18nProvider>
  )
}
