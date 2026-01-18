import { useState, useEffect } from 'react'
import { 
  ShieldAlert, Plus, Trash2, Phone, MapPin, Users, Route, Stethoscope, Flame, Plane,
  AlertTriangle, ChevronDown, ChevronUp, Building, Navigation, Layers, CheckCircle2
} from 'lucide-react'
import { MapPreview, MapEditorModal } from './MapComponents'

const contactTypes = [
  { value: 'emergency', label: 'Emergency Services', icon: Phone },
  { value: 'fic', label: 'Flight Information Centre', icon: Plane },
  { value: 'hospital', label: 'Hospital', icon: Stethoscope },
  { value: 'client', label: 'Client Contact', icon: Building },
  { value: 'company', label: 'Company Contact', icon: Users },
  { value: 'site', label: 'Site Contact', icon: MapPin },
  { value: 'other', label: 'Other', icon: Phone }
]

const defaultContacts = [
  { type: 'emergency', name: 'Emergency Services', phone: '911', notes: 'Police, Fire, Ambulance' },
  { type: 'fic', name: 'FIC Edmonton', phone: '1-866-541-4102', notes: 'For fly-away reporting' },
  { type: 'company', name: 'Aeria Solutions', phone: '', notes: 'Company emergency contact' }
]

const procedureTypes = [
  { id: 'medical', label: 'Medical Emergency', icon: Stethoscope, 
    defaultSteps: ['Cease all flight operations immediately', 'Ensure scene safety before approaching', 'Call 911 if serious injury', 'Administer first aid within training level', 'Designate someone to meet emergency responders', 'Document incident details for reporting'] },
  { id: 'fire', label: 'Fire Emergency', icon: Flame,
    defaultSteps: ['Alert all personnel - evacuate to muster point', 'Call 911', 'Only attempt to extinguish small fires if trained', 'Do not re-enter area until cleared', 'Account for all personnel at muster point'] },
  { id: 'aircraft_incident', label: 'Aircraft Incident', icon: Plane,
    defaultSteps: ['Note last known position and time', 'Do not approach if fire/smoke present', 'Secure the area - prevent unauthorized access', 'Do not disturb wreckage (potential TSB investigation)', 'Document scene with photos', 'Report to FIC Edmonton if fly-away', 'Complete incident report within 24 hours'] },
  { id: 'weather', label: 'Severe Weather', icon: AlertTriangle,
    defaultSteps: ['Monitor weather continuously during operations', 'Land aircraft immediately if conditions deteriorate', 'Seek shelter in vehicle or substantial structure', 'If lightning: avoid high ground, isolated trees', 'Wait 30 minutes after last thunder before resuming'] }
]

