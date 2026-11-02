import styles from './ContentPage.module.css'

import type { Role } from '../App'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getContent } from '../services/umbraco'

type Props = {
  activeRole: Role | null
}

type Content = {
  id: string
  name: string
  pageTitle: string
  overview: string
  category: string
  type: string
  visibility: string[]
  bodyContent: string
  author: string
  created: string
  updated: string
  path: string
}

function ContentPage({ activeRole }: Props) {
  const { contentPath } = useParams<{ contentPath: string }>()

  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getContent(activeRole)
      .then(contents => {
        const foundContent = contents.find(content => content.path === `/${contentPath}/`)

        setContent(foundContent ?? null)
      })
      .catch(error => {
        console.error('Error loading content:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [contentPath, activeRole])

  if (loading) {
    return <p>Loading...</p>
  }

  if (!content) {
    return <p>Content not found.</p>
  }

  const bodyContent = content.bodyContent.replace(
    /src="\/media\//g,
    'src="https://localhost:8443/media/'
  )

  return (
    <main className="container mt-4">
      <div
        className={styles.contentBody}
        dangerouslySetInnerHTML={{
          __html: bodyContent,
        }}
      />
    </main>
  )
}

export default ContentPage
