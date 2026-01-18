// ============================================
// COR AUDIT REPORT GENERATOR - COMPREHENSIVE VERSION
// Health, Safety & Environment Program Report
// For Certificate of Recognition Audit Preparation
// 
// Accurately reflects Aeria Solutions' complete safety program:
// - 32 HSE Policies (HSE1022-HSE1053)
// - 12 RPAS Operations Policies (RPAS1001-RPAS1012)
// - 9 CRM Policies (CRM1013-CRM1021)
// - 4 Detailed Procedures Documents
// 
// @location src/lib/corReportGenerator.js
// @action REPLACE
// ============================================

import { BrandedPDF } from './pdfExportService'

// COR Audit Elements (aligned with provincial standards)
export const COR_ELEMENTS = {
  management: {
    id: 'management',
    name: 'Management Leadership & Commitment',
    description: 'Policies, responsibilities, and resource allocation',
    weight: 10,
    aeriaEvidence: ['HSE1022', 'HSE1023', 'HSE1024', 'HSE1025', 'HSE1027', 'HSE1032', 'HSE1034', 'HSE1045', 'RPAS1002', 'CRM1020']
  },
  hazard_assessment: {
    id: 'hazard_assessment',
    name: 'Hazard Assessment & Control',
    description: 'Formal and field-level hazard identification',
    weight: 15,
    aeriaEvidence: ['HSE1047', 'HSE1048', 'RPAS1011', 'CRM1013']
  },
  safe_work: {
    id: 'safe_work',
    name: 'Safe Work Practices & Procedures',
    description: 'Documented procedures and job safety analyses',
    weight: 10,
    aeriaEvidence: ['HSE1028', 'HSE1029', 'HSE1033', 'HSE1039', 'HSE1040', 'HSE1041', 'RPAS1004', 'RPAS1005', 'RPAS1007', 'RPAS1008', 'RPAS1009', 'CRM1014', 'CRM1015', 'CRM1016', 'CRM1017', 'CRM1018', 'CRM1019', 'CRM1021']
  },
  training: {
    id: 'training',
    name: 'Training & Competency',
    description: 'Worker training, orientation, and certification',
    weight: 15,
    aeriaEvidence: ['HSE1026', 'RPAS1001']
  },
  inspections: {
    id: 'inspections',
    name: 'Inspections',
    description: 'Workplace and equipment inspections',
    weight: 10,
    aeriaEvidence: ['HSE1049', 'HSE1050', 'RPAS1003', 'RPAS1012']
  },
  investigations: {
    id: 'investigations',
    name: 'Incident Investigation & Reporting',
    description: 'Incident reports, root cause analysis, and CAPAs',
    weight: 15,
    aeriaEvidence: ['HSE1052', 'RPAS1010']
  },
  emergency: {
    id: 'emergency',
    name: 'Emergency Preparedness',
    description: 'Emergency response plans, drills, and resources',
    weight: 10,
    aeriaEvidence: ['HSE1051', 'RPAS1006']
  },
  records: {
    id: 'records',
    name: 'Records & Statistics',
    description: 'KPIs, trend analysis, and documentation',
    weight: 10,
    aeriaEvidence: ['HSE1053']
  },
  program_admin: {
    id: 'program_admin',
    name: 'Program Administration',
    description: 'Document control, reviews, and continuous improvement',
    weight: 5,
    aeriaEvidence: ['HSE1036', 'HSE1038', 'HSE1042', 'HSE1046', 'HSE1053']
  }
}

