import { useEffect, useState } from 'react'
import { getForms } from '../services/umbraco'

import styles from './Survey.module.css'

type Survey = {
  id: string
  name: string
  createdBy: number
  created: string
  updated: string
}

export default function SurveyList() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getForms()
      .then(setSurveys)
      .catch(err => setError(err.message))
  }, [])

  const openSurvey = (formId: string) => {
    window.location.href =
      `https://localhost:44343/surveys/?formId=${formId}`
  }

  if (error) {
    return <p>Error: {error}</p>
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
      placeholder="Search surveys..."
    />

    <button className={styles.searchButton}>
      Search
    </button>
  </div>
</div>

<div className={styles.categoryButtons}>
  <button className={`${styles.categoryButton} ${styles.active}`}>
  All
</button>
  <button className={styles.categoryButton}>Heart Disease</button>
  <button className={styles.categoryButton}>Education</button>
  <button className={styles.categoryButton}>Nutrition</button>
  <button className={styles.categoryButton}>Physical Wellbeing</button>
</div>

  <div className={styles.surveyGrid}>

    {surveys.map((survey) => (
      <div className={styles.surveyCard} key={survey.id}>

        <div className={styles.surveyHeader}>
          <div>
            <p className={styles.organisationLabel}>Created By</p>
            <h3 className={styles.organisationName}>Organisation Name</h3>
          </div>

          <span className={styles.surveyStatus}>Open</span>
        </div>

        <h2 className={styles.surveyName}>
          {survey.name}
        </h2>

        <p className={styles.surveyDescription}>
          Complete this survey and provide your feedback.
          Your response helps improve our services.
        </p>

        <div className={styles.surveyDetails}>

          <div>
            <span>Recipient</span>
            <strong>
              patients
            </strong>
          </div>

          <div>
            <span>Created</span>
            <strong>
              {new Date(survey.created).toLocaleDateString()}
            </strong>
          </div>

          <div>
            <span>Updated</span>
            <strong>
              {new Date(survey.updated).toLocaleDateString()}
            </strong>
          </div>

        </div>

        <button
          className={styles.takeSurveyButton}
          onClick={() => openSurvey(survey.id)}
        >
          Take Survey →
        </button>

      </div>
    ))}

  </div>

</div>

  )
}

