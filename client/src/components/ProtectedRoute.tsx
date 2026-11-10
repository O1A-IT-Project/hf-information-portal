// Protects role-specific frontend routes using the current active role
// This improves UX but should not be treated as the final security boundary
// Sensitive backend operations must still validate the user's assigned roles on server side

// The account must have the required role and currently be viewing the portal under that role before the protected frontend page is displayed

import { Navigate } from 'react-router-dom'

import type { User, Role } from '../App'

type Props = {
  user: User | null
  activeRole: Role | null
  allowedRoles: Role[]
  children: React.ReactNode
}

function ProtectedRoute({ user, activeRole, allowedRoles, children }: Props) {
  if (!user) {
    return <Navigate to="/login" replace />
  }

  const ownsRequiredRole = user.roles?.some(role => allowedRoles.includes(role)) ?? false

  if (!ownsRequiredRole) {
    return <Navigate to="/" replace />
  }

  const activeRoleAllowed = activeRole !== null && allowedRoles.includes(activeRole)

  if (!activeRoleAllowed) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
