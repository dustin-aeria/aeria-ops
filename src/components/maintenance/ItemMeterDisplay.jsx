/**
 * ItemMeterDisplay.jsx
 * Display and edit meter readings (hours, cycles, flights) for an item
 *
 * @location src/components/maintenance/ItemMeterDisplay.jsx
 */

import { useState } from 'react'
import { Gauge, Clock, RotateCcw, Plane, Pencil, Check, X, Loader2 } from 'lucide-react'
import { updateItemMeters } from '../../lib/firestoreMaintenance'

export default function ItemMeterDisplay({ item, onUpdate }) {
  const [editing, setEditing] = useState(null) // 'hours' | 'cycles' | 'flights' | null
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  const isAircraft = item?.itemType === 'aircraft'
  const hours = item?.currentHours || item?.totalFlightHours || 0
  const cycles = item?.currentCycles || item?.totalCycles || 0
  const flights = item?.totalFlights || 0

  const handleEdit = (field, currentValue) => {
    setEditing(field)
    setEditValue(currentValue?.toString() || '0')
  }

  const handleCancel = () => {
    setEditing(null)
    setEditValue('')
  }

  const handleSave = async () => {
    if (!editing) return

    setSaving(true)
    try {
      const meters = {}
      const value = editing === 'hours'
        ? parseFloat(editValue) || 0
        : parseInt(editValue) || 0

      if (editing === 'hours') {
        meters.hours = value
      } else if (editing === 'cycles') {
        meters.cycles = value
      } else if (editing === 'flights') {
        meters.flights = value
      }

      await updateItemMeters(item.id, item.itemType, meters)

      if (onUpdate) {
        onUpdate()
      }

      setEditing(null)
      setEditValue('')
    } catch (err) {
      console.error('Failed to update meters:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const MeterCard = ({ icon: Icon, label, value, unit, field, editable = true }) => {
    const isEditing = editing === field

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Icon className="w-4 h-4" />
            <span className="text-sm">{label}</span>
          </div>
          {editable && !isEditing && (
            <button
              onClick={() => handleEdit(field, value)}
              className="p-1 text-gray-400 hover:text-aeria-navy rounded"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              step={field === 'hours' ? '0.1' : '1'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="flex-1 px-2 py-1 text-2xl font-bold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-aeria-navy"
            />
            <div className="flex gap-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              {field === 'hours' ? value.toFixed(1) : value.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">{unit}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <MeterCard
        icon={isAircraft ? Clock : Gauge}
        label={isAircraft ? 'Flight Hours' : 'Operating Hours'}
        value={hours}
        unit="hrs"
        field="hours"
      />
      <MeterCard
        icon={RotateCcw}
        label="Cycles"
        value={cycles}
        unit="cycles"
        field="cycles"
      />
      {isAircraft && (
        <MeterCard
          icon={Plane}
          label="Total Flights"
          value={flights}
          unit="flights"
          field="flights"
        />
      )}
    </div>
  )
}
