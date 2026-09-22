import { Link } from 'react-router-dom'

import styles from './Footer.module.css'

import logo from '../assets/logo.png'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Brand */}
        <div className={styles.brandSection}>
          <Link to="/" className={styles.logoLink}>
            <img src={logo} alt="HF Information Portal" className={styles.logo} />
          </Link>

          <p>
            Heart failure information and healthcare resources for patients, clinicians and
            healthcare organisations.
          </p>
        </div>

        {/* Explore */}
        <nav className={styles.linkSection} aria-label="Footer navigation">
          <h3>Explore</h3>

          <Link to="/search">Resources</Link>

          <Link to="/find-clinic">Find a Clinic</Link>
        </nav>

        {/* Support */}
        <div className={styles.linkSection}>
          <h3>Support</h3>

          <a href="https://ceih.sa.gov.au/contact-us" target="_blank" rel="noopener noreferrer">
            Contact CEIH
          </a>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>© {currentYear} Heart Failure Information Portal</p>
      </div>
    </footer>
  )
}

export default Footer
