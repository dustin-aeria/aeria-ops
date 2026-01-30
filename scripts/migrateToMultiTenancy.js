/**
 * migrateToMultiTenancy.js
 * One-time migration script to add organization-based multi-tenancy
 *
 * This script:
 * 1. Finds all unique users who have created data (via operatorId/createdBy)
 * 2. Creates an organization for each unique user
 * 3. Adds the user as owner of their organization
 * 4. Updates all documents to add organizationId field
 *
 * Run with: node scripts/migrateToMultiTenancy.js
 *
 * @location scripts/migrateToMultiTenancy.js
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Initialize Firebase Admin
// Expects a service account key file at ./serviceAccountKey.json
const serviceAccountPath = resolve(__dirname, 'serviceAccountKey.json')

let serviceAccount
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
} catch (err) {
  console.error('Error: Could not read serviceAccountKey.json')
  console.error('Please place your Firebase service account key at:', serviceAccountPath)
  console.error('You can download it from Firebase Console > Project Settings > Service Accounts')
  process.exit(1)
}

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

// Collections that need organizationId added
const COLLECTIONS_TO_MIGRATE = [
  'projects',
  'clients',
  'aircraft',
  'equipment',
  'services',
  'incidents',
  'capas',
  'trainingModules',
  'trainingRecords',
  'complianceApplications',
  'inspections',
  'inspectionTemplates',
  'inspectionFindings',
  'corAudits',
  'corAuditors',
  'corCertificates',
  'jhscMeetings',
  'jhscMembers',
  'jhscRecommendations',
  'policies',
  'procedures',
  'hazardAssessments',
  'maintenanceLogs',
  'permits',
  'checklists',
  'checklistTemplates',
  'flightLogs',
  'attachments',
  'comments',
  'notifications',
  'distributionLists',
  'insurancePolicies',
  'templates',
  'knowledgeBase',
  'equipmentAssignments',
  'timeEntries'
]

// Batch size for Firestore operations
const BATCH_SIZE = 100

// Track statistics
const stats = {
  usersFound: 0,
  organizationsCreated: 0,
  membershipsCreated: 0,
  documentsUpdated: 0,
  errors: []
}

/**
 * Find all unique users who have created data
 */
async function findUniqueUsers() {
  console.log('\n=== Finding unique users ===')
  const uniqueUsers = new Map() // userId -> user email/name info

  // Check operators collection for user info
  const operatorsSnapshot = await db.collection('operators').get()
  operatorsSnapshot.forEach(doc => {
    const data = doc.data()
    uniqueUsers.set(doc.id, {
      id: doc.id,
      email: data.email || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      companyName: data.companyName || ''
    })
  })

  // Also scan collections for operatorId/createdBy fields to find any missing users
  for (const collectionName of COLLECTIONS_TO_MIGRATE) {
    try {
      const snapshot = await db.collection(collectionName).limit(1000).get()
      snapshot.forEach(doc => {
        const data = doc.data()
        const userId = data.operatorId || data.createdBy
        if (userId && !uniqueUsers.has(userId)) {
          uniqueUsers.set(userId, {
            id: userId,
            email: '',
            firstName: 'Unknown',
            lastName: 'User',
            companyName: ''
          })
        }
      })
    } catch (err) {
      console.log(`  Skipping ${collectionName}: ${err.message}`)
    }
  }

  stats.usersFound = uniqueUsers.size
  console.log(`  Found ${uniqueUsers.size} unique users`)

  return uniqueUsers
}

/**
 * Create an organization for a user
 */
async function createOrganizationForUser(userInfo) {
  const orgName = userInfo.companyName ||
    `${userInfo.firstName} ${userInfo.lastName}'s Organization`.trim() ||
    'My Organization'

  // Create URL-friendly slug
  const slug = orgName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) + '-' + Date.now().toString(36)

  const orgData = {
    name: orgName,
    slug: slug,
    branding: {
      logoUrl: null,
      primaryColor: '#3B82F6'
    },
    settings: {
      timezone: 'America/Toronto',
      dateFormat: 'MM/DD/YYYY',
      measurementSystem: 'imperial'
    },
    subscription: {
      plan: 'starter',
      status: 'active',
      maxUsers: 5
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy: userInfo.id
  }

  const orgRef = await db.collection('organizations').add(orgData)
  stats.organizationsCreated++

  return orgRef.id
}

/**
 * Create membership for user as owner of organization
 */
