import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRoutes from './routes/authRoutes.js'

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://hf-information-portal.vercel.app',
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

// Health check
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'HF Information Portal API is running',
  })
})

// Routes
app.use('/api/auth', authRoutes)

export default app