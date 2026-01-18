// ============================================
// SHARED MAP COMPONENTS
// Reusable map preview and editor for Site Survey, Flight Plan, Emergency
// 
// @location src/components/project/MapComponents.jsx
// @action NEW FILE
// ============================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  MapPin, X, Loader2, Search, Target, Navigation, Trash2, RotateCcw, 
  CheckCircle2, Layers, ZoomIn, ZoomOut, Crosshair, Route
} from 'lucide-react'

// ============================================
// UTILITY: Load Leaflet
// ============================================
const loadLeaflet = () => {
  return new Promise((resolve) => {
    // Add CSS if not present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Add modal fix CSS
    if (!document.getElementById('leaflet-modal-fix')) {
      const style = document.createElement('style')
      style.id = 'leaflet-modal-fix'
      style.textContent = `
        .leaflet-container { width: 100% !important; height: 100% !important; z-index: 1; }
        .leaflet-control-container { z-index: 800; }
        .leaflet-pane { z-index: 400; }
        .leaflet-tile-pane { z-index: 200; }
        .leaflet-overlay-pane { z-index: 400; }
        .leaflet-marker-pane { z-index: 600; }
        .leaflet-popup-pane { z-index: 700; }
        .custom-marker { background: transparent !important; border: none !important; }
      `
      document.head.appendChild(style)
    }

    if (window.L) {
      resolve(window.L)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve(window.L)
    document.body.appendChild(script)
  })
}

// ============================================
// UTILITY: Create Marker Icon
// ============================================
const createMarkerIcon = (L, color, emoji, size = 32) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    "><span style="transform: rotate(45deg); font-size: ${size * 0.45}px;">${emoji}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size]
  })
}

// ============================================
// MAP PREVIEW COMPONENT (Read-only inline display)
// ============================================
export function MapPreview({ 
  siteLocation,
  boundary = [],
  launchPoint,
  recoveryPoint,
  musterPoints = [],
  evacuationRoutes = [],
  height = 200,
  onOpenEditor,
  showLabels = true
}) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!mapContainerRef.current) return

    const initMap = async () => {
      const L = await loadLeaflet()
      
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      await new Promise(resolve => setTimeout(resolve, 50))

      const defaultLat = siteLocation?.lat || 54.0
      const defaultLng = siteLocation?.lng || -125.0
      const hasLocation = siteLocation?.lat
      const defaultZoom = hasLocation ? 14 : 4

      const map = L.map(mapContainerRef.current, {
        center: [parseFloat(defaultLat), parseFloat(defaultLng)],
        zoom: defaultZoom,
        zoomControl: false,
        dragging: true,
        scrollWheelZoom: false
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OSM',
        maxZoom: 19
      }).addTo(map)

      mapRef.current = map

      // Site marker
      if (siteLocation?.lat && siteLocation?.lng) {
        const marker = L.marker([siteLocation.lat, siteLocation.lng], {
          icon: createMarkerIcon(L, '#1e40af', '📍', 28)
        }).addTo(map)
        if (showLabels) marker.bindTooltip('Site Location')
      }

      // Boundary polygon
      if (boundary.length >= 3) {
        L.polygon(boundary.map(p => [p.lat, p.lng]), {
          color: '#9333ea',
          fillColor: '#9333ea',
          fillOpacity: 0.15,
          weight: 2
        }).addTo(map)
      }

      // Launch point
      if (launchPoint?.lat && launchPoint?.lng) {
        const marker = L.marker([launchPoint.lat, launchPoint.lng], {
          icon: createMarkerIcon(L, '#16a34a', '🚀', 24)
        }).addTo(map)
        if (showLabels) marker.bindTooltip('Launch')
      }

      // Recovery point
      if (recoveryPoint?.lat && recoveryPoint?.lng) {
        const marker = L.marker([recoveryPoint.lat, recoveryPoint.lng], {
          icon: createMarkerIcon(L, '#dc2626', '🎯', 24)
        }).addTo(map)
        if (showLabels) marker.bindTooltip('Recovery')
      }

      // Muster points
      musterPoints.forEach(mp => {
        if (mp.coordinates?.lat && mp.coordinates?.lng) {
          const marker = L.marker([mp.coordinates.lat, mp.coordinates.lng], {
            icon: createMarkerIcon(L, '#f59e0b', '🚨', 24)
          }).addTo(map)
          if (showLabels) marker.bindTooltip(mp.name || 'Muster')
        }
      })

      // Evacuation routes
      evacuationRoutes.forEach(route => {
        if (route.coordinates && route.coordinates.length >= 2) {
          L.polyline(route.coordinates.map(c => [c.lat, c.lng]), {
            color: '#ef4444',
            weight: 3,
            dashArray: '8, 8'
          }).addTo(map)
        }
      })

      // Fit bounds if we have content
      const allPoints = []
      if (siteLocation?.lat) allPoints.push([siteLocation.lat, siteLocation.lng])
      if (launchPoint?.lat) allPoints.push([launchPoint.lat, launchPoint.lng])
      if (recoveryPoint?.lat) allPoints.push([recoveryPoint.lat, recoveryPoint.lng])
      boundary.forEach(p => allPoints.push([p.lat, p.lng]))
      musterPoints.forEach(mp => {
        if (mp.coordinates?.lat) allPoints.push([mp.coordinates.lat, mp.coordinates.lng])
      })

      if (allPoints.length > 1) {
        map.fitBounds(allPoints, { padding: [20, 20] })
      }

      setIsLoading(false)
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [siteLocation, boundary, launchPoint, recoveryPoint, musterPoints, evacuationRoutes])

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-aeria-blue" />
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Edit button overlay */}
      {onOpenEditor && (
        <button
          onClick={onOpenEditor}
          className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 hover:bg-white text-sm font-medium rounded-lg shadow border border-gray-200 flex items-center gap-1 z-20"
        >
          <MapPin className="w-4 h-4" />
          Edit Map
        </button>
      )}

      {/* Status indicators */}
      {!siteLocation?.lat && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
          <p className="text-sm text-gray-500">No location set - click Edit Map</p>
        </div>
      )}
    </div>
  )
}

