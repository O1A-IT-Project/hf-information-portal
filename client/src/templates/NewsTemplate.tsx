import styles from './Templates.module.css'

type RichText = {
  markup: string
}

type ContentProperties = {
  pageTitle?: string
  overview?: string
  date?: string
  author?: string
  body?: RichText
}

type Content = {
  properties: ContentProperties
}

type Props = {
  content: Content
}

// Template for displaying a news page
function NewsTemplate({ content }: Props) {
  const props = content.properties

  return (
    <main className={styles.page}>
      <span className={styles.badge}>News</span>

      <h1 className={styles.title}>{props.pageTitle}</h1>

      <div className={styles.meta}>
        {props.date && <span>{props.date}</span>}

        {props.author && <span>By {props.author}</span>}
      </div>

      {props.overview && <p className={styles.overview}>{props.overview}</p>}

      {props.body?.markup && (
        <section className={styles.section}>
          <div dangerouslySetInnerHTML={{ __html: props.body.markup }} />
        </section>
      )}
    </main>
  )
}

export default NewsTemplate
