import { useState, useEffect, useMemo } from 'react'
import { getAircraft } from '../../lib/firestore'
import { 
  Plane, 
  Plus,
  Trash2,
  AlertTriangle,
  Cloud,
  Wind,
  Eye,
  Gauge,
  MapPin,
  Radio,
  Shield,
  ChevronDown,
  ChevronUp,
  Info,
  Award,
  FileCheck,
  AlertOctagon,
  CheckCircle2,
  XCircle
} from 'lucide-react'

const operationTypes = [
  { value: 'VLOS', label: 'VLOS', description: 'Visual Line of Sight' },
  { value: 'EVLOS', label: 'EVLOS', description: 'Extended Visual Line of Sight' },
  { value: 'BVLOS', label: 'BVLOS', description: 'Beyond Visual Line of Sight' }
]

const areaTypes = [
  { value: 'uncontrolled', label: 'Uncontrolled Airspace (Class G)', controlled: false },
  { value: 'controlled', label: 'Controlled Airspace (Class C/D/E)', controlled: true },
  { value: 'class_f', label: 'Class F - Special Use', controlled: false },
  { value: 'restricted', label: 'Restricted/Prohibited', controlled: true }
]

const groundTypes = [
  { value: 'controlled_ground', label: 'Controlled Ground Area', overPeopleRisk: 'none', description: 'Access restricted, no bystanders' },
  { value: 'sparsely_populated', label: 'Sparsely Populated', overPeopleRisk: 'low', description: 'Rural areas, few people' },
  { value: 'populated', label: 'Populated Area', overPeopleRisk: 'medium', description: 'Residential, commercial' },
  { value: 'gathering', label: 'Gathering of People', overPeopleRisk: 'high', description: 'Events, crowds, assemblies' }
]

const defaultWeatherMinimums = {
  minVisibility: 3,
  minCeiling: 500,
  maxWind: 10,
  maxGust: 15,
  precipitation: false,
  notes: ''
}

const defaultContingencies = [
  { trigger: 'Loss of C2 Link', action: 'Return to Home (RTH) automatically engages. If no RTH within 30 seconds, land in place.', priority: 'high' },
  { trigger: 'Low Battery Warning', action: 'Immediately return to launch point. Land with minimum 20% remaining.', priority: 'high' },
  { trigger: 'GPS Loss', action: 'Switch to ATTI mode, maintain visual contact, manual return and land.', priority: 'high' },
  { trigger: 'Fly-Away', action: 'Attempt to regain control. If unsuccessful, contact FIC Edmonton (1-866-541-4102) immediately.', priority: 'critical' },
  { trigger: 'Deteriorating Weather', action: 'Land immediately if conditions fall below minimums. Do not attempt to "push through."', priority: 'medium' },
  { trigger: 'Aircraft in Vicinity', action: 'Descend and hold position or land. Give way to all manned aircraft.', priority: 'high' }
]

