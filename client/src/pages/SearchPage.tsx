
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

      <div className={styles.categoryDropdown}>
        <label htmlFor="surveyCategory">Filter by category:</label>

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

      <div className={styles.typeDropdown}>
        <label htmlFor="surveyCategory">Filter by type:</label>

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
    </div>


  );


}

export default SearchPage;
