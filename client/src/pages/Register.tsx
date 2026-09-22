import styles from './Register.module.css'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Dispatch, SetStateAction } from 'react'
import type { User } from '../App'

// import axios from 'axios'
import { api } from '../api'

type Props = {
  setUser: Dispatch<SetStateAction<User | null>>
}

function Register({ setUser }: Props) {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleRegister = async () => {
    try {
      if (!email || !firstName || !lastName || !password || !confirmPassword) {
        alert('Please fill in all fields')
        return
      }

      if (password !== confirmPassword) {
        alert('Passwords do not match')
        return
      }

      const response = await api.post('/api/auth/signup', {
        email,
        firstName,
        lastName,
        password,
      })

      if (response.data.success) {
        setUser(response.data.user)

        alert('Account created successfully')

        navigate('/')
      }
    } catch (error) {
      console.error(error)

      alert('Registration failed')
    }
  }

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <button className={styles.underlinedBtn} onClick={() => navigate('/')}>
          ⏎ Back to portal
        </button>

        <h2>Create Account</h2>

        <div className={styles.registerForm}>
          <div className={styles.formGroup}>
            <label>Email</label>

            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>First Name</label>

            <input
              type="text"
              placeholder="Enter your first name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Last Name</label>

            <input
              type="text"
              placeholder="Enter your last name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Confirm Password</label>

            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          <button className={styles.registerBtn} onClick={handleRegister}>
            Create Account
          </button>

          <div className={styles.redirect}>
            <p>Already have an account?</p>

            <button className={styles.underlinedBtn} onClick={() => navigate('/login')}>
              Return to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
