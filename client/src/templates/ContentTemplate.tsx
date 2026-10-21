import styles from './Templates.module.css'

type ImageItem = {
  url: string
  name: string
}

type RichText = {
  markup: string
}

type ContentProperties = {
  pageTitle?: string
  overview?: string
  image?: ImageItem[]
  bodyContent?: RichText
}

type Content = {
  properties: ContentProperties
}

type Props = {
  content: Content
}

function ContentTemplate({ content }: Props) {
  const props = content.properties

  return (
    <main className={styles.page}>
      <span className={styles.badge}>Article</span>

      <h1 className={styles.title}>{props.pageTitle}</h1>

      {props.overview && <p className={styles.overview}>{props.overview}</p>}

      {props.image && props.image.length > 0 && (
        <section className={styles.section}>
          <img
            src={`${props.image[0].url}`}
            alt={props.image[0].name}
            className={styles.image}
          />
        </section>
      )}

      {props.bodyContent?.markup && (
        <section className={styles.section}>
          <div dangerouslySetInnerHTML={{ __html: props.bodyContent.markup }} />
        </section>
      )}
    </main>
  )
}

export default ContentTemplate
