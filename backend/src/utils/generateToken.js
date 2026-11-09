import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

// Create a JWT containing the user's identity claims and store it in the response cookie.
export const generateToken = (userId, fullName, email, res) => {
  // These claim names must match the fields read by the Umbraco Member Controller.
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