// ============================================
// FULL MAP EDITOR MODAL
// ============================================
export function MapEditorModal({
  isOpen,
  onClose,
  onSave,
  // Initial values
  siteLocation,
  boundary = [],
  launchPoint,
  recoveryPoint,
  musterPoints = [],
  evacuationRoutes = [],
  // Mode configuration
  mode = 'site', // 'site' | 'flight' | 'emergency'
  siteName = 'Site'
}) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const boundaryLayerRef = useRef(null)
  const boundaryVertexMarkersRef = useRef([])
  const routeLayersRef = useRef([])

  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  
  // Editing state
  const [activeMode, setActiveMode] = useState(
    mode === 'site' ? 'site' : 
    mode === 'flight' ? 'launch' : 
    'muster'
  )
  const [isDrawingBoundary, setIsDrawingBoundary] = useState(false)
  const [isDrawingRoute, setIsDrawingRoute] = useState(false)
  const [currentRoutePoints, setCurrentRoutePoints] = useState([])

  // Local state for editing
  const [localSiteLocation, setLocalSiteLocation] = useState(siteLocation)
  const [localBoundary, setLocalBoundary] = useState(boundary)
  const [localLaunchPoint, setLocalLaunchPoint] = useState(launchPoint)
  const [localRecoveryPoint, setLocalRecoveryPoint] = useState(recoveryPoint)
  const [localMusterPoints, setLocalMusterPoints] = useState(musterPoints)
  const [localRoutes, setLocalRoutes] = useState(evacuationRoutes)

  // Refs for click handler
  const activeModeRef = useRef(activeMode)
  const isDrawingBoundaryRef = useRef(isDrawingBoundary)
  const isDrawingRouteRef = useRef(isDrawingRoute)

  useEffect(() => { activeModeRef.current = activeMode }, [activeMode])
  useEffect(() => { isDrawingBoundaryRef.current = isDrawingBoundary }, [isDrawingBoundary])
  useEffect(() => { isDrawingRouteRef.current = isDrawingRoute }, [isDrawingRoute])

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSiteLocation(siteLocation)
      setLocalBoundary(boundary || [])
      setLocalLaunchPoint(launchPoint)
      setLocalRecoveryPoint(recoveryPoint)
      setLocalMusterPoints(musterPoints || [])
      setLocalRoutes(evacuationRoutes || [])
      setCurrentRoutePoints([])
      setIsDrawingBoundary(false)
      setIsDrawingRoute(false)
    }
  }, [isOpen, siteLocation, boundary, launchPoint, recoveryPoint, musterPoints, evacuationRoutes])

  // Initialize map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return

    const initMap = async () => {
      const L = await loadLeaflet()

      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      await new Promise(resolve => setTimeout(resolve, 100))
      if (!mapContainerRef.current) return

      const defaultLat = localSiteLocation?.lat || 54.0
      const defaultLng = localSiteLocation?.lng || -125.0
      const hasLocation = localSiteLocation?.lat
      const defaultZoom = hasLocation ? 15 : 5

      const map = L.map(mapContainerRef.current, {
        center: [parseFloat(defaultLat), parseFloat(defaultLng)],
        zoom: defaultZoom,
        zoomControl: true
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(map)

      mapRef.current = map

      // Map click handler
      map.on('click', handleMapClick)

      // Draw initial markers
      redrawMarkers()

      setTimeout(() => {
        map.invalidateSize()
        setIsLoading(false)
      }, 200)
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [isOpen])

  // Redraw markers when state changes
  useEffect(() => {
    if (mapRef.current && !isLoading) {
      redrawMarkers()
    }
  }, [localSiteLocation, localBoundary, localLaunchPoint, localRecoveryPoint, localMusterPoints, localRoutes, isLoading])

  const handleMapClick = useCallback((e) => {
    const lat = parseFloat(e.latlng.lat.toFixed(6))
    const lng = parseFloat(e.latlng.lng.toFixed(6))
    const coords = { lat, lng }

    if (isDrawingBoundaryRef.current) {
      setLocalBoundary(prev => [...prev, coords])
    } else if (isDrawingRouteRef.current) {
      setCurrentRoutePoints(prev => [...prev, coords])
    } else {
      const mode = activeModeRef.current
      
      switch (mode) {
        case 'site':
          setLocalSiteLocation(coords)
          break
        case 'launch':
          setLocalLaunchPoint(coords)
          break
        case 'recovery':
          setLocalRecoveryPoint(coords)
          break
        case 'muster':
          setLocalMusterPoints(prev => [...prev, {
            name: `Muster ${prev.length + 1}`,
            location: `${lat}, ${lng}`,
            coordinates: coords,
            description: ''
          }])
          break
      }
    }
  }, [])

  const redrawMarkers = useCallback(() => {
    if (!mapRef.current || !window.L) return
    const L = window.L
    const map = mapRef.current

    // Clear existing markers
    Object.values(markersRef.current).forEach(m => m && map.removeLayer(m))
    markersRef.current = {}
    
    if (boundaryLayerRef.current) map.removeLayer(boundaryLayerRef.current)
    boundaryLayerRef.current = null
    boundaryVertexMarkersRef.current.forEach(m => map.removeLayer(m))
    boundaryVertexMarkersRef.current = []
    routeLayersRef.current.forEach(l => map.removeLayer(l))
    routeLayersRef.current = []

    // Site location marker (draggable)
    if (localSiteLocation?.lat && localSiteLocation?.lng) {
      const marker = L.marker([localSiteLocation.lat, localSiteLocation.lng], {
        icon: createMarkerIcon(L, '#1e40af', '📍', 32),
        draggable: true
      }).addTo(map)
      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng()
        setLocalSiteLocation({ lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) })
      })
      marker.bindTooltip('Site Location (drag to move)')
      markersRef.current.site = marker
    }

    // Boundary polygon
    if (localBoundary.length >= 3) {
      const polygon = L.polygon(localBoundary.map(p => [p.lat, p.lng]), {
        color: '#9333ea',
        fillColor: '#9333ea',
        fillOpacity: 0.15,
        weight: 2
      }).addTo(map)
      boundaryLayerRef.current = polygon

      // Draggable vertex markers
      localBoundary.forEach((point, idx) => {
        const vertexMarker = L.circleMarker([point.lat, point.lng], {
          radius: 8,
          color: '#9333ea',
          fillColor: 'white',
          fillOpacity: 1,
          weight: 2,
          draggable: true
        }).addTo(map)
        
        // Make vertices draggable
        vertexMarker.on('mousedown', () => {
          map.dragging.disable()
          map.on('mousemove', (e) => {
            vertexMarker.setLatLng(e.latlng)
          })
        })
        
        map.on('mouseup', () => {
          map.dragging.enable()
          map.off('mousemove')
          // Update boundary point
          const newPos = vertexMarker.getLatLng()
          setLocalBoundary(prev => {
            const newBoundary = [...prev]
            newBoundary[idx] = { lat: parseFloat(newPos.lat.toFixed(6)), lng: parseFloat(newPos.lng.toFixed(6)) }
            return newBoundary
          })
        })

        boundaryVertexMarkersRef.current.push(vertexMarker)
      })
    }

    // Launch point (draggable)
    if (localLaunchPoint?.lat && localLaunchPoint?.lng) {
      const marker = L.marker([localLaunchPoint.lat, localLaunchPoint.lng], {
        icon: createMarkerIcon(L, '#16a34a', '🚀', 32),
        draggable: true
      }).addTo(map)
      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng()
        setLocalLaunchPoint({ lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) })
      })
      marker.bindTooltip('Launch Point (drag to move)')
      markersRef.current.launch = marker
    }

    // Recovery point (draggable)
    if (localRecoveryPoint?.lat && localRecoveryPoint?.lng) {
      const marker = L.marker([localRecoveryPoint.lat, localRecoveryPoint.lng], {
        icon: createMarkerIcon(L, '#dc2626', '🎯', 32),
        draggable: true
      }).addTo(map)
      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng()
        setLocalRecoveryPoint({ lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) })
      })
      marker.bindTooltip('Recovery Point (drag to move)')
      markersRef.current.recovery = marker
    }

    // Muster points (draggable)
    localMusterPoints.forEach((mp, idx) => {
      if (mp.coordinates?.lat && mp.coordinates?.lng) {
        const marker = L.marker([mp.coordinates.lat, mp.coordinates.lng], {
          icon: createMarkerIcon(L, '#f59e0b', '🚨', 28),
          draggable: true
        }).addTo(map)
        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng()
          setLocalMusterPoints(prev => {
            const updated = [...prev]
            updated[idx] = {
              ...updated[idx],
              coordinates: { lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) },
              location: `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`
            }
            return updated
          })
        })
        marker.bindTooltip(mp.name || 'Muster Point')
        markersRef.current[`muster_${idx}`] = marker
      }
    })

    // Evacuation routes
    localRoutes.forEach((route, idx) => {
      if (route.coordinates && route.coordinates.length >= 2) {
        const polyline = L.polyline(route.coordinates.map(c => [c.lat, c.lng]), {
          color: '#ef4444',
          weight: 4,
          dashArray: '10, 10'
        }).addTo(map)
        routeLayersRef.current.push(polyline)
      }
    })

    // Current route being drawn
    if (currentRoutePoints.length >= 2) {
      const tempLine = L.polyline(currentRoutePoints.map(c => [c.lat, c.lng]), {
        color: '#f87171',
        weight: 3,
        dashArray: '5, 5'
      }).addTo(map)
      routeLayersRef.current.push(tempLine)
    }
  }, [localSiteLocation, localBoundary, localLaunchPoint, localRecoveryPoint, localMusterPoints, localRoutes, currentRoutePoints])

  // Search handler
  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapRef.current) return
    setSearching(true)
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      )
      const results = await response.json()
      
      if (results.length > 0) {
        const { lat, lon } = results[0]
        mapRef.current.setView([parseFloat(lat), parseFloat(lon)], 15)
      }
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  // Save handler
  const handleSave = () => {
    onSave({
      siteLocation: localSiteLocation,
      boundary: localBoundary,
      launchPoint: localLaunchPoint,
      recoveryPoint: localRecoveryPoint,
      musterPoints: localMusterPoints,
      evacuationRoutes: localRoutes
    })
    onClose()
  }

  // Boundary controls
  const undoBoundaryPoint = () => setLocalBoundary(prev => prev.slice(0, -1))
  const clearBoundary = () => setLocalBoundary([])

  // Route controls
  const saveCurrentRoute = () => {
    if (currentRoutePoints.length < 2) return
    setLocalRoutes(prev => [...prev, {
      name: `Route ${prev.length + 1}`,
      description: '',
      coordinates: currentRoutePoints
    }])
    setCurrentRoutePoints([])
    setIsDrawingRoute(false)
  }
  const cancelRoute = () => {
    setCurrentRoutePoints([])
    setIsDrawingRoute(false)
  }

  // Delete muster point
  const deleteMusterPoint = (idx) => {
    setLocalMusterPoints(prev => prev.filter((_, i) => i !== idx))
  }

  // Delete route
  const deleteRoute = (idx) => {
    setLocalRoutes(prev => prev.filter((_, i) => i !== idx))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Map Editor - {siteName}</h2>
            <p className="text-sm text-gray-500">Click to place markers, drag to reposition</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b bg-gray-50">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search location..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy disabled:opacity-50 text-sm"
            >
              {searching ? '...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Tool Controls */}
        <div className="p-3 border-b flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-gray-500 mr-2">CLICK TO SET:</span>
          
          {/* Site Survey Mode */}
          {(mode === 'site' || mode === 'all') && (
            <>
              <button
                onClick={() => { setActiveMode('site'); setIsDrawingBoundary(false); setIsDrawingRoute(false) }}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${
                  activeMode === 'site' && !isDrawingBoundary ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                📍 Site
              </button>
              <button
                onClick={() => { setIsDrawingBoundary(!isDrawingBoundary); setActiveMode(null); setIsDrawingRoute(false) }}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${
                  isDrawingBoundary ? 'bg-purple-100 text-purple-800 ring-2 ring-purple-500' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Target className="w-3 h-3" /> Boundary
              </button>
              {localBoundary.length > 0 && (
                <>
                  <button onClick={undoBoundaryPoint} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">
                    Undo
                  </button>
                  <button onClick={clearBoundary} className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded">
                    Clear
                  </button>
                  <span className="text-xs text-purple-600">{localBoundary.length} pts</span>
                </>
              )}
            </>
          )}

          {/* Flight Plan Mode */}
          {(mode === 'flight' || mode === 'all') && (
            <>
              <div className="w-px h-5 bg-gray-300 mx-1" />
              <button
                onClick={() => { setActiveMode('launch'); setIsDrawingBoundary(false); setIsDrawingRoute(false) }}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${
                  activeMode === 'launch' ? 'bg-green-100 text-green-800 ring-2 ring-green-500' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🚀 Launch
              </button>
              <button
                onClick={() => { setActiveMode('recovery'); setIsDrawingBoundary(false); setIsDrawingRoute(false) }}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${
                  activeMode === 'recovery' ? 'bg-red-100 text-red-800 ring-2 ring-red-500' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🎯 Recovery
              </button>
            </>
          )}

          {/* Emergency Mode */}
          {(mode === 'emergency' || mode === 'all') && (
            <>
              <div className="w-px h-5 bg-gray-300 mx-1" />
              <button
                onClick={() => { setActiveMode('muster'); setIsDrawingBoundary(false); setIsDrawingRoute(false) }}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${
                  activeMode === 'muster' ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-500' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🚨 Muster
              </button>
              <button
                onClick={() => { setIsDrawingRoute(!isDrawingRoute); setActiveMode(null); setIsDrawingBoundary(false) }}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${
                  isDrawingRoute ? 'bg-red-100 text-red-800 ring-2 ring-red-500' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Route className="w-3 h-3" /> Route
              </button>
              {isDrawingRoute && currentRoutePoints.length >= 2 && (
                <button onClick={saveCurrentRoute} className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded">
                  Save Route ({currentRoutePoints.length} pts)
                </button>
              )}
              {isDrawingRoute && (
                <button onClick={cancelRoute} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">
                  Cancel
                </button>
              )}
            </>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-[400px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-aeria-blue" />
            </div>
          )}
          <div ref={mapContainerRef} className="absolute inset-0" />
        </div>

        {/* Status Bar */}
        <div className="p-3 border-t bg-gray-50 flex flex-wrap gap-4 text-xs">
          {localSiteLocation?.lat && (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded-full" />
              Site: {localSiteLocation.lat.toFixed(5)}, {localSiteLocation.lng.toFixed(5)}
            </span>
          )}
          {localLaunchPoint?.lat && (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded-full" />
              Launch: {localLaunchPoint.lat.toFixed(5)}, {localLaunchPoint.lng.toFixed(5)}
            </span>
          )}
          {localRecoveryPoint?.lat && (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded-full" />
              Recovery: {localRecoveryPoint.lat.toFixed(5)}, {localRecoveryPoint.lng.toFixed(5)}
            </span>
          )}
          {localMusterPoints.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-amber-500 rounded-full" />
              Muster: {localMusterPoints.length}
            </span>
          )}
          {localRoutes.length > 0 && (
            <span className="flex items-center gap-1">
              <Route className="w-3 h-3 text-red-500" />
              Routes: {localRoutes.length}
            </span>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t flex justify-between">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default { MapPreview, MapEditorModal }
