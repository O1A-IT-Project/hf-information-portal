import styles from './Navbar.module.css'

import type { User, Role } from '../App'
import type { Dispatch, SetStateAction } from 'react'

import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../api'

// ============================================================
// Types
// ============================================================

type Props = {
  user: User | null
  setUser: Dispatch<SetStateAction<User | null>>
  activeRole: Role | null
  onRoleChange: (role: Role) => void
}

// ============================================================
// Navbar Component
// ============================================================

function Navbar({ user, setUser, activeRole, onRoleChange }: Props) {
  const navigate = useNavigate()

  const handleSearch = (type: 'survey' | 'resources') => {
    const route = type === 'survey' ? '/survey' : '/search'

    navigate(route, {
      state: { searchTerm },
    })

    setShowSuggestions(false)
  }

  // ==========================================================
  // State
  // ==========================================================

  const [menuOpen, setMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // ==========================================================
  // Logout
  // ==========================================================

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/signout')

      sessionStorage.removeItem('activeRole')

      setUser(null)

      navigate('/')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  const formatRole = (role: Role) => {
    if (role === 'custodian') {
      return 'Content Custodian'
    }

    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* ======================================================
          Logo & Title
          ====================================================== */}
        <a href="/" className={styles.logo}>
          <i className={`bx bx-donate-heart ${styles.logoIcon}`}></i>

          <div className={styles.logoText}>
            <span className={styles.logoTitle}>Heart Failure Information Portal</span>
            <span className={styles.logoOrg}>
              Commission on Excellence and Innovation in Health
            </span>
          </div>
        </a>

        {/* ======================================================
          Links
          ====================================================== */}

        <div className={styles.navLinks}>
          <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Home
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            Resources
          </NavLink>

          <NavLink
            to="/survey"
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            Surveys
          </NavLink>

          <NavLink
            to="/find-clinic"
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            Find a Clinic
          </NavLink>

          <a href="https://ceih.sa.gov.au/contact-us" target="_blank" rel="noopener noreferrer">
            About Us
          </a>

          {activeRole === 'admin' && (
            <NavLink
              to="/admin_panel"
              className={({ isActive }) => (isActive ? styles.active : undefined)}
            >
              Admin Dashboard
            </NavLink>
          )}

          {activeRole === 'clinician' && (
            <NavLink
              to="/ClinicianOnly"
              className={({ isActive }) => (isActive ? styles.active : undefined)}
            >
              Clinician Dashboard
            </NavLink>
          )}
        </div>

        <div className={styles.navActions}>
          {/* ======================================================
          Search
          ====================================================== */}
          <div className={styles.searchBarContainer}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value)
                  setShowSuggestions(e.target.value.trim().length > 0)
                }}
              />

              <button className={styles.searchBtn} onClick={() => handleSearch('resources')}>
                <i className="bx bx-search"></i>
              </button>
            </div>

            {showSuggestions && searchTerm.trim() && (
              <div className={styles.searchSuggestions}>
                <div className={styles.suggestionItem} onClick={() => handleSearch('resources')}>
                  <i className="bx bx-file"></i>
                  <div>
                    <strong>Search Resources</strong>
                    <p>Search resources for "{searchTerm}"</p>
                  </div>
                </div>

                <div className={styles.suggestionItem} onClick={() => handleSearch('survey')}>
                  <i className="bx bx-clipboard"></i>
                  <div>
                    <strong>Search Surveys</strong>
                    <p>Search surveys for "{searchTerm}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================
          Login & Register / Menu
          ====================================================== */}
          {user ? (
            <>
              <div className={styles.profileMenu}>
                <button className={styles.menuButton} onClick={() => setMenuOpen(!menuOpen)}>
                  <i className="bx bx-user-circle"></i>
                </button>
                // Role switcher is only shown when user has multiple assigned roles. Selecting a
                role changes the current portal view but does not change the roles stored for the
                user in the database
                {menuOpen && (
                  <div className={styles.dropdown}>
                    {activeRole && (user.roles?.length ?? 0) > 1 && (
                      <div className={styles.roleSwitcher}>
                        <div className={styles.roleSwitcherHeader}>
                          <span className={styles.roleSwitcherLabel}>Viewing as </span>
                          // fortmatRole converts role names in the database into user-friendly
                          labels for the interface.
                          <span className={styles.activeRoleBadge}>{formatRole(activeRole)}</span>
                        </div>

                        <select
                          className={styles.roleSelect}
                          value={activeRole}
                          onChange={event => {
                            onRoleChange(event.target.value as Role)
                            setMenuOpen(false)
                          }}
                        >
                          {(user.roles ?? []).map(role => (
                            <option key={role} value={role}>
                              {formatRole(role)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>
                      <i className="bx bx-user"></i>
                      <span>Profile</span>
                    </Link>

                    <Link to="/apply-role" onClick={() => setMenuOpen(false)}>
                      <i className="bx bx-bell"></i>
                      <span>Notification</span>
                    </Link>

                    <Link to="/apply-role" onClick={() => setMenuOpen(false)}>
                      <i className="bx bx-bookmark"></i>
                      <span>Bookmark</span>
                    </Link>

                    <Link to="/apply-role" onClick={() => setMenuOpen(false)}>
                      <i className="bx bx-history"></i>
                      <span>History</span>
                    </Link>

                    <Link to="/apply-role" onClick={() => setMenuOpen(false)}>
                      <i className="bx bx-file"></i>
                      <span>Apply for a Role</span>
                    </Link>

                    <button onClick={handleLogout}>
                      <i className="bx bx-log-out"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.login}>
                Login
              </Link>

              <Link to="/register" className={styles.register}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
