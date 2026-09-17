import type { User } from '../App'
import type { Dispatch, SetStateAction } from 'react'

import { Link, NavLink, useNavigate } from 'react-router-dom'

import axios from 'axios'

import styles from './Navbar.module.css'

type Props = {
  user: User | null
  setUser: Dispatch<SetStateAction<User | null>>
}

function Navbar({ user, setUser }: Props) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:3000/api/auth/signout',
        {},
        {
          withCredentials: true,
        }
      )

      setUser(null)

      navigate('/')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>

        {/* Logo */}
        <a href="/" className={styles.logo}>
          <i className={`bx bx-home-heart ${styles.logoIcon}`}></i>

          <div className={styles.logoText}>
            <span className={styles.logoTitle}>Heart Information Portal</span>
            <span className={styles.logoOrg}>Commission on Excellence and Innovation in Health</span>
          </div>
        </a>

        {/* Links */}

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

        {/* Right Side */}
        <div className={styles.navActions}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search..."
            />
            <button className={styles.searchBtn}>
              <i className="bx bx-search"></i>
            </button>
          </div>

          {/* Login/Profile */}
          {user ? (
            <>
              <Link to="/profile" className={styles.hi}>
                Hi, {user.firstName}
              </Link>

              <button className={styles.login} onClick={handleLogout}>
                Logout
              </button>
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
