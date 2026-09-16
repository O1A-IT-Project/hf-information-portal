import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRoutes from './routes/authRoutes.js'
import { connectDB } from './config/db.js'

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',

  // Vercel domain
  'https://hf-information-portal.vercel.app',

  // Vercel deployment
  'https://hf-information-portal-hoq2y9zn8-timothieecantcodes-projects.vercel.app',
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        console.log('Blocked by CORS:', origin)
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Backend check
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'HF Information Portal API is running',
  })
})

// DB check
app.get('/api/db-health', async (_req, res) => {
  try {
    const pool = await connectDB()

    const result = await pool.request().query('SELECT 1 AS ok')

    res.status(200).json({
      database: 'connected',
      result: result.recordset,
    })
  } catch (error) {
    console.error('DB health check failed:', error)

    res.status(500).json({
      database: 'failed',
    })
  }
})


// Routes
app.use('/api/auth', authRoutes)

export default app