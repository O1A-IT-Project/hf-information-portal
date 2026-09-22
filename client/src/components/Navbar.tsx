import styles from './Navbar.module.css'
import axios from 'axios'

import type { User } from '../App'
import type { Dispatch, SetStateAction } from 'react'

import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'


// ============================================================
// Types
// ============================================================

type Props = {
  user: User | null
  setUser: Dispatch<SetStateAction<User | null>>
}


// ============================================================
// Navbar Component
// ============================================================

function Navbar({ user, setUser }: Props) {
  const navigate = useNavigate()

  // ==========================================================
  // State
  // ==========================================================

  const [menuOpen, setMenuOpen] = useState(false)


  // ==========================================================
  // Logout
  // ==========================================================

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/signout')

      setUser(null)

      navigate('/')
    } catch (error) {
      console.error('Logout failed', error)
    }
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
            <span className={styles.logoOrg}>Commission on Excellence and Innovation in Health</span>
          </div>
        </a>


        {/* ======================================================
          Links
          ====================================================== */}

        <div className={styles.navLinks}>

          <NavLink
            to="/"
            className={({ isActive }) => isActive ? styles.active : undefined}
          >
            Home
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) => isActive ? styles.active : undefined}
          >
            Resources
          </NavLink>

          <NavLink
            to="/survey"
            className={({ isActive }) => isActive ? styles.active : undefined}
          >
            Surveys
          </NavLink>

          <NavLink
            to="/find-clinic"
            className={({ isActive }) => isActive ? styles.active : undefined}
          >
            Find a Clinic
          </NavLink>


          <a href="https://ceih.sa.gov.au/contact-us" target="_blank" rel="noopener noreferrer">
            About Us
          </a>

          {user?.roles?.includes('admin') && (
            <NavLink
              to="/admin_panel"
              className={({ isActive }) => isActive ? styles.active : undefined}
            >
              Admin Dashboard
            </NavLink>
          )}

          {user?.roles?.includes('doctor') && (
            <NavLink
              to="/ClinicianOnly"
              className={({ isActive }) => isActive ? styles.active : undefined}
            >
              Clinician Dashboard
            </NavLink>
          )}
        </div>

        <div className={styles.navActions}>


          {/* ======================================================
          Search
          ====================================================== */}
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search..."
            />
            <button className={styles.searchBtn}>
              <i className="bx bx-search"></i>
            </button>
          </div>


          {/* ======================================================
          Login & Register / Menu
          ====================================================== */}
          {user ? (
            <>
              <div className={styles.profileMenu}>
                <button
                  className={styles.menuButton}
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <i className="bx bx-menu"></i>
                </button>

                {menuOpen && (
                  <div className={styles.dropdown}>
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>
                      <i className="bx bx-user"></i>
                      <span>Profile</span>
                    </Link>

                    <Link to="/apply-role" onClick={() => setMenuOpen(false)}>
                      <i className="bx bx-bookmark"></i>
                      <span>Bookmark</span>
                    </Link>

                    <Link to="/apply-role" onClick={() => setMenuOpen(false)}>
                      <i className="bx bx-history"></i>
                      <span>View History</span>
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
