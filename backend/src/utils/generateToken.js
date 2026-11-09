import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

// Utility function to generate a JWT token for a user and set it as an HTTP-only cookie in the response
export const generateToken = (userId, fullName, email, res) => {
  const payload = { id: userId, fullName: fullName, emailaddress: email, memberTypeAlias: "member" }
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  })

  return token
}
