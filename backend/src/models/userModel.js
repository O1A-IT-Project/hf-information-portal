import sql from 'mssql'
import { connectDB } from '../config/db.js'

// Check if user exists
const userExists = async email => {
  try {
    const pool = await connectDB()

    const request = pool.request()

    request.input('Email', sql.VarChar, email)

    const result = await request.query(`
      SELECT 1
      FROM Users
      WHERE email = @Email
    `)

    return result.recordset.length > 0
  } catch (error) {
    console.error('Error checking user existence:', error)

    throw error
  }
}

// Return userId by email
const getUserIdByEmail = async email => {
  try {
    const pool = await connectDB()

    const request = pool.request()

    request.input('Email', sql.VarChar, email)

    const result = await request.query(`
      SELECT userId
      FROM Users
      WHERE email = @Email
    `)

    if (result.recordset.length === 0) {
      throw new Error('User not found')
    }

    return result.recordset[0].userId
  } catch (error) {
    console.error('Error getting userId by email:', error)

    throw error
  }
}

// Create user
const createUser = async userData => {
  const { email, firstName, lastName, hashedPassword } = userData

  if (!email || !firstName || !lastName || !hashedPassword) {
    throw new Error('Missing required user fields')
  }

  let transaction

  try {
    const pool = await connectDB()

    transaction = new sql.Transaction(pool)

    await transaction.begin()

    const request = new sql.Request(transaction)

    request.input('Email', sql.VarChar, email)

    request.input('FirstName', sql.VarChar, firstName)

    request.input('LastName', sql.VarChar, lastName)

    const result = await request.query(`
      INSERT INTO Users (
        email,
        firstName,
        lastName
      )
      OUTPUT INSERTED.userId
      VALUES (
        @Email,
        @FirstName,
        @LastName
      )
    `)

    const userId = result.recordset[0].userId

    await createUserCredentials(userId, hashedPassword, transaction)

    // Every user gets patient role
    await addUserRoles(userId, [1], transaction)

    await transaction.commit()

    return userId
  } catch (error) {
    console.error('Error creating user:', error)

    if (transaction) {
      await transaction.rollback()
    }

    throw error
  }
}

// Create user credentials
const createUserCredentials = async (userId, hashedPassword, transaction) => {
  try {
    if (!transaction) {
      throw new Error('Transaction is required')
    }

    const request = new sql.Request(transaction)

    request.input('UserId', sql.UniqueIdentifier, userId)

    request.input('HashedPassword', sql.VarChar, hashedPassword)

    await request.query(`
      INSERT INTO UserCredentials (
        userId,
        hashedPassword
      )
      VALUES (
        @UserId,
        @HashedPassword
      )
    `)
  } catch (error) {
    console.error('Error creating user credentials:', error)

    throw error
  }
}

// Return hashed password by email
const getHashedPasswordByEmail = async email => {
  try {
    const userId = await getUserIdByEmail(email)

    const pool = await connectDB()

    const request = pool.request()

    request.input('UserId', sql.UniqueIdentifier, userId)

    const result = await request.query(`
      SELECT hashedPassword
      FROM UserCredentials
      WHERE userId = @UserId
    `)

    if (result.recordset.length === 0) {
      throw new Error('User credentials not found')
    }

    return result.recordset[0].hashedPassword
  } catch (error) {
    console.error('Error getting password hash:', error)

    throw error
  }
}

// Return all approved roles
const getUserRoles = async userId => {
  try {
    const pool = await connectDB()

    const request = pool.request()

    request.input('UserId', sql.UniqueIdentifier, userId)

    const result = await request.query(`
      SELECT r.roleName
      FROM UsersRoles ur
      JOIN Roles r
      ON ur.roleId = r.roleId
      WHERE ur.userId = @UserId
    `)

    return result.recordset.map(role => role.roleName)
  } catch (error) {
    console.error('Error getting user roles:', error)

    throw error
  }
}

// Return user by id
const getUserById = async userId => {
  try {
    const pool = await connectDB()

    const request = pool.request()

    request.input('UserId', sql.UniqueIdentifier, userId)

    const result = await request.query(`
      SELECT *
      FROM Users
      WHERE userId = @UserId
    `)

    if (result.recordset.length === 0) {
      throw new Error('User not found')
    }

    const roles = await getUserRoles(userId)

    return {
      ...result.recordset[0],
      roles,
    }
  } catch (error) {
    console.error('Error getting user by id:', error)

    throw error
  }
}

