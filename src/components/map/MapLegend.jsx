/**
 * MapLegend.jsx
 * Visual legend component for the unified project map
 * 
 * Shows what each map element represents with colors and icons
 * 
 * @location src/components/map/MapLegend.jsx
 * @action NEW
 */

import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Square,
  AlertTriangle,
  Navigation,
  Target,
  Circle,
  Flag,
  ArrowRight,
  Info
} from 'lucide-react'
import { MAP_ELEMENT_STYLES, MAP_LAYERS } from '../../lib/mapDataStructures'

// ============================================
// LEGEND ITEM COMPONENT
// ============================================

function LegendItem({ 
  icon: Icon, 
  label, 
  color, 
  type = 'marker',
  strokeStyle = 'solid',
  fillOpacity = 0.1,
  description 
}) {
  const [showTooltip, setShowTooltip] = useState(false)
  
  return (
    <div 
      className="flex items-center gap-2 py-1 relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Visual indicator based on type */}
      {type === 'marker' && (
        <div 
          className="w-5 h-5 flex items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}20`, border: `2px solid ${color}` }}
        >
          {Icon && <Icon className="w-3 h-3" style={{ color }} />}
        </div>
      )}
      
      {type === 'polygon' && (
        <div 
          className="w-5 h-4 rounded-sm"
          style={{ 
            backgroundColor: `${color}${Math.round(fillOpacity * 255).toString(16).padStart(2, '0')}`,
            border: `2px ${strokeStyle} ${color}`
          }}
        />
      )}
      
      {type === 'line' && (
        <div className="w-5 flex items-center">
          <div 
            className="w-full h-0.5"
            style={{ 
              backgroundColor: color,
              borderStyle: strokeStyle
            }}
          />
          <ArrowRight className="w-3 h-3 -ml-1" style={{ color }} />
        </div>
      )}
      
      <span className="text-xs text-gray-700 flex-1">{label}</span>
      
      {description && (
        <Info className="w-3 h-3 text-gray-400" />
      )}
      
      {/* Tooltip */}
      {showTooltip && description && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg z-50 whitespace-nowrap">
          {description}
        </div>
      )}
    </div>
  )
}

// ============================================
// LEGEND GROUP COMPONENT
// ============================================

