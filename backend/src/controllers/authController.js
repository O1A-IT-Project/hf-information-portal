import bcrypt from 'bcryptjs'

import {
  userExists,
  createUser,
  getHashedPasswordByEmail,
  getUserByEmail,
  getUserRoles,
  createRoleApplication,
  getPendingVerificationRequests,
  getPendingVerificationRequestsByUserId,
  approveRoleApplication,
  rejectRoleApplication,
  updateUserById,
  updateProfileImage,
  getProfileImageById,
  getManagedUserByEmail,
  replaceUserRoles,
  getUsersByRole,
} from '../models/userModel.js'

import { generateToken } from '../utils/generateToken.js'
import { detectImageMimeType } from '../utils/detectImageMimeType.js'

// Create normal patient account
const signup = async (req, res) => {
  const { email, firstName, lastName, password } = req.body

  // Simple validation
  if (!email || !firstName || !lastName || !password) {
    return res.status(400).json({
      error: 'INVALID_INPUT',
      message: 'All fields are required',
    })
  }

  try {
    // Check if user exists
    const existingUser = await userExists(email)

    if (existingUser) {
      return res.status(409).json({
        error: 'USER_ALREADY_EXISTS',
        message: 'An account with this email already exists.',
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)

    const hashedPassword = await bcrypt.hash(password, salt)

    // Prepare user data
    const userData = {
      email,
      firstName,
      lastName,
      hashedPassword,
    }

    // Create user
    const userId = await createUser(userData)

    // Generate JWT
    const token = generateToken(user.userId, `${user.firstName} ${user.lastName}`, res)

    // Ensure Umbraco Member record exists
    try {
      const memberResponse = await fetch(
        "https://localhost:44343/umbraco/api/members/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!memberResponse.ok) {
        const errorData = await memberResponse.json().catch(() => null);
        console.error("Failed to sync Umbraco member:", errorData);
        // decide: fail the login, or let it succeed and retry sync later?
      }
    } catch (err) {
      console.error("Error reaching Umbraco:", err);
    }

    // Return response
    return res.status(201).json({
      success: true,

      user: {
        id: userId,
        email,
        firstName,
        lastName,
        roles: ['patient'],
      },
    })
  } catch (error) {
    console.error('Sign-up error:', error)

    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Something went wrong',
    })
  }
}

// Handle sign-in
const signin = async (req, res) => {
  const { email, password } = req.body

  // Simple validation
  if (!email || !password) {
    return res.status(400).json({
      error: 'MISSING_CREDENTIALS',
      message: 'Email and password are required',
    })
  }

  try {
    // Check if user exists
    const user = await getUserByEmail(email)

    if (!user) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, await getHashedPasswordByEmail(email))

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      })
    }

    // Get approved roles
    const roles = await getUserRoles(user.userId)
    const pendingApplications = await getPendingVerificationRequestsByUserId(user.userId)

    // Generate JWT
    const token = generateToken(user.userId, `${user.firstName} ${user.lastName}`, res)

    // Ensure Umbraco Member record exists
    try {
      const memberResponse = await fetch(
        "https://localhost:44343/umbraco/api/members/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

if (!memberResponse.ok && memberResponse.status !== 409) {
        const errorData = await memberResponse.json().catch(() => null);
        console.error("Failed to sync Umbraco member:", errorData);
        // decide: fail the login, or let it succeed and retry sync later?
      }
    } catch (err) {
      console.error("Error reaching Umbraco:", err);
    }

    // Return successful response
    res.status(200).json({
      success: true,

      data: {
        user: {
          id: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles,
          pendingApplications,
        },
      },
    })
  } catch (error) {
    console.error('Sign-in error:', error)

    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Something went wrong',
    })
  }
}

// Handle sign-out
const signout = async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  })

  res.status(200).json({
    success: true,
  })
}

// Return authenticated user
const getUser = async (req, res) => {
  try {
    const roles = await getUserRoles(req.user.userId)

    const pendingApplications = await getPendingVerificationRequestsByUserId(req.user.userId)

    res.json({
      id: req.user.userId,

      email: req.user.email,

      firstName: req.user.firstName,

      lastName: req.user.lastName,

      roles,

      pendingApplications,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to load user',
    })
  }
}

// Update authenticated user's profile
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body

    if (!firstName && !lastName && !email) {
      return res.status(400).json({
        message: 'At least one field is required',
      })
    }

    const updatedUser = await updateUserById(req.user.userId, {
      firstName,
      lastName,
      email,
    })

    res.status(200).json({
      success: true,

      user: {
        id: updatedUser.userId,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        roles: updatedUser.roles,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(400).json({
      message: error.message,
    })
  }
}

// Upload/replace authenticated user's profile image
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No image file provided',
      })
    }

    await updateProfileImage(req.user.userId, req.file.buffer)

    res.status(200).json({
      success: true,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to upload image',
    })
  }
}

