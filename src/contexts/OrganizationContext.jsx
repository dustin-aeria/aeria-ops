/**
 * OrganizationContext.jsx
 * Organization context provider for multi-tenancy
 *
 * Provides organization state and membership info throughout the app.
 * Single organization per user - no org switching needed.
 *
 * @location src/contexts/OrganizationContext.jsx
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import {
  getMembershipsByUser,
  getOrganization,
  hasPermission as checkPermission,
  ROLE_PERMISSIONS,
  ORGANIZATION_ROLES,
  linkPendingInvitations
} from '../lib/firestoreOrganizations'

const OrganizationContext = createContext(null)

export function useOrganizationContext() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider')
  }
  return context
}

export function OrganizationProvider({ children }) {
  const { user, userProfile, loading: authLoading } = useAuth()

  const [organization, setOrganization] = useState(null)
  const [membership, setMembership] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user's organization memberships when user changes
  useEffect(() => {
    async function fetchOrganizationData() {
      if (authLoading) return

      if (!user) {
        setOrganization(null)
        setMembership(null)
        setMemberships([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // First, link any pending invitations for this email
        if (user.email) {
          await linkPendingInvitations(user.uid, user.email)
        }

        // Get all memberships for this user
        const userMemberships = await getMembershipsByUser(user.uid)
        setMemberships(userMemberships)

        // Filter to active memberships only
        const activeMemberships = userMemberships.filter(
          m => m.status === 'active' && m.organization?.subscription?.status !== 'deleted'
        )

        if (activeMemberships.length > 0) {
          // Use the first active membership (single org per user for now)
          const primaryMembership = activeMemberships[0]
          setMembership(primaryMembership)
          setOrganization(primaryMembership.organization)
        } else {
          // No active organization - user needs to create one or be invited
          setOrganization(null)
          setMembership(null)
        }
      } catch (err) {
        console.error('Error fetching organization data:', err)
        setError(err.message || 'Failed to load organization data')
        setOrganization(null)
        setMembership(null)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizationData()
  }, [user, authLoading])

  /**
   * Check if current user has a specific permission
   * @param {string} permission - Permission name from ROLE_PERMISSIONS
   * @returns {boolean}
   */
  const hasPermission = useCallback((permission) => {
    // SIMPLIFIED: All authenticated users have all permissions
    return !!user
  }, [user])

  /**
   * Check if current user has any of the specified roles
   * @param {string[]} roles - Array of role names
   * @returns {boolean}
   */
  const hasRole = useCallback((roles) => {
    // SIMPLIFIED: All authenticated users pass role checks
    return !!user
  }, [user])

  /**
   * Check if user can manage another member (based on role hierarchy)
   * @param {string} targetRole - Role of the member to manage
   * @returns {boolean}
   */
  const canManageMember = useCallback((targetRole) => {
    // SIMPLIFIED: All authenticated users can manage members
    return !!user
  }, [user])

  /**
   * Refresh organization data
   */
  const refreshOrganization = useCallback(async () => {
    if (!organization?.id) return

    try {
      const updatedOrg = await getOrganization(organization.id)
      setOrganization(updatedOrg)
    } catch (err) {
      console.error('Error refreshing organization:', err)
    }
  }, [organization?.id])

  /**
   * Refresh all membership data
   */
  const refreshMemberships = useCallback(async () => {
    if (!user?.uid) return

    try {
      const userMemberships = await getMembershipsByUser(user.uid)
      setMemberships(userMemberships)

      const activeMemberships = userMemberships.filter(
        m => m.status === 'active' && m.organization?.subscription?.status !== 'deleted'
      )

      if (activeMemberships.length > 0) {
        const primaryMembership = activeMemberships[0]
        setMembership(primaryMembership)
        setOrganization(primaryMembership.organization)
      }
    } catch (err) {
      console.error('Error refreshing memberships:', err)
    }
  }, [user?.uid])

  /**
   * Set the current organization (for future multi-org support)
   */
  const setCurrentOrganization = useCallback(async (orgId) => {
    const targetMembership = memberships.find(m => m.organizationId === orgId)
    if (targetMembership) {
      setMembership(targetMembership)
      setOrganization(targetMembership.organization)
    }
  }, [memberships])

  const value = {
    // Core state
    organization,
    membership,
    memberships,
    organizationId: organization?.id || null,
    loading: loading || authLoading,
    error,

    // Permission helpers
    hasPermission,
    hasRole,
    canManageMember,

    // Role constants
    ROLES: ORGANIZATION_ROLES,
    PERMISSIONS: ROLE_PERMISSIONS,

    // Actions
    refreshOrganization,
    refreshMemberships,
    setCurrentOrganization,

    // Convenience flags - SIMPLIFIED: all true for authenticated users
    isOwner: !!user,
    isAdmin: !!user,
    canEdit: !!user,
    canDelete: !!user,
    canManageTeam: !!user,
    canManageSettings: !!user,
    hasOrganization: !!organization,

    // Always true for authenticated users
    isDevMode: true,
    isPlatformAdmin: !!user
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

export default OrganizationContext
