import styles from './Login.module.css'
import axios from 'axios'

import type { Dispatch, SetStateAction } from 'react'
import type { User } from '../App'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'


// ============================================================
// Types
// ============================================================

type Props = {
  setUser: Dispatch<SetStateAction<User | null>>
}


// ============================================================
// Login Component
// ============================================================

function Login({ setUser }: Props) {
  const navigate = useNavigate()


  // ==========================================================
  // State
  // ==========================================================

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')


  // ==========================================================
  // Login
  // ==========================================================

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setErrorMessage('Please enter email and password')
        return
      }

      const response = await axios.post(
        'http://localhost:3000/api/auth/signin',
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      )

      if (response.data.success) {
        setUser(response.data.data.user)

        navigate('/')
      }
    } catch (error: unknown) {
      console.error(error)

      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || 'Login failed')
      } else {
        setErrorMessage('Login failed')
      }
    }
  }

  return (
    <div className={styles.loginContainer}>


      {/* ======================================================
          Login Card
          ====================================================== */}

      <div className={styles.loginCard}>

        <button
          className={styles.underlinedBtn}
          onClick={() => navigate('/')}
        >
          ⏎ Back to portal
        </button>

        <h2>Welcome back!</h2>

        <div className={styles.loginForm}>

          <div className={styles.formGroup}>
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <div className={styles.forgotDiv}>
              <button className={styles.underlinedBtn}>
                Forgot password?
              </button>
            </div>
          </div>

          {errorMessage && (
            <p className={styles.errorMessage}>
              {errorMessage}
            </p>
          )}

          <button
            className={styles.loginBtn}
            onClick={handleLogin}
          >
            Log In
          </button>

          <div className={styles.redirect}>
            <p>Don't have an account?</p>

            <button
              className={styles.underlinedBtn}
              onClick={() => navigate('/register')}
            >
              Create One
            </button>
          </div>

        </div>

      </div>


      {/* ======================================================
          Login Image
          ====================================================== */}

      <div className={styles.loginImage}>
        <img src="/plant.jpg" alt="Login" />
      </div>



    </div>
  );
}

export default Login
