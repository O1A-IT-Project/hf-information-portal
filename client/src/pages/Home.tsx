import styles from './Home.module.css'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { User } from '../App'
import { getPosts } from '../services/umbraco'
import type { Post } from '../services/umbraco'
import HeroCarousel from '../components/HeroCarousel'
import type { HeroSlide } from '../components/HeroCarousel'

type Props = {
  user: User | null
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: 'Heart Failure Information Portal',
    description:
      'Trusted heart failure information and healthcare resources for patients, clinicians and healthcare organisations.',
    image: `${import.meta.env.BASE_URL}images/hero-1.jpg`,
    alt: 'Heart failure information and healthcare resources',
  },
  {
    id: 2,
    title: 'Find Reliable Heart Failure Information',
    description: 'Explore articles, clinical information and resources in one central location.',
    image: `${import.meta.env.BASE_URL}images/hero-2.jpg`,
    alt: 'Heart health information and resources',
  },
  {
    id: 3,
    title: 'Connect With Healthcare Services',
    description:
      'Discover healthcare services and clinical networks available across South Australia.',
    image: `${import.meta.env.BASE_URL}images/hero-3.jpg`,
    alt: 'Healthcare professionals and services',
  },
]

function Home({ user }: Props) {
  const navigate = useNavigate()

  const [posts, setPosts] = useState<Post[]>([])
  const [loadingContent, setLoadingContent] = useState(true)
  const [contentError, setContentError] = useState('')

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await getPosts()

        setPosts(data.slice(0, 4))
      } catch (error) {
        console.error(error)
        setContentError('Unable to load content from Umbraco.')
      } finally {
        setLoadingContent(false)
      }
    }

    loadContent()
  }, [])

  const handleCardClick = (path: string) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank')
    } else {
      navigate(path)
    }
  }

  const getTypeLabel = (contentType: string) => {
    switch (contentType) {
      case 'videoPage':
        return 'Video'
      case 'conditionPage':
        return 'Condition'
      case 'contentPage':
        return 'Article'
      case 'newsPage':
        return 'News'
      default:
        return contentType
    }
  }

  const getContentPath = (post: Post) => {
    if (!post.route?.path) return '/content'

    return `/content${post.route.path}`
  }

  return (
    <div className={styles.homeContainer}>
      <HeroCarousel slides={HERO_SLIDES} />

      <section className={styles.cardsSection}>
        <h2>Featured Resources</h2>

        <div className={styles.cardGrid}>
          <div
            className={styles.card}
            onClick={() => handleCardClick('https://ceih.sa.gov.au/news-and-events')}
            style={{ cursor: 'pointer' }}
          >
            <h3>News and Events</h3>

            <p>
              Stay up to date with the latest stories, insights and achievements from across CEIH.
            </p>
          </div>

          <div
            className={styles.card}
            onClick={() => handleCardClick('https://ceih.sa.gov.au/clinical-networks')}
            style={{ cursor: 'pointer' }}
          >
            <h3>Clinical Networks</h3>

            <p>
              Connecting clinicians, consumers and partners to improve healthcare across South
              Australia.
            </p>
          </div>

          <div
            className={styles.card}
            onClick={() => handleCardClick('/content')}
            style={{ cursor: 'pointer' }}
          >
            <h3>Browse Content</h3>

            <p>Search heart failure articles, news, videos and clinical resources from Umbraco.</p>
          </div>

          {user && !user.roles?.includes('admin') && (
            <div
              className={styles.card}
              onClick={() => handleCardClick('/apply-role')}
              style={{ cursor: 'pointer' }}
            >
              <h3>Apply for Additional Roles</h3>

              <p>
                Clinicians, doctors, pharmacies and content custodians can apply for additional
                access permissions.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className={styles.cardsSection}>
        <h2>Latest Content from Umbraco</h2>

        {loadingContent && <p>Loading content...</p>}

        {!loadingContent && contentError && <p>{contentError}</p>}

        {!loadingContent && !contentError && posts.length === 0 && <p>No content available.</p>}

        {!loadingContent && posts.length > 0 && (
          <div className={styles.cardGrid}>
            {posts.map(post => (
              <div
                key={post.id}
                className={styles.card}
                onClick={() => handleCardClick(getContentPath(post))}
                style={{ cursor: 'pointer' }}
              >
                <h3>{post.title}</h3>

                <p>{post.body || 'No description available.'}</p>

                <small>{getTypeLabel(post.contentType)}</small>
              </div>
            ))}
          </div>
        )}
      </section>

      {user && (
        <section className={styles.dashboardSection}>
          <h2>Welcome back</h2>

          <div className={styles.dashboardCard}>
            <p>
              <strong>{user.roles?.join(', ')}</strong>
            </p>

            <p>Logged in as {user.email}</p>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
