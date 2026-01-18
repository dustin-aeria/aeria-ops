import { useState, useEffect } from 'react'
import { 
  MapPin, Plus, Trash2, AlertTriangle, Navigation, Mountain, TreePine, Building, Radio, Car, Users,
  Camera, ChevronDown, ChevronUp, CheckCircle2, Map, Plane, Layers, ExternalLink
} from 'lucide-react'
import { MapPreview, MapEditorModal } from './MapComponents'

// ============================================
// POPULATION CATEGORIES (SORA-aligned)
// ============================================
const populationCategories = {
  controlled: { label: 'Controlled Ground Area', description: 'No uninvolved people present, fully controlled access', density: 0 },
  remote: { label: 'Remote/Sparsely Populated', description: 'Very low density, < 5 people/km²', density: 5 },
  lightly: { label: 'Lightly Populated', description: 'Rural areas, 5-50 people/km²', density: 50 },
  sparsely: { label: 'Sparsely Populated', description: 'Scattered houses, 50-500 people/km²', density: 500 },
  suburban: { label: 'Suburban/Populated', description: 'Residential areas, 500-5000 people/km²', density: 5000 },
  highdensity: { label: 'High Density Urban', description: 'Urban centers, > 5000 people/km²', density: 10000 },
  assembly: { label: 'Gatherings/Assembly', description: 'Crowds, events, high concentration', density: 50000 }
}

const obstacleTypes = [
  { value: 'tower', label: 'Tower/Mast' },
  { value: 'powerline', label: 'Power Lines' },
  { value: 'building', label: 'Building/Structure' },
  { value: 'tree', label: 'Trees/Vegetation' },
  { value: 'terrain', label: 'Terrain Feature' },
  { value: 'wire', label: 'Wire/Cable' },
  { value: 'antenna', label: 'Antenna' },
  { value: 'other', label: 'Other' }
]

const accessTypes = [
  { value: 'public_road', label: 'Public Road' },
  { value: 'private_road', label: 'Private Road (permission required)' },
  { value: 'trail', label: 'Trail/Path' },
  { value: 'off_road', label: 'Off-road/4x4' },
  { value: 'boat', label: 'Boat Access' },
  { value: 'helicopter', label: 'Helicopter Access' },
  { value: 'walk_in', label: 'Walk-in Only' }
]

const groundConditions = [
  { value: 'paved', label: 'Paved/Concrete' },
  { value: 'gravel', label: 'Gravel' },
  { value: 'grass', label: 'Grass/Field' },
  { value: 'dirt', label: 'Dirt/Earth' },
  { value: 'sand', label: 'Sand' },
  { value: 'snow', label: 'Snow/Ice' },
  { value: 'rocky', label: 'Rocky Terrain' },
  { value: 'wetland', label: 'Wetland/Marsh' }
]

const surveyMethods = [
  { value: 'in_person', label: 'In-Person Site Visit' },
  { value: 'remote', label: 'Remote Assessment' },
  { value: 'hybrid', label: 'Hybrid' }
]

// Default empty site structure
const createEmptySite = (index) => ({
  id: `site-${Date.now()}-${index}`,
  name: index === 0 ? 'Primary Site' : `Site ${index + 1}`,
  includeFlightPlan: true,
  siteSurvey: {
    location: { name: '', coordinates: null },
    boundary: [],
    population: { category: 'sparsely' },
    airspace: { classification: 'G' },
    obstacles: [],
    access: { type: 'public_road' },
    groundConditions: { type: 'grass' },
    surveyDate: new Date().toISOString().split('T')[0],
    surveyedBy: '',
    surveyMethod: 'in_person'
  },
  flightPlan: null,
  sora: null,
  emergency: {
    musterPoints: [],
    evacuationRoutes: []
  }
})