async function createOwnerMembership(userId, organizationId) {
  const membershipId = `${userId}_${organizationId}`

  const membershipData = {
    organizationId: organizationId,
    userId: userId,
    role: 'owner',
    status: 'active',
    invitedAt: null,
    invitedBy: null,
    acceptedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }

  await db.collection('organizationMembers').doc(membershipId).set(membershipData)
  stats.membershipsCreated++
}

/**
 * Update all documents in a collection to add organizationId
 */
async function migrateCollection(collectionName, userOrgMap) {
  console.log(`  Migrating ${collectionName}...`)

  let updated = 0
  let lastDoc = null
  let hasMore = true

  while (hasMore) {
    let query = db.collection(collectionName).limit(BATCH_SIZE)
    if (lastDoc) {
      query = query.startAfter(lastDoc)
    }

    const snapshot = await query.get()

    if (snapshot.empty) {
      hasMore = false
      continue
    }

    const batch = db.batch()
    let batchCount = 0

    for (const doc of snapshot.docs) {
      lastDoc = doc
      const data = doc.data()

      // Skip if already has organizationId
      if (data.organizationId) {
        continue
      }

      // Find the user who owns this document
      const userId = data.operatorId || data.createdBy
      if (!userId) {
        continue
      }

      // Get the organization for this user
      const organizationId = userOrgMap.get(userId)
      if (!organizationId) {
        stats.errors.push(`No org found for user ${userId} in ${collectionName}/${doc.id}`)
        continue
      }

      // Update document with organizationId
      batch.update(doc.ref, {
        organizationId: organizationId,
        updatedAt: FieldValue.serverTimestamp()
      })
      batchCount++
    }

    if (batchCount > 0) {
      await batch.commit()
      updated += batchCount
      stats.documentsUpdated += batchCount
    }

    if (snapshot.docs.length < BATCH_SIZE) {
      hasMore = false
    }
  }

  console.log(`    Updated ${updated} documents`)
  return updated
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('========================================')
  console.log('Multi-Tenancy Migration Script')
  console.log('========================================')
  console.log('Started at:', new Date().toISOString())

  try {
    // Step 1: Find unique users
    const uniqueUsers = await findUniqueUsers()

    if (uniqueUsers.size === 0) {
      console.log('\nNo users found. Nothing to migrate.')
      return
    }

    // Step 2: Create organizations and memberships
    console.log('\n=== Creating organizations ===')
    const userOrgMap = new Map() // userId -> organizationId

    for (const [userId, userInfo] of uniqueUsers) {
      try {
        // Check if user already has an organization
        const existingMembership = await db.collection('organizationMembers')
          .where('userId', '==', userId)
          .limit(1)
          .get()

        if (!existingMembership.empty) {
          const memberDoc = existingMembership.docs[0].data()
          userOrgMap.set(userId, memberDoc.organizationId)
          console.log(`  User ${userId} already has org: ${memberDoc.organizationId}`)
          continue
        }

        // Create new organization
        const organizationId = await createOrganizationForUser(userInfo)
        await createOwnerMembership(userId, organizationId)
        userOrgMap.set(userId, organizationId)

        console.log(`  Created org for ${userInfo.email || userId}: ${organizationId}`)
      } catch (err) {
        stats.errors.push(`Failed to create org for ${userId}: ${err.message}`)
        console.error(`  Error creating org for ${userId}:`, err.message)
      }
    }

    // Step 3: Migrate all collections
    console.log('\n=== Migrating collections ===')
    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      try {
        await migrateCollection(collectionName, userOrgMap)
      } catch (err) {
        stats.errors.push(`Failed to migrate ${collectionName}: ${err.message}`)
        console.error(`  Error migrating ${collectionName}:`, err.message)
      }
    }

    // Print summary
    console.log('\n========================================')
    console.log('Migration Complete')
    console.log('========================================')
    console.log('Summary:')
    console.log(`  Users found: ${stats.usersFound}`)
    console.log(`  Organizations created: ${stats.organizationsCreated}`)
    console.log(`  Memberships created: ${stats.membershipsCreated}`)
    console.log(`  Documents updated: ${stats.documentsUpdated}`)
    console.log(`  Errors: ${stats.errors.length}`)

    if (stats.errors.length > 0) {
      console.log('\nErrors:')
      stats.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`))
    }

    console.log('\nCompleted at:', new Date().toISOString())

  } catch (err) {
    console.error('\nFatal error during migration:', err)
    process.exit(1)
  }
}

// Run the migration
runMigration()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Migration failed:', err)
    process.exit(1)
  })
