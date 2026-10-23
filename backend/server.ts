import dotenv from 'dotenv'
dotenv.config()

// Must come after dotenv.config() so NODE_ENV is available,
// and before any routes/modules that might make HTTPS calls
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  console.log("NODE_TLS_REJECT_UNAUTHORIZED = '0'")
}

import app from './src/app.ts'
import {
  connectDB,
  disconnectDB,
} from './src/config/db.js'

const port = Number(process.env.PORT) || 3000

const startServer = async () => {
  try {
    await connectDB()
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })

    return server
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

const server = await startServer()

// Handle unhandled promise rejections
process.on('unhandledRejection', async err => {
  console.error('Unhandled Rejection:', err)

  server.close(async () => {
    await disconnectDB()
    process.exit(1)
  })
})

// Handle uncaught exceptions
process.on('uncaughtException', async err => {
  console.error('Uncaught Exception:', err)

  server.close(async () => {
    await disconnectDB()
    process.exit(1)
  })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully.')

  server.close(async () => {
    await disconnectDB()
    process.exit(0)
  })
})