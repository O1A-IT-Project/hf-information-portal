import { getUserRoles } from '../models/userModel.js'

// Middleware to require admin role for certain routes
const requireAdmin = async (req, res, next) => {
  try {
    const roles = await getUserRoles(req.user.userId)

    if (!roles.includes('admin')) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Admin access required',
      })
    }

    next()
  } catch (error) {
    console.error('Admin authorisation error:', error)

    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to verify admin access',
    })
  }
}

export { requireAdmin }
