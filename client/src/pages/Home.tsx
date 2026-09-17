import styles from './Home.module.css'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { User } from '../App'
import { getPosts } from '../services/umbraco'
import type { Post } from '../services/umbraco'

type Props = {
  user: User | null
}

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
      <section className={styles.searchSection}>
        <div className={styles.searchContent}>
          <h1>Heart Failure: Information, Resources & Support</h1>

          <p>
            Explore helpful resources, take surveys, and share your insights to help improve heart failure data and research.
          </p>

          <div className={styles.homeSearch}>
            <i className="bx bx-search"></i>

            <input
              type="text"
              placeholder="Search heart failure information..."
            />

            <button onClick={() => navigate('/search')}>
              Search
            </button>
          </div>
        </div>
      </section>

      <section className={styles.aboutSection}>
        <div className={styles.aboutContent}>


          <div className={styles.infoGrid}>

            <div className={styles.infoCard}>
              <div className={`${styles.iconCircle} ${styles.resourceIcon}`}>
                <i className="bx bx-book-open"></i>
              </div>

              <h3>Explore Resources</h3>
              <p>
                  Access guides, articles, and tools to better understand heart failure.
              </p>
            </div>

            <div className={styles.infoCard}>
              <div className={`${styles.iconCircle} ${styles.surveyIcon}`}>
                <i className="bx bx-edit"></i>
              </div>

              <h3>Take Surveys</h3>
              <p>
                Share your experiences to support better heart failure research and care.
              </p>
            </div>


            <div className={styles.infoCard}>
              <div className={`${styles.iconCircle} ${styles.communityIcon}`}>
                <i className="bx bx-group"></i>
              </div>

              <h3>Join Our Community</h3>
              <p>
                Learn, share experiences, and connect with others.
              </p>
            </div>

            <div className={styles.infoCard}>
              <div className={`${styles.iconCircle} ${styles.impactIcon}`}>
                <i className="bx bx-heart"></i>
              </div>

              <h3>Make an Impact</h3>
              <p>
                Your insights can help contribute to better heart failure
                research and support.
              </p>
            </div>

          </div>
        </div>
      </section>

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
