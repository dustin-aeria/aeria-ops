/**
 * FHARiskMatrix.jsx
 * Risk matrix component for FHA display and selection
 *
 * Supports:
 * - Display mode: Shows FHAs plotted on matrix
 * - Selector mode: Interactive likelihood/severity picker
 * - Summary mode: Compact risk level indicator
 *
 * @location src/components/fha/FHARiskMatrix.jsx
 */

import { useState } from 'react'
import { Info } from 'lucide-react'
import {
  LIKELIHOOD_RATINGS,
  SEVERITY_RATINGS,
  getRiskLevel,
  calculateRiskScore
} from '../../lib/firestoreFHA'

// Risk cell colors based on score
const getCellColor = (likelihood, severity) => {
  const score = likelihood * severity
  if (score <= 4) return 'bg-green-200 hover:bg-green-300'
  if (score <= 9) return 'bg-yellow-200 hover:bg-yellow-300'
  if (score <= 16) return 'bg-orange-200 hover:bg-orange-300'
  return 'bg-red-200 hover:bg-red-300'
}

const getCellColorSelected = (likelihood, severity) => {
  const score = likelihood * severity
  if (score <= 4) return 'bg-green-500 ring-2 ring-green-600'
  if (score <= 9) return 'bg-yellow-500 ring-2 ring-yellow-600'
  if (score <= 16) return 'bg-orange-500 ring-2 ring-orange-600'
  return 'bg-red-500 ring-2 ring-red-600'
}

/**
 * Risk Matrix Display - Shows FHAs plotted on matrix
 */
