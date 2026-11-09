import express from 'express'

import {
  signup,
  signin,
  signout,
  getUser,
  applyForRole,
  getVerificationRequests,
  approveRequest,
  rejectRequest,
  updateUser,
  uploadProfileImage,
  getProfileImage,
  searchUser,
  updateManagedUserRoles,
  getAdmins,
} from '../controllers/authController.js'

import { authenticateToken } from '../middlewares/authenticateToken.js'

import { requireAdmin } from '../middlewares/requireAdmin.js'

import upload from '../middlewares/upload.js'

// Create an Express router for authentication-related routes
const router = express.Router()

// Authentication
router.post('/signup', signup)

router.post('/signin', signin)

router.post('/signout', signout)

// Current user
router.get('/me', authenticateToken, getUser)

router.patch('/me', authenticateToken, updateUser)

router.patch(
  '/me/profile-image',
  authenticateToken,
  upload.single('profileImage'),
  uploadProfileImage
)

router.get('/profile-image/:userId', getProfileImage)

// Role applications
router.post('/apply', authenticateToken, applyForRole)

// Admin: verification requests
router.get('/verification-requests', authenticateToken, requireAdmin, getVerificationRequests)

router.post('/approve-request', authenticateToken, requireAdmin, approveRequest)

router.post('/reject-request', authenticateToken, requireAdmin, rejectRequest)

// Admin: user management
router.get('/users/search', authenticateToken, requireAdmin, searchUser)

router.patch('/users/:userId/roles', authenticateToken, requireAdmin, updateManagedUserRoles)

// Admin: current admins
router.get('/admins', authenticateToken, requireAdmin, getAdmins)

export default router
