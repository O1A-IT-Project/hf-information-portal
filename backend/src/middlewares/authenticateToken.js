import jwt from 'jsonwebtoken'
import sql from 'mssql'
import { connectDB, disconnectDB } from '../config/db.js'
import dotenv from 'dotenv'
import { getUserById } from '../models/userModel.js'

dotenv.config()


// Middleware to authenticate JWT token from request headers or cookies
export const authenticateToken = async (req, res, next) => {
  console.log('Token Authentication check | authenticationToken.js')
  let token

  // Check if token exists
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1] // ["Bearer, "Token"];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return res.status(401).json({
      error: 'NO_TOKEN',
      message: 'No token provided',
    })
  }

  try {
    // Verify token and extract user details
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await getUserById(decoded.id)

    if (!user) {
      return res.status(401).json({
        error: 'USER_NOT_FOUND',
        message: 'User no longer exists',
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Token is invalid or expired',
    })
  }
}
