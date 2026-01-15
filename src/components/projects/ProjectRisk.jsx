import { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Plus,
  Trash2,
  Shield,
  Plane,
  Users,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Target,
  Radar,
  FileCheck,
  Wrench,
  GraduationCap,
  Settings,
  Eye
} from 'lucide-react'

// ============================================
// SORA 2.5 CONFIGURATION DATA
// ============================================

// Intrinsic Ground Risk Class (Table 1 from SORA 2.5)
const intrinsicGRC = {
  'VLOS_controlled': 1,
  'VLOS_sparsely': 2,
  'VLOS_populated': 3,
  'VLOS_gathering': 4,
  'BVLOS_sparsely': 3,
  'BVLOS_populated': 4,
  'BVLOS_gathering': 5
}

// Characteristic dimension categories
const maxDimensions = [
  { value: '1m', label: '≤1m', modifier: 0 },
  { value: '3m', label: '1m to 3m', modifier: 1 },
  { value: '8m', label: '3m to 8m', modifier: 2 },
  { value: '8m+', label: '>8m', modifier: 3 }
]

// Kinetic energy categories  
const kineticEnergy = [
  { value: 'low', label: '<700J (approx <2kg)', modifier: 0 },
  { value: 'medium', label: '700J - 34kJ', modifier: 1 },
  { value: 'high', label: '34kJ - 1084kJ', modifier: 2 },
  { value: 'very_high', label: '>1084kJ', modifier: 3 }
]

// Robustness levels
const robustnessLevels = [
  { value: 'none', label: 'None', color: 'bg-gray-100 text-gray-600' },
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  { value: 'high', label: 'High', color: 'bg-green-100 text-green-700' }
]

// Ground Mitigations with robustness
const groundMitigations = [
  { 
    id: 'M1', 
    name: 'Strategic Mitigations for Ground Risk',
    description: 'Reducing number of people at risk through operational restrictions',
    reductionLow: 0,
    reductionMedium: 1,
    reductionHigh: 2,
    criteria: {
      low: 'Basic operational limitations documented',
      medium: 'Verified operational limitations with defined boundaries',
      high: 'Comprehensive restrictions with active monitoring/enforcement'
    }
  },
  { 
    id: 'M2', 
    name: 'Effects of Ground Impact Reduced',
    description: 'Technical mitigations to reduce harm (parachute, frangible design, low energy)',
    reductionLow: 0,
    reductionMedium: 1,
    reductionHigh: 2,
    criteria: {
      low: 'Basic energy attenuation claimed',
      medium: 'Tested energy attenuation system',
      high: 'Certified/proven energy attenuation with redundancy'
    }
  },
  { 
    id: 'M3', 
    name: 'Emergency Response Plan',
    description: 'ERP in place - required but does not reduce GRC',
    reductionLow: 0,
    reductionMedium: 0,
    reductionHigh: 0,
    criteria: {
      low: 'Basic ERP documented',
      medium: 'ERP with defined response times and resources',
      high: 'Comprehensive ERP with training, drills, and coordination'
    }
  }
]

// Air Risk Class levels
const arcLevels = [
  { value: 'ARC-a', label: 'ARC-a', description: 'Atypical airspace - very low encounter rate', color: 'bg-green-100 text-green-800' },
  { value: 'ARC-b', label: 'ARC-b', description: 'Low encounter rate (rural, Class G)', color: 'bg-blue-100 text-blue-800' },
  { value: 'ARC-c', label: 'ARC-c', description: 'Medium encounter rate (suburban, near aerodromes)', color: 'bg-amber-100 text-amber-800' },
  { value: 'ARC-d', label: 'ARC-d', description: 'High encounter rate (urban, busy airspace)', color: 'bg-red-100 text-red-800' }
]

