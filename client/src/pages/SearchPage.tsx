
import type { User } from '../App'

import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getForms, getContent } from '../services/umbraco'

import styles from "./SearchPage.module.css";

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

function SearchPage() {

  const [content, setContent] = useState<Content[]>([])
  const [loadingContent, setLoadingContent] = useState(true)
  const [contentError, setContentError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [sortOrder, setSortOrder] = useState('latest')

  // ==========================================================
  // Load Content
  // ==========================================================

  useEffect(() => {

    const loadContent = async () => {
      try {
        const data = await getContent()

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
  // Get Categories
  // ==========================================================

  const categories = [
    'All',
    ...new Set(
      content
        .map((content) => content.category?.trim())
        .filter((category): category is string => Boolean(category))
    ),
  ]

  // ==========================================================
  // Get Types
  // ==========================================================

  const types = [
    'All',
    ...new Set(
      content
        .map((content) => content.type?.trim())
        .filter((type): type is string => Boolean(type))
    ),
  ]


  // ==========================================================
  // Filter Content
  // ==========================================================

  const filteredContent = content.filter((content) => {
    const matchesTitle = content.name
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())

    const matchesCategory =
      selectedCategory === 'All' ||
      content.category?.trim() === selectedCategory

    const matchesType =
      selectedType === 'All' ||
      content.type?.trim() === selectedType

    return matchesTitle && matchesCategory && matchesType
  })
    .sort((a, b) => {
      const dateA = new Date(a.created).getTime()
      const dateB = new Date(b.created).getTime()

      return sortOrder === 'latest'
        ? dateB - dateA
        : dateA - dateB
    })

  return (
    <div className={styles.resourcesContainer}>
      <div className={styles.resourcesTitleBox}>
        <h1>Available Resources</h1>
      </div>

      <div className={styles.searchGroup}>
        <input
          type="text"
          placeholder="Search content by title..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            // setCurrentPage(1)
          }}
          aria-label="Search surveys by title"
        />

        <button
          type="button"
          className={styles.searchButton}
          onClick={() => {
            setSearchTerm(searchTerm.trim())
            // setCurrentPage(1)
          }}
        >
          Search
        </button>
      </div>
      <div className={styles.filtersContainer}>
        <div className={styles.dropdown}>
          <label htmlFor="surveyCategory">Filter by Category:</label>

          <select
            id="surveyCategory"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              // setCurrentPage(1)
            }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.dropdown}>
          <label htmlFor="surveyCategory">Filter by Type:</label>

          <select
            id="surveyCategory"
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value)
              // setCurrentPage(1)
            }}
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.dropdown}>
          <label htmlFor="sortOrder">Sort by Date:</label>

          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="latest">Latest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {loadingContent && <p>Loading surveys...</p>}

        {contentError && <p role="alert">{contentError}</p>}

        {!loadingContent && !contentError && content.length === 0 && (
          <p>No content available at the moment.</p>
        )}

        {!loadingContent &&
          !contentError &&
          content.length > 0 &&
          filteredContent.length === 0 && (
            <p>No content found matching "{searchTerm}".</p>
          )}

        {!loadingContent &&
          !contentError &&
          filteredContent.map((content) => (

            <div key={content.id}>
              <h2>{content.name}</h2>
              <p>{content.overview}</p>
              <p>{content.author}</p>
              <p>{new Date(content.updated).getFullYear()}</p>
              <p>{new Date(content.type).getFullYear()}</p>
            </div>
          ))}
      </div>
    </div>


  );


}

export default SearchPage;