// Complete Program Structure
export const PROGRAM_STRUCTURE = {
  hse: {
    name: 'Health, Safety & Environment (HSE)',
    totalPolicies: 32,
    policies: [
      { code: 'HSE1022', name: 'Health & Safety Pledge' },
      { code: 'HSE1023', name: 'Commitment Statement' },
      { code: 'HSE1024', name: 'Workers Rights' },
      { code: 'HSE1025', name: 'Safety Management System' },
      { code: 'HSE1026', name: 'Certifications & Qualifications' },
      { code: 'HSE1027', name: 'Health & Safety Policy' },
      { code: 'HSE1028', name: 'Personal Protective Equipment' },
      { code: 'HSE1029', name: 'Vehicle Safety' },
      { code: 'HSE1030', name: 'COVID-19 Policy' },
      { code: 'HSE1031', name: 'Pandemic Disease Policy' },
      { code: 'HSE1032', name: 'Open Communication' },
      { code: 'HSE1033', name: 'Drug & Alcohol Policy' },
      { code: 'HSE1034', name: 'Refuse Unsafe Work' },
      { code: 'HSE1035', name: 'Harassment & Violence' },
      { code: 'HSE1036', name: 'Environmental Policy' },
      { code: 'HSE1037', name: 'Security Policy' },
      { code: 'HSE1038', name: 'Waste Disposal' },
      { code: 'HSE1039', name: 'Fatigue Management' },
      { code: 'HSE1040', name: 'Company Rules' },
      { code: 'HSE1041', name: 'General Safety Rules' },
      { code: 'HSE1042', name: 'Grounds for Dismissal' },
      { code: 'HSE1043', name: 'Public & Visitors Policy' },
      { code: 'HSE1044', name: 'Contractors Policy' },
      { code: 'HSE1045', name: 'Employer Duties' },
      { code: 'HSE1046', name: 'Part 13 Code Requirements' },
      { code: 'HSE1047', name: 'Hazard Assessment Policy' },
      { code: 'HSE1048', name: 'Hazard Control Policy' },
      { code: 'HSE1049', name: 'Inspection Policy' },
      { code: 'HSE1050', name: 'Preventative Maintenance' },
      { code: 'HSE1051', name: 'Emergency Response Policy' },
      { code: 'HSE1052', name: 'Investigations Policy' },
      { code: 'HSE1053', name: 'Systems Overview & Audit' }
    ]
  },
  rpas: {
    name: 'RPAS Operations',
    totalPolicies: 12,
    transportCanadaCode: '930355',
    policies: [
      { code: 'RPAS1001', name: 'Team Competencies' },
      { code: 'RPAS1002', name: 'Roles & Responsibilities' },
      { code: 'RPAS1003', name: 'Airworthiness & Maintenance' },
      { code: 'RPAS1004', name: 'Personal Protective Equipment' },
      { code: 'RPAS1005', name: 'General Procedures' },
      { code: 'RPAS1006', name: 'Emergency Procedures' },
      { code: 'RPAS1007', name: 'Communication Protocol' },
      { code: 'RPAS1008', name: 'Detect, Avoid & Separate' },
      { code: 'RPAS1009', name: 'Minimum Weather Requirements' },
      { code: 'RPAS1010', name: 'Incident & Accident Reporting' },
      { code: 'RPAS1011', name: 'Site Survey & Flight Plan' },
      { code: 'RPAS1012', name: 'Equipment Testing' }
    ],
    procedures: [
      { id: 'RPAS-GP-001', name: 'RPAS General Procedures', version: 'V25_01' },
      { id: 'RPAS-EP-001', name: 'RPAS Emergency Procedures', version: 'V25_01' },
      { id: 'RPAS-AP-001', name: 'RPAS Advanced Procedures', version: 'V25_01' },
      { id: 'RPAS-SS-001', name: 'Site Survey & Flight Plan Procedure', version: 'V25_01' }
    ]
  },
  crm: {
    name: 'Crew Resource Management (CRM)',
    totalPolicies: 9,
    policies: [
      { code: 'CRM1013', name: 'Threat & Error Management' },
      { code: 'CRM1014', name: 'Communication' },
      { code: 'CRM1015', name: 'Situational Awareness' },
      { code: 'CRM1016', name: 'Pressure & Stress Management' },
      { code: 'CRM1017', name: 'Fatigue Management' },
      { code: 'CRM1018', name: 'Workload Management' },
      { code: 'CRM1019', name: 'Decision Making Process' },
      { code: 'CRM1020', name: 'Leadership & Team Building' },
      { code: 'CRM1021', name: 'Automation & Technology Management' }
    ]
  }
}