// Tactical Mitigation Performance Requirements
const tmprDefinitions = [
  {
    id: 'TMPR-A',
    name: 'Remain Clear',
    arcReduction: 1,
    description: 'Ability to remain clear of other airspace users',
    requirements: {
      low: 'Visual observation and manual avoidance',
      medium: 'Enhanced situational awareness (ADS-B In, FLARM)',
      high: 'Automated detect and avoid capability'
    }
  },
  {
    id: 'TMPR-B', 
    name: 'Detect and Avoid',
    arcReduction: 2,
    description: 'Full DAA capability to detect, track, and avoid conflicts',
    requirements: {
      low: 'N/A - DAA requires medium or high',
      medium: 'Cooperative DAA (ADS-B, transponder interrogation)',
      high: 'Non-cooperative DAA (radar, optical sensors)'
    }
  }
]

// SAIL determination matrix (Final GRC vs Residual ARC)
const sailMatrix = {
  1: { 'ARC-a': 'I', 'ARC-b': 'I', 'ARC-c': 'II', 'ARC-d': 'IV' },
  2: { 'ARC-a': 'I', 'ARC-b': 'II', 'ARC-c': 'II', 'ARC-d': 'IV' },
  3: { 'ARC-a': 'II', 'ARC-b': 'II', 'ARC-c': 'IV', 'ARC-d': 'VI' },
  4: { 'ARC-a': 'II', 'ARC-b': 'IV', 'ARC-c': 'IV', 'ARC-d': 'VI' },
  5: { 'ARC-a': 'IV', 'ARC-b': 'IV', 'ARC-c': 'VI', 'ARC-d': 'VI' },
  6: { 'ARC-a': 'IV', 'ARC-b': 'VI', 'ARC-c': 'VI', 'ARC-d': 'VI' },
  7: { 'ARC-a': 'VI', 'ARC-b': 'VI', 'ARC-c': 'VI', 'ARC-d': 'VI' }
}

const sailColors = {
  'I': 'bg-green-100 text-green-800 border-green-300',
  'II': 'bg-blue-100 text-blue-800 border-blue-300',
  'IV': 'bg-amber-100 text-amber-800 border-amber-300',
  'VI': 'bg-red-100 text-red-800 border-red-300'
}

