import { useEffect, useState } from 'react'
import axios from 'axios'
import { api } from '../api'

import { useNavigate } from 'react-router-dom'

import styles from './RoleApplicationForm.module.css'

type Role = 'clinician' | 'doctor' | 'pharmacy' | 'custodian'

type PendingApplication = {
  requestedRole: Role
  verificationStatus: string
}

type Props = {
  refreshUser: () => Promise<void>
}

const allRoles: Role[] = ['clinician', 'doctor', 'pharmacy', 'custodian']

function RoleApplicationForm({ refreshUser }: Props) {
  const navigate = useNavigate()

  const [availableRoles, setAvailableRoles] = useState<Role[]>(allRoles)

  const [requestedRole, setRequestedRole] = useState<Role>('clinician')

  const [ahpraNumber, setAhpraNumber] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [workEmail, setWorkEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  const [pharmacyName, setPharmacyName] = useState('')
  const [pharmacyAddress, setPharmacyAddress] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchAvailableRoles = async () => {
      try {
        const response = await api.get('api/auth/me', {
          withCredentials: true,
        })

        const userRoles: string[] = response.data.roles || []

        const pendingApplications: PendingApplication[] = response.data.pendingApplications || []

        /*
          Only pending applications should make a role
          unavailable.

          A rejected application can be submitted again.
        */
        const pendingRoles = pendingApplications
          .filter(application => application.verificationStatus === 'pending')
          .map(application => application.requestedRole)

        const unavailableRoles = [...userRoles, ...pendingRoles]

        const filteredRoles = allRoles.filter(role => !unavailableRoles.includes(role))

        setAvailableRoles(filteredRoles)

        if (filteredRoles.length > 0) {
          setRequestedRole(filteredRoles[0])
        }
      } catch (error) {
        console.error('Failed to load available roles:', error)
      }
    }

    fetchAvailableRoles()
  }, [])

  const handleSubmit = async () => {
    if (!requestedRole) {
      alert('No roles available')
      return
    }

    try {
      setIsSubmitting(true)

      let verificationData = {}

      if (
        requestedRole === 'doctor' ||
        requestedRole === 'clinician' ||
        requestedRole === 'custodian'
      ) {
        if (!ahpraNumber || !organisation || !workEmail || !phoneNumber) {
          alert('Please complete all verification fields')

          return
        }

        verificationData = {
          ahpraNumber,
          organisation,
          workEmail,
          phoneNumber,
        }
      }

      if (requestedRole === 'pharmacy') {
        if (!pharmacyName || !pharmacyAddress || !licenseNumber || !phoneNumber) {
          alert('Please complete all pharmacy fields')

          return
        }

        verificationData = {
          pharmacyName,
          pharmacyAddress,
          licenseNumber,
          phoneNumber,
        }
      }

      await api.post(
        '/api/auth/apply',
        {
          requestedRole,
          verificationData,
        },
        {
          withCredentials: true,
        }
      )

      /*
        Refresh the global user after the database has
        successfully created the application.

        This updates pendingApplications immediately.
      */
      await refreshUser()

      alert('Role application submitted')

      navigate('/profile')
    } catch (error) {
      console.error('Failed to submit role application:', error)

      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Failed to submit application')
      } else {
        alert('Failed to submit application')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <h2>Apply for Additional Roles</h2>

      {availableRoles.length === 0 ? (
        <p>You already have or applied for all available roles.</p>
      ) : (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="requestedRole">Requested Role</label>

            <select
              id="requestedRole"
              value={requestedRole}
              onChange={e => setRequestedRole(e.target.value as Role)}
              disabled={isSubmitting}
            >
              {availableRoles.map(role => (
                <option key={role} value={role}>
                  {role === 'custodian'
                    ? 'Content Custodian'
                    : role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {(requestedRole === 'doctor' ||
            requestedRole === 'clinician' ||
            requestedRole === 'custodian') && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="ahpraNumber">
                  {requestedRole === 'custodian' ? 'Employee ID' : 'AHPRA Number'}
                </label>

                <input
                  id="ahpraNumber"
                  type="text"
                  value={ahpraNumber}
                  onChange={e => setAhpraNumber(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="organisation">Organisation</label>

                <input
                  id="organisation"
                  type="text"
                  value={organisation}
                  onChange={e => setOrganisation(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="workEmail">Work Email</label>

                <input
                  id="workEmail"
                  type="email"
                  value={workEmail}
                  onChange={e => setWorkEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phoneNumber">Phone Number</label>

                <input
                  id="phoneNumber"
                  type="text"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          {requestedRole === 'pharmacy' && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="pharmacyName">Pharmacy Name</label>

                <input
                  id="pharmacyName"
                  type="text"
                  value={pharmacyName}
                  onChange={e => setPharmacyName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="pharmacyAddress">Pharmacy Address</label>

                <input
                  id="pharmacyAddress"
                  type="text"
                  value={pharmacyAddress}
                  onChange={e => setPharmacyAddress(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="licenseNumber">License Number</label>

                <input
                  id="licenseNumber"
                  type="text"
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="pharmacyPhoneNumber">Phone Number</label>

                <input
                  id="pharmacyPhoneNumber"
                  type="text"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </>
      )}
    </div>
  )
}

export default RoleApplicationForm
