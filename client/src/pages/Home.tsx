import styles from './Home.module.css'

import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import type { User } from '../App'
import { getPosts, getForms } from '../services/umbraco'
import type { Post } from '../services/umbraco'

type Props = {
  user: User | null
}

type Survey = {
  id: string
  name: string
  path: string
  organisationName: string
  created: string
  updated: string
  recipients: string[]
  description: string
}

function Home({ user }: Props) {
  const navigate = useNavigate()

  const [posts, setPosts] = useState<Post[]>([])
  const [loadingContent, setLoadingContent] = useState(true)
  const [contentError, setContentError] = useState('')

  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loadingSurveys, setLoadingSurveys] = useState(true)
  const [surveyError, setSurveyError] = useState('')

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

  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const data = await getForms()

        setSurveys(data)
      } catch (error) {
        console.error(error)
        setSurveyError('Unable to load surveys.')
      } finally {
        setLoadingSurveys(false)
      }
    }

    loadSurveys()
  }, [])

const openSurvey = (path: string) => {
  window.open(
    `https://localhost:44343${path}`,
    '_blank',
    'noopener,noreferrer'
  )
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
      <section className={styles.resourcesSection}>
        <div className={styles.resourcesContent}>
          <h2>Featured Resources</h2>

          <p className={styles.resourcesIntro}>
            Guides, articles, and tools to better understand heart failure.
          </p>
        </div>
      </section>

      <section className={styles.surveysSection}>
        <div className={styles.surveysContent}>

          <div className={styles.surveysTitleBox}>
            <div className={styles.surveysTitleText}>
              <h2>Featured Surveys</h2>
              <p>
                Share your experiences and insights to help improve heart failure data and research.
              </p>
            </div>

            <Link
              to="/survey"
              className={styles.viewAllSurveysLink}
            >
              View All Surveys →
            </Link>
          </div>

          <div className={styles.surveyGrid}>

            {surveys.slice(0, 3).map((survey) => (
              <div className={styles.surveyCard} key={survey.id}>

                <div className={styles.surveyHeader}>
                  <span className={styles.surveyCategory}>
                    Heart Failure
                  </span>

                  <span className={styles.surveyStatus}>
                    Open
                  </span>
                </div>

                <h3 className={styles.surveyName}>
                  {survey.name}
                </h3>

                <p className={styles.surveyDescription}>
                  {survey.description}
                </p>

                <div className={styles.surveyDetails}>
                  <div>
                    <span>Recipient</span>
                    <strong>
                      {survey.recipients.join(', ')}
                    </strong>
                  </div>

                  <div>
                    <span>Created</span>
                    <strong>
                      {new Date(survey.updated).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>

                  <div>
                    <span>Updated</span>
                    <strong>
                      {new Date(survey.updated).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>

                  <div>
                    <span>Organisation</span>
                    <strong>
                      {survey.organisationName}
                    </strong>
                  </div>
                </div>

                <button
                  className={styles.takeSurveyButton}
                  onClick={() => openSurvey(survey.path)}
                >
                  Take Survey →
                </button>

              </div>
            ))}

          </div>


        </div>
      </section>
    </div>
  )
}

export default Home
