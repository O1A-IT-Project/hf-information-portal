import styles from './Register.module.css'
import axios from 'axios'
import { api } from '../api'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { Dispatch, SetStateAction } from 'react'

import type { User } from '../App'

type Props = {
  setUser: Dispatch<SetStateAction<User | null>>
}

function Login({ setUser }: Props) {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        alert('Please enter email and password')
        return
      }

      const response = await api.post('/api/auth/signin', {
        email,
        password,
      })

      if (response.data.success) {
        setUser(response.data.data.user)

        navigate('/')
      }
    } catch (error: unknown) {
      console.error(error)

      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Login failed')
      } else {
        alert('Login failed')
      }
    }
  }

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <button className={styles.underlinedBtn} onClick={() => navigate('/')}>
          ⏎Back to portal
        </button>
        <h2>LOG IN</h2>

        <div className={styles.registerForm}>
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
              <button className={styles.underlinedBtn}>Forgot password?</button>
            </div>
          </div>

          <button className={styles.registerBtn} onClick={handleLogin}>
            Log In
          </button>

          <div className={styles.redirect}>
            <p>Don't have an account?</p>

            <button className={styles.underlinedBtn} onClick={() => navigate('/register')}>
              Create One
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
