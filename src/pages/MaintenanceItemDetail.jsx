/**
 * MaintenanceItemDetail.jsx
 * Detailed maintenance view for a single equipment or aircraft item
 *
 * Features:
 * - Meter readings display and edit
 * - Applied schedules management
 * - Maintenance history
 * - Ground/unground functionality
 *
 * @location src/pages/MaintenanceItemDetail.jsx
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Plane,
  Package,
  Wrench,
  XOctagon,
  CheckCircle,
  Clock,
  Calendar,
  Settings,
  MoreVertical
} from 'lucide-react'
import { calculateOverallMaintenanceStatus, recalculateMaintenanceStatus } from '../lib/firestoreMaintenance'
import ItemMeterDisplay from '../components/maintenance/ItemMeterDisplay'
import AppliedSchedulesList from '../components/maintenance/AppliedSchedulesList'
import MaintenanceHistoryList from '../components/maintenance/MaintenanceHistoryList'
import GroundItemModal from '../components/maintenance/GroundItemModal'
import SelectScheduleModal from '../components/maintenance/SelectScheduleModal'
import LogMaintenanceModal from '../components/maintenance/LogMaintenanceModal'

const statusConfig = {
  ok: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: CheckCircle,
    label: 'Good Standing'
  },
  due_soon: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Clock,
    label: 'Due Soon'
  },
  overdue: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: AlertTriangle,
    label: 'Overdue'
  },
  grounded: {
    bg: 'bg-red-200',
    text: 'text-red-800',
    border: 'border-red-300',
    icon: XOctagon,
    label: 'Grounded'
  },
  no_schedule: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
    icon: Calendar,
    label: 'No Schedule'
  }
}

export default function MaintenanceItemDetail() {
  const { itemType, itemId } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Modal state
  const [showGroundModal, setShowGroundModal] = useState(false)
  const [showSelectSchedule, setShowSelectSchedule] = useState(false)
  const [showLogMaintenance, setShowLogMaintenance] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const loadItem = useCallback(async () => {
    if (!itemType || !itemId) {
      setError('Invalid item parameters')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const collection = itemType === 'aircraft' ? 'aircraft' : 'equipment'
      const docRef = doc(db, collection, itemId)
      const snapshot = await getDoc(docRef)

      if (!snapshot.exists()) {
        setError('Item not found')
        setLoading(false)
        return
      }

      const itemData = {
        id: snapshot.id,
        itemType,
        ...snapshot.data()
      }

      // For aircraft, normalize the name field
      if (itemType === 'aircraft' && !itemData.name) {
        itemData.name = itemData.nickname
      }

      setItem(itemData)

      // Recalculate maintenance status
      await recalculateMaintenanceStatus(itemId, itemType)
    } catch (err) {
      console.error('Failed to load item:', err)
      setError('Failed to load item details')
    } finally {
      setLoading(false)
    }
  }, [itemType, itemId])

  useEffect(() => {
    loadItem()
  }, [loadItem, refreshKey])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleLogService = () => {
    setShowSelectSchedule(true)
  }

  const handleSelectSchedule = (schedule) => {
    setSelectedSchedule(schedule)
    setShowSelectSchedule(false)
    setShowLogMaintenance(true)
  }

  const handleSelectAdHoc = () => {
    setSelectedSchedule(null)
    setShowSelectSchedule(false)
    setShowLogMaintenance(true)
  }

  const handleLogSuccess = () => {
    setShowLogMaintenance(false)
    setSelectedSchedule(null)
    handleRefresh()
  }

  const handleGroundSuccess = () => {
    handleRefresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-aeria-navy mx-auto" />
          <p className="mt-2 text-gray-500">Loading item details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Item</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex justify-center gap-3">
          <button onClick={handleRefresh} className="btn-primary">
            Try Again
          </button>
          <Link to="/maintenance/items" className="btn-secondary">
            Back to List
          </Link>
        </div>
      </div>
    )
  }

  const status = calculateOverallMaintenanceStatus(item)
  const config = statusConfig[status] || statusConfig.no_schedule
  const StatusIcon = config.icon
  const ItemIcon = itemType === 'aircraft' ? Plane : Package
  const itemName = item?.name || item?.nickname || 'Unknown Item'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/maintenance/items"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Items
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-xl ${config.bg} ${config.border} border`}>
              <ItemIcon className={`w-8 h-8 ${config.text}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{itemName}</h1>
              <div className="flex items-center gap-3 mt-1 text-gray-500">
                {item?.model && <span>{item.model}</span>}
                {item?.serialNumber && (
                  <>
                    <span>•</span>
                    <span>S/N: {item.serialNumber}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                  <StatusIcon className="w-4 h-4" />
                  {config.label}
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 capitalize">
                  {itemType}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogService}
              disabled={item?.isGrounded}
              className="flex items-center gap-2 px-4 py-2 bg-aeria-navy text-white rounded-lg hover:bg-aeria-navy/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wrench className="w-5 h-5" />
              Log Service
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[180px]">
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        setShowGroundModal(true)
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
                        item?.isGrounded
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      {item?.isGrounded ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Return to Service
                        </>
                      ) : (
                        <>
                          <XOctagon className="w-4 h-4" />
                          Ground Item
                        </>
                      )}
                    </button>
                    <Link
                      to={`/${itemType === 'aircraft' ? 'aircraft' : 'equipment'}/${itemId}`}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4" />
                      View in {itemType === 'aircraft' ? 'Fleet' : 'Equipment'}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Grounded Banner */}
        {item?.isGrounded && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <XOctagon className="w-6 h-6 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">This item is currently grounded</p>
                <p className="text-red-700 mt-1">{item.groundedReason}</p>
                {item.groundedDate && (
                  <p className="text-sm text-red-600 mt-2">
                    Grounded on {new Date(item.groundedDate.toDate?.() || item.groundedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Meter Readings */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Meter Readings</h2>
        <ItemMeterDisplay item={item} onUpdate={handleRefresh} />
      </div>

      {/* Applied Schedules */}
      <AppliedSchedulesList item={item} onUpdate={handleRefresh} />

      {/* Maintenance History */}
      <MaintenanceHistoryList item={item} />

      {/* Modals */}
      <GroundItemModal
        isOpen={showGroundModal}
        onClose={() => setShowGroundModal(false)}
        item={item}
        onSuccess={handleGroundSuccess}
      />

      <SelectScheduleModal
        isOpen={showSelectSchedule}
        onClose={() => setShowSelectSchedule(false)}
        item={item}
        onSelectSchedule={handleSelectSchedule}
        onSelectAdHoc={handleSelectAdHoc}
      />

      <LogMaintenanceModal
        isOpen={showLogMaintenance}
        onClose={() => {
          setShowLogMaintenance(false)
          setSelectedSchedule(null)
        }}
        item={item}
        schedule={selectedSchedule}
        onSuccess={handleLogSuccess}
      />
    </div>
  )
}
