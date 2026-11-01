
import type { User } from '../App'

import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getContent } from '../services/umbraco'

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

  const navigate = useNavigate()
  const location = useLocation()

  // ==========================================================
  // State
  // ==========================================================

  const [content, setContent] = useState<Content[]>([])
  const [loadingContent, setLoadingContent] = useState(true)
  const [contentError, setContentError] = useState('')

  const [searchTerm, setSearchTerm] = useState(
    location.state?.searchTerm || ''
  )
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [sortOrder, setSortOrder] = useState('latest')

  const [visitedContent, setVisitedContent] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('visitedContent') || '[]')
  })

  const [currentPage, setCurrentPage] = useState(1)
  const contentPerPage = 5


  useEffect(() => {
    const state = location.state as { searchTerm?: string } | null

    if (state?.searchTerm !== undefined) {
      setSearchTerm(state.searchTerm)
    }
  }, [location.key, location.state])


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

  // ==========================================================
  // content Page
  // ==========================================================

  const totalPages = Math.ceil(
    filteredContent.length / contentPerPage
  )

  const startIndex = (currentPage - 1) * contentPerPage

  const paginatedContent = filteredContent.slice(
    startIndex,
    startIndex + contentPerPage
  )

  // ==========================================================
  // Visited Content
  // ==========================================================
  const handleContentClick = (id: string, path: string) => {
    const updatedVisited = [...new Set([...visitedContent, id])]

    setVisitedContent(updatedVisited)
    localStorage.setItem('visitedContent', JSON.stringify(updatedVisited))

    navigate(`/content${path}`)
  }

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
          paginatedContent.map((content) => (
            <div key={content.id} className={styles.contentCard}>
              <h2
                className={`${styles.contentTitle} ${visitedContent.includes(content.id) ? styles.visited : ''
                  }`}
                onClick={() => handleContentClick(content.id, content.path)}
              >
                {content.name}
              </h2>

              <p>{content.overview}</p>

              <div className={styles.contentInformation}>
                <p>Author: {content.author}</p>
                <p>Type: {content.type}</p>
                <p>Publishing Date: {new Date(content.updated).getFullYear()}</p>
              </div>
            </div>
          ))}
      </div>

      {/* Content Page navigation */}
      {!loadingContent &&
        !contentError &&
        totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageButton}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                type="button"
                key={page}
                className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''
                  }`}
                aria-current={currentPage === page ? 'page' : undefined}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className={styles.pageButton}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Next
            </button>
          </div>
        )}
    </div>

  );

}

export default SearchPage;
