/**
 * EmergencyMapTools.jsx
 * Emergency Plan specific map tools and helper components
 * 
 * Provides specialized tools for:
 * - Muster point distance checker
 * - Route distance calculator
 * - Emergency response time estimator
 * - Quick emergency info card
 * 
 * @location src/components/map/EmergencyMapTools.jsx
 * @action NEW
 */

import React, { useState, useMemo } from 'react'
import {
  Flag,
  Route,
  Clock,
  MapPin,
  AlertTriangle,
  Check,
  X,
  Phone,
  Navigation,
  Ruler,
  Users,
  Info,
  Printer,
  Copy,
  ExternalLink
} from 'lucide-react'
import { calculateDistance } from '../../lib/mapDataStructures'

// ============================================
// MUSTER POINT DISTANCE CHECKER
// ============================================

export function MusterPointDistanceChecker({
  musterPoints = [],
  operationsBoundary,
  launchPoint,
  maxRecommendedDistance = 200 // meters - reasonable walking distance
}) {
  const analysis = useMemo(() => {
    if (musterPoints.length === 0) {
      return { status: 'missing', message: 'No muster points defined' }
    }
    
    const primaryMuster = musterPoints.find(p => p.isPrimary) || musterPoints[0]
    if (!primaryMuster?.geometry?.coordinates) {
      return { status: 'invalid', message: 'Primary muster point has no location' }
    }
    
    const [musterLng, musterLat] = primaryMuster.geometry.coordinates
    
    // Check distance from launch point
    let launchDistance = null
    if (launchPoint?.geometry?.coordinates) {
      const [launchLng, launchLat] = launchPoint.geometry.coordinates
      launchDistance = calculateDistance(
        { lat: musterLat, lng: musterLng },
        { lat: launchLat, lng: launchLng }
      )
    }
    
    // Check if muster point is outside operations boundary
    let isOutsideBoundary = false
    // Note: Full point-in-polygon check would require turf.js
    // For now, we'll just check if we have the data
    
    const issues = []
    if (launchDistance && launchDistance > maxRecommendedDistance) {
      issues.push(`Primary muster is ${launchDistance.toFixed(0)}m from launch (recommended: <${maxRecommendedDistance}m)`)
    }
    
    if (musterPoints.filter(p => p.isPrimary).length === 0) {
      issues.push('No primary muster point designated')
    }
    
    if (musterPoints.length < 2) {
      issues.push('Consider adding a secondary muster point')
    }
    
    return {
      status: issues.length === 0 ? 'good' : 'warning',
      primaryMuster,
      launchDistance,
      musterCount: musterPoints.length,
      issues
    }
  }, [musterPoints, launchPoint, maxRecommendedDistance])
  
  return (
    <div className={`rounded-lg p-4 ${
      analysis.status === 'good' 
        ? 'bg-green-50 border border-green-200' 
        : analysis.status === 'warning'
        ? 'bg-amber-50 border border-amber-200'
        : 'bg-gray-50 border border-gray-200'
    }`}>
      <h4 className={`font-medium mb-2 flex items-center gap-2 ${
        analysis.status === 'good' ? 'text-green-800' :
        analysis.status === 'warning' ? 'text-amber-800' : 'text-gray-800'
      }`}>
        {analysis.status === 'good' ? <Check className="w-4 h-4" /> :
         analysis.status === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
         <Flag className="w-4 h-4" />}
        Muster Point Check
      </h4>
      
      {analysis.status === 'missing' || analysis.status === 'invalid' ? (
        <p className="text-sm text-gray-600">{analysis.message}</p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm">
            <strong>{analysis.musterCount}</strong> muster point{analysis.musterCount !== 1 ? 's' : ''} defined
          </p>
          
          {analysis.launchDistance && (
            <p className="text-sm">
              Distance from launch: <strong>{analysis.launchDistance.toFixed(0)}m</strong>
            </p>
          )}
          
          {analysis.issues.length > 0 && (
            <ul className="text-sm space-y-1 mt-2">
              {analysis.issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-amber-500">•</span>
                  {issue}
                </li>
              ))}
            </ul>
          )}
          
          {analysis.status === 'good' && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Muster points properly configured
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// EVACUATION ROUTE ANALYZER
// ============================================

export function EvacuationRouteAnalyzer({ routes = [], musterPoints = [] }) {
  const analysis = useMemo(() => {
    if (routes.length === 0) {
      return { status: 'missing', message: 'No evacuation routes defined' }
    }
    
    const routeData = routes.map(route => {
      let totalDistance = 0
      const coords = route.geometry?.coordinates || []
      
      for (let i = 1; i < coords.length; i++) {
        const [lng1, lat1] = coords[i - 1]
        const [lng2, lat2] = coords[i]
        totalDistance += calculateDistance(
          { lat: lat1, lng: lng1 },
          { lat: lat2, lng: lng2 }
        )
      }
      
      // Estimate walking time (average walking speed ~1.4 m/s)
      const walkingTimeSeconds = totalDistance / 1.4
      const walkingTimeMinutes = walkingTimeSeconds / 60
      
      return {
        ...route,
        distance: totalDistance,
        walkingTime: walkingTimeMinutes
      }
    })
    
    const primaryRoute = routeData.find(r => r.isPrimary) || routeData[0]
    const hasPrimary = routes.some(r => r.isPrimary)
    
    const issues = []
    if (!hasPrimary) {
      issues.push('No primary evacuation route designated')
    }
    if (routes.length < 2) {
      issues.push('Consider adding a secondary evacuation route')
    }
    if (primaryRoute?.walkingTime > 5) {
      issues.push(`Primary route takes ~${primaryRoute.walkingTime.toFixed(1)} min to walk (consider shorter route)`)
    }
    
    return {
      status: issues.length === 0 ? 'good' : 'warning',
      routes: routeData,
      primaryRoute,
      issues
    }
  }, [routes])
  
  return (
    <div className={`rounded-lg p-4 ${
      analysis.status === 'good' 
        ? 'bg-green-50 border border-green-200' 
        : analysis.status === 'warning'
        ? 'bg-amber-50 border border-amber-200'
        : 'bg-gray-50 border border-gray-200'
    }`}>
      <h4 className={`font-medium mb-2 flex items-center gap-2 ${
        analysis.status === 'good' ? 'text-green-800' :
        analysis.status === 'warning' ? 'text-amber-800' : 'text-gray-800'
      }`}>
        {analysis.status === 'good' ? <Check className="w-4 h-4" /> :
         analysis.status === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
         <Route className="w-4 h-4" />}
        Evacuation Route Analysis
      </h4>
      
      {analysis.status === 'missing' ? (
        <p className="text-sm text-gray-600">{analysis.message}</p>
      ) : (
        <div className="space-y-2">
          {analysis.routes.map((route, i) => (
            <div key={route.id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                {route.isPrimary && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Primary</span>}
                {route.name || `Route ${i + 1}`}
              </span>
              <span className="text-gray-600">
                {route.distance.toFixed(0)}m • ~{route.walkingTime.toFixed(1)} min
              </span>
            </div>
          ))}
          
          {analysis.issues.length > 0 && (
            <ul className="text-sm space-y-1 mt-2">
              {analysis.issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-1 text-amber-700">
                  <span>•</span>
                  {issue}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// EMERGENCY RESPONSE TIME ESTIMATOR
// ============================================

export function EmergencyResponseTimeEstimator({ 
  facilities = {},
  siteLocation 
}) {
  const [customDistance, setCustomDistance] = useState('')
  
  // Response time estimates based on typical emergency response
  // Urban: 5-10 min, Suburban: 10-15 min, Rural: 15-30+ min
  const estimates = useMemo(() => {
    const results = []
    
    if (facilities.hospitalDistance) {
      const timeMin = Math.round(facilities.hospitalDistance * 1.5) // ~40 km/h average
      const timeMax = Math.round(facilities.hospitalDistance * 2.5) // ~25 km/h in traffic
      results.push({
        type: 'ambulance',
        label: 'Ambulance / EMS',
        distance: facilities.hospitalDistance,
        timeRange: `${timeMin}-${timeMax}`,
        unit: 'min'
      })
    }
    
    // Generic estimates if no specific data
    if (results.length === 0 && customDistance) {
      const dist = parseFloat(customDistance)
      if (!isNaN(dist)) {
        results.push({
          type: 'emergency',
          label: 'Emergency Services',
          distance: dist,
          timeRange: `${Math.round(dist * 1.5)}-${Math.round(dist * 2.5)}`,
          unit: 'min'
        })
      }
    }
    
    return results
  }, [facilities, customDistance])
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Response Time Estimates
      </h4>
      
      {estimates.length > 0 ? (
        <div className="space-y-2">
          {estimates.map((est, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">{est.label}</span>
              <span className="text-sm font-medium">
                ~{est.timeRange} {est.unit}
                <span className="text-xs text-gray-500 ml-1">({est.distance} km)</span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Enter distance to nearest emergency services:
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              value={customDistance}
              onChange={(e) => setCustomDistance(e.target.value)}
              placeholder="Distance"
              className="input w-24 text-sm"
            />
            <span className="text-sm text-gray-500">km</span>
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-3">
        * Estimates based on average emergency response speeds. Actual times may vary.
      </p>
    </div>
  )
}

// ============================================
// QUICK EMERGENCY INFO CARD
// ============================================

export function QuickEmergencyCard({ 
  emergencyPlan = {}, 
  siteName = '',
  onPrint
}) {
  const primaryContact = (emergencyPlan.contacts || []).find(c => c.isPrimary) || 
                         (emergencyPlan.contacts || [])[0]
  
  const handleCopyInfo = () => {
    const info = [
      `EMERGENCY INFO - ${siteName}`,
      ``,
      `CALL 911 FOR EMERGENCIES`,
      ``,
      primaryContact ? `Primary Contact: ${primaryContact.name} - ${primaryContact.phone}` : '',
      emergencyPlan.facilities?.hospitalName ? `Nearest Hospital: ${emergencyPlan.facilities.hospitalName}` : '',
      emergencyPlan.facilities?.hospitalAddress ? `Address: ${emergencyPlan.facilities.hospitalAddress}` : '',
      ``,
      `NAV CANADA FIC: 1-866-541-4101 (fly-away reporting)`
    ].filter(Boolean).join('\n')
    
    navigator.clipboard.writeText(info)
    alert('Emergency info copied to clipboard')
  }
  
  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          EMERGENCY
        </h4>
        <div className="flex gap-1">
          <button
            onClick={handleCopyInfo}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded"
            title="Copy info"
          >
            <Copy className="w-4 h-4" />
          </button>
          {onPrint && (
            <button
              onClick={onPrint}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded"
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="p-2 bg-white rounded border border-red-200">
          <p className="font-bold text-red-800 text-lg">CALL 911</p>
        </div>
        
        {primaryContact && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-red-600" />
            <span className="font-medium">{primaryContact.name}:</span>
            <span>{primaryContact.phone}</span>
          </div>
        )}
        
        {emergencyPlan.facilities?.hospitalName && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium">{emergencyPlan.facilities.hospitalName}</p>
              {emergencyPlan.facilities.hospitalAddress && (
                <p className="text-xs text-gray-600">{emergencyPlan.facilities.hospitalAddress}</p>
              )}
            </div>
          </div>
        )}
        
        <div className="pt-2 border-t border-red-200">
          <p className="text-xs text-red-700">
            <strong>Fly-Away:</strong> NAV CANADA FIC 1-866-541-4101
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// EMERGENCY PLAN COMPLETENESS
// ============================================

export function EmergencyPlanCompleteness({ 
  emergencyPlan = {}, 
  siteEmergencyData = {} 
}) {
  const checks = [
    {
      label: 'Primary muster point',
      complete: (siteEmergencyData.musterPoints || []).some(p => p.isPrimary),
      required: true
    },
    {
      label: 'Evacuation route',
      complete: (siteEmergencyData.evacuationRoutes || []).length > 0,
      required: true
    },
    {
      label: 'Emergency contacts',
      complete: (emergencyPlan.contacts || []).length > 0,
      required: true
    },
    {
      label: 'Nearest hospital info',
      complete: !!emergencyPlan.facilities?.hospitalName,
      required: true
    },
    {
      label: 'Emergency procedures',
      complete: (emergencyPlan.procedures || []).length > 0,
      required: false
    },
    {
      label: 'Secondary muster point',
      complete: (siteEmergencyData.musterPoints || []).length > 1,
      required: false
    }
  ]
  
  const requiredComplete = checks.filter(c => c.required && c.complete).length
  const requiredTotal = checks.filter(c => c.required).length
  const allComplete = checks.filter(c => c.complete).length
  const total = checks.length
  
  const percentage = Math.round((requiredComplete / requiredTotal) * 100)
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">Plan Completeness</h4>
        <span className={`text-lg font-bold ${
          percentage === 100 ? 'text-green-600' : 
          percentage >= 75 ? 'text-amber-600' : 'text-red-600'
        }`}>
          {percentage}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className={`h-2 rounded-full transition-all ${
            percentage === 100 ? 'bg-green-500' : 
            percentage >= 75 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="space-y-1">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            {check.complete ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <X className={`w-4 h-4 ${check.required ? 'text-red-500' : 'text-gray-400'}`} />
            )}
            <span className={check.complete ? 'text-gray-700' : check.required ? 'text-red-700' : 'text-gray-500'}>
              {check.label}
              {check.required && !check.complete && <span className="text-xs ml-1">(required)</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// EMERGENCY INSTRUCTIONS
// ============================================

export function EmergencyPlanInstructions() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-red-100 transition-colors"
      >
        <span className="font-medium text-red-900 flex items-center gap-2">
          <Info className="w-4 h-4" />
          How to Complete Emergency Plan
        </span>
        <span className="text-sm text-red-600">{isOpen ? 'Hide' : 'Show'}</span>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-3 text-sm text-red-800">
          <div>
            <h5 className="font-medium mb-1">1. Add Muster Points</h5>
            <p>Click "Muster Point" tool on map, click to place. Add at least one primary and one secondary point.</p>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">2. Draw Evacuation Routes</h5>
            <p>Click "Evacuation Route" tool, draw path from operations area to muster point. Double-click to finish.</p>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">3. Add Emergency Contacts</h5>
            <p>Include 911, NAV CANADA FIC, client contacts, and operations manager.</p>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">4. Document Nearest Facilities</h5>
            <p>Record nearest hospital name, address, phone, and estimated travel time.</p>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">5. Define Emergency Procedures</h5>
            <p>Add step-by-step procedures for fly-away, injury, collision, and other emergencies.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default {
  MusterPointDistanceChecker,
  EvacuationRouteAnalyzer,
  EmergencyResponseTimeEstimator,
  QuickEmergencyCard,
  EmergencyPlanCompleteness,
  EmergencyPlanInstructions
}
