import { useEffect, useState } from 'react'
import { getForms } from '../services/umbraco'

import styles from './Survey.module.css'

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

export default function SurveyList() {

  // ==========================================================
  // State
  // ==========================================================

  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loadingSurveys, setLoadingSurveys] = useState(true)
  const [surveyError, setSurveyError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

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
  // Get Categories
  // ==========================================================

  const categories = [
    'All',
    ...new Set(
      surveys
        .map((survey) => survey.category?.trim())
        .filter((category): category is string => Boolean(category))
    ),
  ]

  // ==========================================================
  // Filter Surveys
  // ==========================================================
  const filteredSurveys = surveys.filter((survey) => {
    const matchesTitle = survey.name
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())

    const matchesCategory =
      selectedCategory === 'All' ||
      survey.category?.trim() === selectedCategory

    return matchesTitle && matchesCategory
  })

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

    <div className={styles.surveysContainer}>

      <div className={styles.surveysTitleBox}>
        <h1>Available Surveys</h1>
      </div>

      <div className={styles.searchForm}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Search surveys by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search surveys by title"
          />

          <button
            type="button"
            className={styles.searchButton}
            onClick={() => setSearchTerm(searchTerm.trim())}
          >
            Search
          </button>
        </div>
      </div>

      <div className={styles.categoryDropdown}>
        <label htmlFor="surveyCategory">Filter by category:</label>

        <select
          id="surveyCategory"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.surveyGrid}>
        {loadingSurveys && <p>Loading surveys...</p>}

        {surveyError && <p role="alert">{surveyError}</p>}

        {!loadingSurveys && !surveyError && surveys.length === 0 && (
          <p>No surveys available at the moment.</p>
        )}

        {!loadingSurveys &&
          !surveyError &&
          surveys.length > 0 &&
          filteredSurveys.length === 0 && (
            <p>No surveys found matching "{searchTerm}".</p>
          )}

        {!loadingSurveys &&
          !surveyError &&
          filteredSurveys.slice(0, 3).map((survey) => (


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

  )
}