// Serve a user's profile image
const getProfileImage = async (req, res) => {
  try {
    const imageBuffer = await getProfileImageById(req.params.userId)

    if (!imageBuffer) {
      return res.status(404).json({
        message: 'No profile image set',
      })
    }

    const mimeType = detectImageMimeType(imageBuffer) || 'image/jpeg'

    res.set('Content-Type', mimeType)
    res.set('Cache-Control', 'no-cache')
    res.send(imageBuffer)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to load image',
    })
  }
}

// Apply for additional role
const applyForRole = async (req, res) => {
  try {
    const { requestedRole, verificationData } = req.body

    if (!requestedRole) {
      return res.status(400).json({
        message: 'Requested role is required',
      })
    }

    await createRoleApplication(req.user.userId, requestedRole, verificationData)

    res.status(201).json({
      success: true,
      message: 'Role application submitted',
    })
  } catch (error) {
    console.error(error)

    return res.status(400).json({
      message: error.message,
    })
  }
}

// Return pending role applications
const getVerificationRequests = async (req, res) => {
  try {
    const requests = await getPendingVerificationRequests()

    const parsedRequests = requests.map(request => ({
      ...request,

      verificationData: JSON.parse(request.verificationData || '{}'),
    }))

    res.status(200).json(parsedRequests)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch requests',
    })
  }
}

// Approve role application
const approveRequest = async (req, res) => {
  try {
    const { applicationId } = req.body

    if (!applicationId) {
      return res.status(400).json({
        message: 'Application ID is required',
      })
    }

    await approveRoleApplication(applicationId, req.user.userId)

    res.status(200).json({
      success: true,
      message: 'Application approved',
    })
  } catch (error) {
    console.error(error)

    res.status(400).json({
      message: error.message,
    })
  }
}

// Reject role application
const rejectRequest = async (req, res) => {
  try {
    const { applicationId } = req.body

    if (!applicationId) {
      return res.status(400).json({
        message: 'Application ID is required',
      })
    }

    await rejectRoleApplication(applicationId, req.user.userId)

    res.status(200).json({
      success: true,
      message: 'Application rejected',
    })
  } catch (error) {
    console.error(error)

    res.status(400).json({
      message: error.message,
    })
  }
}

// Admin: search registered user by email
const searchUser = async (req, res) => {
  try {
    const { email } = req.query

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        message: 'Email is required',
      })
    }

    const user = await getManagedUserByEmail(email.trim())

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    return res.status(200).json(user)
  } catch (error) {
    console.error('User search error:', error)

    return res.status(500).json({
      message: 'Failed to search for user',
    })
  }
}

// Admin: replace a user's roles
const updateManagedUserRoles = async (req, res) => {
  try {
    const { userId } = req.params
    const { roles } = req.body

    if (!Array.isArray(roles)) {
      return res.status(400).json({
        message: 'Roles must be an array',
      })
    }

    const allowedRoles = ['admin', 'doctor', 'clinician', 'pharmacy', 'custodian']

    const invalidRoles = roles.filter(role => !allowedRoles.includes(role))

    if (invalidRoles.length > 0) {
      return res.status(400).json({
        message: `Invalid role: ${invalidRoles.join(', ')}`,
      })
    }

    const isCurrentUser =
      req.user.userId.toString().toLowerCase() === userId.toString().toLowerCase()

    // Get the current roles of the account being edited
    const targetRoles = await getUserRoles(userId)

    /*
      Administrators cannot modify another
      administrator's roles.
    */
    if (targetRoles.includes('admin') && !isCurrentUser) {
      return res.status(403).json({
        message: 'You cannot modify another administrator.',
      })
    }

    /*
      Administrators may modify their own secondary
      roles but cannot remove their own Admin role.
    */
    if (isCurrentUser && targetRoles.includes('admin') && !roles.includes('admin')) {
      return res.status(400).json({
        message: 'You cannot remove your own admin role.',
      })
    }

    const updatedUser = await replaceUserRoles(userId, roles, req.user.userId)

    return res.status(200).json(updatedUser)
  } catch (error) {
    console.error('Role update error:', error)

    if (error.message === 'User not found') {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    return res.status(400).json({
      message: error.message,
    })
  }
}

// Admin: return current admins
const getAdmins = async (req, res) => {
  try {
    const admins = await getUsersByRole('admin')

    return res.status(200).json(admins)
  } catch (error) {
    console.error('Get admins error:', error)

    return res.status(500).json({
      message: 'Failed to load admins',
    })
  }
}

export {
  signup,
  signin,
  signout,
  getUser,
  updateUser,
  uploadProfileImage,
  getProfileImage,
  applyForRole,
  getVerificationRequests,
  approveRequest,
  rejectRequest,
  searchUser,
  updateManagedUserRoles,
  getAdmins,
}
