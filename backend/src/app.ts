import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import notificationRoutes from './routes/notificationRoutes.js'

import authRoutes from './routes/authRoutes.js'

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/notifications', notificationRoutes)

export default app