export function RiskMatrixDisplay({ fhas = [], onCellClick }) {
  // Build matrix data
  const matrix = {}
  fhas.forEach((fha, idx) => {
    const key = `${fha.likelihood}-${fha.severity}`
    if (!matrix[key]) matrix[key] = []
    matrix[key].push({ fha, index: idx })
  })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-700">Risk Matrix Overview</h4>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Info className="w-3 h-3" />
          {fhas.length} FHA{fhas.length !== 1 ? 's' : ''} plotted
        </div>
      </div>

      <div className="overflow-x-auto">
        {/* Severity axis label */}
        <div className="text-center text-xs font-medium text-gray-600 mb-1">
          Severity →
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="p-1 text-right pr-2 text-gray-500 text-[10px] align-bottom">
                <div className="whitespace-nowrap">Likelihood ↓</div>
              </th>
              {SEVERITY_RATINGS.map(s => (
                <th key={s.value} className="p-1 text-center" title={s.description}>
                  <div className="font-medium text-gray-600">{s.value}</div>
                  <div className="text-[10px] text-gray-400 font-normal truncate max-w-[60px]">{s.label}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...LIKELIHOOD_RATINGS].reverse().map(l => (
              <tr key={l.value}>
                <td className="p-1 text-right pr-2" title={l.description}>
                  <div className="font-medium text-gray-600">{l.value}</div>
                  <div className="text-[10px] text-gray-400 truncate max-w-[70px]">{l.label}</div>
                </td>
                {SEVERITY_RATINGS.map(s => {
                  const key = `${l.value}-${s.value}`
                  const cellData = matrix[key] || []
                  const hasItems = cellData.length > 0
                  const score = l.value * s.value

                  return (
                    <td
                      key={s.value}
                      className={`p-1 text-center border border-gray-300 ${getCellColor(l.value, s.value)} ${
                        hasItems ? 'font-bold cursor-pointer' : ''
                      }`}
                      onClick={() => hasItems && onCellClick?.(cellData)}
                      title={hasItems ? `${cellData.length} FHA(s): Click to view` : `${l.label} × ${s.label} = ${score}`}
                    >
                      {hasItems ? cellData.length : ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Enhanced Legend */}
        <div className="mt-4 p-3 bg-gray-50 rounded border">
          <p className="text-xs font-medium text-gray-700 mb-2">Risk Levels (Likelihood × Severity)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-200 rounded border border-green-300"></span>
              <span><strong>Low</strong> (1-4)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-yellow-200 rounded border border-yellow-300"></span>
              <span><strong>Medium</strong> (5-9)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-orange-200 rounded border border-orange-300"></span>
              <span><strong>High</strong> (10-16)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-red-200 rounded border border-red-300"></span>
              <span><strong>Critical</strong> (17-25)</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Click on cells with FHAs to view details.</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Risk Matrix Selector - Interactive likelihood/severity picker
 */
export function RiskMatrixSelector({
  likelihood,
  severity,
  onChange,
  label = 'Select Risk Level',
  showLabels = true
}) {
  const [hoveredCell, setHoveredCell] = useState(null)

  const handleCellClick = (l, s) => {
    onChange?.({ likelihood: l, severity: s })
  }

  const currentScore = likelihood && severity ? likelihood * severity : null
  const currentRisk = currentScore ? getRiskLevel(currentScore) : null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {label && <h4 className="text-sm font-medium text-gray-700 mb-3">{label}</h4>}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="p-1"></th>
              {SEVERITY_RATINGS.map(s => (
                <th
                  key={s.value}
                  className="p-1 text-center font-medium text-gray-600"
                  title={`${s.label}: ${s.description}`}
                >
                  {showLabels ? s.label.substring(0, 3) : s.value}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...LIKELIHOOD_RATINGS].reverse().map(l => (
              <tr key={l.value}>
                <td
                  className="p-1 font-medium text-gray-600 text-right pr-2"
                  title={`${l.label}: ${l.description}`}
                >
                  {showLabels ? l.label.substring(0, 3) : l.value}
                </td>
                {SEVERITY_RATINGS.map(s => {
                  const isSelected = likelihood === l.value && severity === s.value
                  const isHovered = hoveredCell?.l === l.value && hoveredCell?.s === s.value
                  const score = l.value * s.value

                  return (
                    <td
                      key={s.value}
                      className={`p-2 text-center border border-gray-300 cursor-pointer transition-all ${
                        isSelected
                          ? getCellColorSelected(l.value, s.value) + ' text-white font-bold'
                          : getCellColor(l.value, s.value)
                      } ${isHovered && !isSelected ? 'ring-2 ring-gray-400' : ''}`}
                      onClick={() => handleCellClick(l.value, s.value)}
                      onMouseEnter={() => setHoveredCell({ l: l.value, s: s.value })}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={`L:${l.value} (${l.label}) × S:${s.value} (${s.label}) = ${score}`}
                    >
                      {score}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Current selection display */}
      {currentScore && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Likelihood: <strong>{LIKELIHOOD_RATINGS.find(l => l.value === likelihood)?.label}</strong> ({likelihood})
            </span>
            <span className={`px-2 py-0.5 rounded font-medium ${currentRisk.bgColor} ${currentRisk.textColor}`}>
              {currentRisk.level} ({currentScore})
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Severity: <strong>{SEVERITY_RATINGS.find(s => s.value === severity)?.label}</strong> ({severity})
          </div>
        </div>
      )}

      {/* Hover preview */}
      {hoveredCell && !(likelihood === hoveredCell.l && severity === hoveredCell.s) && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Click to select: L:{hoveredCell.l} × S:{hoveredCell.s} = {hoveredCell.l * hoveredCell.s}
        </div>
      )}
    </div>
  )
}

/**
 * Compact Risk Badge with mini matrix tooltip
 */
export function RiskBadgeWithMatrix({ likelihood, severity, showTooltip = true }) {
  const [showMatrix, setShowMatrix] = useState(false)
  const score = likelihood * severity
  const { level, bgColor, textColor } = getRiskLevel(score)

  return (
    <div className="relative inline-block">
      <span
        className={`inline-flex items-center px-2 py-1 rounded font-medium text-sm cursor-help ${bgColor} ${textColor}`}
        onMouseEnter={() => showTooltip && setShowMatrix(true)}
        onMouseLeave={() => setShowMatrix(false)}
      >
        {level} ({score})
      </span>

      {showMatrix && showTooltip && (
        <div className="absolute z-20 left-0 top-full mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="text-xs text-gray-600 mb-2">
            <div>Likelihood: {likelihood} ({LIKELIHOOD_RATINGS.find(l => l.value === likelihood)?.label})</div>
            <div>Severity: {severity} ({SEVERITY_RATINGS.find(s => s.value === severity)?.label})</div>
          </div>
          <MiniMatrix likelihood={likelihood} severity={severity} />
        </div>
      )}
    </div>
  )
}

/**
 * Mini 5x5 matrix showing selected cell
 */
function MiniMatrix({ likelihood, severity }) {
  return (
    <div className="grid grid-cols-5 gap-0.5 w-20">
      {[5, 4, 3, 2, 1].map(l => (
        [1, 2, 3, 4, 5].map(s => {
          const isSelected = l === likelihood && s === severity
          const score = l * s
          let bgClass = 'bg-green-200'
          if (score > 4) bgClass = 'bg-yellow-200'
          if (score > 9) bgClass = 'bg-orange-200'
          if (score > 16) bgClass = 'bg-red-200'

          return (
            <div
              key={`${l}-${s}`}
              className={`w-3 h-3 rounded-sm ${bgClass} ${isSelected ? 'ring-2 ring-gray-800' : ''}`}
            />
          )
        })
      ))}
    </div>
  )
}

/**
 * Risk Summary Stats - Shows distribution across risk levels
 */
export function RiskSummaryStats({ fhas = [] }) {
  const stats = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  }

  fhas.forEach(fha => {
    const { level } = getRiskLevel(fha.riskScore)
    stats[level.toLowerCase()]++
  })

  const total = fhas.length

  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="bg-red-50 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
        <div className="text-xs text-red-600">Critical</div>
        {total > 0 && (
          <div className="text-xs text-red-500">{Math.round((stats.critical / total) * 100)}%</div>
        )}
      </div>
      <div className="bg-orange-50 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-orange-700">{stats.high}</div>
        <div className="text-xs text-orange-600">High</div>
        {total > 0 && (
          <div className="text-xs text-orange-500">{Math.round((stats.high / total) * 100)}%</div>
        )}
      </div>
      <div className="bg-yellow-50 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-yellow-700">{stats.medium}</div>
        <div className="text-xs text-yellow-600">Medium</div>
        {total > 0 && (
          <div className="text-xs text-yellow-500">{Math.round((stats.medium / total) * 100)}%</div>
        )}
      </div>
      <div className="bg-green-50 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-green-700">{stats.low}</div>
        <div className="text-xs text-green-600">Low</div>
        {total > 0 && (
          <div className="text-xs text-green-500">{Math.round((stats.low / total) * 100)}%</div>
        )}
      </div>
    </div>
  )
}

// Default export for convenience
export default RiskMatrixSelector
