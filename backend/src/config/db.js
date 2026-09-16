import sql from 'mssql'
import dotenv from 'dotenv'

dotenv.config()

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 1433),

  options: {
    encrypt: true,
    trustServerCertificate: true,
  },

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },

  connectionTimeout: 10000,
  requestTimeout: 10000,
}

let pool = null

const connectDB = async () => {
  try {
    if (pool?.connected) {
      return pool
    }

    console.log('Attempting DB connection...')

    pool = await sql.connect(config)

    console.log('Connected to SQL Server')

    return pool
  } catch (error) {
    console.error('Database connection failed:', error.message)
    throw new Error('Database connection failed')
  }
}

const disconnectDB = async () => {
  try {
    if (pool) {
      await pool.close()
      console.log('Disconnected from SQL Server')
      pool = null
    }
  } catch (error) {
    console.error('Error closing database connection:', error.message)
  }
}

export { sql, connectDB, disconnectDB }
