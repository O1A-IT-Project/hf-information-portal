import styles from './Home.module.css'

import type { User } from '../App'

import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getForms, getArticles } from '../services/umbraco'


// ============================================================
// Types
// ============================================================

type Props = {
  user: User | null
}

type Content = {
  id: string
  name: string
  pageTitle: string
  overview: string
  category: string
  visibility: string[]
  bodyContent: string
  author: string
  created: string
  updated: string
  path: string
}

type Survey = {
  id: string
  name: string
  description: string
  category: string
  recipients: string[]
  organisationName: string
  created: string
  updated: string
  path: string
}


// ============================================================
// Home Component
// ============================================================

function Home({ user }: Props) {
  const navigate = useNavigate()


  // ==========================================================
  // State
  // ==========================================================

  const [content, setContent] = useState<Content[]>([])
  const [loadingContent, setLoadingContent] = useState(true)
  const [contentError, setContentError] = useState('')

  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loadingSurveys, setLoadingSurveys] = useState(true)
  const [surveyError, setSurveyError] = useState('')


  // ==========================================================
  // Load Posts (currently articles but to be updated)
  // ==========================================================

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await getArticles()

        setContent(data)
      } catch (error) {
        console.error(error)
        setContentError('Unable to load content.')
      } finally {
        setLoadingContent(false)
      }
    }

    loadContent()
  }, [])


  // ==========================================================
  // Load Surveys
  // ==========================================================

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


  // ==========================================================
  // Survey Navigation
  // ==========================================================

  const openSurvey = (path: string) => {
    window.open(
      `https://localhost:44343${path}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <div className={styles.homeContainer}>


      {/* ======================================================
          Hero / Search
          ====================================================== */}

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


      {/* ======================================================
          About / Feature Cards
          ====================================================== */}

      <section className={styles.aboutSection}>
        <div className={styles.aboutContent}>

          <div className={styles.infoGrid}>

            {/* Explore Resources */}
            <div className={styles.infoCard}>
              <div className={`${styles.iconCircle} ${styles.resourceIcon}`}>
                <i className="bx bx-book-open"></i>
              </div>

              <h3>Explore Resources</h3>

              <p>
                Access guides, articles, and tools to better understand heart failure.
              </p>
            </div>

            {/* Take Surveys */}
            <div className={styles.infoCard}>
              <div className={`${styles.iconCircle} ${styles.surveyIcon}`}>
                <i className="bx bx-edit"></i>
              </div>

              <h3>Take Surveys</h3>

              <p>
                Share your experiences to support better heart failure research and care.
              </p>
            </div>

            {/* Join Our Community */}
            <div className={styles.infoCard}>
              <div className={`${styles.iconCircle} ${styles.communityIcon}`}>
                <i className="bx bx-group"></i>
              </div>

              <h3>Join Our Community</h3>

              <p>
                Learn, share experiences, and connect with others.
              </p>
            </div>

            {/* Make an Impact */}
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


      {/* ======================================================
          Featured Resouces
          ====================================================== */}

      <section className={styles.resourcesSection}>
        <div className={styles.resourcesContent}>

          {/* Section Header */}
          <div className={styles.resourcesTitleBox}>

            <div className={styles.resourcesTitleText}>
              <h2>Featured Resources</h2>

              <p>
                Guides, articles, and tools to better understand heart failure.
              </p>
            </div>

            <Link
              to="/resources"
              className={styles.viewAllResourcesLink}
            >
              View All Resources →
            </Link>

          </div>

          {/* Resource Cards */}
          <div className={styles.resourceGrid}>

            {content.slice(0, 3).map((content) => (

              <div
                className={styles.resourceCard}
                key={content.id}
              >

                {/* Resource Header */}
                <div className={styles.resourceHeader}>

                  <span className={styles.resourceType}>
                    Article
                  </span>

                </div>

                {/* Resource Information */}
                <h3 className={styles.resourceName}>
                  {content.name}
                </h3>

                <p className={styles.resourceDescription}>
                  {content.overview}
                </p>

                {/* Resource Details */}
                <div className={styles.resourceDetails}>

                  <div>
                    <span>Category</span>

                    <strong>
                      {content.category}
                    </strong>
                  </div>

                  <div>
                    <span>Created</span>

                    <strong>
                      {new Date(content.updated).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>

                  <div>
                    <span>Updated</span>

                    <strong>
                      {new Date(content.updated).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>

                  <div>
                    <span>Author</span>

                    <strong>
                      {content.author}
                    </strong>
                  </div>

                </div>

                {/* Resource Action */}
                <button className={styles.viewResourceButton} onClick={() => navigate(`/article${content.path}`)}>  View Resource → </button>
              </div>

            ))}

          </div>
        </div >
      </section >

      {/* ======================================================
          Featured Surveys
          ====================================================== */}

      < section className={styles.surveysSection} >
        <div className={styles.surveysContent}>

          {/* Section Header */}
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

          {/* Survey Cards */}
          <div className={styles.surveyGrid}>

            {surveys.slice(0, 3).map((survey) => (

              <div
                className={styles.surveyCard}
                key={survey.id}
              >

                {/* Survey Header */}
                <div className={styles.surveyHeader}>

                  <span className={styles.surveyType}>
                    Survey
                  </span>

                  <span className={styles.surveyStatus}>
                    Open
                  </span>

                </div>

                {/* Survey Information */}
                <h3 className={styles.surveyName}>
                  {survey.name}
                </h3>

                <p className={styles.surveyDescription}>
                  {survey.description}
                </p>

                {/* Survey Details */}
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

                {/* Survey Action */}
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
      </section >


    </div >
  )
}

export default Home
