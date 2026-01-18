/**
 * MapControls.jsx
 * Control panel for the unified project map
 * 
 * Includes:
 * - Site selector dropdown
 * - Layer visibility toggles
 * - Drawing tool buttons
 * - Basemap switcher
 * - View controls (fit to site/all)
 * 
 * @location src/components/map/MapControls.jsx
 * @action NEW
 */

import React, { useState } from 'react'
import {
  MapPin,
  Layers,
  PenTool,
  Map,
  Globe,
  Mountain,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Maximize2,
  Target,
  Trash2,
  X,
  Check,
  Square,
  Circle,
  Navigation,
  Flag,
  Plane,
  AlertTriangle,
  Copy,
  MoreVertical
} from 'lucide-react'
import { MAP_LAYERS, MAP_BASEMAPS, SITE_STATUS } from '../../lib/mapDataStructures'
import { DRAWING_MODES } from '../../hooks/useMapData'

// ============================================
// SITE SELECTOR COMPONENT
// ============================================

export function SiteSelector({ 
  sites, 
  activeSiteId, 
  onSelectSite, 
  onAddSite,
  onDuplicateSite,
  onDeleteSite,
  editMode = false,
  compact = false 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState(null)
  
  const activeSite = sites.find(s => s.id === activeSiteId)
  
  if (compact) {
    return (
      <div className="relative">
        <select
          value={activeSiteId || ''}
          onChange={(e) => onSelectSite(e.target.value)}
          className="input text-sm py-1.5 pr-8"
        >
          {sites.map(site => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Sites ({sites.length}/10)
          </span>
          {editMode && sites.length < 10 && (
            <button
              onClick={onAddSite}
              className="p-1 text-aeria-navy hover:bg-aeria-navy/10 rounded transition-colors"
              title="Add new site"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="max-h-60 overflow-y-auto">
        {sites.map((site, index) => {
          const isActive = site.id === activeSiteId
          const status = SITE_STATUS[site.status] || SITE_STATUS.draft
          
          return (
            <div
              key={site.id}
              className={`relative flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                isActive 
                  ? 'bg-aeria-navy/10 border-l-2 border-aeria-navy' 
                  : 'hover:bg-gray-50 border-l-2 border-transparent'
              }`}
              onClick={() => onSelectSite(site.id)}
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
              />
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isActive ? 'text-aeria-navy' : 'text-gray-900'}`}>
                  {site.name}
                </p>
                <span className={`text-xs px-1.5 py-0.5 rounded ${status.color}`}>
                  {status.label}
                </span>
              </div>
              
              {editMode && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpenId(menuOpenId === site.id ? null : site.id)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {menuOpenId === site.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuOpenId(null)
                        }}
                      />
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDuplicateSite?.(site.id)
                            setMenuOpenId(null)
                          }}
                          className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </button>
                        {sites.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteSite?.(site.id)
                              setMenuOpenId(null)
                            }}
                            className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// LAYER TOGGLE COMPONENT
// ============================================

export function LayerToggles({ 
  visibleLayers, 
  onToggleLayer, 
  allowedLayers = ['siteSurvey', 'flightPlan', 'emergency'],
  compact = false 
}) {
  const [isExpanded, setIsExpanded] = useState(!compact)
  
  const layers = Object.entries(MAP_LAYERS).filter(([id]) => allowedLayers.includes(id))
  
  if (compact) {
    return (
      <div className="flex items-center gap-1 bg-white rounded-lg shadow border border-gray-200 p-1">
        {layers.map(([id, layer]) => {
          const isVisible = visibleLayers[id]
          return (
            <button
              key={id}
              onClick={() => onToggleLayer(id)}
              className={`p-2 rounded transition-colors ${
                isVisible 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={`${isVisible ? 'Hide' : 'Show'} ${layer.label}`}
              style={{ color: isVisible ? layer.color : undefined }}
            >
              {id === 'siteSurvey' && <MapPin className="w-4 h-4" />}
              {id === 'flightPlan' && <Plane className="w-4 h-4" />}
              {id === 'emergency' && <AlertTriangle className="w-4 h-4" />}
            </button>
          )
        })}
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between"
      >
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Layers
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-2 space-y-1">
          {layers.map(([id, layer]) => {
            const isVisible = visibleLayers[id]
            return (
              <button
                key={id}
                onClick={() => onToggleLayer(id)}
                className={`w-full flex items-center gap-3 px-2 py-1.5 rounded transition-colors ${
                  isVisible ? 'bg-gray-50' : 'opacity-50'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="flex-1 text-left text-sm text-gray-700">
                  {layer.label}
                </span>
                {isVisible ? (
                  <Eye className="w-4 h-4 text-gray-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================
// DRAWING TOOLS COMPONENT
// ============================================

export function DrawingTools({ 
  drawingMode, 
  isDrawing,
  drawingPoints,
  onStartDrawing, 
  onCancelDrawing,
  onCompleteDrawing,
  onRemoveLastPoint,
  activeLayer = 'siteSurvey',
  editMode = false 
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  if (!editMode) return null
  
  // Group drawing modes by layer
  const toolGroups = {
    siteSurvey: [
      { mode: 'siteLocation', icon: MapPin, label: 'Site Location' },
      { mode: 'operationsBoundary', icon: Square, label: 'Boundary' },
      { mode: 'obstacle', icon: AlertTriangle, label: 'Obstacle' }
    ],
    flightPlan: [
      { mode: 'launchPoint', icon: Navigation, label: 'Launch' },
      { mode: 'recoveryPoint', icon: Target, label: 'Recovery' },
      { mode: 'pilotPosition', icon: Circle, label: 'Pilot' },
      { mode: 'flightGeography', icon: Square, label: 'Flight Area' }
    ],
    emergency: [
      { mode: 'musterPoint', icon: Flag, label: 'Muster' },
      { mode: 'evacuationRoute', icon: Navigation, label: 'Evac Route' }
    ]
  }
  
  const currentTools = toolGroups[activeLayer] || []
  
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between"
      >
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <PenTool className="w-4 h-4" />
          Drawing Tools
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-2">
          {/* Active drawing indicator */}
          {isDrawing && (
            <div className="mb-2 p-2 bg-aeria-navy/10 rounded-lg">
              <p className="text-xs font-medium text-aeria-navy mb-1">
                {DRAWING_MODES[drawingMode.id]?.label || 'Drawing'}
              </p>
              {drawingMode.type === 'polygon' && (
                <p className="text-xs text-gray-600">
                  Points: {drawingPoints.length} (need 3+)
                </p>
              )}
              {drawingMode.type === 'line' && (
                <p className="text-xs text-gray-600">
                  Points: {drawingPoints.length} (need 2+)
                </p>
              )}
              <div className="flex gap-1 mt-2">
                {drawingPoints.length > 0 && (
                  <button
                    onClick={onRemoveLastPoint}
                    className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Undo
                  </button>
                )}
                <button
                  onClick={onCancelDrawing}
                  className="flex-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Cancel
                </button>
                {((drawingMode.type === 'polygon' && drawingPoints.length >= 3) ||
                  (drawingMode.type === 'line' && drawingPoints.length >= 2)) && (
                  <button
                    onClick={() => onCompleteDrawing()}
                    className="flex-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Tool buttons */}
          <div className="grid grid-cols-2 gap-1">
            {currentTools.map(({ mode, icon: Icon, label }) => {
              const isActive = drawingMode.id === mode
              return (
                <button
                  key={mode}
                  onClick={() => isActive ? onCancelDrawing() : onStartDrawing(mode)}
                  disabled={isDrawing && !isActive}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                    isActive
                      ? 'bg-aeria-navy text-white'
                      : isDrawing
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// BASEMAP SWITCHER COMPONENT
// ============================================

export function BasemapSwitcher({ currentBasemap, onChangeBasemap }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const basemaps = Object.values(MAP_BASEMAPS)
  const current = MAP_BASEMAPS[currentBasemap] || MAP_BASEMAPS.streets
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-white rounded-lg shadow border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Change basemap"
      >
        {current.id === 'satellite' ? (
          <Globe className="w-5 h-5 text-gray-700" />
        ) : current.id === 'outdoors' ? (
          <Mountain className="w-5 h-5 text-gray-700" />
        ) : (
          <Map className="w-5 h-5 text-gray-700" />
        )}
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
            {basemaps.map(basemap => (
              <button
                key={basemap.id}
                onClick={() => {
                  onChangeBasemap(basemap.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  current.id === basemap.id
                    ? 'bg-aeria-navy/10 text-aeria-navy'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {basemap.id === 'satellite' ? (
                  <Globe className="w-4 h-4" />
                ) : basemap.id === 'outdoors' ? (
                  <Mountain className="w-4 h-4" />
                ) : (
                  <Map className="w-4 h-4" />
                )}
                {basemap.label}
                {current.id === basemap.id && (
                  <Check className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ============================================
// VIEW CONTROLS COMPONENT
// ============================================

export function ViewControls({ 
  onFitToSite, 
  onFitToAll, 
  onZoomIn, 
  onZoomOut,
  showAllSites,
  onToggleShowAll 
}) {
  return (
    <div className="flex flex-col gap-1 bg-white rounded-lg shadow border border-gray-200 p-1">
      <button
        onClick={onZoomIn}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
        title="Zoom in"
      >
        <Plus className="w-5 h-5" />
      </button>
      
      <button
        onClick={onZoomOut}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
        title="Zoom out"
      >
        <Minus className="w-5 h-5" />
      </button>
      
      <div className="w-full h-px bg-gray-200 my-1" />
      
      <button
        onClick={onFitToSite}
        className={`p-2 rounded transition-colors ${
          !showAllSites 
            ? 'text-aeria-navy bg-aeria-navy/10' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        title="Fit to active site"
      >
        <Target className="w-5 h-5" />
      </button>
      
      <button
        onClick={onFitToAll}
        className={`p-2 rounded transition-colors ${
          showAllSites 
            ? 'text-aeria-navy bg-aeria-navy/10' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        title="Fit to all sites"
      >
        <Maximize2 className="w-5 h-5" />
      </button>
    </div>
  )
}

// ============================================
// COMBINED CONTROLS PANEL
// ============================================

export function MapControlsPanel({
  // Site props
  sites,
  activeSiteId,
  onSelectSite,
  onAddSite,
  onDuplicateSite,
  onDeleteSite,
  
  // Layer props
  visibleLayers,
  onToggleLayer,
  allowedLayers,
  
  // Drawing props
  drawingMode,
  isDrawing,
  drawingPoints,
  onStartDrawing,
  onCancelDrawing,
  onCompleteDrawing,
  onRemoveLastPoint,
  activeLayer,
  
  // Basemap props
  currentBasemap,
  onChangeBasemap,
  
  // View props
  onFitToSite,
  onFitToAll,
  onZoomIn,
  onZoomOut,
  showAllSites,
  
  // Mode
  editMode = false,
  position = 'left' // 'left' | 'right'
}) {
  const positionClasses = position === 'right' 
    ? 'right-4' 
    : 'left-4'
  
  return (
    <>
      {/* Left/Right side controls */}
      <div className={`absolute top-4 ${positionClasses} z-10 flex flex-col gap-3 max-h-[calc(100%-8rem)] overflow-y-auto`}>
        <SiteSelector
          sites={sites}
          activeSiteId={activeSiteId}
          onSelectSite={onSelectSite}
          onAddSite={onAddSite}
          onDuplicateSite={onDuplicateSite}
          onDeleteSite={onDeleteSite}
          editMode={editMode}
        />
        
        <LayerToggles
          visibleLayers={visibleLayers}
          onToggleLayer={onToggleLayer}
          allowedLayers={allowedLayers}
        />
        
        {editMode && (
          <DrawingTools
            drawingMode={drawingMode}
            isDrawing={isDrawing}
            drawingPoints={drawingPoints}
            onStartDrawing={onStartDrawing}
            onCancelDrawing={onCancelDrawing}
            onCompleteDrawing={onCompleteDrawing}
            onRemoveLastPoint={onRemoveLastPoint}
            activeLayer={activeLayer}
            editMode={editMode}
          />
        )}
      </div>
      
      {/* Bottom right controls */}
      <div className="absolute bottom-4 right-4 z-10 flex items-end gap-2">
        <BasemapSwitcher
          currentBasemap={currentBasemap}
          onChangeBasemap={onChangeBasemap}
        />
        
        <ViewControls
          onFitToSite={onFitToSite}
          onFitToAll={onFitToAll}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          showAllSites={showAllSites}
        />
      </div>
    </>
  )
}

export default MapControlsPanel