// Calculate KPIs from data
export function calculateSafetyKPIs(data) {
  const { incidents = [], capas = [], forms = [], operators = [], projects = [], aircraft = [] } = data
  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)
  
  // Filter YTD data
  const ytdIncidents = incidents.filter(i => {
    const date = i.dateOccurred?.toDate ? i.dateOccurred.toDate() : new Date(i.dateOccurred)
    return date >= yearStart
  })
  
  const recordableIncidents = ytdIncidents.filter(i => i.type !== 'near_miss' && i.type !== 'observation')
  const nearMisses = ytdIncidents.filter(i => i.type === 'near_miss')
  const safetyObservations = ytdIncidents.filter(i => i.type === 'observation' || i.type === 'safety_observation')
  
  // RPAS-specific incidents
  const flightIncidents = ytdIncidents.filter(i => i.category === 'flight' || i.category === 'rpas')
  
  // Days since last recordable incident
  let daysSinceIncident = null
  if (recordableIncidents.length > 0) {
    const sortedIncidents = [...recordableIncidents].sort((a, b) => {
      const dateA = a.dateOccurred?.toDate ? a.dateOccurred.toDate() : new Date(a.dateOccurred)
      const dateB = b.dateOccurred?.toDate ? b.dateOccurred.toDate() : new Date(b.dateOccurred)
      return dateB - dateA
    })
    const lastDate = sortedIncidents[0].dateOccurred?.toDate 
      ? sortedIncidents[0].dateOccurred.toDate() 
      : new Date(sortedIncidents[0].dateOccurred)
    daysSinceIncident = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))
  }
  
  // Form counts by type
  const formCounts = {}
  forms.forEach(f => {
    const type = f.templateId || 'unknown'
    formCounts[type] = (formCounts[type] || 0) + 1
  })
  
  // Helper to calculate form completion rate
  const getFormRate = (templateIds) => {
    const matchingForms = forms.filter(f => templateIds.some(t => (f.templateId || '').includes(t)))
    const completed = matchingForms.filter(f => f.status === 'completed')
    return matchingForms.length > 0 ? Math.round((completed.length / matchingForms.length) * 100) : 100
  }
  
  // CAPA stats
  const openCapas = capas.filter(c => !['closed', 'verified_effective'].includes(c.status))
  const closedCapas = capas.filter(c => ['closed', 'verified_effective'].includes(c.status))
  const overdueCapas = openCapas.filter(c => {
    if (!c.targetDate) return false
    const target = c.targetDate?.toDate ? c.targetDate.toDate() : new Date(c.targetDate)
    return target < now
  })
  
  // Training completion (from operators)
  const operatorsWithCerts = operators.filter(o => Array.isArray(o.certifications) && o.certifications.length > 0)
  const trainingCompletionRate = operators.length > 0 
    ? Math.round((operatorsWithCerts.length / operators.length) * 100) 
    : 100
  
  // Certification currency
  const operatorsWithValidCerts = operators.filter(o => {
    if (!Array.isArray(o.certifications) || o.certifications.length === 0) return false
    return o.certifications.some(cert => {
      if (!cert.expiryDate) return true
      const expiry = cert.expiryDate?.toDate ? cert.expiryDate.toDate() : new Date(cert.expiryDate)
      return expiry > now
    })
  })
  const certCurrencyRate = operators.length > 0 
    ? Math.round((operatorsWithValidCerts.length / operators.length) * 100) 
    : 100
  
  // Inspection/FLHA/Preflight completion rates
  const inspectionCompletionRate = getFormRate(['inspection'])
  const flhaCompletionRate = getFormRate(['flha', 'field_level_hazard'])
  const preflightCompletionRate = getFormRate(['preflight', 'pre_flight'])
  const tailgateCompletionRate = getFormRate(['tailgate'])
  
  // Near miss to incident ratio
  const nearMissRatio = recordableIncidents.length > 0
    ? (nearMisses.length / recordableIncidents.length).toFixed(1)
    : nearMisses.length > 0 ? 'Inf' : 'N/A'
  
  // CAPA rates
  const capaClosureRate = capas.length > 0
    ? Math.round((closedCapas.length / capas.length) * 100)
    : 100
  const onTimeCapas = closedCapas.filter(c => c.metrics?.onTime !== false)
  const capaOnTimeRate = closedCapas.length > 0
    ? Math.round((onTimeCapas.length / closedCapas.length) * 100)
    : 100
  
  // Equipment stats
  const activeAircraft = aircraft.filter(a => a.status === 'active' || a.status === 'operational' || a.status === 'CLEAR')
  const lockedOutAircraft = aircraft.filter(a => a.status === 'LOCKOUT' || a.status === 'grounded')
  const equipmentAvailability = aircraft.length > 0 ? Math.round((activeAircraft.length / aircraft.length) * 100) : 100
  
  return {
    // Leading Indicators
    trainingCompletionRate,
    certCurrencyRate,
    inspectionCompletionRate,
    flhaCompletionRate,
    preflightCompletionRate,
    tailgateCompletionRate,
    nearMissReportingRate: nearMisses.length,
    safetyObservations: safetyObservations.length,
    
    // Lagging Indicators
    daysSinceIncident,
    ytdRecordableIncidents: recordableIncidents.length,
    ytdNearMisses: nearMisses.length,
    ytdFlightIncidents: flightIncidents.length,
    nearMissRatio,
    
    // CAPA Metrics
    openCapas: openCapas.length,
    closedCapas: closedCapas.length,
    overdueCapas: overdueCapas.length,
    capaClosureRate,
    capaOnTimeRate,
    
    // Equipment Metrics
    totalAircraft: aircraft.length,
    activeAircraft: activeAircraft.length,
    lockedOutAircraft: lockedOutAircraft.length,
    equipmentAvailability,
    
    // Form Statistics
    totalForms: forms.length,
    completedForms: forms.filter(f => f.status === 'completed').length,
    formCounts,
    
    // Program Stats
    totalOperators: operators.length,
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
    
    // Program Structure
    totalPolicies: 53,
    hsePolicies: 32,
    rpasPolicies: 12,
    crmPolicies: 9,
    totalProcedures: 4
  }
}

