import { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Plus,
  Trash2,
  Shield,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Target,
  Radar,
  FileCheck,
  Wrench,
  GraduationCap,
  Users,
  Eye,
  MapPin,
  Zap,
  Globe,
  Brain,
  Box,
  RefreshCw
} from 'lucide-react'

// Import SORA configuration
import {
  populationCategories,
  uaCharacteristics,
  intrinsicGRCMatrix,
  groundMitigations,
  arcLevels,
  tmprDefinitions,
  sailMatrix,
  sailColors,
  sailDescriptions,
  containmentRobustness,
  calculateAdjacentAreaDistance,
  osoDefinitions,
  osoCategories,
  robustnessLevels,
  getIntrinsicGRC,
  calculateFinalGRC as calcFinalGRC,
  calculateResidualARC as calcResidualARC,
  getSAIL,
  checkOSOCompliance,
  getContainmentRequirement
} from '../../lib/soraConfig'

// ============================================
// HSE HAZARD ASSESSMENT CONFIG
// ============================================
const hazardCategories = [
  { value: 'environmental', label: 'Environmental', examples: 'Weather, terrain, water hazards, wildlife' },
  { value: 'overhead', label: 'Overhead', examples: 'Power lines, towers, buildings, trees, wires' },
  { value: 'access', label: 'Access/Egress', examples: 'Slips/trips, uneven terrain, water crossings' },
  { value: 'ergonomic', label: 'Ergonomic', examples: 'Awkward postures, repetitive tasks, manual handling' },
  { value: 'personal', label: 'Personal Limitations', examples: 'Fatigue, distraction, training gaps, stress' },
  { value: 'equipment', label: 'Equipment', examples: 'Malfunction, battery hazards, sharp edges' },
  { value: 'biological', label: 'Biological', examples: 'Insects, poisonous plants, animal encounters' },
  { value: 'chemical', label: 'Chemical', examples: 'Fuel, battery chemicals, site contaminants' }
]

const likelihoodLevels = [
  { value: 1, label: 'Rare', description: 'Highly unlikely to occur' },
  { value: 2, label: 'Unlikely', description: 'Could occur but not expected' },
  { value: 3, label: 'Possible', description: 'Might occur occasionally' },
  { value: 4, label: 'Likely', description: 'Will probably occur' },
  { value: 5, label: 'Almost Certain', description: 'Expected to occur' }
]

const severityLevels = [
  { value: 1, label: 'Negligible', description: 'No injury, minor inconvenience' },
  { value: 2, label: 'Minor', description: 'First aid injury, minor damage' },
  { value: 3, label: 'Moderate', description: 'Medical treatment, significant damage' },
  { value: 4, label: 'Major', description: 'Serious injury, major damage' },
  { value: 5, label: 'Catastrophic', description: 'Fatality, total loss' }
]

const getRiskLevel = (likelihood, severity) => {
  const score = likelihood * severity
  if (score <= 4) return { level: 'Low', color: 'bg-green-100 text-green-800', action: 'Acceptable with monitoring' }
  if (score <= 9) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800', action: 'Mitigations recommended' }
  if (score <= 16) return { level: 'High', color: 'bg-orange-100 text-orange-800', action: 'Mitigations required' }
  return { level: 'Critical', color: 'bg-red-100 text-red-800', action: 'Do not proceed without controls' }
}

