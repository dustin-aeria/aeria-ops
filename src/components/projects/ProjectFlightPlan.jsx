import { useState, useEffect, useMemo } from 'react'
import { getAircraft } from '../../lib/firestore'
import { 
  Plane, Plus, Trash2, AlertTriangle, Cloud, Wind, Eye, Gauge, ChevronDown, ChevronUp,
  Award, FileCheck, CheckCircle2, Zap, MapPin, Users, Radio, ExternalLink, RefreshCw,
  Navigation, Target, Map, Loader2, Info, Link2, Layers
} from 'lucide-react'
import { MapPreview, MapEditorModal } from './MapComponents'

const operationTypes = [
  { value: 'VLOS', label: 'VLOS', description: 'Visual Line of Sight' },
  { value: 'EVLOS', label: 'EVLOS', description: 'Extended Visual Line of Sight' },
  { value: 'BVLOS', label: 'BVLOS', description: 'Beyond Visual Line of Sight' }
]

const defaultWeatherMinimums = {
  minVisibility: 3,
  minCeiling: 500,
  maxWind: 10,
  maxGust: 15,
  precipitation: false
}

const defaultContingencies = [
  { trigger: 'Loss of C2 Link', action: 'Return to Home (RTH) automatically engages. If no RTH within 30 seconds, land in place.', priority: 'high' },
  { trigger: 'Low Battery Warning', action: 'Immediately return to launch point. Land with minimum 20% remaining.', priority: 'high' },
  { trigger: 'GPS Loss', action: 'Switch to ATTI mode, maintain visual contact, manual return and land.', priority: 'high' },
  { trigger: 'Fly-Away', action: 'Attempt to regain control. If unsuccessful, contact FIC Edmonton (1-866-541-4102) immediately.', priority: 'critical' },
  { trigger: 'Deteriorating Weather', action: 'Land immediately if conditions fall below minimums.', priority: 'medium' },
  { trigger: 'Aircraft in Vicinity', action: 'Descend and hold position or land. Give way to all manned aircraft.', priority: 'high' }
]