// Calculate estimated audit readiness score
export function calculateAuditReadinessScore(kpis) {
  let score = 0
  let maxScore = 0
  
  // Training (15%)
  maxScore += 15
  score += ((kpis.trainingCompletionRate || 100) / 100) * 15
  
  // Inspections (10%)
  maxScore += 10
  score += ((kpis.inspectionCompletionRate || 100) / 100) * 10
  
  // FLHA (15%)
  maxScore += 15
  score += ((kpis.flhaCompletionRate || 100) / 100) * 15
  
  // Near miss reporting (10%)
  maxScore += 10
  if ((kpis.ytdNearMisses || 0) >= 5) score += 10
  else if ((kpis.ytdNearMisses || 0) >= 3) score += 7
  else if ((kpis.ytdNearMisses || 0) >= 1) score += 4
  
  // CAPA closure (15%)
  maxScore += 15
  score += ((kpis.capaClosureRate || 100) / 100) * 15
  
  // CAPA on-time (10%)
  maxScore += 10
  score += ((kpis.capaOnTimeRate || 100) / 100) * 10
  
  // Incident-free days (15%)
  maxScore += 15
  if (kpis.daysSinceIncident === null || kpis.daysSinceIncident >= 365) score += 15
  else if (kpis.daysSinceIncident >= 180) score += 12
  else if (kpis.daysSinceIncident >= 90) score += 9
  else if (kpis.daysSinceIncident >= 30) score += 6
  else score += 3
  
  // Documentation completeness (10%)
  maxScore += 10
  const docScore = Math.min(((kpis.totalForms || 0) / 50) * 10, 10)
  score += docScore
  
  return Math.round((score / maxScore) * 100)
}

