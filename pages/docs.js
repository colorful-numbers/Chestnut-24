import Head from 'next/head'
import Navbar from './navbar'
import Footer from './footer'
import { useI18n } from '../lib/i18n'
import { getDevNotes } from '../lib/devNotes'

export async function getStaticProps() {
  return {
    props: {
      notes: getDevNotes(),
    },
  }
}

export default function DocsPage({ notes }) {
  const { t } = useI18n()

  return (
    <div className="info-site min-h-screen flex flex-col">
      <Head>
        <title>{t.docs.title} - {t.metaTitle}</title>
        <meta name="description" content={t.docs.body} />
      </Head>
      <Navbar />
      <main>
        <section className="info-section defn-page">
          <div className="section-heading section-heading--wide">
            <div>
              <span>{t.docs.label}</span>
              <h1>{t.docs.title}</h1>
            </div>
            <p>{t.docs.body}</p>
          </div>
          <div className="dev-notes">
            {notes.map((note) => (
              <article key={note.slug} id={note.slug} className="dev-note">
                <header className="dev-note__head">
                  <h2>{note.version}</h2>
                </header>
                <div
                  className="dev-note__body"
                  // Local, trusted docs rendered by lib/markdownRender.js.
                  dangerouslySetInnerHTML={{ __html: note.html }}
                />
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