// ============================================
// CARs LICENSE DETECTION
// ============================================
const detectCARsCategory = (flightPlan, aircraft) => {
  const {
    operationType = 'VLOS',
    maxAltitudeAGL = 120,
    flightAreaType = 'uncontrolled',
    groundType = 'sparsely_populated',
    overPeople = false,
    nearAerodrome = false,
    aerodromeDistance = null,
    nightOperations = false
  } = flightPlan

  // Get primary aircraft specs
  const primaryAircraft = aircraft?.find(a => a.isPrimary) || aircraft?.[0]
  const mtow = primaryAircraft?.mtow || 0 // in grams
  const isMicro = mtow > 0 && mtow <= 250
  const isSmall = mtow > 250 && mtow <= 25000

  const reasons = []
  let category = 'basic'

  // SFOC Required (Complex Operations)
  if (operationType === 'BVLOS') {
    category = 'complex'
    reasons.push('BVLOS operations require SFOC')
  }
  
  if (nightOperations) {
    category = 'complex'
    reasons.push('Night operations require SFOC')
  }
  
  if (maxAltitudeAGL > 122 && flightAreaType === 'controlled') {
    category = 'complex'
    reasons.push('Above 122m (400ft) in controlled airspace requires SFOC')
  }
  
  if (mtow > 25000) {
    category = 'complex'
    reasons.push('RPAS over 25kg requires SFOC')
  }

  // Advanced Operations
  if (category !== 'complex') {
    const isControlled = ['controlled', 'restricted'].includes(flightAreaType)
    const isOverPeople = overPeople || groundType === 'gathering' || groundType === 'populated'
    const isNearAerodrome = nearAerodrome && (!aerodromeDistance || aerodromeDistance < 5.6) // 3nm = 5.56km
    
    if (isControlled && !isMicro) {
      category = 'advanced'
      reasons.push('Controlled airspace requires Advanced certificate')
    }
    
    if (isOverPeople && !isMicro) {
      category = 'advanced'
      reasons.push('Operations over/near people require Advanced certificate')
    }
    
    if (isNearAerodrome) {
      category = 'advanced'
      reasons.push('Within 3nm of aerodrome requires Advanced certificate or ATC authorization')
    }
  }

  // Basic Operations - remaining cases
  if (category === 'basic') {
    reasons.push('Standard VLOS operation in uncontrolled airspace')
    if (isMicro) {
      reasons.push('Micro RPAS (≤250g) - some restrictions relaxed')
    }
  }

  return { category, reasons, isMicro, isSmall, mtow }
}

// License category display config
const licenseCategories = {
  basic: {
    label: 'Basic Operations',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle2,
    requirements: [
      'Pilot Certificate - Basic',
      'Registered RPAS',
      'VLOS operations only',
      'Below 122m (400ft) AGL',
      'Uncontrolled airspace or authorization'
    ]
  },
  advanced: {
    label: 'Advanced Operations',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Award,
    requirements: [
      'Pilot Certificate - Advanced',
      'Registered RPAS with safety features',
      'Flight Review within 24 months',
      'Can fly in controlled airspace',
      'Can fly over/near people'
    ]
  },
  complex: {
    label: 'Complex Operations (SFOC)',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: FileCheck,
    requirements: [
      'Special Flight Operations Certificate',
      'Detailed safety case required',
      'Transport Canada approval',
      'Insurance requirements may apply',
      'Operational limitations per SFOC'
    ]
  }
}