// ============================================
// OSO DEFINITIONS (SORA 2.5 Annex E)
// ============================================
// Requirements: O = Optional, L = Low, M = Medium, H = High
const osoDefinitions = [
  {
    id: 'OSO#01',
    category: 'technical',
    name: 'Ensure operator competence',
    description: 'The operator must demonstrate competency appropriate for the operation',
    requirements: { I: 'O', II: 'L', IV: 'M', VI: 'H' }
  },
  {
    id: 'OSO#02',
    category: 'technical',
    name: 'UAS manufactured by competent entity',
    description: 'UAS should be manufactured by an entity with appropriate competencies',
    requirements: { I: 'O', II: 'O', IV: 'L', VI: 'M' }
  },
  {
    id: 'OSO#03',
    category: 'technical',
    name: 'UAS maintained by competent entity',
    description: 'UAS maintenance performed by competent personnel',
    requirements: { I: 'L', II: 'L', IV: 'M', VI: 'H' }
  },
  {
    id: 'OSO#04',
    category: 'technical',
    name: 'UAS developed to design standards',
    description: 'UAS developed according to recognized design standards',
    requirements: { I: 'O', II: 'O', IV: 'L', VI: 'M' }
  },
  {
    id: 'OSO#05',
    category: 'technical',
    name: 'UAS designed considering system safety',
    description: 'System safety and reliability considered in UAS design',
    requirements: { I: 'O', II: 'L', IV: 'M', VI: 'H' }
  },
  {
    id: 'OSO#06',
    category: 'technical',
    name: 'C3 link performance appropriate',
    description: 'Command, control, and communication link meets operational needs',
    requirements: { I: 'O', II: 'L', IV: 'M', VI: 'H' }
  },
  {
    id: 'OSO#07',
    category: 'operational',
    name: 'Inspection of UAS',
    description: 'Pre-flight and periodic inspections to ensure safe condition',
    requirements: { I: 'L', II: 'L', IV: 'M', VI: 'H' }
  },
  {
    id: 'OSO#08',
    category: 'operational',
    name: 'Operational procedures defined',
    description: 'Procedures are defined, validated, and adhered to',
    requirements: { I: 'L', II: 'M', IV: 'H', VI: 'H' }
  },
  {
    id: 'OSO#09',
    category: 'operational',
    name: 'Remote crew trained and current',
    description: 'Flight crew have appropriate training and maintain currency',
    requirements: { I: 'L', II: 'L', IV: 'M', VI: 'H' }
  },
  {
    id: 'OSO#10',
    category: 'technical',
    name: 'Safe recovery from technical issue',
    description: 'UAS can safely recover from foreseeable technical failures',
    requirements: { I: 'O', II: 'L', IV: 'M', VI: 'H' }
  },
  {
    id: 'OSO#11',
    category: 'operational',
    name: 'Procedures for adverse conditions',
    description: 'Procedures exist for handling adverse operating conditions',
    requirements: { I: 'L', II: 'L', IV: 'M', VI: 'H' }
  },
  {
    id: 'OSO#12',
    category: 'technical',
    name: 'UAS designed for adverse conditions',
    description: 'UAS designed and qualified to cope with adverse conditions',
    requirements: { I: 'O', II: 'O', IV: 'L', VI: 'M' }
  },
  {
    id: 'OSO#13',
    category: 'technical',
    name: 'External services reliable',
    description: 'External services supporting UAS operation are reliable',
    requirements: { I: 'O', II: 'L', IV: 'L', VI: 'M' }
  },
  {
    id: 'OSO#14',
    category: 'operational',
    name: 'Operational volume protection',
    description: 'Procedures to define and protect operational volume',
    requirements: { I: 'O', II: 'L', IV: 'M', VI: 'H' }
  },
  {
    id: 'OSO#15',
    category: 'operational',
    name: 'Ground risk buffer definition',
    description: 'Adjacent area/ground risk buffer appropriately defined',
    requirements: { I: 'O', II: 'L', IV: 'M', VI: 'H' }
  },
  {
    id: 'OSO#16',
    category: 'operational',
    name: 'Multi-crew coordination',
    description: 'Effective coordination between multiple crew members',
    requirements: { I: 'L', II: 'L', IV: 'M', VI: 'H' }
  },
  {
    id: 'OSO#17',
    category: 'operational',
    name: 'Remote crew fit to operate',
    description: 'Fitness requirements for remote crew members',
    requirements: { I: 'L', II: 'L', IV: 'M', VI: 'H' }
  },
  {
    id: 'OSO#18',
    category: 'technical',
    name: 'Automatic flight envelope protection',
    description: 'Automated systems to protect against exceeding flight envelope',
    requirements: { I: 'O', II: 'O', IV: 'L', VI: 'M' }
  },
  {
    id: 'OSO#19',
    category: 'operational',
    name: 'Safe recovery from human error',
    description: 'Procedures/design to recover from remote crew errors',
    requirements: { I: 'L', II: 'L', IV: 'M', VI: 'H' }
  },
  {
    id: 'OSO#20',
    category: 'technical',
    name: 'Redundant flight envelope protection',
    description: 'Redundant/autonomous flight envelope protection',
    requirements: { I: 'O', II: 'O', IV: 'L', VI: 'M' }
  },
  {
    id: 'OSO#21',
    category: 'technical',
    name: 'Flight termination capability',
    description: 'Method to retrieve or terminate flight in emergency',
    requirements: { I: 'L', II: 'L', IV: 'M', VI: 'H' }
  },
  {
    id: 'OSO#22',
    category: 'operational',
    name: 'Safe environmental conditions',
    description: 'Operations conducted in safe environmental conditions',
    requirements: { I: 'L', II: 'L', IV: 'M', VI: 'H' }
  },
  {
    id: 'OSO#23',
    category: 'operational',
    name: 'Environmental conditions defined',
    description: 'Environmental conditions for safe operations are defined',
    requirements: { I: 'L', II: 'L', IV: 'L', VI: 'M' }
  },
  {
    id: 'OSO#24',
    category: 'technical',
    name: 'UAS qualified for environment',
    description: 'UAS designed and qualified for operating environment',
    requirements: { I: 'O', II: 'O', IV: 'L', VI: 'M' }
  }
]