// ============================================
// MAIN COMPONENT: Multi-Site Survey
// ============================================
export default function ProjectSiteSurvey({ project, onUpdate }) {
  const [sites, setSites] = useState([])
  const [activeSiteIndex, setActiveSiteIndex] = useState(0)
  const [mapEditorOpen, setMapEditorOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    population: true,
    airspace: false,
    obstacles: false,
    access: false,
    ground: false,
    notes: false
  })

  // Initialize from project
  useEffect(() => {
    if (project.sites && Array.isArray(project.sites) && project.sites.length > 0) {
      setSites(project.sites)
    } else if (project.siteSurvey) {
      // Migrate old single-site structure
      const migratedSite = {
        id: 'site-migrated-1',
        name: 'Primary Site',
        includeFlightPlan: true,
        siteSurvey: project.siteSurvey,
        flightPlan: project.flightPlan || null,
        sora: project.sora || null,
        emergency: {
          musterPoints: project.emergencyPlan?.musterPoints || [],
          evacuationRoutes: project.emergencyPlan?.evacuationRoutes || []
        }
      }
      setSites([migratedSite])
      // Save the migrated structure
      onUpdate({ sites: [migratedSite] })
    } else {
      // Create default site
      const defaultSite = createEmptySite(0)
      setSites([defaultSite])
      onUpdate({ sites: [defaultSite] })
    }
  }, [])

  // Save sites to project
  const saveSites = (newSites) => {
    setSites(newSites)
    onUpdate({ sites: newSites })
  }

  const activeSite = sites[activeSiteIndex] || sites[0]
  const siteSurvey = activeSite?.siteSurvey || {}

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Site management
  const addSite = () => {
    const newSite = createEmptySite(sites.length)
    const newSites = [...sites, newSite]
    saveSites(newSites)
    setActiveSiteIndex(newSites.length - 1)
  }

  const removeSite = (index) => {
    if (sites.length <= 1) return
    const newSites = sites.filter((_, i) => i !== index)
    saveSites(newSites)
    if (activeSiteIndex >= newSites.length) {
      setActiveSiteIndex(newSites.length - 1)
    }
  }

  const updateSiteName = (index, name) => {
    const newSites = [...sites]
    newSites[index] = { ...newSites[index], name }
    saveSites(newSites)
  }

  const toggleFlightPlan = (index) => {
    const newSites = [...sites]
    const site = newSites[index]
    const includeFlightPlan = !site.includeFlightPlan
    newSites[index] = {
      ...site,
      includeFlightPlan,
      flightPlan: includeFlightPlan ? (site.flightPlan || {}) : null,
      sora: includeFlightPlan ? (site.sora || {}) : null
    }
    saveSites(newSites)
  }

  // Update active site's survey data
  const updateSiteSurvey = (updates) => {
    const newSites = [...sites]
    newSites[activeSiteIndex] = {
      ...newSites[activeSiteIndex],
      siteSurvey: {
        ...newSites[activeSiteIndex].siteSurvey,
        ...updates
      }
    }
    saveSites(newSites)
  }

  const updateLocation = (field, value) => {
    updateSiteSurvey({
      location: { ...(siteSurvey.location || {}), [field]: value }
    })
  }

  const updatePopulation = (field, value) => {
    updateSiteSurvey({
      population: { ...(siteSurvey.population || {}), [field]: value }
    })
  }

  const updateAirspace = (field, value) => {
    updateSiteSurvey({
      airspace: { ...(siteSurvey.airspace || {}), [field]: value }
    })
  }

  const updateAccess = (field, value) => {
    updateSiteSurvey({
      access: { ...(siteSurvey.access || {}), [field]: value }
    })
  }

  const updateGroundConditions = (field, value) => {
    updateSiteSurvey({
      groundConditions: { ...(siteSurvey.groundConditions || {}), [field]: value }
    })
  }

  // Obstacles
  const addObstacle = () => {
    updateSiteSurvey({
      obstacles: [...(siteSurvey.obstacles || []), { type: 'building', description: '', height: '', distance: '' }]
    })
  }

  const updateObstacle = (index, field, value) => {
    const obstacles = [...(siteSurvey.obstacles || [])]
    obstacles[index] = { ...obstacles[index], [field]: value }
    updateSiteSurvey({ obstacles })
  }

  const removeObstacle = (index) => {
    updateSiteSurvey({
      obstacles: (siteSurvey.obstacles || []).filter((_, i) => i !== index)
    })
  }

  // Handle map editor save
  const handleMapSave = (mapData) => {
    const newSites = [...sites]
    newSites[activeSiteIndex] = {
      ...newSites[activeSiteIndex],
      siteSurvey: {
        ...newSites[activeSiteIndex].siteSurvey,
        location: {
          ...newSites[activeSiteIndex].siteSurvey.location,
          coordinates: mapData.siteLocation
        },
        boundary: mapData.boundary || []
      }
    }
    saveSites(newSites)
  }

  if (sites.length === 0) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Site Tabs / Selector */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-aeria-blue" />
            Project Sites
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{sites.length}</span>
          </h2>
          <button onClick={addSite} className="btn-secondary text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Add Site
          </button>
        </div>

        {/* Site Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {sites.map((site, index) => (
            <button
              key={site.id}
              onClick={() => setActiveSiteIndex(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                activeSiteIndex === index
                  ? 'border-aeria-blue bg-blue-50 text-aeria-navy'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{site.name}</span>
              {site.includeFlightPlan && (
                <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">+ Flight</span>
              )}
            </button>
          ))}
        </div>

        {/* Active Site Configuration */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Site Name</label>
              <input
                type="text"
                value={activeSite?.name || ''}
                onChange={(e) => updateSiteName(activeSiteIndex, e.target.value)}
                className="input font-medium"
                placeholder="Site name"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border">
                <input
                  type="checkbox"
                  checked={activeSite?.includeFlightPlan || false}
                  onChange={() => toggleFlightPlan(activeSiteIndex)}
                  className="w-4 h-4 text-green-600 rounded"
                />
                <span className="text-sm flex items-center gap-1">
                  <Plane className="w-4 h-4 text-green-600" />
                  Include Flight Plan & SORA
                </span>
              </label>
              {sites.length > 1 && (
                <button
                  onClick={() => removeSite(activeSiteIndex)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-200"
                  title="Remove site"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Site Location & Map */}
      <div className="card">
        <button
          onClick={() => toggleSection('location')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-aeria-blue" />
            Site Location & Boundary
          </h2>
          {expandedSections.location ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.location && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Site Name / Description *</label>
              <input
                type="text"
                value={siteSurvey.location?.name || ''}
                onChange={(e) => updateLocation('name', e.target.value)}
                className="input"
                placeholder="e.g., Highway 99 Bridge Inspection Site"
              />
            </div>

            {/* Inline Map Preview */}
            <div>
              <label className="label mb-2">Site Map</label>
              <MapPreview
                siteLocation={siteSurvey.location?.coordinates}
                boundary={siteSurvey.boundary}
                launchPoint={activeSite?.flightPlan?.launchPoint}
                recoveryPoint={activeSite?.flightPlan?.recoveryPoint}
                height={250}
                onOpenEditor={() => setMapEditorOpen(true)}
              />
            </div>

            {/* Coordinate Display */}
            {siteSurvey.location?.coordinates && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Latitude</label>
                  <input
                    type="text"
                    value={siteSurvey.location?.coordinates?.lat || ''}
                    readOnly
                    className="input bg-gray-50"
                  />
                </div>
                <div>
                  <label className="label">Longitude</label>
                  <input
                    type="text"
                    value={siteSurvey.location?.coordinates?.lng || ''}
                    readOnly
                    className="input bg-gray-50"
                  />
                </div>
              </div>
            )}

            {/* Boundary Status */}
            {(siteSurvey.boundary || []).length > 0 && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Work area boundary defined ({siteSurvey.boundary.length} points)
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Population Density */}
      <div className="card">
        <button
          onClick={() => toggleSection('population')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-aeria-blue" />
            Population Density
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">SORA Input</span>
          </h2>
          {expandedSections.population ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.population && (
          <div className="mt-4 space-y-2">
            {Object.entries(populationCategories).map(([key, cat]) => (
              <label
                key={key}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  siteSurvey.population?.category === key
                    ? 'border-aeria-blue bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="populationCategory"
                  value={key}
                  checked={siteSurvey.population?.category === key}
                  onChange={(e) => updatePopulation('category', e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">{cat.label}</p>
                  <p className="text-sm text-gray-600">{cat.description}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Airspace */}
      <div className="card">
        <button
          onClick={() => toggleSection('airspace')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-aeria-blue" />
            Airspace Classification
          </h2>
          {expandedSections.airspace ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.airspace && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Airspace Class</label>
              <select
                value={siteSurvey.airspace?.classification || 'G'}
                onChange={(e) => updateAirspace('classification', e.target.value)}
                className="input"
              >
                <option value="G">Class G - Uncontrolled</option>
                <option value="E">Class E - Controlled (above 700ft AGL)</option>
                <option value="D">Class D - Control Zone</option>
                <option value="C">Class C - Terminal Area</option>
                <option value="B">Class B - Major Airport</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteSurvey.airspace?.nearAerodrome || false}
                  onChange={(e) => updateAirspace('nearAerodrome', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Near Aerodrome (within 5.6km / 3nm)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteSurvey.airspace?.nearHeliport || false}
                  onChange={(e) => updateAirspace('nearHeliport', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Near Heliport (within 1.8km / 1nm)</span>
              </label>
            </div>

            {siteSurvey.airspace?.nearAerodrome && (
              <div>
                <label className="label">Distance to Aerodrome (km)</label>
                <input
                  type="number"
                  value={siteSurvey.airspace?.aerodromeDistance || ''}
                  onChange={(e) => updateAirspace('aerodromeDistance', parseFloat(e.target.value))}
                  className="input"
                  placeholder="e.g., 3.5"
                  step="0.1"
                />
              </div>
            )}

            {/* NAV Canada Link */}
            <a
              href="https://www.navcanada.ca/en/flight-planning/drone-flight-planning.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-aeria-blue hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Check NAV CANADA Drone Flight Planning
            </a>
          </div>
        )}
      </div>

      {/* Obstacles */}
      <div className="card">
        <button
          onClick={() => toggleSection('obstacles')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-aeria-blue" />
            Obstacles & Hazards
            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
              {(siteSurvey.obstacles || []).length}
            </span>
          </h2>
          {expandedSections.obstacles ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.obstacles && (
          <div className="mt-4 space-y-3">
            {(siteSurvey.obstacles || []).map((obs, i) => (
              <div key={i} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid sm:grid-cols-4 gap-2">
                    <select
                      value={obs.type}
                      onChange={(e) => updateObstacle(i, 'type', e.target.value)}
                      className="input text-sm"
                    >
                      {obstacleTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={obs.description}
                      onChange={(e) => updateObstacle(i, 'description', e.target.value)}
                      className="input text-sm"
                      placeholder="Description"
                    />
                    <input
                      type="text"
                      value={obs.height}
                      onChange={(e) => updateObstacle(i, 'height', e.target.value)}
                      className="input text-sm"
                      placeholder="Height (m AGL)"
                    />
                    <input
                      type="text"
                      value={obs.distance}
                      onChange={(e) => updateObstacle(i, 'distance', e.target.value)}
                      className="input text-sm"
                      placeholder="Distance (m)"
                    />
                  </div>
                  <button onClick={() => removeObstacle(i)} className="p-1.5 text-red-500 hover:bg-red-100 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addObstacle} className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-400 hover:text-amber-600 flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              Add Obstacle
            </button>
          </div>
        )}
      </div>

      {/* Site Access */}
      <div className="card">
        <button
          onClick={() => toggleSection('access')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Car className="w-5 h-5 text-aeria-blue" />
            Site Access
          </h2>
          {expandedSections.access ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.access && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Access Type</label>
                <select
                  value={siteSurvey.access?.type || 'public_road'}
                  onChange={(e) => updateAccess('type', e.target.value)}
                  className="input"
                >
                  {accessTypes.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Gate Code / Access Code</label>
                <input
                  type="text"
                  value={siteSurvey.access?.gateCode || ''}
                  onChange={(e) => updateAccess('gateCode', e.target.value)}
                  className="input"
                  placeholder="If applicable"
                />
              </div>
            </div>

            <div>
              <label className="label">Directions to Site</label>
              <textarea
                value={siteSurvey.access?.directions || ''}
                onChange={(e) => updateAccess('directions', e.target.value)}
                className="input min-h-[80px]"
                placeholder="Turn-by-turn directions from nearest landmark..."
              />
            </div>

            <div>
              <label className="label">Parking Location</label>
              <input
                type="text"
                value={siteSurvey.access?.parkingLocation || ''}
                onChange={(e) => updateAccess('parkingLocation', e.target.value)}
                className="input"
                placeholder="Where to park vehicles"
              />
            </div>

            <div>
              <label className="label">On-Site Contact</label>
              <input
                type="text"
                value={siteSurvey.access?.contactOnSite || ''}
                onChange={(e) => updateAccess('contactOnSite', e.target.value)}
                className="input"
                placeholder="Name and phone"
              />
            </div>
          </div>
        )}
      </div>

      {/* Ground Conditions */}
      <div className="card">
        <button
          onClick={() => toggleSection('ground')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Mountain className="w-5 h-5 text-aeria-blue" />
            Ground Conditions
          </h2>
          {expandedSections.ground ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.ground && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Surface Type</label>
                <select
                  value={siteSurvey.groundConditions?.type || 'grass'}
                  onChange={(e) => updateGroundConditions('type', e.target.value)}
                  className="input"
                >
                  {groundConditions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer mt-6">
                <input
                  type="checkbox"
                  checked={siteSurvey.groundConditions?.suitableForVehicle ?? true}
                  onChange={(e) => updateGroundConditions('suitableForVehicle', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Suitable for vehicle access</span>
              </label>
            </div>

            <div>
              <label className="label">Ground Hazards</label>
              <textarea
                value={siteSurvey.groundConditions?.hazards || ''}
                onChange={(e) => updateGroundConditions('hazards', e.target.value)}
                className="input min-h-[60px]"
                placeholder="Uneven terrain, holes, debris, water hazards..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Survey Info */}
      <div className="card">
        <button
          onClick={() => toggleSection('notes')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-aeria-blue" />
            Survey Information
          </h2>
          {expandedSections.notes ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.notes && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Survey Date *</label>
                <input
                  type="date"
                  value={siteSurvey.surveyDate || ''}
                  onChange={(e) => updateSiteSurvey({ surveyDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Surveyed By *</label>
                <input
                  type="text"
                  value={siteSurvey.surveyedBy || ''}
                  onChange={(e) => updateSiteSurvey({ surveyedBy: e.target.value })}
                  className="input"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="label">Method</label>
                <select
                  value={siteSurvey.surveyMethod || 'in_person'}
                  onChange={(e) => updateSiteSurvey({ surveyMethod: e.target.value })}
                  className="input"
                >
                  {surveyMethods.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Additional Notes</label>
              <textarea
                value={siteSurvey.notes || ''}
                onChange={(e) => updateSiteSurvey({ notes: e.target.value })}
                className="input min-h-[100px]"
                placeholder="Any additional observations, recommendations, or notes..."
              />
            </div>
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
        launchPoint={activeSite?.flightPlan?.launchPoint}
        recoveryPoint={activeSite?.flightPlan?.recoveryPoint}
        mode="site"
        siteName={activeSite?.name}
      />
    </div>
  )
}
