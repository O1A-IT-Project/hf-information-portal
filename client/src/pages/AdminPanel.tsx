import { useEffect, useState } from 'react'
import axios from 'axios'
import { api } from '../api'

import styles from './AdminPanel.module.css'

import type { User } from '../App'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

type Props = {
  user: User
}

type VerificationRequest = {
  id: string | number
  email: string
  firstName: string
  lastName: string

  requestedRole: 'clinician' | 'doctor' | 'pharmacy' | 'custodian'

  verificationData: {
    ahpraNumber?: string
    organisation?: string
    workEmail?: string

    pharmacyName?: string
    pharmacyAddress?: string
    licenseNumber?: string

    phoneNumber?: string
  }
}

type ManagedUser = {
  id: string | number
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

type AdminTab = 'verification' | 'users' | 'admins'

const AVAILABLE_ROLES = ['admin', 'doctor', 'clinician', 'pharmacy', 'custodian']

function AdminPanel({ user }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('verification')

  // Verification requests
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)

  // User management
  const [searchEmail, setSearchEmail] = useState('')
  const [searchedUser, setSearchedUser] = useState<ManagedUser | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  const [searchError, setSearchError] = useState('')
  const [searching, setSearching] = useState(false)
  const [savingRoles, setSavingRoles] = useState(false)

  // Current admins
  const [admins, setAdmins] = useState<ManagedUser[]>([])
  const [adminsLoading, setAdminsLoading] = useState(false)
  const [adminsError, setAdminsError] = useState('')
  const [adminsLoaded, setAdminsLoaded] = useState(false)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/api/auth/verification-requests')

        setRequests(response.data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchRequests()
  }, [])

  const isCurrentUser = (userId: string | number) => {
    return String(userId).toLowerCase() === String(user.id).toLowerCase()
  }

  const handleApprove = async () => {
    if (!selectedRequest) return

    try {
      await api.post('/api/auth/approve-request', {
        applicationId: selectedRequest.id,
      })

      alert('Application approved')

      setRequests(currentRequests =>
        currentRequests.filter(request => request.id !== selectedRequest.id)
      )

      setSelectedRequest(null)
      setAdminsLoaded(false)
    } catch (error) {
      console.error(error)

      alert('Failed to approve application')
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return

    try {
      await api.post('/api/auth/reject-request', {
        applicationId: selectedRequest.id,
      })

      alert('Application rejected')

      setRequests(currentRequests =>
        currentRequests.filter(request => request.id !== selectedRequest.id)
      )

      setSelectedRequest(null)
    } catch (error) {
      console.error(error)

      alert('Failed to reject application')
    }
  }

  const searchUserByEmail = async (email: string) => {
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setSearchError('Please enter an email address.')
      return
    }

    try {
      setSearching(true)

      setSearchError('')
      setSearchedUser(null)

      const response = await api.get('/api/auth/users/search', {
        params: {
          email: trimmedEmail,
        },
      })

      const foundUser: ManagedUser = response.data

      setSearchedUser(foundUser)

      // Patient is a permanent base role and is not edited here.
      setSelectedRoles((foundUser.roles ?? []).filter(role => role !== 'patient'))
    } catch (error) {
      console.error(error)

      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setSearchError('No user found with that email address.')
      } else {
        setSearchError('Unable to search for user.')
      }
    } finally {
      setSearching(false)
    }
  }

  const handleUserSearch = async () => {
    await searchUserByEmail(searchEmail)
  }

  const handleRoleChange = (role: string) => {
    setSelectedRoles(currentRoles => {
      if (currentRoles.includes(role)) {
        return currentRoles.filter(currentRole => currentRole !== role)
      }

      return [...currentRoles, role]
    })
  }

  const handleSaveRoles = async () => {
    if (!searchedUser) return

    try {
      setSavingRoles(true)

      const response = await api.patch(`/api/auth/users/${searchedUser.id}/roles`, {
        roles: selectedRoles,
      })

      const updatedUser: ManagedUser = response.data

      setSearchedUser(updatedUser)

      setSelectedRoles((updatedUser.roles ?? []).filter(role => role !== 'patient'))

      /*
        If a pending application has just been satisfied
        through User Management, remove it immediately from
        the frontend instead of waiting for a refresh.
      */
      setRequests(currentRequests =>
        currentRequests.filter(request => {
          const sameUser = request.email.toLowerCase() === updatedUser.email.toLowerCase()

          const roleWasAssigned = updatedUser.roles.includes(request.requestedRole)

          return !(sameUser && roleWasAssigned)
        })
      )

      setSelectedRequest(currentRequest => {
        if (!currentRequest) return null

        const sameUser = currentRequest.email.toLowerCase() === updatedUser.email.toLowerCase()

        const roleWasAssigned = updatedUser.roles.includes(currentRequest.requestedRole)

        return sameUser && roleWasAssigned ? null : currentRequest
      })

      // Reload Current Admins next time it is opened.
      setAdminsLoaded(false)

      alert('User roles updated successfully.')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Role update failed:', error.response?.data)

        alert(error.response?.data?.message || 'Failed to update user roles.')
      } else {
        console.error(error)

        alert('Failed to update user roles.')
      }
    } finally {
      setSavingRoles(false)
    }
  }

  const loadAdmins = async () => {
    if (adminsLoaded) return

    try {
      setAdminsLoading(true)
      setAdminsError('')

      const response = await api.get('/api/auth/admins')

      setAdmins(response.data)
      setAdminsLoaded(true)
    } catch (error) {
      console.error(error)

      setAdminsError('Unable to load current admins.')
    } finally {
      setAdminsLoading(false)
    }
  }

  const handleTabChange = async (tab: AdminTab) => {
    setActiveTab(tab)

    if (tab === 'admins') {
      await loadAdmins()
    }
  }

  const handleManageAdmin = async (admin: ManagedUser) => {
    // Frontend safeguard:
    // only allow an admin to manage themselves.
    if (!isCurrentUser(admin.id)) {
      return
    }

    setSearchEmail(admin.email)
    setActiveTab('users')

    await searchUserByEmail(admin.email)
  }

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  const formatFieldLabel = (field: string) => {
    const formatted = field.replace(/([A-Z])/g, ' $1')

    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  // Current logged-in admin is always displayed first.
  const sortedAdmins = [...admins].sort((a, b) => {
    if (isCurrentUser(a.id)) return -1

    if (isCurrentUser(b.id)) return 1

    return a.firstName.localeCompare(b.firstName)
  })

  const searchedUserIsAdmin = searchedUser?.roles.includes('admin') ?? false

  const searchedUserIsYou = searchedUser ? isCurrentUser(searchedUser.id) : false

  /*
    Normal users are editable.

    The currently logged-in admin can edit their own
    secondary roles.

    Other administrators are read-only.
  */
  const canEditSearchedUser = !searchedUserIsAdmin || searchedUserIsYou

  return (
    <main className={styles.container}>
      <div className={styles.pageHeader}>
        <h1>Admin Dashboard</h1>

        <p>Manage verification requests, user roles and administrator access.</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist" aria-label="Admin dashboard sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'verification'}
          className={`${styles.tab} ${activeTab === 'verification' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('verification')}
        >
          Verification Requests
          {requests.length > 0 && <span className={styles.tabBadge}>{requests.length}</span>}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'users'}
          className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('users')}
        >
          User Management
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'admins'}
          className={`${styles.tab} ${activeTab === 'admins' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('admins')}
        >
          Current Admins
        </button>
      </div>

      {/* Verification Requests */}
      {activeTab === 'verification' && (
        <section className={styles.tabContent}>
          <div className={styles.sectionHeader}>
            <h2>Pending Verification Requests</h2>

            <p>Review applications for additional portal roles.</p>
          </div>

          <div className={styles.requestsContainer}>
            <div className={styles.requestsList}>
              {requests.length === 0 ? (
                <div className={styles.emptyPanel}>
                  <p>No pending verification requests.</p>
                </div>
              ) : (
                requests.map(request => (
                  <button
                    type="button"
                    key={request.id}
                    className={`${styles.requestCard} ${
                      selectedRequest?.id === request.id ? styles.selectedRequestCard : ''
                    }`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <h3>
                      {request.firstName} {request.lastName}
                    </h3>

                    <p>
                      Requested Role: <strong>{formatRole(request.requestedRole)}</strong>
                    </p>
                  </button>
                ))
              )}
            </div>

            <div className={styles.detailsPanel}>
              {selectedRequest ? (
                <>
                  <div className={styles.detailsHeader}>
                    <div>
                      <h2>
                        {selectedRequest.firstName} {selectedRequest.lastName}
                      </h2>

                      <p>{selectedRequest.email}</p>
                    </div>

                    <span className={styles.roleBadge}>
                      {formatRole(selectedRequest.requestedRole)}
                    </span>
                  </div>

                  <div className={styles.divider} />

                  <h3>Verification Details</h3>

                  <div className={styles.verificationDetails}>
                    {Object.entries(selectedRequest.verificationData).map(([key, value]) =>
                      value ? (
                        <div className={styles.detailRow} key={key}>
                          <span>{formatFieldLabel(key)}</span>

                          <strong>{value}</strong>
                        </div>
                      ) : null
                    )}
                  </div>

                  <div className={styles.buttonGroup}>
                    <button type="button" className={styles.approveBtn} onClick={handleApprove}>
                      Approve
                    </button>

                    <button type="button" className={styles.rejectBtn} onClick={handleReject}>
                      Reject
                    </button>
                  </div>
                </>
              ) : (
                <div className={styles.emptyDetails}>
                  <h3>No request selected</h3>

                  <p>Select a verification request to view its details.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* User Management */}
      {activeTab === 'users' && (
        <section className={styles.tabContent}>
          <div className={styles.managementPanel}>
            <div className={styles.sectionHeader}>
              <h2>User Management</h2>

              <p>Search for a registered user by email and manage their roles.</p>
            </div>

            <div className={styles.userSearch}>
              <input
                type="email"
                value={searchEmail}
                onChange={event => setSearchEmail(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    handleUserSearch()
                  }
                }}
                placeholder="Enter user email address"
                className={styles.searchInput}
              />

              <button
                type="button"
                className={styles.searchBtn}
                onClick={handleUserSearch}
                disabled={searching}
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchError && <p className={styles.errorMessage}>{searchError}</p>}

            {searchedUser && (
              <div className={styles.userManagementCard}>
                <div className={styles.userDetails}>
                  <div>
                    <h3>
                      {searchedUser.firstName} {searchedUser.lastName}
                      {searchedUserIsYou && <span className={styles.youBadge}>You</span>}
                    </h3>

                    <p>{searchedUser.email}</p>
                  </div>

                  <span className={styles.userId}>User #{searchedUser.id}</span>
                </div>

                {canEditSearchedUser ? (
                  <>
                    <div className={styles.roleManagement}>
                      <h3>Assigned Roles</h3>

                      <p>Select the roles this user should have.</p>

                      <div className={styles.rolesGrid}>
                        {AVAILABLE_ROLES.map(role => (
                          <label
                            key={role}
                            className={`${styles.roleOption} ${
                              selectedRoles.includes(role) ? styles.selectedRole : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedRoles.includes(role)}
                              onChange={() => handleRoleChange(role)}
                              disabled={searchedUserIsYou && role === 'admin'}
                            />

                            <span>{formatRole(role)}</span>
                          </label>
                        ))}
                      </div>

                      {searchedUserIsYou && searchedUserIsAdmin && (
                        <p className={styles.adminRoleNote}>
                          Your Admin role cannot be removed through the portal.
                        </p>
                      )}
                    </div>

                    <div className={styles.saveRolesContainer}>
                      <button
                        type="button"
                        className={styles.saveRolesBtn}
                        onClick={handleSaveRoles}
                        disabled={savingRoles}
                      >
                        {savingRoles ? 'Saving...' : 'Save Roles'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles.adminNotice}>
                    <h3>Administrator Account</h3>

                    <p>You cannot modify another administrator's roles.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Current Admins */}
      {activeTab === 'admins' && (
        <section className={styles.tabContent}>
          <div className={styles.managementPanel}>
            <div className={styles.sectionHeader}>
              <h2>Current Admins</h2>

              <p>View users who currently have administrator access.</p>
            </div>

            {adminsLoading && (
              <div className={styles.emptyPanel}>
                <p>Loading admins...</p>
              </div>
            )}

            {!adminsLoading && adminsError && <p className={styles.errorMessage}>{adminsError}</p>}

            {!adminsLoading && !adminsError && admins.length === 0 && (
              <div className={styles.emptyPanel}>
                <p>No administrators found.</p>
              </div>
            )}

            {!adminsLoading && !adminsError && sortedAdmins.length > 0 && (
              <div className={styles.adminGrid}>
                {sortedAdmins.map(admin => {
                  const isYou = isCurrentUser(admin.id)

                  return (
                    <div key={admin.id} className={styles.adminCard}>
                      <div className={styles.adminAvatar}>
                        <img
                          src={`${API_BASE_URL}/api/auth/profile-image/${admin.id}`}
                          alt={`${admin.firstName} ${admin.lastName}`}
                          className={styles.adminAvatarImage}
                          onError={event => {
                            event.currentTarget.style.display = 'none'

                            event.currentTarget.nextElementSibling?.removeAttribute('hidden')
                          }}
                        />

                        <span hidden>
                          {admin.firstName.charAt(0).toUpperCase()}
                          {admin.lastName.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className={styles.adminInfo}>
                        <h3>
                          {admin.firstName} {admin.lastName}
                          {isYou && <span className={styles.youBadge}>You</span>}
                        </h3>

                        <p>{admin.email}</p>
                      </div>

                      {isYou ? (
                        <button
                          type="button"
                          className={styles.manageBtn}
                          onClick={() => handleManageAdmin(admin)}
                        >
                          Manage
                        </button>
                      ) : (
                        <span className={styles.viewOnlyBadge}>View only</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  )
}

export default AdminPanel