// ============================================
// HSE HAZARD ASSESSMENT
// ============================================
const hazardCategories = [
  { value: 'physical', label: 'Physical', examples: 'Terrain, weather, obstacles, traffic' },
  { value: 'chemical', label: 'Chemical', examples: 'Fuel, batteries, industrial chemicals' },
  { value: 'biological', label: 'Biological', examples: 'Wildlife, insects, vegetation' },
  { value: 'ergonomic', label: 'Ergonomic', examples: 'Repetitive motion, fatigue, workstation' },
  { value: 'psychological', label: 'Psychological', examples: 'Stress, time pressure, distractions' },
  { value: 'environmental', label: 'Environmental', examples: 'Heat, cold, UV, noise' }
]

const likelihoodLevels = [
  { value: 1, label: 'Rare', description: 'Highly unlikely to occur' },
  { value: 2, label: 'Unlikely', description: 'Could occur but not expected' },
  { value: 3, label: 'Possible', description: 'Might occur occasionally' },
  { value: 4, label: 'Likely', description: 'Will probably occur' },
  { value: 5, label: 'Almost Certain', description: 'Expected to occur' }
]

const severityLevels = [
  { value: 1, label: 'Negligible', description: 'No injury, minor equipment damage' },
  { value: 2, label: 'Minor', description: 'First aid injury, minor property damage' },
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
// MAIN COMPONENT
// ============================================
export default function ProjectRisk({ project, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({
    groundRisk: true,
    airRisk: true,
    oso: false,
    hazards: true
  })

  const flightPlanEnabled = project.sections?.flightPlan

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

      onUpdate({
        riskAssessment: {
          sora: {
            enabled: flightPlanEnabled,
            operationType: project.flightPlan?.operationType || 'VLOS',
            groundType: project.flightPlan?.groundType || 'sparsely_populated',
            maxDimension: '1m',
            kineticEnergy: 'low',
            overPeople: false,
            mitigations: {
              M1: { enabled: false, robustness: 'none', evidence: '' },
              M2: { enabled: false, robustness: 'none', evidence: '' },
              M3: { enabled: true, robustness: 'low', evidence: '' }
            },
            initialARC: 'ARC-a',
            tmpr: {
              enabled: false,
              type: 'TMPR-A',
              robustness: 'none',
              evidence: ''
            },
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
  }, [project.riskAssessment])

  const riskAssessment = project.riskAssessment || { sora: {}, hazards: [] }
  const sora = riskAssessment.sora || {}

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
  // CALCULATIONS
  // ============================================
  
  // Calculate intrinsic GRC
  const calculateIntrinsicGRC = () => {
    const opType = sora.operationType || 'VLOS'
    const groundType = sora.groundType || 'sparsely_populated'
    
    let key = ''
    if (opType === 'VLOS' || opType === 'EVLOS') {
      if (groundType === 'controlled_ground') key = 'VLOS_controlled'
      else if (groundType === 'sparsely_populated') key = 'VLOS_sparsely'
      else if (groundType === 'populated') key = 'VLOS_populated'
      else key = 'VLOS_gathering'
    } else {
      if (groundType === 'sparsely_populated' || groundType === 'controlled_ground') key = 'BVLOS_sparsely'
      else if (groundType === 'populated') key = 'BVLOS_populated'
      else key = 'BVLOS_gathering'
    }
    
    return intrinsicGRC[key] || 2
  }

  // Calculate final GRC with mitigations
  const calculateFinalGRC = () => {
    let grc = calculateIntrinsicGRC()
    
    // Add for size/energy adjustments (simplified - max +2)
    const dimMod = maxDimensions.find(d => d.value === sora.maxDimension)?.modifier || 0
    const energyMod = kineticEnergy.find(k => k.value === sora.kineticEnergy)?.modifier || 0
    // Use higher of the two modifiers
    grc += Math.max(dimMod, energyMod)
    
    // Over people adds 1
    if (sora.overPeople) grc += 1
    
    // Apply mitigations
    const mits = sora.mitigations || {}
    
    if (mits.M1?.enabled) {
      const m1 = groundMitigations.find(m => m.id === 'M1')
      if (mits.M1.robustness === 'medium') grc -= m1.reductionMedium
      else if (mits.M1.robustness === 'high') grc -= m1.reductionHigh
    }
    
    if (mits.M2?.enabled) {
      const m2 = groundMitigations.find(m => m.id === 'M2')
      if (mits.M2.robustness === 'medium') grc -= m2.reductionMedium
      else if (mits.M2.robustness === 'high') grc -= m2.reductionHigh
    }
    
    // Clamp to valid range
    return Math.max(1, Math.min(7, grc))
  }

  // Calculate residual ARC (after TMPR)
  const calculateResidualARC = () => {
    const arcOrder = ['ARC-a', 'ARC-b', 'ARC-c', 'ARC-d']
    const initialIndex = arcOrder.indexOf(sora.initialARC || 'ARC-a')
    
    if (!sora.tmpr?.enabled || sora.tmpr.robustness === 'none') {
      return sora.initialARC || 'ARC-a'
    }
    
    const tmprDef = tmprDefinitions.find(t => t.id === sora.tmpr.type)
    const reduction = tmprDef?.arcReduction || 0
    
    // Only reduce if robustness is medium or high
    let effectiveReduction = 0
    if (sora.tmpr.robustness === 'medium') effectiveReduction = Math.min(reduction, 1)
    else if (sora.tmpr.robustness === 'high') effectiveReduction = reduction
    
    const newIndex = Math.max(0, initialIndex - effectiveReduction)
    return arcOrder[newIndex]
  }

  // Calculate SAIL
  const calculateSAIL = () => {
    const grc = calculateFinalGRC()
    const arc = calculateResidualARC()
    return sailMatrix[grc]?.[arc] || 'II'
  }

  const intrinsicGRCValue = calculateIntrinsicGRC()
  const finalGRC = calculateFinalGRC()
  const residualARC = calculateResidualARC()
  const sail = calculateSAIL()

  // Get OSO requirement level for current SAIL
  const getOsoRequirement = (oso) => {
    return oso.requirements[sail] || 'O'
  }

  // Check if OSO compliance is sufficient
  const checkOsoCompliance = (oso) => {
    const required = getOsoRequirement(oso)
    const actual = sora.osoCompliance?.[oso.id]?.robustness || 'none'
    
    if (required === 'O') return { status: 'ok', message: 'Optional' }
    
    const levels = ['none', 'low', 'medium', 'high']
    const requiredIndex = levels.indexOf(required.toLowerCase())
    const actualIndex = levels.indexOf(actual)
    
    if (actualIndex >= requiredIndex) return { status: 'ok', message: 'Compliant' }
    return { status: 'gap', message: `Requires ${required} robustness` }
  }

  // ============================================
  // HAZARDS MANAGEMENT
  // ============================================
  const addHazard = () => {
    updateRiskAssessment({
      hazards: [...(riskAssessment.hazards || []), {
        category: 'physical',
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

  // Count OSO compliance gaps
  const osoGapCount = osoDefinitions.filter(oso => {
    const req = getOsoRequirement(oso)
    if (req === 'O') return false
    return checkOsoCompliance(oso).status === 'gap'
  }).length

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* SORA Summary Header */}
      {flightPlanEnabled && (
        <div className="card bg-gradient-to-r from-aeria-sky to-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SORA 2.5 Assessment Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Intrinsic GRC</p>
              <p className="text-2xl font-bold text-gray-400">{intrinsicGRCValue}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Final GRC</p>
              <p className="text-2xl font-bold text-gray-900">{finalGRC}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Residual ARC</p>
              <p className="text-2xl font-bold text-gray-900">{residualARC}</p>
            </div>
            <div className={`text-center p-3 rounded-lg shadow-sm ${sailColors[sail]}`}>
              <p className="text-xs opacity-75 mb-1">SAIL</p>
              <p className="text-2xl font-bold">{sail}</p>
            </div>
          </div>
          {osoGapCount > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-amber-800">
                {osoGapCount} OSO compliance gap{osoGapCount > 1 ? 's' : ''} identified - review OSO section
              </span>
            </div>
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
            </h2>
            {expandedSections.groundRisk ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.groundRisk && (
            <div className="mt-4 space-y-6">
              {/* Operational Parameters */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Operational Parameters</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="label">Operation Type</label>
                    <select
                      value={sora.operationType || 'VLOS'}
                      onChange={(e) => updateSora('operationType', e.target.value)}
                      className="input"
                    >
                      <option value="VLOS">VLOS</option>
                      <option value="EVLOS">EVLOS</option>
                      <option value="BVLOS">BVLOS</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Ground Area Type</label>
                    <select
                      value={sora.groundType || 'sparsely_populated'}
                      onChange={(e) => updateSora('groundType', e.target.value)}
                      className="input"
                    >
                      <option value="controlled_ground">Controlled Ground Area</option>
                      <option value="sparsely_populated">Sparsely Populated</option>
                      <option value="populated">Populated</option>
                      <option value="gathering">Gathering of People</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Max Characteristic Dimension</label>
                    <select
                      value={sora.maxDimension || '1m'}
                      onChange={(e) => updateSora('maxDimension', e.target.value)}
                      className="input"
                    >
                      {maxDimensions.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Typical Kinetic Energy</label>
                    <select
                      value={sora.kineticEnergy || 'low'}
                      onChange={(e) => updateSora('kineticEnergy', e.target.value)}
                      className="input"
                    >
                      {kineticEnergy.map(k => (
                        <option key={k.value} value={k.value}>{k.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sora.overPeople || false}
                      onChange={(e) => updateSora('overPeople', e.target.checked)}
                      className="w-4 h-4 text-aeria-navy rounded"
                    />
                    <span className="text-sm text-gray-700">Operations over uninvolved persons (+1 GRC)</span>
                  </label>
                </div>
              </div>

              {/* Ground Mitigations */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Ground Risk Mitigations
                </h3>
                <div className="space-y-4">
                  {groundMitigations.map((mit) => {
                    const mitData = sora.mitigations?.[mit.id] || {}
                    return (
                      <div key={mit.id} className="p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={mitData.enabled || false}
                            onChange={(e) => updateMitigation(mit.id, 'enabled', e.target.checked)}
                            className="w-4 h-4 text-aeria-navy rounded mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{mit.id}: {mit.name}</span>
                              {mit.reductionHigh > 0 && (
                                <span className="text-xs text-green-600">
                                  (up to -{mit.reductionHigh} GRC)
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{mit.description}</p>
                            
                            {mitData.enabled && (
                              <div className="grid sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
                                <div>
                                  <label className="label text-xs">Robustness Level</label>
                                  <select
                                    value={mitData.robustness || 'none'}
                                    onChange={(e) => updateMitigation(mit.id, 'robustness', e.target.value)}
                                    className="input text-sm"
                                  >
                                    {robustnessLevels.map(r => (
                                      <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                  </select>
                                  {mitData.robustness && mitData.robustness !== 'none' && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {mit.criteria[mitData.robustness]}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <label className="label text-xs">Evidence / Justification</label>
                                  <input
                                    type="text"
                                    value={mitData.evidence || ''}
                                    onChange={(e) => updateMitigation(mit.id, 'evidence', e.target.value)}
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
                  })}
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
            </h2>
            {expandedSections.airRisk ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.airRisk && (
            <div className="mt-4 space-y-6">
              {/* Initial ARC */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Initial Air Risk Classification</h3>
                <div>
                  <label className="label">Initial ARC (before mitigations)</label>
                  <select
                    value={sora.initialARC || 'ARC-a'}
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
                    <strong>ARC Determination Guide:</strong><br />
                    • ARC-a: Controlled ground, very remote, segregated airspace<br />
                    • ARC-b: Class G uncontrolled, rural areas, low traffic<br />
                    • ARC-c: Near aerodromes, suburban, moderate traffic<br />
                    • ARC-d: Controlled airspace, urban, high traffic density
                  </p>
                </div>
              </div>

              {/* TMPR */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Tactical Mitigation Performance Requirements (TMPR)
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
                    {tmprDefinitions.map(tmpr => (
                      <div key={tmpr.id} className="p-3 bg-white rounded-lg border border-gray-200">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="tmpr_type"
                            checked={sora.tmpr.type === tmpr.id}
                            onChange={() => updateTmpr('type', tmpr.id)}
                            className="w-4 h-4 text-aeria-navy mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{tmpr.id}: {tmpr.name}</span>
                              <span className="text-xs text-green-600">(up to -{tmpr.arcReduction} ARC levels)</span>
                            </div>
                            <p className="text-sm text-gray-500">{tmpr.description}</p>
                          </div>
                        </label>
                        
                        {sora.tmpr.type === tmpr.id && (
                          <div className="grid sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100 ml-7">
                            <div>
                              <label className="label text-xs">Robustness Level</label>
                              <select
                                value={sora.tmpr.robustness || 'none'}
                                onChange={(e) => updateTmpr('robustness', e.target.value)}
                                className="input text-sm"
                              >
                                {robustnessLevels.map(r => (
                                  <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                              </select>
                              {sora.tmpr.robustness && sora.tmpr.robustness !== 'none' && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {tmpr.requirements[sora.tmpr.robustness]}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="label text-xs">Evidence / Capability</label>
                              <input
                                type="text"
                                value={sora.tmpr.evidence || ''}
                                onChange={(e) => updateTmpr('evidence', e.target.value)}
                                className="input text-sm"
                                placeholder="Equipment, procedures, training..."
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {sora.initialARC !== residualARC && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>ARC Reduction Applied:</strong> {sora.initialARC} → {residualARC}
                    </p>
                  </div>
                )}
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
              Operational Safety Objectives (OSOs)
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
                  Based on SAIL {sail}, the following OSO robustness levels are required. 
                  <strong> O</strong> = Optional, <strong>L</strong> = Low, <strong>M</strong> = Medium, <strong>H</strong> = High
                </p>
              </div>

              {/* Technical OSOs */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Technical OSOs
                </h3>
                <div className="space-y-2">
                  {osoDefinitions.filter(o => o.category === 'technical').map(oso => {
                    const required = getOsoRequirement(oso)
                    const compliance = checkOsoCompliance(oso)
                    const osoData = sora.osoCompliance?.[oso.id] || {}
                    
                    return (
                      <div 
                        key={oso.id} 
                        className={`p-3 rounded-lg border ${
                          compliance.status === 'gap' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
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
                              {compliance.status === 'gap' && (
                                <span className="px-1.5 py-0.5 text-xs rounded bg-amber-200 text-amber-800">
                                  Gap
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{oso.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
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

              {/* Operational OSOs */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Operational OSOs
                </h3>
                <div className="space-y-2">
                  {osoDefinitions.filter(o => o.category === 'operational').map(oso => {
                    const required = getOsoRequirement(oso)
                    const compliance = checkOsoCompliance(oso)
                    const osoData = sora.osoCompliance?.[oso.id] || {}
                    
                    return (
                      <div 
                        key={oso.id} 
                        className={`p-3 rounded-lg border ${
                          compliance.status === 'gap' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
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
                              {compliance.status === 'gap' && (
                                <span className="px-1.5 py-0.5 text-xs rounded bg-amber-200 text-amber-800">
                                  Gap
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{oso.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
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
                            className="input text-sm w-36"
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
                          placeholder="What controls will be implemented to reduce this risk?"
                        />
                      </div>

                      <div className="grid sm:grid-cols-4 gap-3">
                        <div>
                          <label className="label text-xs">Likelihood (Residual)</label>
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
                          <label className="label text-xs">Severity (Residual)</label>
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