export default function ProjectFlightPlan({ project, onUpdate }) {
  const [aircraftList, setAircraftList] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    license: true,
    aircraft: true,
    parameters: true,
    weather: true,
    contingencies: false
  })

  useEffect(() => {
    loadAircraft()
  }, [])

  useEffect(() => {
    if (!project.flightPlan) {
      onUpdate({
        flightPlan: {
          aircraft: [],
          operationType: 'VLOS',
          maxAltitudeAGL: 120,
          flightAreaType: 'uncontrolled',
          groundType: 'sparsely_populated',
          overPeople: false,
          nearAerodrome: false,
          aerodromeDistance: null,
          nightOperations: false,
          weatherMinimums: { ...defaultWeatherMinimums },
          contingencies: [...defaultContingencies],
          additionalProcedures: ''
        }
      })
    }
  }, [project.flightPlan])

  const loadAircraft = async () => {
    try {
      const data = await getAircraft()
      setAircraftList(data.filter(ac => ac.status === 'airworthy'))
    } catch (err) {
      console.error('Error loading aircraft:', err)
    } finally {
      setLoading(false)
    }
  }

  const flightPlan = project.flightPlan || {}

  const updateFlightPlan = (updates) => {
    onUpdate({
      flightPlan: {
        ...flightPlan,
        ...updates
      }
    })
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Aircraft management
  const addAircraft = (aircraftId) => {
    if (!aircraftId) return
    const ac = aircraftList.find(a => a.id === aircraftId)
    if (!ac) return
    if (flightPlan.aircraft?.some(a => a.id === aircraftId)) return

    updateFlightPlan({
      aircraft: [...(flightPlan.aircraft || []), {
        id: ac.id,
        nickname: ac.nickname,
        make: ac.make,
        model: ac.model,
        mtow: ac.mtow,
        maxSpeed: ac.maxSpeed,
        maxDimension: ac.maxDimension,
        isPrimary: (flightPlan.aircraft || []).length === 0
      }]
    })
  }

  const removeAircraft = (aircraftId) => {
    const newAircraft = (flightPlan.aircraft || []).filter(a => a.id !== aircraftId)
    if (newAircraft.length > 0 && !newAircraft.some(a => a.isPrimary)) {
      newAircraft[0].isPrimary = true
    }
    updateFlightPlan({ aircraft: newAircraft })
  }

  const setPrimaryAircraft = (aircraftId) => {
    const newAircraft = (flightPlan.aircraft || []).map(a => ({
      ...a,
      isPrimary: a.id === aircraftId
    }))
    updateFlightPlan({ aircraft: newAircraft })
  }

  // Weather minimums
  const updateWeather = (field, value) => {
    updateFlightPlan({
      weatherMinimums: {
        ...(flightPlan.weatherMinimums || defaultWeatherMinimums),
        [field]: value
      }
    })
  }

  // Contingencies
  const updateContingency = (index, field, value) => {
    const newContingencies = [...(flightPlan.contingencies || defaultContingencies)]
    newContingencies[index] = { ...newContingencies[index], [field]: value }
    updateFlightPlan({ contingencies: newContingencies })
  }

  const addContingency = () => {
    updateFlightPlan({
      contingencies: [...(flightPlan.contingencies || []), {
        trigger: '',
        action: '',
        priority: 'medium'
      }]
    })
  }

  const removeContingency = (index) => {
    const newContingencies = (flightPlan.contingencies || []).filter((_, i) => i !== index)
    updateFlightPlan({ contingencies: newContingencies })
  }

  const availableAircraft = aircraftList.filter(ac => 
    !flightPlan.aircraft?.some(a => a.id === ac.id)
  )

  // Calculate license category
  const licenseInfo = useMemo(() => {
    return detectCARsCategory(flightPlan, flightPlan.aircraft)
  }, [flightPlan])

  const categoryConfig = licenseCategories[licenseInfo.category]
  const CategoryIcon = categoryConfig.icon

  // Get primary aircraft for SORA data
  const primaryAircraft = flightPlan.aircraft?.find(a => a.isPrimary) || flightPlan.aircraft?.[0]

  return (
    <div className="space-y-6">
      {/* License Category Banner */}
      <div className={`card border-2 ${categoryConfig.color}`}>
        <button
          onClick={() => toggleSection('license')}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-3">
            <CategoryIcon className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">CARs Category: {categoryConfig.label}</h2>
              <p className="text-sm opacity-80">Based on your flight parameters</p>
            </div>
          </div>
          {expandedSections.license ? <ChevronUp className="w-5 h-5 opacity-60" /> : <ChevronDown className="w-5 h-5 opacity-60" />}
        </button>

        {expandedSections.license && (
          <div className="mt-4 pt-4 border-t border-current/20">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Why this category?</h4>
                <ul className="space-y-1">
                  {licenseInfo.reasons.map((reason, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
                {licenseInfo.mtow > 0 && (
                  <p className="text-sm mt-2 opacity-80">
                    Aircraft MTOW: {licenseInfo.mtow}g ({licenseInfo.isMicro ? 'Micro' : licenseInfo.isSmall ? 'Small' : 'Standard'} RPAS)
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Requirements</h4>
                <ul className="space-y-1">
                  {categoryConfig.requirements.map((req, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SORA Summary (if applicable) */}
      {licenseInfo.category !== 'basic' && primaryAircraft && (
        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-purple-600" />
            <h3 className="font-medium text-purple-900">SORA Data Summary</h3>
          </div>
          <div className="grid sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-purple-600">Max Dimension</p>
              <p className="font-semibold text-purple-900">{primaryAircraft.maxDimension || '~1'}m</p>
            </div>
            <div>
              <p className="text-purple-600">Max Speed</p>
              <p className="font-semibold text-purple-900">{primaryAircraft.maxSpeed || '~25'} m/s</p>
            </div>
            <div>
              <p className="text-purple-600">Max Altitude</p>
              <p className="font-semibold text-purple-900">{flightPlan.maxAltitudeAGL || 120}m AGL</p>
            </div>
            <div>
              <p className="text-purple-600">Operation Type</p>
              <p className="font-semibold text-purple-900">{flightPlan.operationType || 'VLOS'}</p>
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-3">
            These values will be used in SORA assessment. Update aircraft specs in Aircraft Management for accurate calculations.
          </p>
        </div>
      )}

      {/* Aircraft Selection */}
      <div className="card">
        <button
          onClick={() => toggleSection('aircraft')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plane className="w-5 h-5 text-aeria-blue" />
            Aircraft
            {flightPlan.aircraft?.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                {flightPlan.aircraft.length}
              </span>
            )}
          </h2>
          {expandedSections.aircraft ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.aircraft && (
          <div className="mt-4 space-y-4">
            {flightPlan.aircraft?.length > 0 ? (
              <div className="space-y-2">
                {flightPlan.aircraft.map((ac) => (
                  <div 
                    key={ac.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      ac.isPrimary ? 'bg-aeria-navy/5 border-aeria-navy/30' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Plane className={`w-5 h-5 ${ac.isPrimary ? 'text-aeria-navy' : 'text-gray-400'}`} />
                      <div>
                        <span className="font-medium text-gray-900">{ac.nickname}</span>
                        <span className="text-gray-500 ml-2">{ac.make} {ac.model}</span>
                        {ac.isPrimary && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-aeria-navy text-white rounded">Primary</span>
                        )}
                        {ac.mtow && (
                          <span className="ml-2 text-xs text-gray-500">({ac.mtow}g)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!ac.isPrimary && flightPlan.aircraft.length > 1 && (
                        <button
                          onClick={() => setPrimaryAircraft(ac.id)}
                          className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 hover:bg-gray-200 rounded"
                        >
                          Make Primary
                        </button>
                      )}
                      <button
                        onClick={() => removeAircraft(ac.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Plane className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No aircraft selected</p>
              </div>
            )}

            {availableAircraft.length > 0 && (
              <div className="flex gap-2">
                <select
                  className="input flex-1"
                  defaultValue=""
                  onChange={(e) => {
                    addAircraft(e.target.value)
                    e.target.value = ''
                  }}
                >
                  <option value="">Add aircraft...</option>
                  {availableAircraft.map(ac => (
                    <option key={ac.id} value={ac.id}>
                      {ac.nickname} - {ac.make} {ac.model} ({ac.mtow || '?'}g)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {availableAircraft.length === 0 && aircraftList.length === 0 && !loading && (
              <p className="text-sm text-gray-500">
                <a href="/aircraft" className="text-aeria-blue hover:underline">Add aircraft</a> to your fleet first.
              </p>
            )}
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
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Operation Type</label>
                <select
                  value={flightPlan.operationType || 'VLOS'}
                  onChange={(e) => updateFlightPlan({ operationType: e.target.value })}
                  className="input"
                >
                  {operationTypes.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} - {opt.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Max Altitude AGL (m)</label>
                <input
                  type="number"
                  value={flightPlan.maxAltitudeAGL || 120}
                  onChange={(e) => updateFlightPlan({ maxAltitudeAGL: parseFloat(e.target.value) || 0 })}
                  className="input"
                  min="0"
                  max="400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {flightPlan.maxAltitudeAGL > 122 
                    ? '⚠️ Above 400ft may require SFOC' 
                    : '✓ Within basic operations limit (400ft)'}
                </p>
              </div>

              <div>
                <label className="label">Airspace Classification</label>
                <select
                  value={flightPlan.flightAreaType || 'uncontrolled'}
                  onChange={(e) => updateFlightPlan({ flightAreaType: e.target.value })}
                  className="input"
                >
                  {areaTypes.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Ground Area Type</label>
                <select
                  value={flightPlan.groundType || 'sparsely_populated'}
                  onChange={(e) => updateFlightPlan({ groundType: e.target.value })}
                  className="input"
                >
                  {groundTypes.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} - {opt.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flightPlan.overPeople || false}
                  onChange={(e) => updateFlightPlan({ overPeople: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-aeria-blue"
                />
                <span className="text-sm">
                  <span className="font-medium">Over People</span>
                  <br />
                  <span className="text-gray-500">Within 30m horizontal</span>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flightPlan.nearAerodrome || false}
                  onChange={(e) => updateFlightPlan({ nearAerodrome: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-aeria-blue"
                />
                <span className="text-sm">
                  <span className="font-medium">Near Aerodrome</span>
                  <br />
                  <span className="text-gray-500">Within 5.6km (3nm)</span>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flightPlan.nightOperations || false}
                  onChange={(e) => updateFlightPlan({ nightOperations: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-aeria-blue"
                />
                <span className="text-sm">
                  <span className="font-medium">Night Operations</span>
                  <br />
                  <span className="text-gray-500">Before sunrise/after sunset</span>
                </span>
              </label>
            </div>

            {flightPlan.nearAerodrome && (
              <div>
                <label className="label">Distance from Aerodrome (km)</label>
                <input
                  type="number"
                  value={flightPlan.aerodromeDistance || ''}
                  onChange={(e) => updateFlightPlan({ aerodromeDistance: parseFloat(e.target.value) || null })}
                  className="input"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 4.5"
                />
              </div>
            )}
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
          <div className="mt-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Min Visibility (SM)
                </label>
                <input
                  type="number"
                  value={flightPlan.weatherMinimums?.minVisibility || 3}
                  onChange={(e) => updateWeather('minVisibility', parseFloat(e.target.value))}
                  className="input"
                  step="0.5"
                  min="0"
                />
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  Min Ceiling (ft)
                </label>
                <input
                  type="number"
                  value={flightPlan.weatherMinimums?.minCeiling || 500}
                  onChange={(e) => updateWeather('minCeiling', parseFloat(e.target.value))}
                  className="input"
                  step="100"
                  min="0"
                />
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  Max Wind (m/s)
                </label>
                <input
                  type="number"
                  value={flightPlan.weatherMinimums?.maxWind || 10}
                  onChange={(e) => updateWeather('maxWind', parseFloat(e.target.value))}
                  className="input"
                  min="0"
                />
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  Max Gust (m/s)
                </label>
                <input
                  type="number"
                  value={flightPlan.weatherMinimums?.maxGust || 15}
                  onChange={(e) => updateWeather('maxGust', parseFloat(e.target.value))}
                  className="input"
                  min="0"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!(flightPlan.weatherMinimums?.precipitation ?? false)}
                  onChange={(e) => updateWeather('precipitation', !e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-aeria-blue"
                />
                <span className="text-sm font-medium">No precipitation (rain, snow, etc.)</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="label">Weather Notes</label>
              <textarea
                value={flightPlan.weatherMinimums?.notes || ''}
                onChange={(e) => updateWeather('notes', e.target.value)}
                className="input min-h-[60px]"
                placeholder="Additional weather considerations..."
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
                        className="flex-1 text-sm font-medium bg-transparent border-none p-0 focus:ring-0"
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
              className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Contingency
            </button>
          </div>
        )}
      </div>

      {/* Additional Procedures */}
      <div className="card">
        <label className="label">Additional Procedures / Notes</label>
        <textarea
          value={flightPlan.additionalProcedures || ''}
          onChange={(e) => updateFlightPlan({ additionalProcedures: e.target.value })}
          className="input min-h-[100px]"
          placeholder="Any additional flight procedures, special considerations, or notes..."
        />
      </div>
    </div>
  )
}
