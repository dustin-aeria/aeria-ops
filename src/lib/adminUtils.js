/**
 * adminUtils.js
 * Utility functions for admin operations
 *
 * Usage: Import and call from browser console or temporarily from a component
 *
 * @location src/lib/adminUtils.js
 */

import { doc, updateDoc, getDoc, setDoc, getDocs, query, where, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { logger } from './logger'

/**
 * Make a user the admin of their organization
 * @param {string} userId - The user's Firebase UID
 * @param {string} organizationId - The organization ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function makeOrganizationAdmin(userId, organizationId) {
  try {
    if (!userId || !organizationId) {
      return { success: false, error: 'User ID and Organization ID are required' }
    }

    const membershipId = `${userId}_${organizationId}`
    const memberRef = doc(db, 'organizationMembers', membershipId)
    const memberSnap = await getDoc(memberRef)

    if (memberSnap.exists()) {
      // Update existing membership to admin
      await updateDoc(memberRef, {
        role: 'admin',
        status: 'active',
        updatedAt: serverTimestamp()
      })
    } else {
      // Create new membership as admin
      await setDoc(memberRef, {
        organizationId: organizationId,
        userId: userId,
        role: 'admin',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }

    logger.info(`User ${userId} is now admin of organization ${organizationId}`)
    return { success: true }
  } catch (error) {
    logger.error('Error making user organization admin:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Auto-elevate current user to admin if they're the only member or first member
 * @param {Object} auth - Firebase auth instance
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function autoElevateToAdmin(auth) {
  try {
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'No user logged in' }
    }

    // Find user's organization memberships
    const membershipsRef = collection(db, 'organizationMembers')
    const q = query(membershipsRef, where('userId', '==', user.uid))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return { success: false, error: 'User has no organization memberships' }
    }

    // Check each membership and elevate if needed
    let elevated = false
    for (const docSnap of snapshot.docs) {
      const membership = docSnap.data()
      if (membership.role !== 'admin') {
        await updateDoc(doc(db, 'organizationMembers', docSnap.id), {
          role: 'admin',
          status: 'active',
          updatedAt: serverTimestamp()
        })
        elevated = true
        logger.info(`Elevated user ${user.uid} to admin in organization ${membership.organizationId}`)
      }
    }

    if (elevated) {
      return { success: true, message: 'User elevated to admin. Please refresh the page.' }
    } else {
      return { success: true, message: 'User is already an admin.' }
    }
  } catch (error) {
    logger.error('Error auto-elevating user:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Make a user a platform admin
 * @param {string} userId - The user's Firebase UID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function makePlatformAdmin(userId) {
  try {
    const userRef = doc(db, 'operators', userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return { success: false, error: 'User not found in operators collection' }
    }

    await updateDoc(userRef, {
      isPlatformAdmin: true,
      role: 'admin' // Also ensure they have admin role
    })

    logger.info(`User ${userId} is now a platform admin`)
    return { success: true }
  } catch (error) {
    logger.error('Error making user platform admin:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Remove platform admin status from a user
 * @param {string} userId - The user's Firebase UID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function removePlatformAdmin(userId) {
  try {
    const userRef = doc(db, 'operators', userId)
    await updateDoc(userRef, {
      isPlatformAdmin: false
    })

    logger.info(`User ${userId} is no longer a platform admin`)
    return { success: true }
  } catch (error) {
    logger.error('Error removing platform admin:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Make the current logged-in user a platform admin
 * Call this from browser console after importing
 * @param {Object} auth - Firebase auth instance
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function makeCurrentUserPlatformAdmin(auth) {
  const user = auth.currentUser
  if (!user) {
    return { success: false, error: 'No user logged in' }
  }
  return makePlatformAdmin(user.uid)
}

/**
 * Enable dev mode for a user (grants all permissions bypass)
 * @param {string} userId - The user's Firebase UID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function enableDevMode(userId) {
  try {
    const userRef = doc(db, 'operators', userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return { success: false, error: 'User not found in operators collection' }
    }

    await updateDoc(userRef, {
      devMode: true,
      isPlatformAdmin: true,
      role: 'admin'
    })

    logger.info(`Dev mode enabled for user ${userId}`)
    return { success: true, message: 'Dev mode enabled. Please refresh the page.' }
  } catch (error) {
    logger.error('Error enabling dev mode:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Disable dev mode for a user
 * @param {string} userId - The user's Firebase UID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function disableDevMode(userId) {
  try {
    const userRef = doc(db, 'operators', userId)
    await updateDoc(userRef, {
      devMode: false
    })

    logger.info(`Dev mode disabled for user ${userId}`)
    return { success: true }
  } catch (error) {
    logger.error('Error disabling dev mode:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Enable dev mode for the current logged-in user
 * @param {Object} auth - Firebase auth instance
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function enableDevModeForCurrentUser(auth) {
  const user = auth.currentUser
  if (!user) {
    return { success: false, error: 'No user logged in' }
  }
  return enableDevMode(user.uid)
}

/**
 * Quick setup: Make current user admin + platform admin + dev mode
 * Use this for initial development setup
 * @param {Object} auth - Firebase auth instance
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function setupDevAccess(auth) {
  const user = auth.currentUser
  if (!user) {
    return { success: false, error: 'No user logged in' }
  }

  try {
    // Enable dev mode on user profile
    await enableDevMode(user.uid)

    // Also elevate to admin in all organizations
    await autoElevateToAdmin(auth)

    return {
      success: true,
      message: 'Full dev access enabled! You now have admin + platform admin + dev mode. Please refresh the page.'
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Migrate old role names to new RBAC roles
 * Maps: owner -> admin, manager -> management
 * @param {string} organizationId - Optional: only migrate for specific org
 * @returns {Promise<{success: boolean, migrated: number, errors: string[]}>}
 */
export async function migrateRolesToNewSystem(organizationId = null) {
  const roleMapping = {
    'owner': 'admin',
    'manager': 'management'
  }

  try {
    const membershipsRef = collection(db, 'organizationMembers')
    let q = membershipsRef

    if (organizationId) {
      q = query(membershipsRef, where('organizationId', '==', organizationId))
    }

    const snapshot = await getDocs(q)

    let migrated = 0
    const errors = []

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data()
      const oldRole = data.role

      // Check if role needs migration
      if (roleMapping[oldRole]) {
        const newRole = roleMapping[oldRole]
        try {
          await updateDoc(doc(db, 'organizationMembers', docSnap.id), {
            role: newRole,
            previousRole: oldRole, // Keep track of old role for audit
            roleMigratedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
          migrated++
          logger.info(`Migrated user ${data.userId} from ${oldRole} to ${newRole}`)
        } catch (err) {
          errors.push(`Failed to migrate ${docSnap.id}: ${err.message}`)
        }
      }
    }

    logger.info(`Role migration complete: ${migrated} users migrated`)
    return { success: true, migrated, errors }
  } catch (error) {
    logger.error('Error during role migration:', error)
    return { success: false, migrated: 0, errors: [error.message] }
  }
}

/**
 * Get a summary of all roles in the organization
 * Useful for auditing before/after migration
 * @param {string} organizationId - The organization ID
 * @returns {Promise<Object>} Role counts and user list
 */
export async function getRoleSummary(organizationId) {
  try {
    const membershipsRef = collection(db, 'organizationMembers')
    const q = query(membershipsRef, where('organizationId', '==', organizationId))
    const snapshot = await getDocs(q)

    const summary = {
      total: 0,
      byRole: {},
      users: []
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data()
      summary.total++
      summary.byRole[data.role] = (summary.byRole[data.role] || 0) + 1
      summary.users.push({
        id: docSnap.id,
        userId: data.userId,
        role: data.role,
        status: data.status,
        previousRole: data.previousRole || null
      })
    })

    return summary
  } catch (error) {
    logger.error('Error getting role summary:', error)
    return null
  }
}

/**
 * Check if migration is needed for an organization
 * @param {string} organizationId - The organization ID
 * @returns {Promise<{needed: boolean, oldRoles: string[]}>}
 */
export async function checkMigrationNeeded(organizationId) {
  const oldRoles = ['owner', 'manager']

  try {
    const membershipsRef = collection(db, 'organizationMembers')
    const q = query(membershipsRef, where('organizationId', '==', organizationId))
    const snapshot = await getDocs(q)

    const foundOldRoles = []
    snapshot.forEach(docSnap => {
      const role = docSnap.data().role
      if (oldRoles.includes(role) && !foundOldRoles.includes(role)) {
        foundOldRoles.push(role)
      }
    })

    return {
      needed: foundOldRoles.length > 0,
      oldRoles: foundOldRoles
    }
  } catch (error) {
    logger.error('Error checking migration status:', error)
    return { needed: false, oldRoles: [] }
  }
}

// SECURITY: Admin functions should only be called through authenticated admin UI
// Do NOT expose to window object in production
// Use the MasterPolicyAdmin page or Settings page for admin operations

// Development helper: expose to window for console access
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Import auth and expose it
  import('./firebase').then(({ auth }) => {
    window.auth = auth

    window.adminUtils = {
      makeOrganizationAdmin,
      autoElevateToAdmin,
      makePlatformAdmin,
      removePlatformAdmin,
      makeCurrentUserPlatformAdmin,
      enableDevMode,
      disableDevMode,
      enableDevModeForCurrentUser,
      setupDevAccess,
      // Migration utilities
      migrateRolesToNewSystem,
      getRoleSummary,
      checkMigrationNeeded
    }

    console.log('%c🔧 Admin Utils Ready', 'font-size: 14px; font-weight: bold; color: #3B82F6;')
    console.log('%cQuick commands:', 'font-weight: bold;')
    console.log('  adminUtils.setupDevAccess(auth)    - Full access (admin + platform admin + devMode)')
    console.log('  adminUtils.autoElevateToAdmin(auth) - Make yourself org admin')
    console.log('  adminUtils.enableDevModeForCurrentUser(auth) - Enable devMode bypass')
    console.log('')
    console.log('%cMigration commands:', 'font-weight: bold;')
    console.log('  adminUtils.checkMigrationNeeded(orgId)     - Check if role migration needed')
    console.log('  adminUtils.getRoleSummary(orgId)           - View all roles in org')
    console.log('  adminUtils.migrateRolesToNewSystem(orgId)  - Migrate owner->admin, manager->management')
    console.log('')
    console.log('After running any command, refresh the page to see changes.')
  })
}