function LegendGroup({ title, color, children, defaultExpanded = true }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 transition-colors"
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-medium text-gray-700 flex-1 text-left">
          {title}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-3 h-3 text-gray-400" />
        ) : (
          <ChevronDown className="w-3 h-3 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-2 pb-2 pl-4">
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================
// MAIN LEGEND COMPONENT
// ============================================

export function MapLegend({ 
  visibleLayers = { siteSurvey: true, flightPlan: true, emergency: true },
  compact = false,
  position = 'bottom-left' // 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
}) {
  const [isExpanded, setIsExpanded] = useState(!compact)
  
  // Position classes
  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4'
  }
  
  if (compact && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`absolute ${positionClasses[position]} z-10 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors`}
        title="Show legend"
      >
        <Info className="w-5 h-5 text-gray-600" />
      </button>
    )
  }
  
  return (
    <div className={`${compact ? `absolute ${positionClasses[position]} z-10` : ''} bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden min-w-[180px]`}>
      {/* Header */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Legend
        </span>
        {compact && (
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {/* Site Survey Layer */}
        {visibleLayers.siteSurvey && (
          <LegendGroup 
            title="Site Survey" 
            color={MAP_LAYERS.siteSurvey.color}
          >
            <LegendItem
              icon={MapPin}
              label="Site Location"
              color={MAP_ELEMENT_STYLES.siteLocation.color}
              type="marker"
              description="Center point of operation site"
            />
            <LegendItem
              label="Operations Boundary"
              color={MAP_ELEMENT_STYLES.operationsBoundary.color}
              type="polygon"
              fillOpacity={MAP_ELEMENT_STYLES.operationsBoundary.fillOpacity}
              strokeStyle={MAP_ELEMENT_STYLES.operationsBoundary.strokeStyle}
              description="Area where operations will take place"
            />
            <LegendItem
              icon={AlertTriangle}
              label="Obstacle"
              color={MAP_ELEMENT_STYLES.obstacles.color}
              type="marker"
              description="Identified obstacles (towers, wires, etc.)"
            />
          </LegendGroup>
        )}
        
        {/* Flight Plan Layer */}
        {visibleLayers.flightPlan && (
          <LegendGroup 
            title="Flight Plan" 
            color={MAP_LAYERS.flightPlan.color}
          >
            <LegendItem
              icon={Navigation}
              label="Launch Point"
              color={MAP_ELEMENT_STYLES.launchPoint.color}
              type="marker"
              description="RPAS launch/takeoff location"
            />
            <LegendItem
              icon={Target}
              label="Recovery Point"
              color={MAP_ELEMENT_STYLES.recoveryPoint.color}
              type="marker"
              description="RPAS landing/recovery location"
            />
            <LegendItem
              icon={Circle}
              label="Pilot Position"
              color={MAP_ELEMENT_STYLES.pilotPosition.color}
              type="marker"
              description="Remote pilot operating position"
            />
            <LegendItem
              label="Flight Geography"
              color={MAP_ELEMENT_STYLES.flightGeography.color}
              type="polygon"
              fillOpacity={MAP_ELEMENT_STYLES.flightGeography.fillOpacity}
              strokeStyle="dashed"
              description="Intended flight area (SORA)"
            />
            <LegendItem
              label="Contingency Volume"
              color={MAP_ELEMENT_STYLES.contingencyVolume.color}
              type="polygon"
              fillOpacity={MAP_ELEMENT_STYLES.contingencyVolume.fillOpacity}
              strokeStyle="dotted"
              description="Buffer for abnormal situations"
            />
            <LegendItem
              label="Ground Risk Buffer"
              color={MAP_ELEMENT_STYLES.groundRiskBuffer.color}
              type="polygon"
              fillOpacity={MAP_ELEMENT_STYLES.groundRiskBuffer.fillOpacity}
              strokeStyle="dotted"
              description="Extended ground risk area"
            />
          </LegendGroup>
        )}
        
        {/* Emergency Layer */}
        {visibleLayers.emergency && (
          <LegendGroup 
            title="Emergency" 
            color={MAP_LAYERS.emergency.color}
          >
            <LegendItem
              icon={Flag}
              label="Muster Point"
              color={MAP_ELEMENT_STYLES.musterPoints.color}
              type="marker"
              description="Emergency assembly location"
            />
            <LegendItem
              label="Evacuation Route"
              color={MAP_ELEMENT_STYLES.evacuationRoutes.color}
              type="line"
              strokeStyle="solid"
              description="Primary evacuation path"
            />
          </LegendGroup>
        )}
      </div>
    </div>
  )
}

// ============================================
// INLINE LEGEND (for use in panels)
// ============================================

export function InlineLegend({ 
  layer,
  elements = [] 
}) {
  const layerConfig = MAP_LAYERS[layer]
  if (!layerConfig) return null
  
  // Filter to only show elements that exist in the provided list
  const elementConfigs = elements
    .map(elementType => MAP_ELEMENT_STYLES[elementType])
    .filter(Boolean)
  
  if (elementConfigs.length === 0) return null
  
  return (
    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
      {elementConfigs.map(config => (
        <div key={config.label} className="flex items-center gap-1.5">
          {config.type === 'marker' && (
            <div 
              className="w-3 h-3 rounded-full border-2"
              style={{ borderColor: config.color, backgroundColor: `${config.color}20` }}
            />
          )}
          {config.type === 'polygon' && (
            <div 
              className="w-4 h-3 rounded-sm"
              style={{ 
                backgroundColor: `${config.color}15`,
                border: `1.5px ${config.strokeStyle || 'solid'} ${config.color}`
              }}
            />
          )}
          {config.type === 'line' && (
            <div 
              className="w-4 h-0 border-t-2"
              style={{ borderColor: config.color }}
            />
          )}
          <span>{config.label}</span>
        </div>
      ))}
    </div>
  )
}

// ============================================
// SITE COLOR LEGEND (for multi-site view)
// ============================================

export function SiteColorLegend({ sites, activeSiteId }) {
  if (!Array.isArray(sites) || sites.length <= 1) return null
  
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-2">
      <p className="text-xs font-medium text-gray-500 mb-1">Sites</p>
      <div className="space-y-1">
        {sites.map((site, index) => {
          const isActive = site.id === activeSiteId
          const color = `hsl(${index * 60}, 70%, 50%)`
          
          return (
            <div 
              key={site.id}
              className={`flex items-center gap-2 px-1 py-0.5 rounded ${
                isActive ? 'bg-gray-100' : ''
              }`}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className={`text-xs ${isActive ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                {site.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MapLegend
