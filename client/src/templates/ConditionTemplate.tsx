import styles from './Templates.module.css'

type RichText = {
  markup: string
}

type ContentProperties = {
  pageTitle?: string
  overview?: string
  bodyContent?: RichText
  symptoms?: RichText
  causes?: RichText
  treatments?: RichText
  videoUrl?: string
}

type Content = {
  properties: ContentProperties
}

type Props = {
  content: Content
}

// Template for displaying a condition page 
function ConditionTemplate({ content }: Props) {
  const props = content.properties

  return (
    <main className={styles.page}>
      <span className={styles.badge}>Condition</span>

      <h1 className={styles.title}>{props.pageTitle}</h1>

      {props.overview && <p className={styles.overview}>{props.overview}</p>}

      {props.bodyContent?.markup && (
        <section className={styles.section}>
          <div dangerouslySetInnerHTML={{ __html: props.bodyContent.markup }} />
        </section>
      )}

      {props.symptoms?.markup && (
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Symptoms</h2>

          <div dangerouslySetInnerHTML={{ __html: props.symptoms.markup }} />
        </section>
      )}

      {props.causes?.markup && (
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Causes</h2>

          <div dangerouslySetInnerHTML={{ __html: props.causes.markup }} />
        </section>
      )}

      {props.treatments?.markup && (
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Treatments</h2>

          <div dangerouslySetInnerHTML={{ __html: props.treatments.markup }} />
        </section>
      )}

      {props.videoUrl && (
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Related Video</h2>

          <div className={styles.videoWrapper}>
            <iframe src={props.videoUrl} title="Video" allowFullScreen />
          </div>
        </section>
      )}
    </main>
  )
}

export default ConditionTemplate