// Add approved roles to user
const addUserRoles = async (userId, roleIds, existingTransaction = null) => {
  try {
    const pool = await connectDB()

    const transaction = existingTransaction || new sql.Transaction(pool)

    if (!existingTransaction) {
      await transaction.begin()
    }

    const roles = Array.isArray(roleIds) ? roleIds : [roleIds]

    for (const roleId of roles) {
      const checkRequest = new sql.Request(transaction)

      checkRequest.input('UserId', sql.UniqueIdentifier, userId)

      checkRequest.input('RoleId', sql.Int, roleId)

      const checkResult = await checkRequest.query(`
        SELECT *
        FROM UsersRoles
        WHERE userId = @UserId
        AND roleId = @RoleId
      `)

      if (checkResult.recordset.length === 0) {
        const insertRequest = new sql.Request(transaction)

        insertRequest.input('UserId', sql.UniqueIdentifier, userId)

        insertRequest.input('RoleId', sql.Int, roleId)

        await insertRequest.query(`
          INSERT INTO UsersRoles (
            userId,
            roleId
          )
          VALUES (
            @UserId,
            @RoleId
          )
        `)
      }
    }

    if (!existingTransaction) {
      await transaction.commit()
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error adding user roles:', error)

    throw error
  }
}

// Return user by email
const getUserByEmail = async email => {
  try {
    const pool = await connectDB()

    const request = pool.request()

    request.input('Email', sql.VarChar, email)

    const result = await request.query(`
      SELECT *
      FROM Users
      WHERE email = @Email
    `)

    if (result.recordset.length === 0) {
      return null
    }

    return result.recordset[0]
  } catch (error) {
    console.error('Error getting user by email:', error)

    throw error
  }
}

// Create role application
const createRoleApplication = async (userId, requestedRole, verificationData) => {
  try {
    const pool = await connectDB()

    // Check existing applications
    const pendingRequestDb = pool.request()

    pendingRequestDb.input('UserId', sql.UniqueIdentifier, userId)

    pendingRequestDb.input('RequestedRole', sql.VarChar, requestedRole)

    const existingApplication = await pendingRequestDb.query(`
        SELECT *
        FROM RoleApplications
        WHERE userId = @UserId
        AND requestedRole = @RequestedRole
        AND verificationStatus != 'rejected'
      `)

    if (existingApplication.recordset.length > 0) {
      throw new Error('Role already requested or assigned')
    }

    // Check approved roles
    const approvedRoleDb = pool.request()

    approvedRoleDb.input('UserId', sql.UniqueIdentifier, userId)

    approvedRoleDb.input('RequestedRole', sql.VarChar, requestedRole)

    const approvedRole = await approvedRoleDb.query(`
        SELECT *
        FROM UsersRoles ur
        JOIN Roles r
        ON ur.roleId = r.roleId
        WHERE ur.userId = @UserId
        AND r.roleName = @RequestedRole
      `)

    if (approvedRole.recordset.length > 0) {
      throw new Error('Role already assigned')
    }

    // Create application
    const insertRequestDb = pool.request()

    insertRequestDb.input('UserId', sql.UniqueIdentifier, userId)

    insertRequestDb.input('RequestedRole', sql.VarChar, requestedRole)

    insertRequestDb.input('VerificationStatus', sql.VarChar, 'pending')

    insertRequestDb.input(
      'VerificationData',
      sql.NVarChar(sql.MAX),
      JSON.stringify(verificationData || {})
    )

    await insertRequestDb.query(`
      INSERT INTO RoleApplications (
        userId,
        requestedRole,
        verificationStatus,
        verificationData
      )
      VALUES (
        @UserId,
        @RequestedRole,
        @VerificationStatus,
        @VerificationData
      )
    `)

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error creating role application:', error)

    throw error
  }
}

// Return pending applications
const getPendingVerificationRequests = async () => {
  try {
    const pool = await connectDB()

    const result = await pool.request().query(`
      SELECT
        ra.applicationId AS id,

        u.userId,
        u.email,
        u.firstName,
        u.lastName,

        ra.requestedRole,
        ra.verificationStatus,
        ra.verificationData

      FROM RoleApplications ra

      JOIN Users u
      ON ra.userId = u.userId

      WHERE ra.verificationStatus = 'pending'
    `)

    return result.recordset
  } catch (error) {
    console.error('Error getting pending requests:', error)

    throw error
  }
}

const getPendingVerificationRequestsByUserId = async userId => {
  try {
    const pool = await connectDB()

    const request = pool.request()

    request.input('UserId', sql.UniqueIdentifier, userId)

    const result = await request.query(`
      SELECT
        requestedRole,
        verificationStatus,
        verificationData
      FROM RoleApplications
      WHERE userId = @UserId
      AND verificationStatus != 'approved'
      AND requestedRole NOT IN (
        SELECT r.roleName
        FROM UsersRoles ur
        JOIN Roles r
        ON ur.roleId = r.roleId
        WHERE ur.userId = @UserId
      )
    `)

    return result.recordset.map(application => ({
      ...application,

      verificationData: JSON.parse(application.verificationData || '{}'),
    }))
  } catch (error) {
    console.error('Error getting pending requests:', error)

    throw error
  }
}

const roleNameToId = {
  patient: 1,
  clinician: 2,
  doctor: 3,
  pharmacy: 4,
  custodian: 5,
  admin: 6,
}

// Approve role application
const approveRoleApplication = async (applicationId, adminUserId) => {
  let transaction

  try {
    const pool = await connectDB()

    transaction = new sql.Transaction(pool)

    await transaction.begin()

    // Get application
    const applicationRequest = new sql.Request(transaction)

    applicationRequest.input('ApplicationId', sql.Int, applicationId)

    const applicationResult = await applicationRequest.query(`
      SELECT *
      FROM RoleApplications
      WHERE applicationId = @ApplicationId
      AND verificationStatus = 'pending'
    `)

    if (applicationResult.recordset.length === 0) {
      throw new Error('Application not found')
    }

    const application = applicationResult.recordset[0]

    const roleId = roleNameToId[application.requestedRole]

    // Add role to user
    await addUserRoles(application.userId, [roleId], transaction)

    // Update application
    const updateRequest = new sql.Request(transaction)

    updateRequest.input('ApplicationId', sql.Int, applicationId)

    updateRequest.input('ReviewedBy', sql.UniqueIdentifier, adminUserId)

    await updateRequest.query(`
      UPDATE RoleApplications
      SET
        verificationStatus = 'approved',
        reviewedBy = @ReviewedBy,
        reviewedAt = GETDATE()
      WHERE applicationId = @ApplicationId
    `)
    
    await createNotification(
      {
        userId: application.userId,
        type: 'role_approved',
        title: 'Role request approved',
        message: `Your request for the ${application.requestedRole} role has been approved.`,
        link: '/profile',
      },
      transaction
    )
    await transaction.commit()

    return {
      success: true,
    }
  } catch (error) {
    if (transaction) {
      await transaction.rollback()
    }

    console.error('Error approving application:', error)

    throw error
  }
}

// Reject role application
const rejectRoleApplication = async (applicationId, adminUserId) => {
  try {
    const pool = await connectDB()

    const request = pool.request()

    request.input('ApplicationId', sql.Int, applicationId)

    request.input('ReviewedBy', sql.UniqueIdentifier, adminUserId)

    await request.query(`
      UPDATE RoleApplications
      SET
        verificationStatus = 'rejected',
        reviewedBy = @ReviewedBy,
        reviewedAt = GETDATE()
      WHERE applicationId = @ApplicationId
    `)

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error rejecting application:', error)

    throw error
  }
}

// Return user and roles for admin user management
const getManagedUserByEmail = async email => {
  try {
    const user = await getUserByEmail(email)

    if (!user) {
      return null
    }

    const roles = await getUserRoles(user.userId)

    return {
      id: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
    }
  } catch (error) {
    console.error('Error getting managed user by email:', error)

    throw error
  }
}

// Replace user roles from Admin Dashboard
const replaceUserRoles = async (userId, roleNames, adminUserId) => {
  if (!Array.isArray(roleNames)) {
    throw new Error('Roles must be an array')
  }

  if (!adminUserId) {
    throw new Error('Admin user ID is required')
  }

  let transaction

  try {
    const pool = await connectDB()

    transaction = new sql.Transaction(pool)

    await transaction.begin()

    // Confirm user exists
    const userRequest = new sql.Request(transaction)

    userRequest.input('UserId', sql.UniqueIdentifier, userId)

    const userResult = await userRequest.query(`
      SELECT userId
      FROM Users
      WHERE userId = @UserId
    `)

    if (userResult.recordset.length === 0) {
      throw new Error('User not found')
    }

    // Patient is always preserved as the base role
    const requestedRoles = [...new Set(['patient', ...roleNames])]

    const validRoleNames = Object.keys(roleNameToId)

    const invalidRoles = requestedRoles.filter(role => !validRoleNames.includes(role))

    if (invalidRoles.length > 0) {
      throw new Error(`Invalid role: ${invalidRoles.join(', ')}`)
    }

    const roleIds = requestedRoles.map(role => roleNameToId[role])

    // Remove current roles
    const deleteRequest = new sql.Request(transaction)

    deleteRequest.input('UserId', sql.UniqueIdentifier, userId)

    await deleteRequest.query(`
      DELETE FROM UsersRoles
      WHERE userId = @UserId
    `)

    // Add the new role set
    await addUserRoles(userId, roleIds, transaction)

    // If the user already has a pending application for one of the roles manually assigned by the admin, treat it as an approval

    for (const roleName of requestedRoles) {
      if (roleName === 'patient') {
        continue
      }

      const applicationRequest = new sql.Request(transaction)

      applicationRequest.input('UserId', sql.UniqueIdentifier, userId)

      applicationRequest.input('RoleName', sql.VarChar, roleName)

      applicationRequest.input('ReviewedBy', sql.UniqueIdentifier, adminUserId)

      await applicationRequest.query(`
        UPDATE RoleApplications
        SET
          verificationStatus = 'approved',
          reviewedBy = @ReviewedBy,
          reviewedAt = GETDATE()
        WHERE userId = @UserId
          AND requestedRole = @RoleName
          AND verificationStatus = 'pending'
      `)
    }

    // Everything succeeded
    await transaction.commit()

    transaction = null

    const updatedUser = await getUserById(userId)

    return {
      id: updatedUser.userId,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      roles: updatedUser.roles,
    }
  } catch (error) {
    if (transaction) {
      await transaction.rollback()
    }

    console.error('Error replacing user roles:', error)

    throw error
  }
}

// Return all users with a specified role
const getUsersByRole = async roleName => {
  try {
    const pool = await connectDB()

    const request = pool.request()

    request.input('RoleName', sql.VarChar, roleName)

    const result = await request.query(`
      SELECT DISTINCT
        u.userId,
        u.email,
        u.firstName,
        u.lastName

      FROM Users u

      JOIN UsersRoles ur
        ON u.userId = ur.userId

      JOIN Roles r
        ON ur.roleId = r.roleId

      WHERE r.roleName = @RoleName

      ORDER BY
        u.firstName,
        u.lastName
    `)

    const users = await Promise.all(
      result.recordset.map(async user => {
        const roles = await getUserRoles(user.userId)

        return {
          id: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles,
        }
      })
    )

    return users
  } catch (error) {
    console.error('Error getting users by role:', error)

    throw error
  }
}

// Update user's basic info
const updateUserById = async (userId, updates) => {
  const { firstName, lastName, email } = updates

  if (!firstName && !lastName && !email) {
    throw new Error('No fields provided to update')
  }

  try {
    const pool = await connectDB()

    // If email is changing, make sure it's not taken by someone else
    if (email) {
      const checkRequest = pool.request()

      checkRequest.input('Email', sql.VarChar, email)
      checkRequest.input('UserId', sql.UniqueIdentifier, userId)

      const existing = await checkRequest.query(`
        SELECT 1
        FROM Users
        WHERE email = @Email
        AND userId != @UserId
      `)

      if (existing.recordset.length > 0) {
        throw new Error('Email already in use')
      }
    }

    const request = pool.request()

    request.input('UserId', sql.UniqueIdentifier, userId)
    request.input('FirstName', sql.VarChar, firstName)
    request.input('LastName', sql.VarChar, lastName)
    request.input('Email', sql.VarChar, email)

    await request.query(`
      UPDATE Users
      SET
        firstName = COALESCE(@FirstName, firstName),
        lastName = COALESCE(@LastName, lastName),
        email = COALESCE(@Email, email)
      WHERE userId = @UserId
    `)

    return await getUserById(userId)
  } catch (error) {
    console.error('Error updating user:', error)

    throw error
  }
}

// Update user's profile image
const updateProfileImage = async (userId, imageBuffer) => {
  try {
    const pool = await connectDB()

    const request = pool.request()

    request.input('UserId', sql.UniqueIdentifier, userId)
    request.input('ProfileImage', sql.VarBinary(sql.MAX), imageBuffer)

    await request.query(`
      UPDATE Users
      SET profileImage = @ProfileImage
      WHERE userId = @UserId
    `)

    return { success: true }
  } catch (error) {
    console.error('Error updating profile image:', error)

    throw error
  }
}

// Get user's profile image
const getProfileImageById = async userId => {
  try {
    const pool = await connectDB()

    const request = pool.request()

    request.input('UserId', sql.UniqueIdentifier, userId)

    const result = await request.query(`
      SELECT profileImage
      FROM Users
      WHERE userId = @UserId
    `)

    if (result.recordset.length === 0) {
      throw new Error('User not found')
    }

    return result.recordset[0].profileImage
  } catch (error) {
    console.error('Error getting profile image:', error)

    throw error
  }
}

export {
  userExists,
  createUser,
  getHashedPasswordByEmail,
  getUserById,
  getUserByEmail,
  addUserRoles,
  getUserRoles,
  createRoleApplication,
  getPendingVerificationRequests,
  getPendingVerificationRequestsByUserId,
  approveRoleApplication,
  rejectRoleApplication,
  updateUserById,
  getProfileImageById,
  updateProfileImage,
  getManagedUserByEmail,
  replaceUserRoles,
  getUsersByRole,
}