// Generate comprehensive COR audit report
export async function generateCORReport(data, options = {}) {
  const {
    branding = null,
    includeAppendices = true,
    reportPeriod = String(new Date().getFullYear())
  } = options
  
  const {
    incidents = [],
    capas = [],
    forms = [],
    operators = [],
    projects = [],
    aircraft = [],
    clients = []
  } = data
  
  // Calculate KPIs
  const kpis = calculateSafetyKPIs(data)
  const auditScore = calculateAuditReadinessScore(kpis)
  
  // Create PDF
  const pdf = new BrandedPDF({
    title: 'Health, Safety & Environment Program Report',
    subtitle: 'Certificate of Recognition (COR) Audit Documentation',
    projectName: `Annual Safety Review - ${reportPeriod}`,
    projectCode: `COR-${reportPeriod}`,
    branding
  })
  
  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()
  
  // ============================================
  // SECTION 1: EXECUTIVE SUMMARY
  // ============================================
  pdf.addNewSection('Executive Summary')
  
  pdf.addParagraph(`This Health, Safety & Environment Program Report documents Aeria Solutions Ltd.'s comprehensive safety management system for Certificate of Recognition (COR) audit purposes. The program integrates workplace safety, RPAS flight operations safety, and human factors management through 53 documented policies, 4 detailed procedures, and 3 master manuals.`)
  
  pdf.addSpacer(5)
  
  pdf.addSubsectionTitle('Program Scope')
  pdf.addTable(
    ['Domain', 'Policies', 'Focus'],
    [
      ['Health, Safety & Environment', '32', 'BC OHS Regulation, WorkSafeBC compliance'],
      ['RPAS Operations', '12 + 4 procedures', 'CARs Part IX, SORA methodology'],
      ['Crew Resource Management', '9', 'Human factors, TC AC 700-042'],
      ['Total', '53 policies', 'Integrated safety management']
    ]
  )
  
  pdf.addSpacer(5)
  
  pdf.addSubsectionTitle('Key Performance Indicators')
  pdf.addKPIRow([
    { label: 'Audit Readiness', value: String(auditScore) + '%' },
    { label: 'Days Incident-Free', value: kpis.daysSinceIncident !== null ? String(kpis.daysSinceIncident) : 'None' },
    { label: 'YTD Incidents', value: String(kpis.ytdRecordableIncidents) },
    { label: 'Open CAPAs', value: String(kpis.openCapas) }
  ])
  
  // ============================================
  // SECTION 2: MANAGEMENT COMMITMENT
  // ============================================
  pdf.addNewSection('Management Leadership & Commitment')
  
  pdf.addParagraph('Aeria Solutions demonstrates management commitment through documented policies, defined responsibilities, and active safety program participation.')
  
  pdf.addSubsectionTitle('Foundational Policies')
  pdf.addTable(
    ['Policy ID', 'Name', 'Purpose'],
    [
      ['HSE1022', 'Health & Safety Pledge', 'Zero harm commitment'],
      ['HSE1023', 'Commitment Statement', 'Leadership accountability'],
      ['HSE1024', 'Workers Rights', 'Right to know, participate, refuse'],
      ['HSE1025', 'Safety Management System', 'ISO 45001-aligned SMS'],
      ['HSE1027', 'Health & Safety Policy', 'Foundational H&S statement']
    ]
  )
  
  pdf.addSubsectionTitle('Organizational Structure')
  pdf.addTable(
    ['Role', 'Responsibility'],
    [
      ['Accountable Executive', 'Overall safety program accountability'],
      ['Operations Manager', 'Day-to-day safety implementation'],
      ['Maintenance Manager', 'Equipment airworthiness'],
      ['Pilot in Command (PIC)', 'Flight operation authority'],
      ['Visual Observer (VO)', 'Situational awareness support']
    ]
  )
  
  // ============================================
  // SECTION 3: HAZARD ASSESSMENT
  // ============================================
  pdf.addNewSection('Hazard Assessment & Control')
  
  pdf.addParagraph('Hazard identification and control is implemented through formal assessments, field-level hazard assessments (FLHA), SORA risk assessments, and CRM threat and error management.')
  
  pdf.addSubsectionTitle('Assessment Types')
  pdf.addTable(
    ['Assessment Type', 'Frequency', 'Policy'],
    [
      ['Formal Hazard Assessment', 'Per site/major change', 'HSE1047'],
      ['Field-Level Hazard Assessment', 'Every operation', 'HSE1047'],
      ['Site Survey', 'Per operation area', 'RPAS1011'],
      ['SORA Risk Assessment', 'Per flight operation', 'RPAS Manual'],
      ['Threat & Error Management', 'Every briefing', 'CRM1013']
    ]
  )
  
  pdf.addSubsectionTitle('Performance')
  pdf.addKPIRow([
    { label: 'FLHA Completion', value: String(kpis.flhaCompletionRate) + '%' },
    { label: 'Inspection Rate', value: String(kpis.inspectionCompletionRate) + '%' },
    { label: 'Pre-Flight Rate', value: String(kpis.preflightCompletionRate) + '%' }
  ])
  
  // ============================================
  // SECTION 4: SAFE WORK PRACTICES
  // ============================================
  pdf.addNewSection('Safe Work Practices & Procedures')
  
  pdf.addParagraph('Comprehensive safe work procedures cover all phases of RPAS operations, supported by CRM protocols for human factors management.')
  
  pdf.addSubsectionTitle('RPAS General Procedures (RPAS-GP-001)')
  pdf.addTable(
    ['Phase', 'Procedure'],
    [
      ['1', 'Operation Planning Flow - Pre-departure documentation'],
      ['2', 'Kit Preparation Flow - Equipment and battery readiness'],
      ['3', 'Weather & NOTAM Review Flow - Conditions assessment'],
      ['4', 'Team Briefing Flow - Objectives, roles, safety alignment'],
      ['5', 'Site Setup Flow - Area inspection and perimeter'],
      ['6', 'RPAS Setup Flow - Assembly, calibration, checks'],
      ['7', 'Take-Off Checklist - Final verification'],
      ['8', 'During Flight Flow - Active monitoring'],
      ['9', 'Landing and Post-Flight Flow - Safe recovery'],
      ['10', 'Team Debrief Flow - Lessons learned']
    ]
  )
  
  pdf.addSubsectionTitle('CRM Protocols')
  pdf.addTable(
    ['Protocol', 'Policy', 'Application'],
    [
      ['P.A.C.E. Escalation', 'CRM1014', 'Probe - Alert - Challenge - Emergency'],
      ['Situational Awareness', 'CRM1015', 'Perception - Comprehension - Projection'],
      ['Workload Management', 'CRM1018', 'Task prioritization and delegation'],
      ['Decision Making', 'CRM1019', 'Structured decision matrices']
    ]
  )
  
  // ============================================
  // SECTION 5: TRAINING & COMPETENCY
  // ============================================
  pdf.addNewSection('Training & Competency')
  
  pdf.addParagraph('All personnel receive comprehensive training covering safety procedures, RPAS operations, and crew resource management.')
  
  pdf.addSubsectionTitle('Required Certifications (RPAS1001)')
  pdf.addTable(
    ['Certification', 'Requirement', 'Renewal'],
    [
      ['RPAS Pilot Certificate', 'Basic/Advanced/Complex', 'Per TC'],
      ['ROC-A', 'Radio operations', '5 years'],
      ['Emergency First Aid & CPR', 'All crew', '3 years'],
      ['Wilderness First Aid', 'Remote ops', '3 years'],
      ['CRM Training', 'All flight crew', 'Annual']
    ]
  )
  
  pdf.addSubsectionTitle('Competency Status')
  pdf.addKPIRow([
    { label: 'Cert Currency', value: String(kpis.certCurrencyRate) + '%' },
    { label: 'Training Rate', value: String(kpis.trainingCompletionRate) + '%' },
    { label: 'Total Operators', value: String(kpis.totalOperators) }
  ])
  
  // ============================================
  // SECTION 6: INSPECTIONS
  // ============================================
  pdf.addNewSection('Inspections & Maintenance')
  
  pdf.addSubsectionTitle('Inspection Schedule')
  pdf.addTable(
    ['Inspection Type', 'Frequency', 'Policy'],
    [
      ['Workplace Inspection', 'Monthly', 'HSE1049'],
      ['Pre-Flight Inspection', 'Every operation', 'RPAS1003'],
      ['Equipment Testing', 'New/Pre-Op/Post-Maint/Annual', 'RPAS1012'],
      ['Vehicle Pre-Use', 'Daily', 'HSE1029'],
      ['PPE Inspection', 'Per use', 'HSE1028']
    ]
  )
  
  pdf.addSubsectionTitle('Equipment Status')
  pdf.addKPIRow([
    { label: 'Equipment Available', value: String(kpis.equipmentAvailability) + '%' },
    { label: 'Active Aircraft', value: String(kpis.activeAircraft) },
    { label: 'Locked Out', value: String(kpis.lockedOutAircraft) }
  ])
  
  // ============================================
  // SECTION 7: INCIDENT INVESTIGATION
  // ============================================
  pdf.addNewSection('Incident Investigation & Reporting')
  
  pdf.addSubsectionTitle('Reporting Requirements')
  pdf.addTable(
    ['Authority', 'Timeframe', 'Trigger'],
    [
      ['Internal', '24 hours', 'All incidents and near misses'],
      ['Transport Canada', 'Per CAR 901.49(1)', 'RPAS incidents as specified'],
      ['WorkSafeBC', 'Immediately', 'Serious injuries, fatalities'],
      ['TSB', 'Immediately', 'Fatalities, manned aircraft collision']
    ]
  )
  
  pdf.addSubsectionTitle('Incident Statistics')
  pdf.addTable(
    ['Metric', 'YTD', 'Target', 'Status'],
    [
      ['Recordable Incidents', String(kpis.ytdRecordableIncidents), '0', kpis.ytdRecordableIncidents === 0 ? 'Met' : 'Not Met'],
      ['Flight Incidents', String(kpis.ytdFlightIncidents), '0', kpis.ytdFlightIncidents === 0 ? 'Met' : 'Not Met'],
      ['Near Miss Reports', String(kpis.ytdNearMisses), '5 or more', kpis.ytdNearMisses >= 5 ? 'Met' : 'Review'],
      ['Days Since Incident', kpis.daysSinceIncident !== null ? String(kpis.daysSinceIncident) : 'None', '90 or more', (kpis.daysSinceIncident === null || kpis.daysSinceIncident >= 90) ? 'Met' : 'Not Met']
    ]
  )
  
  pdf.addSubsectionTitle('CAPA Performance')
  pdf.addKPIRow([
    { label: 'Open CAPAs', value: String(kpis.openCapas) },
    { label: 'Overdue', value: String(kpis.overdueCapas) },
    { label: 'Closure Rate', value: String(kpis.capaClosureRate) + '%' },
    { label: 'On-Time Rate', value: String(kpis.capaOnTimeRate) + '%' }
  ])
  
  // ============================================
  // SECTION 8: EMERGENCY RESPONSE
  // ============================================
  pdf.addNewSection('Emergency Preparedness & Response')
  
  pdf.addSubsectionTitle('RPAS Emergency Procedures (RPAS-EP-001)')
  pdf.addTable(
    ['Scenario', 'Response'],
    [
      ['Control Station Failure', 'Backup procedures and RTH activation'],
      ['RPAS Failure', 'Emergency landing or flight termination'],
      ['Crash Event', 'Scene preservation and notification'],
      ['Fly-Away', 'Tracking, notification, and recovery'],
      ['C2 Link Failure', 'Automated failsafe activation'],
      ['Inadvertent Airspace Entry', 'ATC notification protocol']
    ]
  )
  
  pdf.addSubsectionTitle('Emergency Contacts')
  pdf.addTable(
    ['Service', 'Contact'],
    [
      ['Emergency Services', '911'],
      ['WorkSafeBC (24hr)', '1-888-621-7233'],
      ['Transport Canada Civil Aviation', '1-888-463-0521'],
      ['NAV CANADA', '1-866-992-7433'],
      ['TSB Occurrence Reporting', '1-819-994-3741']
    ]
  )
  
  // ============================================
  // SECTION 9: RECORDS & STATISTICS
  // ============================================
  pdf.addNewSection('Records & Statistics')
  
  pdf.addParagraph('Comprehensive records are maintained for all health and safety activities.')
  
  pdf.addSubsectionTitle('Leading Indicators')
  pdf.addTable(
    ['Indicator', 'Target', 'Actual', 'Status'],
    [
      ['Training Completion', '95%', String(kpis.trainingCompletionRate) + '%', kpis.trainingCompletionRate >= 95 ? 'Met' : 'Not Met'],
      ['Inspection Completion', '100%', String(kpis.inspectionCompletionRate) + '%', kpis.inspectionCompletionRate >= 100 ? 'Met' : 'Not Met'],
      ['FLHA Completion', '100%', String(kpis.flhaCompletionRate) + '%', kpis.flhaCompletionRate >= 100 ? 'Met' : 'Not Met'],
      ['Near Miss Reports', '5 or more per year', String(kpis.ytdNearMisses), kpis.ytdNearMisses >= 5 ? 'Met' : 'Review']
    ]
  )
  
  pdf.addSubsectionTitle('Form Statistics')
  const formEntries = Object.entries(kpis.formCounts || {})
  if (formEntries.length > 0) {
    const formRows = formEntries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([type, count]) => [
        type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        String(count)
      ])
    pdf.addTable(['Form Type', 'Count'], formRows)
  } else {
    pdf.addParagraph('No forms recorded yet.')
  }
  
  // ============================================
  // SECTION 10: PROGRAM ADMINISTRATION
  // ============================================
  pdf.addNewSection('Program Administration')
  
  pdf.addParagraph('The health and safety program is reviewed annually and updated as required.')
  
  pdf.addSubsectionTitle('Document Control')
  pdf.addTable(
    ['Control', 'Description'],
    [
      ['Version Control', 'All policies version controlled with revision history'],
      ['Review Cycle', 'Annual review cycle with documented amendments'],
      ['Distribution', 'Electronic distribution through Aeria Ops platform'],
      ['Retention', 'Records retained per regulatory requirements']
    ]
  )
  
  pdf.addSubsectionTitle('Regulatory Compliance')
  pdf.addTable(
    ['Regulation', 'Application'],
    [
      ['BC Workers Compensation Act', 'Workplace safety requirements'],
      ['BC OHS Regulation', 'Specific safety standards'],
      ['CARs Part IX', 'RPAS operations requirements'],
      ['Transport Canada ACs', 'Advisory compliance guidance'],
      ['JARUS SORA 2.5', 'Risk assessment methodology'],
      ['ISO 45001:2018', 'SMS framework principles']
    ]
  )
  
  // ============================================
  // APPENDICES
  // ============================================
  if (includeAppendices) {
    // Appendix A: Complete Policy Index
    pdf.addNewSection('Appendix A: Policy Index')
    
    pdf.addSubsectionTitle('HSE Policies (32)')
    const hsePolicies = PROGRAM_STRUCTURE.hse.policies || []
    if (hsePolicies.length > 0) {
      const hseRows = hsePolicies.map(p => [p.code || 'N/A', p.name || 'Unknown'])
      pdf.addTable(['Code', 'Policy Name'], hseRows)
    }
    
    pdf.addSubsectionTitle('RPAS Operations Policies (12)')
    const rpasPolicies = PROGRAM_STRUCTURE.rpas.policies || []
    if (rpasPolicies.length > 0) {
      const rpasRows = rpasPolicies.map(p => [p.code || 'N/A', p.name || 'Unknown'])
      pdf.addTable(['Code', 'Policy Name'], rpasRows)
    }
    
    pdf.addSubsectionTitle('CRM Policies (9)')
    const crmPolicies = PROGRAM_STRUCTURE.crm.policies || []
    if (crmPolicies.length > 0) {
      const crmRows = crmPolicies.map(p => [p.code || 'N/A', p.name || 'Unknown'])
      pdf.addTable(['Code', 'Policy Name'], crmRows)
    }
    
    pdf.addSubsectionTitle('Procedures Documents (4)')
    const procedures = PROGRAM_STRUCTURE.rpas.procedures || []
    if (procedures.length > 0) {
      const procRows = procedures.map(p => [p.id || 'N/A', p.name || 'Unknown', p.version || 'N/A'])
      pdf.addTable(['Code', 'Name', 'Version'], procRows)
    }
    
    // Appendix B: Operator List
    if (Array.isArray(operators) && operators.length > 0) {
      pdf.addNewSection('Appendix B: Operator Registry')
      const opRows = operators.slice(0, 25).map(op => [
        op.name || `${op.firstName || ''} ${op.lastName || ''}`.trim() || 'Unknown',
        op.role || 'Operator',
        op.pilotCertificate || 'N/A',
        Array.isArray(op.certifications) ? op.certifications.slice(0, 2).map(c => c.type || c.name || String(c)).join(', ') : 'None'
      ])
      pdf.addTable(['Name', 'Role', 'Pilot Cert', 'Certifications'], opRows)
    }
    
    // Appendix C: Equipment Registry
    if (Array.isArray(aircraft) && aircraft.length > 0) {
      pdf.addNewSection('Appendix C: Equipment Registry')
      const acRows = aircraft.map(a => [
        a.nickname || a.name || 'Unknown',
        a.manufacturer || 'N/A',
        a.model || 'N/A',
        a.serialNumber || a.registration || 'N/A',
        a.status || 'Active'
      ])
      pdf.addTable(['Name', 'Manufacturer', 'Model', 'Serial', 'Status'], acRows)
    }
    
    // Appendix D: Project List
    if (Array.isArray(projects) && projects.length > 0) {
      pdf.addNewSection('Appendix D: Project List')
      const projectRows = projects.slice(0, 20).map(p => [
        p.projectCode || (p.id ? p.id.substring(0, 8) : 'N/A'),
        p.name || 'Unknown',
        p.client || 'N/A',
        p.status || 'Unknown'
      ])
      pdf.addTable(['Code', 'Project Name', 'Client', 'Status'], projectRows)
    }
  }
  
  // ============================================
  // CERTIFICATION PAGE
  // ============================================
  pdf.addNewSection('Certification & Approval')
  
  pdf.addParagraph('I certify that the information contained in this report accurately represents the Health, Safety & Environment program of Aeria Solutions Ltd. as of the date indicated.')
  
  pdf.addSpacer(20)
  
  pdf.addSignatureBlock([
    { role: 'Health & Safety Manager' },
    { role: 'Operations Manager' },
    { role: 'Accountable Executive' }
  ])
  
  pdf.addSpacer(10)
  
  pdf.addParagraph(`Report Generated: ${new Date().toLocaleDateString('en-CA')}`)
  pdf.addParagraph('Transport Canada Company File: 930355')
  
  return pdf
}

// Export function for use in components
export async function exportCORReport(data, options = {}) {
  const pdf = await generateCORReport(data, options)
  const filename = `Aeria_COR_Report_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(filename)
  return filename
}

export default {
  COR_ELEMENTS,
  PROGRAM_STRUCTURE,
  calculateSafetyKPIs,
  calculateAuditReadinessScore,
  generateCORReport,
  exportCORReport
}