// ============================================
// HELPER: Determine UA characteristic from aircraft data
// ============================================
const getUACharacteristicFromAircraft = (aircraft) => {
  if (!aircraft || aircraft.length === 0) return null
  
  // Use primary aircraft, or first aircraft
  const primary = aircraft.find(a => a.isPrimary) || aircraft[0]
  
  // If we have maxSpeed from the aircraft library
  const speed = primary.maxSpeed || 25
  
  // Determine category based on speed (simplified - ideally would also check dimension)
  if (speed <= 25) return '1m_25ms'
  if (speed <= 35) return '3m_35ms'
  if (speed <= 75) return '8m_75ms'
  if (speed <= 120) return '20m_120ms'
  return '40m_200ms'
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProjectRisk({ project, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({
    groundRisk: true,
    airRisk: true,
    containment: false,
    oso: false,
    hazards: true
  })

  const flightPlanEnabled = project.sections?.flightPlan
  const siteSurveyEnabled = project.sections?.siteSurvey

  // ============================================
  // Get data from Site Survey and Flight Plan
  // ============================================
  const siteSurveyPopulation = project.siteSurvey?.population?.category
  const siteSurveyAdjacentPopulation = project.siteSurvey?.population?.adjacentCategory
  const flightPlanAircraft = project.flightPlan?.aircraft
  const flightPlanMaxSpeed = flightPlanAircraft?.find(a => a.isPrimary)?.maxSpeed || 
                             flightPlanAircraft?.[0]?.maxSpeed || 25

  // Initialize risk assessment if not present
  useEffect(() => {
    if (!project.riskAssessment) {
      const initialOsoCompliance = {}
      osoDefinitions.forEach(oso => {
        initialOsoCompliance[oso.id] = {
          robustness: 'none',
          evidence: ''
        }
      })

      // Auto-populate from Site Survey if available
      const initialPopulation = siteSurveyPopulation || 'sparsely'
      const initialAdjacentPopulation = siteSurveyAdjacentPopulation || 'sparsely'
      const initialUACharacteristic = getUACharacteristicFromAircraft(flightPlanAircraft) || '1m_25ms'

      onUpdate({
        riskAssessment: {
          sora: {
            enabled: flightPlanEnabled,
            // UA Characteristics - try to get from Flight Plan aircraft
            uaCharacteristic: initialUACharacteristic,
            maxSpeed: flightPlanMaxSpeed,
            // Population - pull from Site Survey if available
            populationCategory: initialPopulation,
            adjacentAreaPopulation: initialAdjacentPopulation,
            // Track if values came from Site Survey
            populationFromSiteSurvey: !!siteSurveyPopulation,
            adjacentFromSiteSurvey: !!siteSurveyAdjacentPopulation,
            // Mitigations (separated M1A, M1B, M1C)
            mitigations: {
              M1A: { enabled: false, robustness: 'none', evidence: '' },
              M1B: { enabled: false, robustness: 'none', evidence: '' },
              M1C: { enabled: false, robustness: 'none', evidence: '' },
              M2: { enabled: false, robustness: 'none', evidence: '' },
              M3: { enabled: true, robustness: 'low', evidence: 'ERP documented in Emergency Plan section' }
            },
            // Air Risk
            initialARC: 'ARC-b',
            tmpr: {
              enabled: true,
              type: 'VLOS',
              robustness: 'low',
              evidence: ''
            },
            // Containment
            containment: {
              method: '',
              robustness: 'none',
              evidence: ''
            },
            // OSO Compliance
            osoCompliance: initialOsoCompliance,
            additionalNotes: ''
          },
          hazards: [],
          overallRiskAcceptable: null,
          reviewNotes: '',
          reviewedBy: '',
          reviewDate: ''
        }
      })
    }
  }, [project.riskAssessment, flightPlanEnabled, onUpdate, siteSurveyPopulation, siteSurveyAdjacentPopulation, flightPlanAircraft, flightPlanMaxSpeed])

  const riskAssessment = project.riskAssessment || { sora: {}, hazards: [] }
  const sora = riskAssessment.sora || {}

  // ============================================
  // UPDATE FUNCTIONS
  // ============================================
  const updateRiskAssessment = (updates) => {
    onUpdate({
      riskAssessment: {
        ...riskAssessment,
        ...updates
      }
    })
  }

  const updateSora = (field, value) => {
    updateRiskAssessment({
      sora: { ...sora, [field]: value }
    })
  }

  const updateMitigation = (mitId, field, value) => {
    updateSora('mitigations', {
      ...(sora.mitigations || {}),
      [mitId]: {
        ...(sora.mitigations?.[mitId] || {}),
        [field]: value
      }
    })
  }

  const updateTmpr = (field, value) => {
    updateSora('tmpr', {
      ...(sora.tmpr || {}),
      [field]: value
    })
  }

  const updateContainment = (field, value) => {
    updateSora('containment', {
      ...(sora.containment || {}),
      [field]: value
    })
  }

  const updateOso = (osoId, field, value) => {
    updateSora('osoCompliance', {
      ...(sora.osoCompliance || {}),
      [osoId]: {
        ...(sora.osoCompliance?.[osoId] || {}),
        [field]: value
      }
    })
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // ============================================
  // SYNC FROM SITE SURVEY
  // ============================================
  const syncFromSiteSurvey = () => {
    if (siteSurveyPopulation) {
      updateSora('populationCategory', siteSurveyPopulation)
      updateSora('populationFromSiteSurvey', true)
    }
    if (siteSurveyAdjacentPopulation) {
      updateSora('adjacentAreaPopulation', siteSurveyAdjacentPopulation)
      updateSora('adjacentFromSiteSurvey', true)
    }
  }

  // Sync max speed from flight plan aircraft
  const syncFromFlightPlan = () => {
    if (flightPlanMaxSpeed) {
      updateSora('maxSpeed', flightPlanMaxSpeed)
    }
    const uaChar = getUACharacteristicFromAircraft(flightPlanAircraft)
    if (uaChar) {
      updateSora('uaCharacteristic', uaChar)
    }
  }

  // ============================================
  // CALCULATIONS
  // ============================================
  
  // Get intrinsic GRC from matrix
  const intrinsicGRC = getIntrinsicGRC(
    sora.populationCategory || 'sparsely',
    sora.uaCharacteristic || '1m_25ms'
  )

  // Calculate final GRC with mitigations
  const finalGRC = calcFinalGRC(intrinsicGRC, sora.mitigations || {})

  // Calculate residual ARC
  const residualARC = calcResidualARC(sora.initialARC || 'ARC-b', sora.tmpr)

  // Get SAIL
  const sail = getSAIL(finalGRC, residualARC) || 'II'

  // Check if outside SORA scope
  const outsideScope = intrinsicGRC === null || intrinsicGRC > 7 || finalGRC > 7

  // Calculate adjacent area distance
  const adjacentDistance = calculateAdjacentAreaDistance(sora.maxSpeed || 25)

  // Get required containment robustness
  const requiredContainment = getContainmentRequirement(
    sora.adjacentAreaPopulation || 'sparsely',
    sail
  )

  // Count OSO compliance gaps
  const osoGapCount = osoDefinitions.filter(oso => {
    const compliance = checkOSOCompliance(oso, sail, sora.osoCompliance?.[oso.id]?.robustness || 'none')
    return !compliance.compliant
  }).length

  // Check containment compliance
  const containmentCompliant = (() => {
    const levels = { 'none': 0, 'low': 1, 'medium': 2, 'high': 3 }
    const required = levels[requiredContainment] || 0
    const actual = levels[sora.containment?.robustness] || 0
    return actual >= required
  })()

  // Check if Site Survey data differs from current SORA values
  const siteSurveyMismatch = siteSurveyPopulation && siteSurveyPopulation !== sora.populationCategory
  const adjacentMismatch = siteSurveyAdjacentPopulation && siteSurveyAdjacentPopulation !== sora.adjacentAreaPopulation

  // ============================================
  // HAZARDS MANAGEMENT
  // ============================================
  const addHazard = () => {
    updateRiskAssessment({
      hazards: [...(riskAssessment.hazards || []), {
        category: 'environmental',
        description: '',
        likelihood: 2,
        severity: 2,
        controls: '',
        residualLikelihood: 1,
        residualSeverity: 1,
        responsible: ''
      }]
    })
  }

  const updateHazard = (index, field, value) => {
    const newHazards = [...(riskAssessment.hazards || [])]
    newHazards[index] = { ...newHazards[index], [field]: value }
    updateRiskAssessment({ hazards: newHazards })
  }

  const removeHazard = (index) => {
    const newHazards = (riskAssessment.hazards || []).filter((_, i) => i !== index)
    updateRiskAssessment({ hazards: newHazards })
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* SORA Summary Header */}
      {flightPlanEnabled && (
        <div className="card bg-gradient-to-r from-aeria-sky to-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SORA 2.5 Assessment Summary</h2>
          
          {outsideScope ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Outside SORA Scope</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                The combination of population density and UA characteristics results in a GRC outside 
                the SORA methodology scope. Consider certified category operations or different operational parameters.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Intrinsic GRC</p>
                  <p className="text-2xl font-bold text-gray-400">{intrinsicGRC}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Final GRC</p>
                  <p className="text-2xl font-bold text-gray-900">{finalGRC}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Initial ARC</p>
                  <p className="text-lg font-bold text-gray-400">{sora.initialARC || 'ARC-b'}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Residual ARC</p>
                  <p className="text-lg font-bold text-gray-900">{residualARC}</p>
                </div>
                <div className={`text-center p-3 rounded-lg shadow-sm ${sailColors[sail]}`}>
                  <p className="text-xs opacity-75 mb-1">SAIL</p>
                  <p className="text-2xl font-bold">{sail}</p>
                </div>
              </div>

              {/* Status Alerts */}
              <div className="mt-4 space-y-2">
                {osoGapCount > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span className="text-sm text-amber-800">
                      {osoGapCount} OSO compliance gap{osoGapCount > 1 ? 's' : ''} identified - review OSO section
                    </span>
                  </div>
                )}
                {!containmentCompliant && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                    <Box className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span className="text-sm text-amber-800">
                      Containment requires {requiredContainment} robustness - review Containment section
                    </span>
                  </div>
                )}
                {/* NEW: Site Survey sync alert */}
                {(siteSurveyMismatch || adjacentMismatch) && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-blue-800">
                        Site Survey has different population data. 
                        {siteSurveyMismatch && ` Operational: ${populationCategories.find(p => p.value === siteSurveyPopulation)?.label}`}
                        {adjacentMismatch && ` Adjacent: ${populationCategories.find(p => p.value === siteSurveyAdjacentPopulation)?.label}`}
                      </span>
                    </div>
                    <button
                      onClick={syncFromSiteSurvey}
                      className="text-sm text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Sync
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Ground Risk Section */}
      {flightPlanEnabled && (
        <div className="card">
          <button
            onClick={() => toggleSection('groundRisk')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-aeria-blue" />
              Ground Risk Assessment
              <span className="text-sm font-normal text-gray-500">(Steps 2-3)</span>
            </h2>
            {expandedSections.groundRisk ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.groundRisk && (
            <div className="mt-4 space-y-6">
              {/* UA Characteristics */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    UA Characteristics
                  </h3>
                  {/* NEW: Sync from Flight Plan button */}
                  {flightPlanAircraft && flightPlanAircraft.length > 0 && (
                    <button
                      onClick={syncFromFlightPlan}
                      className="text-xs text-aeria-blue hover:text-aeria-navy flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Sync from Flight Plan
                    </button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">UA Size & Speed Category</label>
                    <select
                      value={sora.uaCharacteristic || '1m_25ms'}
                      onChange={(e) => {
                        const char = uaCharacteristics.find(u => u.value === e.target.value)
                        updateSora('uaCharacteristic', e.target.value)
                        if (char) updateSora('maxSpeed', char.maxSpeed)
                      }}
                      className="input"
                    >
                      {uaCharacteristics.map(ua => (
                        <option key={ua.value} value={ua.value}>
                          {ua.label} - {ua.description}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on max characteristic dimension and typical cruise speed
                    </p>
                  </div>
                  <div>
                    <label className="label">Max Operational Speed (m/s)</label>
                    <input
                      type="number"
                      value={sora.maxSpeed || 25}
                      onChange={(e) => updateSora('maxSpeed', parseFloat(e.target.value) || 25)}
                      className="input"
                      min="1"
                      max="200"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used for containment calculations (3-min flight distance)
                    </p>
                  </div>
                </div>
              </div>

              {/* Population Density */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Operational Area Population
                  </h3>
                  {/* NEW: Sync from Site Survey button */}
                  {siteSurveyEnabled && siteSurveyPopulation && (
                    <button
                      onClick={syncFromSiteSurvey}
                      className="text-xs text-aeria-blue hover:text-aeria-navy flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Sync from Site Survey
                    </button>
                  )}
                </div>

                {/* NEW: Show Site Survey source indicator */}
                {sora.populationFromSiteSurvey && (
                  <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Population data imported from Site Survey
                    </p>
                  </div>
                )}

                <div>
                  <label className="label">Population Density Category</label>
                  <select
                    value={sora.populationCategory || 'sparsely'}
                    onChange={(e) => {
                      updateSora('populationCategory', e.target.value)
                      updateSora('populationFromSiteSurvey', false) // Mark as manually changed
                    }}
                    className="input"
                  >
                    {populationCategories.map(pop => (
                      <option key={pop.value} value={pop.value}>
                        {pop.label} ({pop.density})
                      </option>
                    ))}
                  </select>
                  {sora.populationCategory && (
                    <p className="text-xs text-gray-500 mt-1">
                      {populationCategories.find(p => p.value === sora.populationCategory)?.examples}
                    </p>
                  )}
                </div>

                {/* Intrinsic GRC Display */}
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Intrinsic GRC (from Table 2)</span>
                    <span className={`text-lg font-bold ${intrinsicGRC > 5 ? 'text-amber-600' : 'text-gray-900'}`}>
                      {intrinsicGRC || 'N/A'}
                    </span>
                  </div>
                  {intrinsicGRC === null && (
                    <p className="text-xs text-red-600 mt-1">
                      This combination is outside SORA scope
                    </p>
                  )}
                </div>
              </div>

              {/* Ground Risk Mitigations */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Ground Risk Mitigations
                </h3>
                
                <div className="space-y-4">
                  {/* M1A - Sheltering */}
                  <MitigationCard
                    mitigation={groundMitigations.M1A}
                    data={sora.mitigations?.M1A || {}}
                    onUpdate={(field, value) => updateMitigation('M1A', field, value)}
                  />

                  {/* M1B - Operational Restrictions */}
                  <MitigationCard
                    mitigation={groundMitigations.M1B}
                    data={sora.mitigations?.M1B || {}}
                    onUpdate={(field, value) => updateMitigation('M1B', field, value)}
                  />

                  {/* M1C - Ground Observation */}
                  <MitigationCard
                    mitigation={groundMitigations.M1C}
                    data={sora.mitigations?.M1C || {}}
                    onUpdate={(field, value) => updateMitigation('M1C', field, value)}
                  />

                  {/* M2 - Impact Reduction */}
                  <MitigationCard
                    mitigation={groundMitigations.M2}
                    data={sora.mitigations?.M2 || {}}
                    onUpdate={(field, value) => updateMitigation('M2', field, value)}
                  />

                  {/* M3 - ERP (Required) */}
                  <MitigationCard
                    mitigation={groundMitigations.M3}
                    data={sora.mitigations?.M3 || { enabled: true, robustness: 'low' }}
                    onUpdate={(field, value) => updateMitigation('M3', field, value)}
                    required
                  />
                </div>

                {/* Final GRC Display */}
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Final GRC (after mitigations)</span>
                    <div className="flex items-center gap-2">
                      {intrinsicGRC !== finalGRC && (
                        <span className="text-sm text-gray-400">{intrinsicGRC} →</span>
                      )}
                      <span className={`text-lg font-bold ${finalGRC > 5 ? 'text-amber-600' : 'text-green-600'}`}>
                        {finalGRC}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Air Risk Section */}
      {flightPlanEnabled && (
        <div className="card">
          <button
            onClick={() => toggleSection('airRisk')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Radar className="w-5 h-5 text-aeria-blue" />
              Air Risk Assessment
              <span className="text-sm font-normal text-gray-500">(Steps 4-6)</span>
            </h2>
            {expandedSections.airRisk ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.airRisk && (
            <div className="mt-4 space-y-6">
              {/* Initial ARC */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Initial Air Risk Classification</h3>
                <div>
                  <label className="label">Initial ARC</label>
                  <select
                    value={sora.initialARC || 'ARC-b'}
                    onChange={(e) => updateSora('initialARC', e.target.value)}
                    className="input"
                  >
                    {arcLevels.map(arc => (
                      <option key={arc.value} value={arc.value}>
                        {arc.label} - {arc.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>ARC Determination Guide:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    {arcLevels.map(arc => (
                      <li key={arc.value}>• <strong>{arc.label}:</strong> {arc.guidance}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* TMPR */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Tactical Mitigation (TMPR)
                </h3>
                
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={sora.tmpr?.enabled || false}
                    onChange={(e) => updateTmpr('enabled', e.target.checked)}
                    className="w-4 h-4 text-aeria-navy rounded"
                  />
                  <span className="text-sm text-gray-700">Apply tactical mitigations to reduce ARC</span>
                </label>

                {sora.tmpr?.enabled && (
                  <div className="space-y-4 pt-3 border-t border-gray-200">
                    <div>
                      <label className="label">Mitigation Type</label>
                      <select
                        value={sora.tmpr?.type || 'VLOS'}
                        onChange={(e) => updateTmpr('type', e.target.value)}
                        className="input"
                      >
                        {tmprDefinitions.map(tmpr => (
                          <option key={tmpr.id} value={tmpr.id}>
                            {tmpr.name} (up to -{tmpr.arcReduction} ARC)
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {tmprDefinitions.find(t => t.id === sora.tmpr?.type)?.description}
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Robustness Level</label>
                        <select
                          value={sora.tmpr?.robustness || 'none'}
                          onChange={(e) => updateTmpr('robustness', e.target.value)}
                          className="input"
                        >
                          {robustnessLevels.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">Evidence / Method</label>
                        <input
                          type="text"
                          value={sora.tmpr?.evidence || ''}
                          onChange={(e) => updateTmpr('evidence', e.target.value)}
                          className="input"
                          placeholder="How is this achieved?"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Residual ARC Display */}
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Residual ARC</span>
                    <div className="flex items-center gap-2">
                      {(sora.initialARC || 'ARC-b') !== residualARC && (
                        <span className="text-sm text-gray-400">{sora.initialARC || 'ARC-b'} →</span>
                      )}
                      <span className={`px-2 py-1 rounded text-sm font-medium ${arcLevels.find(a => a.value === residualARC)?.color}`}>
                        {residualARC}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Containment Section (Step 8) */}
      {flightPlanEnabled && (
        <div className="card">
          <button
            onClick={() => toggleSection('containment')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Box className="w-5 h-5 text-aeria-blue" />
              Containment Requirements
              <span className="text-sm font-normal text-gray-500">(Step 8)</span>
              {!containmentCompliant && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
                  Gap
                </span>
              )}
            </h2>
            {expandedSections.containment ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.containment && (
            <div className="mt-4 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Containment ensures the UA remains within the operational volume and that the 
                  adjacent area (ground risk buffer) is appropriately protected.
                </p>
              </div>

              {/* Adjacent Area Calculation */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Adjacent Area Assessment
                  </h3>
                  {/* NEW: Sync from Site Survey button */}
                  {siteSurveyEnabled && siteSurveyAdjacentPopulation && (
                    <button
                      onClick={syncFromSiteSurvey}
                      className="text-xs text-aeria-blue hover:text-aeria-navy flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Sync from Site Survey
                    </button>
                  )}
                </div>

                {/* NEW: Show Site Survey source indicator */}
                {sora.adjacentFromSiteSurvey && (
                  <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Adjacent area data imported from Site Survey
                    </p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">Adjacent Area Distance (3-min flight)</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-lg font-semibold text-gray-900">
                        {adjacentDistance.km} km ({adjacentDistance.nm} NM)
                      </p>
                      <p className="text-xs text-gray-500">
                        Based on max speed of {sora.maxSpeed || 25} m/s × 180 seconds
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="label">Adjacent Area Population</label>
                    <select
                      value={sora.adjacentAreaPopulation || 'sparsely'}
                      onChange={(e) => {
                        updateSora('adjacentAreaPopulation', e.target.value)
                        updateSora('adjacentFromSiteSurvey', false) // Mark as manually changed
                      }}
                      className="input"
                    >
                      {populationCategories.map(pop => (
                        <option key={pop.value} value={pop.value}>
                          {pop.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Population density of area within {adjacentDistance.km}km of operational boundary
                    </p>
                  </div>
                </div>

                {/* Required Containment */}
                <div className="p-3 bg-white rounded-lg border border-gray-200 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Required Containment Robustness</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      requiredContainment === 'high' ? 'bg-red-100 text-red-700' :
                      requiredContainment === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {requiredContainment.charAt(0).toUpperCase() + requiredContainment.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on adjacent area population ({sora.adjacentAreaPopulation}) and SAIL {sail}
                  </p>
                </div>

                {/* Containment Method */}
                <div className="space-y-4">
                  <div>
                    <label className="label">Containment Method</label>
                    <textarea
                      value={sora.containment?.method || ''}
                      onChange={(e) => updateContainment('method', e.target.value)}
                      className="input min-h-[80px]"
                      placeholder="Describe how containment is achieved (e.g., geofencing, operational boundaries, flight termination system)..."
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Achieved Robustness</label>
                      <select
                        value={sora.containment?.robustness || 'none'}
                        onChange={(e) => updateContainment('robustness', e.target.value)}
                        className="input"
                      >
                        {robustnessLevels.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Evidence</label>
                      <input
                        type="text"
                        value={sora.containment?.evidence || ''}
                        onChange={(e) => updateContainment('evidence', e.target.value)}
                        className="input"
                        placeholder="Supporting evidence..."
                      />
                    </div>
                  </div>

                  {/* Compliance Status */}
                  <div className={`p-3 rounded-lg border ${containmentCompliant ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center gap-2">
                      {containmentCompliant ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      )}
                      <span className={`text-sm font-medium ${containmentCompliant ? 'text-green-800' : 'text-amber-800'}`}>
                        {containmentCompliant ? 'Containment requirement met' : `Requires ${requiredContainment} robustness`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* OSO Compliance Section */}
      {flightPlanEnabled && (
        <div className="card">
          <button
            onClick={() => toggleSection('oso')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-aeria-blue" />
              Operational Safety Objectives
              <span className="text-sm font-normal text-gray-500">(Step 9)</span>
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${sailColors[sail]}`}>
                SAIL {sail}
              </span>
              {osoGapCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
                  {osoGapCount} gap{osoGapCount > 1 ? 's' : ''}
                </span>
              )}
            </h2>
            {expandedSections.oso ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.oso && (
            <div className="mt-4 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Based on SAIL {sail}, each OSO requires a specific robustness level.
                  <strong> O</strong> = Optional, <strong>L</strong> = Low, <strong>M</strong> = Medium, <strong>H</strong> = High
                </p>
              </div>

              {/* Group OSOs by category */}
              {Object.entries(osoCategories).map(([catKey, catInfo]) => {
                const categoryOsos = osoDefinitions.filter(o => o.category === catKey)
                if (categoryOsos.length === 0) return null

                const CategoryIcon = {
                  'competence': GraduationCap,
                  'design': Wrench,
                  'procedures': FileCheck,
                  'crew': Users,
                  'containment': Target,
                  'human_factors': Brain,
                  'external': Globe
                }[catKey] || FileCheck

                return (
                  <div key={catKey}>
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <CategoryIcon className="w-4 h-4" />
                      {catInfo.label}
                    </h3>
                    <div className="space-y-2">
                      {categoryOsos.map(oso => {
                        const required = oso.requirements[sail]
                        const osoData = sora.osoCompliance?.[oso.id] || {}
                        const compliance = checkOSOCompliance(oso, sail, osoData.robustness || 'none')

                        return (
                          <div 
                            key={oso.id} 
                            className={`p-3 rounded-lg border ${
                              !compliance.compliant ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-gray-900 text-sm">{oso.id}</span>
                                  <span className="text-sm text-gray-700">{oso.name}</span>
                                  <span className={`px-1.5 py-0.5 text-xs rounded ${
                                    required === 'O' ? 'bg-gray-100 text-gray-600' :
                                    required === 'L' ? 'bg-blue-100 text-blue-700' :
                                    required === 'M' ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    Req: {required}
                                  </span>
                                  {!compliance.compliant && (
                                    <span className="px-1.5 py-0.5 text-xs rounded bg-amber-200 text-amber-800">
                                      Gap
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{oso.description}</p>
                              </div>
                              <select
                                value={osoData.robustness || 'none'}
                                onChange={(e) => updateOso(oso.id, 'robustness', e.target.value)}
                                className="input text-xs py-1 w-24"
                              >
                                {robustnessLevels.map(r => (
                                  <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                              </select>
                            </div>
                            {(osoData.robustness && osoData.robustness !== 'none') && (
                              <input
                                type="text"
                                value={osoData.evidence || ''}
                                onChange={(e) => updateOso(oso.id, 'evidence', e.target.value)}
                                className="input text-sm mt-2"
                                placeholder="Evidence / means of compliance..."
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* HSE Hazard Assessment */}
      <div className="card">
        <button
          onClick={() => toggleSection('hazards')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-aeria-blue" />
            HSE Hazard Assessment
          </h2>
          {expandedSections.hazards ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.hazards && (
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Identify non-RPAS operational hazards following the HSE hazard assessment framework.
                This assessment is always required regardless of SORA.
              </p>
            </div>

            {(riskAssessment.hazards || []).length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500">No hazards identified yet.</p>
                <button
                  onClick={addHazard}
                  className="text-sm text-aeria-blue hover:underline mt-2"
                >
                  Add your first hazard
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {(riskAssessment.hazards || []).map((hazard, index) => {
                  const initialRisk = getRiskLevel(hazard.likelihood, hazard.severity)
                  const residualRisk = getRiskLevel(hazard.residualLikelihood, hazard.residualSeverity)
                  
                  return (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                            #{index + 1}
                          </span>
                          <select
                            value={hazard.category}
                            onChange={(e) => updateHazard(index, 'category', e.target.value)}
                            className="input text-sm w-40"
                          >
                            {hazardCategories.map(cat => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => removeHazard(index)}
                          className="p-1.5 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mb-3">
                        <label className="label text-xs">Hazard Description</label>
                        <textarea
                          value={hazard.description}
                          onChange={(e) => updateHazard(index, 'description', e.target.value)}
                          className="input text-sm min-h-[60px]"
                          placeholder="Describe the hazard..."
                        />
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="label text-xs">Likelihood (Initial)</label>
                          <select
                            value={hazard.likelihood}
                            onChange={(e) => updateHazard(index, 'likelihood', parseInt(e.target.value))}
                            className="input text-sm"
                          >
                            {likelihoodLevels.map(l => (
                              <option key={l.value} value={l.value}>{l.value} - {l.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label text-xs">Severity (Initial)</label>
                          <select
                            value={hazard.severity}
                            onChange={(e) => updateHazard(index, 'severity', parseInt(e.target.value))}
                            className="input text-sm"
                          >
                            {severityLevels.map(s => (
                              <option key={s.value} value={s.value}>{s.value} - {s.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label text-xs">Initial Risk</label>
                          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${initialRisk.color}`}>
                            {initialRisk.level} ({hazard.likelihood * hazard.severity})
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="label text-xs">Control Measures</label>
                        <textarea
                          value={hazard.controls}
                          onChange={(e) => updateHazard(index, 'controls', e.target.value)}
                          className="input text-sm min-h-[60px]"
                          placeholder="What controls will be implemented?"
                        />
                      </div>

                      <div className="grid sm:grid-cols-4 gap-3">
                        <div>
                          <label className="label text-xs">Residual Likelihood</label>
                          <select
                            value={hazard.residualLikelihood}
                            onChange={(e) => updateHazard(index, 'residualLikelihood', parseInt(e.target.value))}
                            className="input text-sm"
                          >
                            {likelihoodLevels.map(l => (
                              <option key={l.value} value={l.value}>{l.value} - {l.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label text-xs">Residual Severity</label>
                          <select
                            value={hazard.residualSeverity}
                            onChange={(e) => updateHazard(index, 'residualSeverity', parseInt(e.target.value))}
                            className="input text-sm"
                          >
                            {severityLevels.map(s => (
                              <option key={s.value} value={s.value}>{s.value} - {s.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label text-xs">Residual Risk</label>
                          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${residualRisk.color}`}>
                            {residualRisk.level} ({hazard.residualLikelihood * hazard.residualSeverity})
                          </div>
                        </div>
                        <div>
                          <label className="label text-xs">Responsible</label>
                          <input
                            type="text"
                            value={hazard.responsible}
                            onChange={(e) => updateHazard(index, 'responsible', e.target.value)}
                            className="input text-sm"
                            placeholder="Who"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <button
              onClick={addHazard}
              className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Hazard
            </button>
          </div>
        )}
      </div>

      {/* Risk Acceptance */}
      <div className="card">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-aeria-blue" />
          Risk Assessment Review
        </h3>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Reviewed By</label>
            <input
              type="text"
              value={riskAssessment.reviewedBy || ''}
              onChange={(e) => updateRiskAssessment({ reviewedBy: e.target.value })}
              className="input"
              placeholder="Name of reviewer"
            />
          </div>
          <div>
            <label className="label">Review Date</label>
            <input
              type="date"
              value={riskAssessment.reviewDate || ''}
              onChange={(e) => updateRiskAssessment({ reviewDate: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="label">Overall Risk Acceptable?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={riskAssessment.overallRiskAcceptable === true}
                onChange={() => updateRiskAssessment({ overallRiskAcceptable: true })}
                className="w-4 h-4 text-green-600"
              />
              <span className="text-sm text-gray-700">Yes - Risk is acceptable with controls</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={riskAssessment.overallRiskAcceptable === false}
                onChange={() => updateRiskAssessment({ overallRiskAcceptable: false })}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-sm text-gray-700">No - Additional mitigations required</span>
            </label>
          </div>
        </div>

        <div>
          <label className="label">Review Notes</label>
          <textarea
            value={riskAssessment.reviewNotes || ''}
            onChange={(e) => updateRiskAssessment({ reviewNotes: e.target.value })}
            className="input min-h-[80px]"
            placeholder="Notes from risk assessment review..."
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">SORA 2.5 Compliance</h3>
            <p className="text-sm text-blue-700 mt-1">
              This assessment follows JARUS SORA 2.5 methodology. The determined SAIL level ({sail}) 
              establishes the required robustness for each OSO. All gaps must be addressed before operations 
              can proceed. The assessment should be reviewed during the tailgate briefing with all crew.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// HELPER COMPONENTS
// ============================================

function MitigationCard({ mitigation, data, onUpdate, required = false }) {
  const isEnabled = data.enabled || required

  // Get available robustness levels for this mitigation
  const availableLevels = robustnessLevels.filter(r => {
    if (r.value === 'none') return true
    return mitigation.reductions[r.value] !== null
  })

  // Calculate reduction for current robustness
  const currentReduction = data.robustness && data.robustness !== 'none' 
    ? mitigation.reductions[data.robustness] 
    : 0

  return (
    <div className={`p-3 rounded-lg border ${isEnabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => onUpdate('enabled', e.target.checked)}
          disabled={required}
          className="w-4 h-4 text-aeria-navy rounded mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-gray-900">{mitigation.id}: {mitigation.name}</span>
            {currentReduction && currentReduction !== 0 && (
              <span className="text-xs text-green-600 font-medium">
                ({currentReduction > 0 ? '+' : ''}{currentReduction} GRC)
              </span>
            )}
            {required && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Required</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-2">{mitigation.description}</p>
          
          {mitigation.note && (
            <p className="text-xs text-amber-600 mb-2 italic">{mitigation.note}</p>
          )}
          
          {isEnabled && (
            <div className="grid sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
              <div>
                <label className="label text-xs">Robustness Level</label>
                <select
                  value={data.robustness || 'none'}
                  onChange={(e) => onUpdate('robustness', e.target.value)}
                  className="input text-sm"
                >
                  {availableLevels.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                      {r.value !== 'none' && mitigation.reductions[r.value] !== null && mitigation.reductions[r.value] !== 0 && 
                        ` (${mitigation.reductions[r.value] > 0 ? '+' : ''}${mitigation.reductions[r.value]} GRC)`
                      }
                    </option>
                  ))}
                </select>
                {data.robustness && data.robustness !== 'none' && mitigation.criteria[data.robustness] && (
                  <p className="text-xs text-gray-500 mt-1">
                    {mitigation.criteria[data.robustness]}
                  </p>
                )}
              </div>
              <div>
                <label className="label text-xs">Evidence / Justification</label>
                <input
                  type="text"
                  value={data.evidence || ''}
                  onChange={(e) => onUpdate('evidence', e.target.value)}
                  className="input text-sm"
                  placeholder="How is this mitigation achieved?"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