// ============================================
// MAIN COMPONENT: Multi-Site Emergency Plan
// ============================================
export default function ProjectEmergency({ project, onUpdate }) {
  const [sites, setSites] = useState([])
  const [activeSiteIndex, setActiveSiteIndex] = useState(0)
  const [mapEditorOpen, setMapEditorOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    contacts: true,
    medical: true,
    muster: true,
    procedures: false
  })

  // Initialize from project
  useEffect(() => {
    if (project.sites && Array.isArray(project.sites)) {
      setSites(project.sites)
    }
  }, [project.sites])

  // Initialize project-level emergency plan for shared contacts
  useEffect(() => {
    if (!project.emergencyPlan) {
      const defaultProcedures = {}
      procedureTypes.forEach(p => {
        defaultProcedures[p.id] = { enabled: true, steps: [...p.defaultSteps] }
      })

      onUpdate({
        emergencyPlan: {
          contacts: [...defaultContacts],
          medicalFacility: { name: '', address: '', phone: '', distance: '', driveTime: '' },
          firstAid: { kitLocation: 'In project vehicle', aedAvailable: false },
          procedures: defaultProcedures
        }
      })
    }
  }, [project.emergencyPlan])

  const emergencyPlan = project.emergencyPlan || {}
  const activeSite = sites[activeSiteIndex]
  const siteSurvey = activeSite?.siteSurvey || {}

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const saveSites = (newSites) => {
    setSites(newSites)
    onUpdate({ sites: newSites })
  }

  const updateEmergencyPlan = (updates) => {
    onUpdate({ emergencyPlan: { ...emergencyPlan, ...updates } })
  }

  // Contacts (shared across all sites)
  const addContact = () => {
    updateEmergencyPlan({
      contacts: [...(emergencyPlan.contacts || []), { type: 'other', name: '', phone: '', notes: '' }]
    })
  }

  const updateContact = (index, field, value) => {
    const newContacts = [...(emergencyPlan.contacts || [])]
    newContacts[index] = { ...newContacts[index], [field]: value }
    updateEmergencyPlan({ contacts: newContacts })
  }

  const removeContact = (index) => {
    updateEmergencyPlan({
      contacts: (emergencyPlan.contacts || []).filter((_, i) => i !== index)
    })
  }

  // Medical facility
  const updateMedical = (field, value) => {
    updateEmergencyPlan({
      medicalFacility: { ...(emergencyPlan.medicalFacility || {}), [field]: value }
    })
  }

  // First aid
  const updateFirstAid = (field, value) => {
    updateEmergencyPlan({
      firstAid: { ...(emergencyPlan.firstAid || {}), [field]: value }
    })
  }

  // Handle map save for site-specific emergency data
  const handleMapSave = (mapData) => {
    if (!activeSite) return
    const siteIndex = sites.findIndex(s => s.id === activeSite.id)
    if (siteIndex === -1) return

    const newSites = [...sites]
    newSites[siteIndex] = {
      ...newSites[siteIndex],
      emergency: {
        ...newSites[siteIndex].emergency,
        musterPoints: mapData.musterPoints || [],
        evacuationRoutes: mapData.evacuationRoutes || []
      }
    }
    saveSites(newSites)
  }

  // Update muster point name/description
  const updateMusterPoint = (index, field, value) => {
    if (!activeSite) return
    const siteIndex = sites.findIndex(s => s.id === activeSite.id)
    if (siteIndex === -1) return

    const newSites = [...sites]
    const musterPoints = [...(newSites[siteIndex].emergency?.musterPoints || [])]
    musterPoints[index] = { ...musterPoints[index], [field]: value }
    newSites[siteIndex] = {
      ...newSites[siteIndex],
      emergency: { ...newSites[siteIndex].emergency, musterPoints }
    }
    saveSites(newSites)
  }

  const deleteMusterPoint = (index) => {
    if (!activeSite) return
    const siteIndex = sites.findIndex(s => s.id === activeSite.id)
    if (siteIndex === -1) return

    const newSites = [...sites]
    const musterPoints = (newSites[siteIndex].emergency?.musterPoints || []).filter((_, i) => i !== index)
    newSites[siteIndex] = {
      ...newSites[siteIndex],
      emergency: { ...newSites[siteIndex].emergency, musterPoints }
    }
    saveSites(newSites)
  }

  // Update route name/description
  const updateRoute = (index, field, value) => {
    if (!activeSite) return
    const siteIndex = sites.findIndex(s => s.id === activeSite.id)
    if (siteIndex === -1) return

    const newSites = [...sites]
    const routes = [...(newSites[siteIndex].emergency?.evacuationRoutes || [])]
    routes[index] = { ...routes[index], [field]: value }
    newSites[siteIndex] = {
      ...newSites[siteIndex],
      emergency: { ...newSites[siteIndex].emergency, evacuationRoutes: routes }
    }
    saveSites(newSites)
  }

  const deleteRoute = (index) => {
    if (!activeSite) return
    const siteIndex = sites.findIndex(s => s.id === activeSite.id)
    if (siteIndex === -1) return

    const newSites = [...sites]
    const routes = (newSites[siteIndex].emergency?.evacuationRoutes || []).filter((_, i) => i !== index)
    newSites[siteIndex] = {
      ...newSites[siteIndex],
      emergency: { ...newSites[siteIndex].emergency, evacuationRoutes: routes }
    }
    saveSites(newSites)
  }

  return (
    <div className="space-y-6">
      {/* Site Selector */}
      {sites.length > 1 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-5 h-5 text-aeria-blue" />
            <h2 className="text-lg font-semibold">Select Site for Emergency Points</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {sites.map((site, index) => (
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
                {(site.emergency?.musterPoints?.length > 0 || site.emergency?.evacuationRoutes?.length > 0) && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contacts (shared) */}
      <div className="card">
        <button
          onClick={() => toggleSection('contacts')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-aeria-blue" />
            Emergency Contacts
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">All Sites</span>
          </h2>
          {expandedSections.contacts ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.contacts && (
          <div className="mt-4 space-y-3">
            {(emergencyPlan.contacts || []).map((contact, index) => {
              const TypeIcon = contactTypes.find(t => t.value === contact.type)?.icon || Phone
              return (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    <TypeIcon className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                    <div className="flex-1 grid sm:grid-cols-4 gap-2">
                      <select
                        value={contact.type}
                        onChange={(e) => updateContact(index, 'type', e.target.value)}
                        className="input text-sm"
                      >
                        {contactTypes.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => updateContact(index, 'name', e.target.value)}
                        className="input text-sm"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={contact.phone}
                        onChange={(e) => updateContact(index, 'phone', e.target.value)}
                        className="input text-sm"
                        placeholder="Phone"
                      />
                      <input
                        type="text"
                        value={contact.notes}
                        onChange={(e) => updateContact(index, 'notes', e.target.value)}
                        className="input text-sm"
                        placeholder="Notes"
                      />
                    </div>
                    <button onClick={() => removeContact(index)} className="p-1.5 text-red-500 hover:bg-red-100 rounded flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
            <button onClick={addContact} className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        )}
      </div>

      {/* Medical Facility & First Aid */}
      <div className="card">
        <button
          onClick={() => toggleSection('medical')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-aeria-blue" />
            Medical Facility & First Aid
          </h2>
          {expandedSections.medical ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.medical && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Hospital / Medical Facility</label>
                <input
                  type="text"
                  value={emergencyPlan.medicalFacility?.name || ''}
                  onChange={(e) => updateMedical('name', e.target.value)}
                  className="input"
                  placeholder="Name of nearest hospital"
                />
              </div>
              <div>
                <label className="label">Emergency Phone</label>
                <input
                  type="text"
                  value={emergencyPlan.medicalFacility?.phone || ''}
                  onChange={(e) => updateMedical('phone', e.target.value)}
                  className="input"
                  placeholder="Hospital phone"
                />
              </div>
            </div>
            
            <div>
              <label className="label">Address</label>
              <input
                type="text"
                value={emergencyPlan.medicalFacility?.address || ''}
                onChange={(e) => updateMedical('address', e.target.value)}
                className="input"
                placeholder="Full address"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Distance</label>
                <input
                  type="text"
                  value={emergencyPlan.medicalFacility?.distance || ''}
                  onChange={(e) => updateMedical('distance', e.target.value)}
                  className="input"
                  placeholder="e.g., 15 km"
                />
              </div>
              <div>
                <label className="label">Drive Time</label>
                <input
                  type="text"
                  value={emergencyPlan.medicalFacility?.driveTime || ''}
                  onChange={(e) => updateMedical('driveTime', e.target.value)}
                  className="input"
                  placeholder="e.g., 20 minutes"
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium text-gray-900 mb-3">First Aid</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Aid Kit Location</label>
                  <input
                    type="text"
                    value={emergencyPlan.firstAid?.kitLocation || ''}
                    onChange={(e) => updateFirstAid('kitLocation', e.target.value)}
                    className="input"
                    placeholder="e.g., In project vehicle"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    checked={emergencyPlan.firstAid?.aedAvailable || false}
                    onChange={(e) => updateFirstAid('aedAvailable', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">AED Available</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Site-Specific Muster & Evacuation */}
      {activeSite && (
        <div className="card">
          <button
            onClick={() => toggleSection('muster')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-aeria-blue" />
              Muster Points & Evacuation Routes
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{activeSite.name}</span>
            </h2>
            {expandedSections.muster ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.muster && (
            <div className="mt-4 space-y-4">
              {/* Map Preview with all emergency points */}
              <MapPreview
                siteLocation={siteSurvey.location?.coordinates}
                boundary={siteSurvey.boundary}
                launchPoint={activeSite.flightPlan?.launchPoint}
                recoveryPoint={activeSite.flightPlan?.recoveryPoint}
                musterPoints={activeSite.emergency?.musterPoints || []}
                evacuationRoutes={activeSite.emergency?.evacuationRoutes || []}
                height={280}
                onOpenEditor={() => setMapEditorOpen(true)}
              />

              {/* Muster Points List */}
              <div>
                <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                  🚨 Muster Points
                  <span className="text-xs text-gray-500">({(activeSite.emergency?.musterPoints || []).length})</span>
                </h3>
                <div className="space-y-2">
                  {(activeSite.emergency?.musterPoints || []).map((point, index) => (
                    <div key={index} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 grid sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={point.name}
                            onChange={(e) => updateMusterPoint(index, 'name', e.target.value)}
                            className="input text-sm"
                            placeholder="Name"
                          />
                          <input
                            type="text"
                            value={point.description}
                            onChange={(e) => updateMusterPoint(index, 'description', e.target.value)}
                            className="input text-sm"
                            placeholder="Description / landmarks"
                          />
                        </div>
                        <button onClick={() => deleteMusterPoint(index)} className="p-1.5 text-red-500 hover:bg-red-100 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {point.coordinates && (
                        <p className="text-xs text-amber-600 mt-2">
                          📍 {point.coordinates.lat?.toFixed(6)}, {point.coordinates.lng?.toFixed(6)}
                        </p>
                      )}
                    </div>
                  ))}
                  {(activeSite.emergency?.musterPoints || []).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                      No muster points set. Click "Edit Map" to add.
                    </p>
                  )}
                </div>
              </div>

              {/* Evacuation Routes List */}
              <div className="pt-4 border-t">
                <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                  <Route className="w-4 h-4" />
                  Evacuation Routes
                  <span className="text-xs text-gray-500">({(activeSite.emergency?.evacuationRoutes || []).length})</span>
                </h3>
                <div className="space-y-2">
                  {(activeSite.emergency?.evacuationRoutes || []).map((route, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={route.name}
                            onChange={(e) => updateRoute(index, 'name', e.target.value)}
                            className="input text-sm"
                            placeholder="Route name"
                          />
                          <textarea
                            value={route.description}
                            onChange={(e) => updateRoute(index, 'description', e.target.value)}
                            className="input text-sm min-h-[60px]"
                            placeholder="Route description..."
                          />
                        </div>
                        <button onClick={() => deleteRoute(index)} className="p-1.5 text-red-500 hover:bg-red-100 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {route.coordinates && route.coordinates.length > 0 && (
                        <p className="text-xs text-red-600 mt-2">
                          <CheckCircle2 className="w-3 h-3 inline mr-1" />
                          Route mapped ({route.coordinates.length} waypoints)
                        </p>
                      )}
                    </div>
                  ))}
                  {(activeSite.emergency?.evacuationRoutes || []).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                      No routes set. Click "Edit Map" to draw evacuation routes.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Emergency Procedures */}
      <div className="card">
        <button
          onClick={() => toggleSection('procedures')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-aeria-blue" />
            Emergency Procedures
          </h2>
          {expandedSections.procedures ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.procedures && (
          <div className="mt-4 space-y-4">
            {procedureTypes.map((procType) => {
              const procedure = emergencyPlan.procedures?.[procType.id] || { enabled: true, steps: procType.defaultSteps }
              const ProcIcon = procType.icon
              return (
                <div key={procType.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <ProcIcon className="w-4 h-4 text-gray-600" />
                      <span className="font-medium">{procType.label}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                      {(procedure.steps || []).map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Map Editor Modal */}
      {activeSite && (
        <MapEditorModal
          isOpen={mapEditorOpen}
          onClose={() => setMapEditorOpen(false)}
          onSave={handleMapSave}
          siteLocation={siteSurvey.location?.coordinates}
          boundary={siteSurvey.boundary}
          launchPoint={activeSite.flightPlan?.launchPoint}
          recoveryPoint={activeSite.flightPlan?.recoveryPoint}
          musterPoints={activeSite.emergency?.musterPoints || []}
          evacuationRoutes={activeSite.emergency?.evacuationRoutes || []}
          mode="emergency"
          siteName={activeSite.name}
        />
      )}
    </div>
  )
}
