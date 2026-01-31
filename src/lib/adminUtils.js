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
 * Make a user the owner of their organization
 * @param {string} userId - The user's Firebase UID
 * @param {string} organizationId - The organization ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function makeOrganizationOwner(userId, organizationId) {
  try {
    if (!userId || !organizationId) {
      return { success: false, error: 'User ID and Organization ID are required' }
    }

    const membershipId = `${userId}_${organizationId}`
    const memberRef = doc(db, 'organizationMembers', membershipId)
    const memberSnap = await getDoc(memberRef)

    if (memberSnap.exists()) {
      // Update existing membership to owner
      await updateDoc(memberRef, {
        role: 'owner',
        status: 'active',
        updatedAt: serverTimestamp()
      })
    } else {
      // Create new membership as owner
      await setDoc(memberRef, {
        organizationId: organizationId,
        userId: userId,
        role: 'owner',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }

    logger.info(`User ${userId} is now owner of organization ${organizationId}`)
    return { success: true }
  } catch (error) {
    logger.error('Error making user organization owner:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Auto-elevate current user to owner if they're the only member or first member
 * @param {Object} auth - Firebase auth instance
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function autoElevateToOwner(auth) {
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
      if (membership.role !== 'owner') {
        await updateDoc(doc(db, 'organizationMembers', docSnap.id), {
          role: 'owner',
          status: 'active',
          updatedAt: serverTimestamp()
        })
        elevated = true
        logger.info(`Elevated user ${user.uid} to owner in organization ${membership.organizationId}`)
      }
    }

    if (elevated) {
      return { success: true, message: 'User elevated to owner. Please refresh the page.' }
    } else {
      return { success: true, message: 'User is already an owner.' }
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
      role: 'owner'
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
 * Quick setup: Make current user owner + platform admin + dev mode
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

    // Also elevate to owner in all organizations
    await autoElevateToOwner(auth)

    return {
      success: true,
      message: 'Full dev access enabled! You now have owner + platform admin + dev mode. Please refresh the page.'
    }
  } catch (error) {
    return { success: false, error: error.message }
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
      makeOrganizationOwner,
      autoElevateToOwner,
      makePlatformAdmin,
      removePlatformAdmin,
      makeCurrentUserPlatformAdmin,
      enableDevMode,
      disableDevMode,
      enableDevModeForCurrentUser,
      setupDevAccess
    }

    console.log('%c🔧 Admin Utils Ready', 'font-size: 14px; font-weight: bold; color: #3B82F6;')
    console.log('%cQuick commands:', 'font-weight: bold;')
    console.log('  adminUtils.setupDevAccess(auth)    - Full access (owner + admin + devMode)')
    console.log('  adminUtils.autoElevateToOwner(auth) - Make yourself org owner')
    console.log('  adminUtils.enableDevModeForCurrentUser(auth) - Enable devMode bypass')
    console.log('')
    console.log('After running any command, refresh the page to see changes.')
  })
}