// ============================================
// MAIN COMPONENT: Multi-Site Flight Plan
// ============================================
export default function ProjectFlightPlan({ project, onUpdate }) {
  const [sites, setSites] = useState([])
  const [activeSiteIndex, setActiveSiteIndex] = useState(0)
  const [availableAircraft, setAvailableAircraft] = useState([])
  const [loadingAircraft, setLoadingAircraft] = useState(true)
  const [mapEditorOpen, setMapEditorOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    aircraft: true,
    parameters: true,
    launchRecovery: true,
    weather: false,
    contingencies: false
  })

  // Load aircraft
  useEffect(() => {
    async function loadAircraft() {
      try {
        const aircraft = await getAircraft()
        setAvailableAircraft(aircraft || [])
      } catch (error) {
        console.error('Error loading aircraft:', error)
      } finally {
        setLoadingAircraft(false)
      }
    }
    loadAircraft()
  }, [])

  // Initialize from project
  useEffect(() => {
    if (project.sites && Array.isArray(project.sites)) {
      setSites(project.sites)
    }
  }, [project.sites])

  // Get sites that have flight plans enabled
  const sitesWithFlightPlans = useMemo(() => 
    sites.filter(s => s.includeFlightPlan), [sites])
  
  // Find first site with flight plan for initial selection
  useEffect(() => {
    if (sitesWithFlightPlans.length > 0 && activeSiteIndex >= sitesWithFlightPlans.length) {
      setActiveSiteIndex(0)
    }
  }, [sitesWithFlightPlans.length])

  const activeSite = sitesWithFlightPlans[activeSiteIndex]
  const flightPlan = activeSite?.flightPlan || {}
  const siteSurvey = activeSite?.siteSurvey || {}

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Save updates
  const saveSites = (newSites) => {
    setSites(newSites)
    onUpdate({ sites: newSites })
  }

  // Update active site's flight plan
  const updateFlightPlan = (updates) => {
    const siteIndex = sites.findIndex(s => s.id === activeSite?.id)
    if (siteIndex === -1) return

    const newSites = [...sites]
    newSites[siteIndex] = {
      ...newSites[siteIndex],
      flightPlan: {
        ...newSites[siteIndex].flightPlan,
        ...updates
      }
    }
    saveSites(newSites)
  }

  const updateWeather = (field, value) => {
    updateFlightPlan({
      weatherMinimums: {
        ...(flightPlan.weatherMinimums || defaultWeatherMinimums),
        [field]: value
      }
    })
  }

  // Aircraft management
  const addAircraft = (aircraftId) => {
    const aircraft = availableAircraft.find(a => a.id === aircraftId)
    if (!aircraft) return

    const existing = flightPlan.aircraft || []
    if (existing.find(a => a.id === aircraftId)) return

    updateFlightPlan({
      aircraft: [...existing, {
        id: aircraft.id,
        name: aircraft.nickname || aircraft.name,
        manufacturer: aircraft.manufacturer,
        model: aircraft.model,
        mtow: aircraft.mtow,
        maxSpeed: aircraft.maxSpeed,
        maxDimension: aircraft.maxDimension,
        isPrimary: existing.length === 0
      }]
    })
  }

  const removeAircraft = (index) => {
    const aircraft = [...(flightPlan.aircraft || [])]
    const wasPrimary = aircraft[index]?.isPrimary
    aircraft.splice(index, 1)
    if (wasPrimary && aircraft.length > 0) {
      aircraft[0].isPrimary = true
    }
    updateFlightPlan({ aircraft })
  }

  const setPrimaryAircraft = (index) => {
    const aircraft = (flightPlan.aircraft || []).map((a, i) => ({
      ...a,
      isPrimary: i === index
    }))
    updateFlightPlan({ aircraft })
  }

  // Contingencies
  const addContingency = () => {
    updateFlightPlan({
      contingencies: [...(flightPlan.contingencies || defaultContingencies), {
        trigger: '',
        action: '',
        priority: 'medium'
      }]
    })
  }

  const updateContingency = (index, field, value) => {
    const contingencies = [...(flightPlan.contingencies || defaultContingencies)]
    contingencies[index] = { ...contingencies[index], [field]: value }
    updateFlightPlan({ contingencies })
  }

  const removeContingency = (index) => {
    updateFlightPlan({
      contingencies: (flightPlan.contingencies || []).filter((_, i) => i !== index)
    })
  }

  // Handle map save
  const handleMapSave = (mapData) => {
    const siteIndex = sites.findIndex(s => s.id === activeSite?.id)
    if (siteIndex === -1) return

    const newSites = [...sites]
    newSites[siteIndex] = {
      ...newSites[siteIndex],
      flightPlan: {
        ...newSites[siteIndex].flightPlan,
        launchPoint: mapData.launchPoint,
        recoveryPoint: mapData.recoveryPoint
      }
    }
    saveSites(newSites)
  }

  // No sites with flight plans
  if (sitesWithFlightPlans.length === 0) {
    return (
      <div className="card text-center py-12">
        <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Flight Plans</h3>
        <p className="text-gray-500 mb-4">
          Enable "Include Flight Plan" for at least one site in the Site Survey section.
        </p>
        <p className="text-sm text-gray-400">
          Go to Site Survey → Select a site → Check "Include Flight Plan & SORA"
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Site Selector */}
      {sitesWithFlightPlans.length > 1 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-5 h-5 text-aeria-blue" />
            <h2 className="text-lg font-semibold">Select Site</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {sitesWithFlightPlans.map((site, index) => (
              <button
                key={site.id}
                onClick={() => setActiveSiteIndex(index)}
                className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 transition-all ${
                  activeSiteIndex === index
                    ? 'border-aeria-blue bg-blue-50 text-aeria-navy'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <MapPin className="w-4 h-4" />
                {site.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Site Info Banner */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
        <div>
          <p className="font-medium text-blue-900">Flight Plan: {activeSite?.name}</p>
          <p className="text-sm text-blue-700">
            Population: {siteSurvey.population?.category || 'Not set'} | 
            Airspace: Class {siteSurvey.airspace?.classification || 'G'}
          </p>
        </div>
        <Link2 className="w-5 h-5 text-blue-400" />
      </div>

      {/* Aircraft Selection */}
      <div className="card">
        <button
          onClick={() => toggleSection('aircraft')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plane className="w-5 h-5 text-aeria-blue" />
            Aircraft
            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
              {(flightPlan.aircraft || []).length}
            </span>
          </h2>
          {expandedSections.aircraft ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.aircraft && (
          <div className="mt-4 space-y-4">
            {/* Selected Aircraft */}
            {(flightPlan.aircraft || []).map((ac, i) => (
              <div key={ac.id} className={`p-3 rounded-lg border ${ac.isPrimary ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Plane className={`w-5 h-5 ${ac.isPrimary ? 'text-green-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium">{ac.name}</p>
                      <p className="text-sm text-gray-500">{ac.manufacturer} {ac.model} | MTOW: {ac.mtow ? `${ac.mtow}kg` : 'N/A'}</p>
                    </div>
                    {ac.isPrimary && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">Primary</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!ac.isPrimary && (
                      <button onClick={() => setPrimaryAircraft(i)} className="text-xs text-aeria-blue hover:underline">
                        Set Primary
                      </button>
                    )}
                    <button onClick={() => removeAircraft(i)} className="p-1 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Aircraft */}
            <div>
              <label className="label">Add Aircraft</label>
              <select
                value=""
                onChange={(e) => addAircraft(e.target.value)}
                className="input"
                disabled={loadingAircraft}
              >
                <option value="">Select aircraft to add...</option>
                {availableAircraft
                  .filter(a => !(flightPlan.aircraft || []).find(fa => fa.id === a.id))
                  .map(a => (
                    <option key={a.id} value={a.id}>{a.nickname || a.name} - {a.manufacturer} {a.model}</option>
                  ))
                }
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Flight Parameters */}
      <div className="card">
        <button
          onClick={() => toggleSection('parameters')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-aeria-blue" />
            Flight Parameters
          </h2>
          {expandedSections.parameters ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.parameters && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Operation Type *</label>
                <select
                  value={flightPlan.operationType || 'VLOS'}
                  onChange={(e) => updateFlightPlan({ operationType: e.target.value })}
                  className="input"
                >
                  {operationTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label} - {t.description}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Max Altitude (m AGL) *</label>
                <input
                  type="number"
                  value={flightPlan.maxAltitudeAGL || ''}
                  onChange={(e) => updateFlightPlan({ maxAltitudeAGL: parseFloat(e.target.value) })}
                  className="input"
                  placeholder="e.g., 120"
                />
              </div>
              <div>
                <label className="label">Flight Radius (m)</label>
                <input
                  type="number"
                  value={flightPlan.flightRadius || ''}
                  onChange={(e) => updateFlightPlan({ flightRadius: parseFloat(e.target.value) })}
                  className="input"
                  placeholder="e.g., 500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Min Distance from People (m)</label>
                <input
                  type="number"
                  value={flightPlan.distanceFromPeople || 30}
                  onChange={(e) => updateFlightPlan({ distanceFromPeople: parseFloat(e.target.value) })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Estimated Duration (min)</label>
                <input
                  type="number"
                  value={flightPlan.estimatedDuration || ''}
                  onChange={(e) => updateFlightPlan({ estimatedDuration: parseFloat(e.target.value) })}
                  className="input"
                  placeholder="e.g., 30"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flightPlan.overPeople || false}
                  onChange={(e) => updateFlightPlan({ overPeople: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Operations over people</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flightPlan.nightOperations || false}
                  onChange={(e) => updateFlightPlan({ nightOperations: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Night operations</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Launch & Recovery Points */}
      <div className="card">
        <button
          onClick={() => toggleSection('launchRecovery')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-aeria-blue" />
            Launch & Recovery Points
          </h2>
          {expandedSections.launchRecovery ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.launchRecovery && (
          <div className="mt-4 space-y-4">
            {/* Map Preview */}
            <MapPreview
              siteLocation={siteSurvey.location?.coordinates}
              boundary={siteSurvey.boundary}
              launchPoint={flightPlan.launchPoint}
              recoveryPoint={flightPlan.recoveryPoint}
              height={250}
              onOpenEditor={() => setMapEditorOpen(true)}
            />

            {/* Point Status */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border-2 ${flightPlan.launchPoint ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🚀</span>
                  <span className="font-medium">Launch Point</span>
                  {flightPlan.launchPoint && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                </div>
                {flightPlan.launchPoint ? (
                  <p className="text-sm text-gray-600">
                    {flightPlan.launchPoint.lat?.toFixed(6)}, {flightPlan.launchPoint.lng?.toFixed(6)}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Click "Edit Map" to set</p>
                )}
              </div>
              <div className={`p-4 rounded-lg border-2 ${flightPlan.recoveryPoint ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🎯</span>
                  <span className="font-medium">Recovery Point</span>
                  {flightPlan.recoveryPoint && <CheckCircle2 className="w-4 h-4 text-red-500" />}
                </div>
                {flightPlan.recoveryPoint ? (
                  <p className="text-sm text-gray-600">
                    {flightPlan.recoveryPoint.lat?.toFixed(6)}, {flightPlan.recoveryPoint.lng?.toFixed(6)}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Click "Edit Map" to set</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weather Minimums */}
      <div className="card">
        <button
          onClick={() => toggleSection('weather')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-aeria-blue" />
            Weather Minimums
          </h2>
          {expandedSections.weather ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.weather && (
          <div className="mt-4 grid sm:grid-cols-4 gap-4">
            <div>
              <label className="label flex items-center gap-1"><Eye className="w-3 h-3" /> Min Visibility (SM)</label>
              <input
                type="number"
                value={flightPlan.weatherMinimums?.minVisibility || 3}
                onChange={(e) => updateWeather('minVisibility', parseFloat(e.target.value))}
                className="input"
                step="0.5"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Cloud className="w-3 h-3" /> Min Ceiling (ft)</label>
              <input
                type="number"
                value={flightPlan.weatherMinimums?.minCeiling || 500}
                onChange={(e) => updateWeather('minCeiling', parseFloat(e.target.value))}
                className="input"
                step="100"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Wind className="w-3 h-3" /> Max Wind (m/s)</label>
              <input
                type="number"
                value={flightPlan.weatherMinimums?.maxWind || 10}
                onChange={(e) => updateWeather('maxWind', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Wind className="w-3 h-3" /> Max Gust (m/s)</label>
              <input
                type="number"
                value={flightPlan.weatherMinimums?.maxGust || 15}
                onChange={(e) => updateWeather('maxGust', parseFloat(e.target.value))}
                className="input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Contingencies */}
      <div className="card">
        <button
          onClick={() => toggleSection('contingencies')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-aeria-blue" />
            Contingency Procedures
            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
              {(flightPlan.contingencies || defaultContingencies).length}
            </span>
          </h2>
          {expandedSections.contingencies ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.contingencies && (
          <div className="mt-4 space-y-3">
            {(flightPlan.contingencies || defaultContingencies).map((cont, i) => (
              <div key={i} className={`p-3 rounded-lg border ${
                cont.priority === 'critical' ? 'bg-red-50 border-red-200' :
                cont.priority === 'high' ? 'bg-amber-50 border-amber-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={cont.priority}
                        onChange={(e) => updateContingency(i, 'priority', e.target.value)}
                        className="text-xs px-2 py-1 rounded border bg-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                      <input
                        type="text"
                        value={cont.trigger}
                        onChange={(e) => updateContingency(i, 'trigger', e.target.value)}
                        className="flex-1 text-sm font-medium bg-transparent border-b border-transparent hover:border-gray-300 focus:border-aeria-blue focus:outline-none px-1"
                        placeholder="Trigger condition..."
                      />
                    </div>
                    <textarea
                      value={cont.action}
                      onChange={(e) => updateContingency(i, 'action', e.target.value)}
                      className="w-full text-sm bg-transparent border-none p-0 focus:ring-0 resize-none"
                      placeholder="Response action..."
                      rows={2}
                    />
                  </div>
                  <button
                    onClick={() => removeContingency(i)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addContingency}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Contingency
            </button>
          </div>
        )}
      </div>

      {/* Map Editor Modal */}
      <MapEditorModal
        isOpen={mapEditorOpen}
        onClose={() => setMapEditorOpen(false)}
        onSave={handleMapSave}
        siteLocation={siteSurvey.location?.coordinates}
        boundary={siteSurvey.boundary}
        launchPoint={flightPlan.launchPoint}
        recoveryPoint={flightPlan.recoveryPoint}
        mode="flight"
        siteName={activeSite?.name}
      />
    </div>
  )
}
