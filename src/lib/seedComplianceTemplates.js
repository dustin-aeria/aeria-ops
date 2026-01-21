/**
 * seedComplianceTemplates.js
 * Seed script for compliance matrix templates
 *
 * Contains compliance templates for:
 * - General Compliance Projects (any compliance questionnaire)
 * - Client Prequalification questionnaires
 * - Transport Canada SFOC matrices (BVLOS, 25kg+, 400ft+, Multi-RPA, Payload)
 *
 * @location src/lib/seedComplianceTemplates.js
 */

import { seedComplianceTemplate } from './firestoreCompliance'
import { logger } from './logger'

// ============================================
// GENERAL COMPLIANCE PROJECT TEMPLATE
// Flexible template for any compliance questionnaire
// ============================================

export const GENERAL_COMPLIANCE_TEMPLATE = {
  id: 'general-compliance',
  name: 'General Compliance Project',
  shortName: 'General Compliance',
  description: 'Flexible compliance template for any regulatory questionnaire, client prequalification, audit, or compliance matrix. Add your own requirements or use the AI assistant to help structure your responses.',

  // Metadata
  category: 'general',
  regulatoryBody: 'Various',
  regulation: 'Custom',
  version: '2024-01',
  effectiveDate: '2024-01-15',

  // Categories/Sections - Generic categories that apply to most compliance
  categories: [
    {
      id: 'company',
      name: 'Company Information',
      description: 'Organization details, contacts, and corporate information',
      order: 1
    },
    {
      id: 'operations',
      name: 'Operations',
      description: 'Operational procedures, capabilities, and service descriptions',
      order: 2
    },
    {
      id: 'equipment',
      name: 'Equipment & Systems',
      description: 'Equipment specifications, maintenance, and technical capabilities',
      order: 3
    },
    {
      id: 'personnel',
      name: 'Personnel & Training',
      description: 'Staff qualifications, training programs, and certifications',
      order: 4
    },
    {
      id: 'safety',
      name: 'Safety & Risk Management',
      description: 'Safety procedures, risk assessment, and incident management',
      order: 5
    },
    {
      id: 'documentation',
      name: 'Documentation & Records',
      description: 'Policies, procedures, manuals, and record keeping',
      order: 6
    },
    {
      id: 'insurance',
      name: 'Insurance & Legal',
      description: 'Insurance coverage, certifications, and legal compliance',
      order: 7
    },
    {
      id: 'custom',
      name: 'Additional Requirements',
      description: 'Custom requirements specific to this compliance project',
      order: 8
    }
  ],

  // Starter requirements - minimal set to get started
  requirements: [
    {
      id: 'gen-001',
      category: 'company',
      order: 1,
      text: 'Provide company name, address, and primary contact information.',
      shortText: 'Company Information',
      regulatoryRef: '',
      guidance: 'Include legal company name, mailing address, phone, email, and key contact person.',
      responseType: 'text',
      required: true,
      helpText: 'Basic company identification information.'
    },
    {
      id: 'gen-002',
      category: 'company',
      order: 2,
      text: 'Describe your organization and its relevant experience.',
      shortText: 'Organization Overview',
      regulatoryRef: '',
      guidance: 'Provide a brief description of your organization, history, and relevant experience for the work being proposed.',
      responseType: 'text',
      required: false,
      helpText: 'Help the reviewer understand your organization\'s background and capabilities.'
    },
    {
      id: 'gen-003',
      category: 'operations',
      order: 1,
      text: 'Describe the services or operations you are proposing.',
      shortText: 'Service Description',
      regulatoryRef: '',
      guidance: 'Detail the scope, nature, and extent of services or operations covered by this compliance application.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.overview.description'],
      helpText: 'What work will you be performing?'
    },
    {
      id: 'gen-004',
      category: 'equipment',
      order: 1,
      text: 'List the primary equipment that will be used.',
      shortText: 'Equipment List',
      regulatoryRef: '',
      guidance: 'Include make, model, specifications, and any relevant certifications or registrations.',
      responseType: 'document-reference',
      required: false,
      autoPopulateFrom: ['project.flightPlan.aircraft'],
      helpText: 'What equipment will you use to perform the work?'
    },
    {
      id: 'gen-005',
      category: 'personnel',
      order: 1,
      text: 'Describe the qualifications and certifications of key personnel.',
      shortText: 'Personnel Qualifications',
      regulatoryRef: '',
      guidance: 'Include relevant certifications, training, and experience for personnel involved.',
      responseType: 'document-reference',
      required: false,
      autoPopulateFrom: ['project.crew'],
      helpText: 'Who will perform the work and what are their qualifications?'
    },
    {
      id: 'gen-006',
      category: 'safety',
      order: 1,
      text: 'Describe your safety management approach.',
      shortText: 'Safety Management',
      regulatoryRef: '',
      guidance: 'Include safety policies, risk assessment processes, incident reporting, and continuous improvement.',
      responseType: 'document-reference',
      required: false,
      suggestedPolicies: ['1007', '1040', '1041', '1045'],
      helpText: 'How do you manage safety in your operations?'
    },
    {
      id: 'gen-007',
      category: 'insurance',
      order: 1,
      text: 'Provide evidence of liability insurance coverage.',
      shortText: 'Insurance Coverage',
      regulatoryRef: '',
      guidance: 'Include certificate of insurance with coverage amounts and relevant endorsements.',
      responseType: 'document-reference',
      required: false,
      helpText: 'What insurance coverage do you have?'
    }
  ],

  // Export configuration
  exportFormat: {
    type: 'matrix',
    columns: ['requirement', 'response', 'documentRef'],
    includeGuidance: false
  },

  // Status
  status: 'active',
  isPublic: true
}

// ============================================
// CLIENT PREQUALIFICATION TEMPLATE
// For client vendor qualification questionnaires
// ============================================

export const CLIENT_PREQUALIFICATION_TEMPLATE = {
  id: 'client-prequalification',
  name: 'Client Prequalification Questionnaire',
  shortName: 'Prequalification',
  description: 'Standard prequalification questionnaire for client vendor qualification processes. Covers company information, capabilities, safety, and compliance.',

  // Metadata
  category: 'prequalification',
  regulatoryBody: 'Client Requirements',
  regulation: 'Vendor Qualification',
  version: '2024-01',
  effectiveDate: '2024-01-15',

  // Categories
  categories: [
    {
      id: 'company',
      name: 'Company Profile',
      description: 'Corporate information and structure',
      order: 1
    },
    {
      id: 'capabilities',
      name: 'Capabilities & Experience',
      description: 'Services, equipment, and relevant experience',
      order: 2
    },
    {
      id: 'hse',
      name: 'Health, Safety & Environment',
      description: 'HSE programs, statistics, and certifications',
      order: 3
    },
    {
      id: 'quality',
      name: 'Quality Management',
      description: 'Quality systems, certifications, and processes',
      order: 4
    },
    {
      id: 'insurance',
      name: 'Insurance & Bonding',
      description: 'Insurance coverage and financial security',
      order: 5
    },
    {
      id: 'references',
      name: 'References & Past Performance',
      description: 'Previous work and client references',
      order: 6
    }
  ],

  // Requirements
  requirements: [
    // Company Profile
    {
      id: 'prequal-001',
      category: 'company',
      order: 1,
      text: 'Legal company name, address, phone, and primary contact.',
      shortText: 'Company Details',
      regulatoryRef: '',
      guidance: 'Provide full legal name as registered, physical address, mailing address if different, and main point of contact.',
      responseType: 'text',
      required: true
    },
    {
      id: 'prequal-002',
      category: 'company',
      order: 2,
      text: 'Business registration number and date of incorporation.',
      shortText: 'Business Registration',
      regulatoryRef: '',
      guidance: 'Include provincial/federal business number and when the company was established.',
      responseType: 'text',
      required: true
    },
    {
      id: 'prequal-003',
      category: 'company',
      order: 3,
      text: 'Ownership structure and key personnel.',
      shortText: 'Ownership & Management',
      regulatoryRef: '',
      guidance: 'Describe ownership (private, public, subsidiary) and list key management personnel.',
      responseType: 'text',
      required: false
    },
    // Capabilities
    {
      id: 'prequal-004',
      category: 'capabilities',
      order: 1,
      text: 'Describe your core services and capabilities.',
      shortText: 'Service Capabilities',
      regulatoryRef: '',
      guidance: 'Detail the services you provide, geographic coverage, and any specializations.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.overview.description']
    },
    {
      id: 'prequal-005',
      category: 'capabilities',
      order: 2,
      text: 'List major equipment and resources.',
      shortText: 'Equipment & Resources',
      regulatoryRef: '',
      guidance: 'Include key equipment owned/leased, fleet information, and technology systems.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.flightPlan.aircraft']
    },
    {
      id: 'prequal-006',
      category: 'capabilities',
      order: 3,
      text: 'Certifications, licenses, and regulatory approvals.',
      shortText: 'Certifications & Approvals',
      regulatoryRef: '',
      guidance: 'List relevant certifications (ISO, industry-specific), licenses, and regulatory approvals.',
      responseType: 'document-reference',
      required: true
    },
    // HSE
    {
      id: 'prequal-007',
      category: 'hse',
      order: 1,
      text: 'Describe your Health & Safety program.',
      shortText: 'H&S Program',
      regulatoryRef: '',
      guidance: 'Include safety policies, training programs, hazard identification, and incident management.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1007', '1040', '1041', '1045']
    },
    {
      id: 'prequal-008',
      category: 'hse',
      order: 2,
      text: 'Provide safety statistics for the past 3 years (TRIR, LTIR, EMR).',
      shortText: 'Safety Statistics',
      regulatoryRef: '',
      guidance: 'Include Total Recordable Incident Rate, Lost Time Incident Rate, and Experience Modification Rate if applicable.',
      responseType: 'text',
      required: true
    },
    {
      id: 'prequal-009',
      category: 'hse',
      order: 3,
      text: 'Describe any regulatory violations or incidents in the past 5 years.',
      shortText: 'Incident History',
      regulatoryRef: '',
      guidance: 'Disclose any significant incidents, regulatory actions, or violations and corrective actions taken.',
      responseType: 'text',
      required: true
    },
    // Quality
    {
      id: 'prequal-010',
      category: 'quality',
      order: 1,
      text: 'Describe your Quality Management System.',
      shortText: 'Quality Management',
      regulatoryRef: '',
      guidance: 'Include quality policies, procedures, inspection processes, and any certifications (ISO 9001, etc.).',
      responseType: 'document-reference',
      required: false,
      suggestedPolicies: ['1012', '1053']
    },
    // Insurance
    {
      id: 'prequal-011',
      category: 'insurance',
      order: 1,
      text: 'Provide Certificate of Insurance with coverage details.',
      shortText: 'Insurance Coverage',
      regulatoryRef: '',
      guidance: 'Include general liability, professional liability, auto, and any other relevant coverages with limits.',
      responseType: 'document-reference',
      required: true
    },
    {
      id: 'prequal-012',
      category: 'insurance',
      order: 2,
      text: 'Workers\' Compensation coverage and clearance.',
      shortText: 'Workers Compensation',
      regulatoryRef: '',
      guidance: 'Provide WCB/WSIB clearance certificate showing good standing.',
      responseType: 'document-reference',
      required: true
    },
    // References
    {
      id: 'prequal-013',
      category: 'references',
      order: 1,
      text: 'Provide 3 relevant project references.',
      shortText: 'Project References',
      regulatoryRef: '',
      guidance: 'Include client name, project description, dates, and contact information for reference verification.',
      responseType: 'text',
      required: true
    }
  ],

  // Export configuration
  exportFormat: {
    type: 'matrix',
    columns: ['requirement', 'response', 'documentRef'],
    includeGuidance: false
  },

  status: 'active',
  isPublic: true
}

// ============================================
// SFOC 25KG+ TEMPLATE
// CAR 903.01(a) - RPA more than 25 kg
// ============================================

export const SFOC_25KG_TEMPLATE = {
  id: 'sfoc-25kg-903-01a',
  name: 'SFOC - RPA Over 25kg',
  shortName: '25kg+ SFOC',
  description: 'Compliance checklist for CAR 903.01(a) - RPAS operations with aircraft over 25kg MTOW. Covers airworthiness, enhanced safety, and operational requirements for heavy lift operations.',

  category: 'sfoc',
  regulatoryBody: 'Transport Canada',
  regulation: 'CAR 903.01(a)',
  version: '2024-01',
  effectiveDate: '2024-01-15',

  categories: [
    {
      id: 'operations',
      name: 'Operations & Risk Assessment',
      description: 'Operational planning, SORA, and risk management for heavy lift operations',
      order: 1
    },
    {
      id: 'airworthiness',
      name: 'Aircraft & Airworthiness',
      description: 'Aircraft specifications, design assurance, and airworthiness considerations',
      order: 2
    },
    {
      id: 'crew',
      name: 'Crew & Organization',
      description: 'Personnel qualifications and organizational requirements',
      order: 3
    }
  ],

  requirements: [
    {
      id: '25kg-001',
      category: 'operations',
      order: 1,
      text: 'Describe the purpose and scope of operations requiring an RPA over 25kg.',
      shortText: 'Purpose of Operations',
      regulatoryRef: 'CAR 903.02(d)',
      guidance: 'Explain why a heavy lift RPA is required and the operational objectives.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.overview.description', 'project.sora.conops'],
      suggestedPolicies: ['1001', '1005']
    },
    {
      id: '25kg-002',
      category: 'operations',
      order: 2,
      text: 'Provide SORA assessment including impact energy analysis for aircraft over 25kg.',
      shortText: 'SORA & Impact Analysis',
      regulatoryRef: 'AC 903-001',
      guidance: 'SORA must include detailed impact energy calculations. Higher kinetic energy typically increases GRC.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.sora.sailLevel', 'project.sora.grc', 'project.sora.arc']
    },
    {
      id: '25kg-003',
      category: 'operations',
      order: 3,
      text: 'Describe operational area and any population density considerations.',
      shortText: 'Operational Area',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Operations with heavy RPA may have additional restrictions over populated areas.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.siteSurvey.location']
    },
    {
      id: '25kg-004',
      category: 'operations',
      order: 4,
      text: 'Describe emergency procedures specific to heavy lift operations.',
      shortText: 'Emergency Procedures',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include procedures for controlled descent, emergency landing, and notification protocols.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1006', '1007']
    },
    {
      id: '25kg-005',
      category: 'airworthiness',
      order: 1,
      text: 'Provide complete aircraft specifications including MTOW, dimensions, and performance data.',
      shortText: 'Aircraft Specifications',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include detailed specifications from manufacturer and any modifications.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.flightPlan.aircraft']
    },
    {
      id: '25kg-006',
      category: 'airworthiness',
      order: 2,
      text: 'Describe any design assurance or type certificate for the aircraft.',
      shortText: 'Design Assurance',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Higher SAIL levels require design assurance. Include any type certificates, COAs, or manufacturer declarations.',
      responseType: 'document-reference',
      required: true
    },
    {
      id: '25kg-007',
      category: 'airworthiness',
      order: 3,
      text: 'Describe the maintenance program for the heavy RPA.',
      shortText: 'Maintenance Program',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include inspection intervals, service requirements, and record keeping.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1009']
    },
    {
      id: '25kg-008',
      category: 'airworthiness',
      order: 4,
      text: 'Describe any parachute recovery system or flight termination system.',
      shortText: 'Recovery/Termination System',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Heavy RPA may require ballistic parachute or FTS. Describe system and activation procedures.',
      responseType: 'document-reference',
      required: false
    },
    {
      id: '25kg-009',
      category: 'crew',
      order: 1,
      text: 'Pilot qualifications and type-specific training for heavy RPA.',
      shortText: 'Pilot Qualifications',
      regulatoryRef: 'CAR 901.54',
      guidance: 'Include certifications and any type-specific training for the aircraft.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1010', '1011'],
      autoPopulateFrom: ['project.crew']
    },
    {
      id: '25kg-010',
      category: 'crew',
      order: 2,
      text: 'Provide Operations Manual or relevant excerpts.',
      shortText: 'Operations Manual',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include sections specific to heavy lift operations.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1001', '1012']
    },
    {
      id: '25kg-011',
      category: 'crew',
      order: 3,
      text: 'Evidence of liability insurance appropriate for heavy RPA operations.',
      shortText: 'Insurance Coverage',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Coverage should reflect increased risk of heavier aircraft.',
      responseType: 'document-reference',
      required: true
    }
  ],

  exportFormat: {
    type: 'matrix',
    columns: ['requirement', 'response', 'documentRef'],
    includeGuidance: false,
    tcFormNumber: '26-0835'
  },

  relatedTemplates: ['sfoc-bvlos-903-01b'],
  status: 'active',
  isPublic: true
}

// ============================================
// SFOC 400FT+ TEMPLATE
// CAR 903.01(d) - RPA above 400 ft AGL
// ============================================

export const SFOC_400FT_TEMPLATE = {
  id: 'sfoc-400ft-903-01d',
  name: 'SFOC - Operations Above 400ft AGL',
  shortName: '400ft+ SFOC',
  description: 'Compliance checklist for CAR 903.01(d) - RPAS operations above 400 feet AGL. Covers airspace coordination, traffic deconfliction, and enhanced situational awareness.',

  category: 'sfoc',
  regulatoryBody: 'Transport Canada',
  regulation: 'CAR 903.01(d)',
  version: '2024-01',
  effectiveDate: '2024-01-15',

  categories: [
    {
      id: 'operations',
      name: 'Operations & Airspace',
      description: 'Operational planning, altitude requirements, and airspace considerations',
      order: 1
    },
    {
      id: 'equipment',
      name: 'Equipment & Systems',
      description: 'Aircraft capabilities and tracking systems for high altitude operations',
      order: 2
    },
    {
      id: 'crew',
      name: 'Crew & Coordination',
      description: 'Personnel and ATC coordination requirements',
      order: 3
    }
  ],

  requirements: [
    {
      id: '400ft-001',
      category: 'operations',
      order: 1,
      text: 'Describe the purpose of operations requiring flight above 400ft AGL.',
      shortText: 'Purpose of Operations',
      regulatoryRef: 'CAR 903.02(d)',
      guidance: 'Explain why high altitude operations are necessary for the mission objectives.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.overview.description']
    },
    {
      id: '400ft-002',
      category: 'operations',
      order: 2,
      text: 'Specify the maximum altitude AGL and describe flight profiles.',
      shortText: 'Maximum Altitude & Profile',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include maximum altitude, typical operating altitudes, and any altitude transitions.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.flightPlan.maxAltitudeAGL']
    },
    {
      id: '400ft-003',
      category: 'operations',
      order: 3,
      text: 'Describe the operational area and airspace classification.',
      shortText: 'Airspace & Area',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include airspace class, nearby aerodromes, and any airspace restrictions.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.siteSurvey.airspace']
    },
    {
      id: '400ft-004',
      category: 'operations',
      order: 4,
      text: 'Provide SORA assessment with air risk considerations for high altitude operations.',
      shortText: 'SORA Assessment',
      regulatoryRef: 'AC 903-001',
      guidance: 'Higher altitude typically increases Air Risk Class. Document mitigations.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.sora.arc', 'project.sora.sailLevel']
    },
    {
      id: '400ft-005',
      category: 'operations',
      order: 5,
      text: 'Describe methods for detecting and avoiding other aircraft at higher altitudes.',
      shortText: 'Traffic Detection',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include ADS-B, visual observers, radar, or other DAA methods.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1015', '1017']
    },
    {
      id: '400ft-006',
      category: 'operations',
      order: 6,
      text: 'Describe NAV CANADA coordination and NOTAM procedures.',
      shortText: 'ATC Coordination',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include pre-flight notification, real-time coordination, and NOTAM issuance.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1003', '1004']
    },
    {
      id: '400ft-007',
      category: 'equipment',
      order: 1,
      text: 'Describe aircraft capabilities for high altitude operations.',
      shortText: 'Aircraft Capabilities',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include performance at altitude, C2 link range, and any altitude-related limitations.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.flightPlan.aircraft']
    },
    {
      id: '400ft-008',
      category: 'equipment',
      order: 2,
      text: 'Describe any tracking or surveillance equipment (ADS-B, transponder, etc.).',
      shortText: 'Tracking Equipment',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Higher altitude operations may require electronic conspicuity equipment.',
      responseType: 'document-reference',
      required: true
    },
    {
      id: '400ft-009',
      category: 'crew',
      order: 1,
      text: 'Pilot qualifications and training for high altitude operations.',
      shortText: 'Pilot Qualifications',
      regulatoryRef: 'CAR 901.54',
      guidance: 'Include certifications and any airspace-specific training.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.crew']
    },
    {
      id: '400ft-010',
      category: 'crew',
      order: 2,
      text: 'Describe crew communication procedures, especially for traffic advisories.',
      shortText: 'Communication Procedures',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include radio monitoring, traffic advisory relay, and emergency communications.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1013', '1021']
    }
  ],

  exportFormat: {
    type: 'matrix',
    columns: ['requirement', 'response', 'documentRef'],
    includeGuidance: false,
    tcFormNumber: '26-0835'
  },

  relatedTemplates: ['sfoc-bvlos-903-01b'],
  status: 'active',
  isPublic: true
}

// ============================================
// SFOC MULTI-RPA TEMPLATE
// CAR 903.01(e) - More than 5 RPAs from one control station
// ============================================

export const SFOC_MULTI_RPA_TEMPLATE = {
  id: 'sfoc-multi-rpa-903-01e',
  name: 'SFOC - Multi-RPA Operations',
  shortName: 'Multi-RPA SFOC',
  description: 'Compliance checklist for CAR 903.01(e) - Operating more than 5 RPAs from one control station. Covers swarm/fleet management, command architecture, and enhanced safety measures.',

  category: 'sfoc',
  regulatoryBody: 'Transport Canada',
  regulation: 'CAR 903.01(e)',
  version: '2024-01',
  effectiveDate: '2024-01-15',

  categories: [
    {
      id: 'operations',
      name: 'Multi-RPA Operations',
      description: 'Fleet operations, coordination, and command structure',
      order: 1
    },
    {
      id: 'equipment',
      name: 'Systems & Architecture',
      description: 'Control systems, automation, and technical capabilities',
      order: 2
    },
    {
      id: 'crew',
      name: 'Crew & Management',
      description: 'Personnel, training, and organizational requirements',
      order: 3
    }
  ],

  requirements: [
    {
      id: 'multi-001',
      category: 'operations',
      order: 1,
      text: 'Describe the purpose and scope of multi-RPA operations.',
      shortText: 'Purpose of Operations',
      regulatoryRef: 'CAR 903.02(d)',
      guidance: 'Explain why multiple simultaneous RPAs are required and operational objectives.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.overview.description']
    },
    {
      id: 'multi-002',
      category: 'operations',
      order: 2,
      text: 'Describe the number of RPAs and their roles in the operation.',
      shortText: 'Fleet Configuration',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include number of aircraft, their individual roles, and any lead/follower hierarchy.',
      responseType: 'document-reference',
      required: true
    },
    {
      id: 'multi-003',
      category: 'operations',
      order: 3,
      text: 'Describe the coordination method between multiple RPAs (autonomous, manual, hybrid).',
      shortText: 'Coordination Method',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Explain how RPAs are coordinated - pre-programmed, real-time control, or autonomous swarm behavior.',
      responseType: 'document-reference',
      required: true
    },
    {
      id: 'multi-004',
      category: 'operations',
      order: 4,
      text: 'Provide SORA assessment for multi-RPA operations.',
      shortText: 'SORA Assessment',
      regulatoryRef: 'AC 903-001',
      guidance: 'SORA should address increased complexity and any aggregated risk from multiple aircraft.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.sora.sailLevel']
    },
    {
      id: 'multi-005',
      category: 'operations',
      order: 5,
      text: 'Describe collision avoidance measures between RPAs in the fleet.',
      shortText: 'Internal Collision Avoidance',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include separation standards, automated deconfliction, and manual override procedures.',
      responseType: 'document-reference',
      required: true
    },
    {
      id: 'multi-006',
      category: 'operations',
      order: 6,
      text: 'Describe emergency procedures for multi-RPA scenarios.',
      shortText: 'Emergency Procedures',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include loss of one RPA, mass recall, and cascading failure scenarios.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1006', '1007']
    },
    {
      id: 'multi-007',
      category: 'equipment',
      order: 1,
      text: 'Describe the Ground Control Station architecture for multi-RPA control.',
      shortText: 'GCS Architecture',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include hardware, software, displays, and how multiple aircraft are monitored/controlled.',
      responseType: 'document-reference',
      required: true
    },
    {
      id: 'multi-008',
      category: 'equipment',
      order: 2,
      text: 'Describe the C2 link architecture for multiple simultaneous RPAs.',
      shortText: 'C2 Link Architecture',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include frequencies, bandwidth allocation, and interference management.',
      responseType: 'document-reference',
      required: true
    },
    {
      id: 'multi-009',
      category: 'equipment',
      order: 3,
      text: 'Describe any automation or AI systems used for fleet management.',
      shortText: 'Automation Systems',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include level of automation, human oversight, and manual override capabilities.',
      responseType: 'document-reference',
      required: true
    },
    {
      id: 'multi-010',
      category: 'crew',
      order: 1,
      text: 'Describe crew structure and roles for multi-RPA operations.',
      shortText: 'Crew Structure',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include pilot-to-aircraft ratio, supervisor roles, and crew coordination.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.crew']
    },
    {
      id: 'multi-011',
      category: 'crew',
      order: 2,
      text: 'Describe training specific to multi-RPA operations.',
      shortText: 'Multi-RPA Training',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include workload management, system training, and emergency scenarios.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1010', '1011']
    }
  ],

  exportFormat: {
    type: 'matrix',
    columns: ['requirement', 'response', 'documentRef'],
    includeGuidance: false,
    tcFormNumber: '26-0835'
  },

  status: 'active',
  isPublic: true
}

// ============================================
// SFOC BVLOS COMPLIANCE MATRIX TEMPLATE
// CAR 903.01(b) - Beyond Visual Line of Sight Operations
// ============================================

export const SFOC_BVLOS_TEMPLATE = {
  id: 'sfoc-bvlos-903-01b',
  name: 'SFOC - BVLOS Operations',
  shortName: 'BVLOS SFOC',
  description: 'Compliance checklist for CAR 903.01(b) - RPAS in Beyond Visual Line of Sight operations. This matrix covers all Transport Canada requirements for BVLOS SFOC applications.',

  // Metadata
  category: 'sfoc',
  regulatoryBody: 'Transport Canada',
  regulation: 'CAR 903.01(b)',
  version: '2024-01',
  effectiveDate: '2024-01-15',

  // Categories/Sections
  categories: [
    {
      id: 'operations',
      name: 'RPAS Operation / Risk Assessment',
      description: 'Requirements related to operational planning, SORA, and risk management',
      order: 1
    },
    {
      id: 'equipment',
      name: 'RPAS Equipment / Capability',
      description: 'Requirements related to aircraft, systems, and technical capabilities',
      order: 2
    },
    {
      id: 'crew',
      name: 'Applicant / Operator / Pilot',
      description: 'Requirements related to personnel, qualifications, and organizational standards',
      order: 3
    }
  ],

  // Requirements
  requirements: [
    // ============================================
    // SECTION 1: RPAS Operation / Risk Assessment
    // ============================================
    {
      id: 'req-001',
      category: 'operations',
      order: 1,
      text: 'As per CAR 903.02(d), describe in detail the purpose of the operations. Provide a CONOPS type document to cover scope of the proposed operation.',
      shortText: 'Purpose of Operations / CONOPS',
      regulatoryRef: 'CAR 903.02(d)',
      guidance: 'Include: operational objectives, geographic scope, duration, aircraft types, altitude ranges, and any special considerations. The CONOPS should be comprehensive and cover all aspects of the proposed BVLOS operation.',
      responseType: 'document-reference',
      required: true,
      minResponseLength: 50,
      autoPopulateFrom: [
        'project.overview.description',
        'project.sora.conops',
        'project.flightPlan.summary'
      ],
      suggestedPolicies: ['1001', '1005', '1006', '1012'],
      suggestedDocTypes: ['operations-manual', 'conops', 'sora-report'],
      validationRules: [
        { type: 'requiresDocument', docTypes: ['conops', 'operations-manual'] },
        { type: 'minDocuments', count: 1 }
      ],
      helpText: 'This requirement asks you to explain WHY you are conducting the operation and provide a Concept of Operations document. Be specific about the purpose, scope, and nature of the BVLOS operations.',
      exampleResponse: 'The purpose of this operation is to conduct aerial pipeline inspection services for [Client] in the [Location] area. Operations will involve systematic survey flights along the pipeline corridor using [Aircraft Type] equipped with [Sensors]. See attached CONOPS document (Operations Manual Section 3.2, pages 12-18) for complete operational details including flight profiles, altitude ranges, and risk mitigations.'
    },
    {
      id: 'req-002',
      category: 'operations',
      order: 2,
      text: 'Provide the Specific Operational Risk Assessment (SORA), SAIL level and Appendix C - Operational Safety Objectives (OSOs) as detailed in AC 903-001.',
      shortText: 'SORA Assessment & OSOs',
      regulatoryRef: 'AC 903-001',
      guidance: 'Must include complete SORA with Ground Risk Class (GRC), Air Risk Class (ARC), final SAIL level, and all applicable OSO compliance evidence. Ensure SORA version 2.5 methodology is followed.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: [
        'project.sora.sailLevel',
        'project.sora.grc',
        'project.sora.arc',
        'project.sora.osos'
      ],
      suggestedDocTypes: ['sora-report'],
      validationRules: [
        { type: 'requiresProjectData', fields: ['sora.sailLevel'] },
        { type: 'requiresDocument', docTypes: ['sora-report'] }
      ],
      helpText: 'The SORA assessment determines the Specific Assurance and Integrity Level (SAIL) required for your operation based on ground and air risk analysis.',
      exampleResponse: 'SORA Assessment completed per JARUS SORA 2.5 methodology. Final SAIL Level: II. Ground Risk Class (GRC): 3 (Sparsely populated, mitigated by M1 & M2). Air Risk Class (ARC): ARC-b (uncontrolled airspace, VLOS mitigation). All applicable OSOs have been addressed with evidence documented in the attached SORA report.'
    },
    {
      id: 'req-003',
      category: 'operations',
      order: 3,
      text: 'Provide a description of the area of operation, including geographic boundaries, airspace classification, and any airspace restrictions.',
      shortText: 'Area of Operation Description',
      regulatoryRef: 'CAR 903.02(d)',
      guidance: 'Include detailed geographic coordinates or boundary descriptions, airspace class (A through G), any NOTAMs, TFRs, or permanent airspace restrictions. Include maps where appropriate.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: [
        'project.siteSurvey.location',
        'project.siteSurvey.airspace',
        'project.mapData.operationalArea'
      ],
      suggestedDocTypes: ['site-survey', 'maps'],
      helpText: 'Clearly define where operations will take place. Include all relevant airspace information and any potential conflicts.',
      exampleResponse: 'Operations will be conducted within a defined corridor along the Trans-Northern Pipeline from [Start Point coordinates] to [End Point coordinates]. The operational area is within Class G uncontrolled airspace, below 400ft AGL. Nearest aerodrome is [Name] at [Distance] NM. See attached maps and site survey documentation.'
    },
    {
      id: 'req-004',
      category: 'operations',
      order: 4,
      text: 'Provide details of the proposed flight profiles, including maximum altitude AGL, maximum distance from pilot, and flight duration.',
      shortText: 'Flight Profiles',
      regulatoryRef: 'CAR 903.02(d)',
      guidance: 'Describe typical and maximum operational parameters. Include altitude limits, range limits, typical flight duration, and any variations based on mission requirements.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: [
        'project.flightPlan.maxAltitudeAGL',
        'project.flightPlan.operationType'
      ],
      helpText: 'Define the envelope within which operations will be conducted.',
      exampleResponse: 'Maximum altitude: 120m (400ft) AGL. Maximum range from pilot: 2km (within C2 link range). Typical flight duration: 25-30 minutes per battery. Flight profile: Linear corridor survey at 50m AGL with terrain following. See Operations Manual Section 4.3.'
    },
    {
      id: 'req-005',
      category: 'operations',
      order: 5,
      text: 'Describe the method(s) used to maintain situational awareness of other aircraft in the area of operation when operating BVLOS.',
      shortText: 'Situational Awareness Methods',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Explain how you will detect and avoid other aircraft. This may include visual observers, ADS-B receivers, FLARM, radar, or other DAA systems. For SAIL II+, explain the DAA system or procedural mitigations.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1015', '1017'],
      suggestedDocTypes: ['operations-manual', 'daa-procedures'],
      helpText: 'BVLOS operations require robust methods to detect and avoid conflicting traffic.',
      exampleResponse: 'Situational awareness maintained through: 1) Network of trained Visual Observers (VOs) positioned along the flight corridor with radio communication to PIC. 2) ADS-B In receiver on GCS displaying nearby traffic. 3) Real-time monitoring of NAV CANADA traffic advisories. 4) Pre-flight NOTAM check and coordination with local air traffic. See VO procedures in Operations Manual Section 5.2.'
    },
    {
      id: 'req-006',
      category: 'operations',
      order: 6,
      text: 'Describe the procedures for coordination with NAV CANADA and/or the appropriate air traffic control authority.',
      shortText: 'ATC Coordination Procedures',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail how you will coordinate with ATC, FIC, or other authorities before and during operations. Include NOTAM procedures if applicable.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1003', '1004'],
      helpText: 'Proper coordination with air traffic services is essential for BVLOS operations.',
      exampleResponse: 'Pre-flight: File flight plan with FIC Edmonton 24 hours prior. Issue NOTAM for operation area. Day of operation: Contact FIC for traffic advisory. During flight: Monitor 126.7 MHz. Emergency: Contact FIC immediately via phone (1-866-541-4102). See NAV CANADA coordination checklist in Operations Manual Appendix D.'
    },
    {
      id: 'req-007',
      category: 'operations',
      order: 7,
      text: 'Provide emergency procedures including loss of command and control link, fly-away, and other abnormal situations.',
      shortText: 'Emergency Procedures',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Document all emergency procedures specific to BVLOS operations. Include loss of C2 link, GPS failure, fly-away, battery emergency, weather deterioration, and collision avoidance.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1006', '1007'],
      autoPopulateFrom: [
        'project.flightPlan.contingencies',
        'project.emergencyPlan'
      ],
      suggestedDocTypes: ['emergency-procedures', 'operations-manual'],
      helpText: 'Emergency procedures must be comprehensive and practiced.',
      exampleResponse: 'Emergency procedures documented in Operations Manual Section 6. Key procedures: 1) Loss of C2 Link: RPAS executes RTH automatically, VOs track visually. 2) Fly-away: Attempt regain control, contact FIC immediately, track via ADS-B. 3) Low battery: Immediate RTH, land with 20% reserve. 4) Weather deterioration: Land immediately if below minimums. All crew trained quarterly on emergency procedures.'
    },
    {
      id: 'req-008',
      category: 'operations',
      order: 8,
      text: 'Describe the communication procedures between the pilot and any visual observers or other crew members.',
      shortText: 'Crew Communication Procedures',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail the communication methods, frequencies/channels, standard phraseology, and backup communication methods.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1013', '1015', '1021'],
      autoPopulateFrom: ['project.communications'],
      helpText: 'Clear communication protocols are essential for safe BVLOS operations.',
      exampleResponse: 'Primary: Dedicated UHF radio channel. Backup: Cellular phone. Standard phraseology per Operations Manual Section 5.3. Check-in intervals: Every 2 minutes during BVLOS flight. Emergency stop word: "ABORT ABORT ABORT". All crew briefed on communications procedures pre-flight.'
    },
    {
      id: 'req-009',
      category: 'operations',
      order: 9,
      text: 'Provide weather minimums and limitations for the proposed operations.',
      shortText: 'Weather Minimums',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Specify visibility minimums, ceiling requirements, wind limitations, and any other weather restrictions specific to BVLOS operations.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1005'],
      autoPopulateFrom: ['project.flightPlan.weatherMinimums'],
      helpText: 'Weather minimums for BVLOS should be more conservative than VLOS operations.',
      exampleResponse: 'Minimum visibility: 3 SM. Minimum ceiling: 500ft AGL. Maximum wind: 25 km/h sustained, 35 km/h gusts. No operations in precipitation, fog, or icing conditions. Weather checked via AWOS/METAR 1 hour prior and continuously monitored. Operations suspended if conditions deteriorate below minimums.'
    },
    {
      id: 'req-010',
      category: 'operations',
      order: 10,
      text: 'Describe the procedures for pre-flight planning and risk assessment for each operation.',
      shortText: 'Pre-flight Planning Procedures',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Document the systematic approach to planning each flight, including risk assessment, go/no-go decisions, and crew briefing.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1002', '1014', '1017'],
      suggestedDocTypes: ['operations-manual', 'checklists'],
      helpText: 'Thorough pre-flight planning reduces operational risk.',
      exampleResponse: 'Pre-flight planning follows Operations Manual Section 3: 1) Weather assessment (METAR, TAF, AWOS). 2) NOTAM check. 3) Site-specific risk assessment update. 4) Equipment serviceability check. 5) Crew fitness verification (IMSAFE). 6) Full crew briefing using standard briefing checklist. 7) Go/No-Go decision by PIC. See attached pre-flight checklist.'
    },

    // ============================================
    // SECTION 2: RPAS Equipment / Capability
    // ============================================
    {
      id: 'req-011',
      category: 'equipment',
      order: 1,
      text: 'Provide make, model, and specifications of the RPAS to be used, including MTOW, maximum speed, and endurance.',
      shortText: 'RPAS Specifications',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include complete aircraft specifications, registration number if applicable, and any relevant type certificates or design approvals.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.flightPlan.aircraft'],
      suggestedDocTypes: ['aircraft-specs', 'registration'],
      helpText: 'Provide detailed specifications for all aircraft to be used in BVLOS operations.',
      exampleResponse: 'Primary Aircraft: DJI Matrice 300 RTK. MTOW: 9kg. Max Speed: 23 m/s. Endurance: 55 min (no payload). Registration: C-XXXX. Secondary Aircraft: [Details]. See attached aircraft specification sheets and airworthiness documentation.'
    },
    {
      id: 'req-012',
      category: 'equipment',
      order: 2,
      text: 'Describe the command and control (C2) link system, including frequencies, range, and redundancy measures.',
      shortText: 'C2 Link System',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail the C2 link technology, operating frequencies, effective range, and any backup or redundant systems.',
      responseType: 'document-reference',
      required: true,
      suggestedDocTypes: ['equipment-specs'],
      helpText: 'C2 link reliability is critical for BVLOS operations.',
      exampleResponse: 'Primary C2: OcuSync 3.0, 2.4/5.8 GHz dual-band. Effective range: 15km (optimal conditions). Redundancy: 4 antenna diversity system. Automatic frequency hopping. Backup: 4G LTE module for telemetry (data only). C2 link tested prior to each flight. Operations remain within demonstrated reliable range.'
    },
    {
      id: 'req-013',
      category: 'equipment',
      order: 3,
      text: 'Describe the lost link procedures and automatic return-to-home (RTH) capabilities.',
      shortText: 'Lost Link & RTH Procedures',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Explain what happens automatically when C2 link is lost and any manual override procedures.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1006'],
      helpText: 'Lost link procedures must be failsafe and predictable.',
      exampleResponse: 'Lost Link Response: 1) RPAS hovers for 10 seconds attempting reconnection. 2) If no reconnection, automatic RTH at 50m AGL following recorded path. 3) If RTH not feasible, controlled descent and landing. RTH tested before each flight. Manual override available via backup controller. See Operations Manual Section 6.2.'
    },
    {
      id: 'req-014',
      category: 'equipment',
      order: 4,
      text: 'Describe any geo-fencing or containment systems used to prevent the RPAS from leaving the approved operational area.',
      shortText: 'Geo-fencing / Containment',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail any electronic geo-fencing, virtual boundaries, or physical containment measures.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.sora.containment'],
      helpText: 'Containment is a key mitigation for ground risk in SORA.',
      exampleResponse: 'Software geo-fence programmed in flight controller with 100m buffer from operational boundary. Hard altitude limit: 130m AGL. Automatic hover and alert if approaching geo-fence. Emergency RTH triggered if boundary breach attempted. Geo-fence verified during pre-flight checks. See SORA containment evidence documentation.'
    },
    {
      id: 'req-015',
      category: 'equipment',
      order: 5,
      text: 'Describe the RPAS navigation system(s) and any redundancy measures.',
      shortText: 'Navigation Systems',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail GPS/GNSS systems, any RTK augmentation, backup navigation methods, and behavior during navigation failure.',
      responseType: 'document-reference',
      required: true,
      helpText: 'Reliable navigation is essential for BVLOS operations.',
      exampleResponse: 'Primary Navigation: Multi-constellation GNSS (GPS L1/L2, GLONASS, Galileo, BeiDou). RTK positioning via D-RTK2 base station (2cm accuracy). Backup: Vision positioning system (below 50m). IMU-based dead reckoning for short-duration GPS loss. GPS failure procedure: Immediate transition to ATTI mode and controlled return.'
    },
    {
      id: 'req-016',
      category: 'equipment',
      order: 6,
      text: 'Describe the method(s) used for detecting and avoiding obstacles during BVLOS flight.',
      shortText: 'Obstacle Detection & Avoidance',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail any onboard sensors, pre-planned route verification, or procedural methods for obstacle avoidance.',
      responseType: 'document-reference',
      required: true,
      helpText: 'Obstacle avoidance is critical when the pilot cannot directly see obstacles.',
      exampleResponse: 'Multi-directional obstacle sensing (forward, backward, lateral, up, down) using infrared and vision sensors. Detection range: 40m. Automatic brake and hover when obstacle detected. Pre-flight route verification against terrain and obstacle database. Minimum safe altitude established per segment based on site survey. See Operations Manual Section 4.5.'
    },
    {
      id: 'req-017',
      category: 'equipment',
      order: 7,
      text: 'Describe the method(s) used for ground-based surveillance of the RPAS during BVLOS operations.',
      shortText: 'Ground-Based Surveillance',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Explain how you maintain awareness of RPAS position and status when beyond visual line of sight.',
      responseType: 'document-reference',
      required: true,
      helpText: 'Ground-based tracking enables situational awareness during BVLOS.',
      exampleResponse: 'Real-time telemetry displayed on GCS showing position, altitude, heading, speed, battery status, and system health. Position updated 5Hz. ADS-B Out for external tracking. Flight path recording for post-flight review. Telemetry alerts for abnormal parameters. Visual observers provide backup visual tracking where possible.'
    },
    {
      id: 'req-018',
      category: 'equipment',
      order: 8,
      text: 'Provide details of any flight termination system (FTS) or parachute recovery system (PRS) if applicable.',
      shortText: 'FTS / Parachute System',
      regulatoryRef: 'CAR 903.02',
      guidance: 'If equipped, describe the termination or recovery system capabilities, activation methods, and testing requirements.',
      responseType: 'document-reference',
      required: false,
      helpText: 'FTS/PRS may be required for certain SAIL levels or population densities.',
      exampleResponse: 'N/A - Operations conducted over sparsely populated areas with SAIL II. Aircraft descent rate in power-off condition: [X] m/s. Impact energy calculations support operations without FTS/PRS per SORA methodology. If FTS required for specific mission: [Describe system and procedures].'
    },
    {
      id: 'req-019',
      category: 'equipment',
      order: 9,
      text: 'Describe the maintenance program for the RPAS and associated equipment.',
      shortText: 'Maintenance Program',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail the preventive maintenance schedule, inspection intervals, and record-keeping procedures.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1009'],
      suggestedDocTypes: ['maintenance-manual'],
      helpText: 'Regular maintenance ensures aircraft reliability for BVLOS operations.',
      exampleResponse: 'Maintenance per manufacturer recommendations and Operations Manual Section 8. Pre-flight inspection before each flight. 25-hour inspection interval. 100-hour major inspection. Battery cycle tracking and replacement criteria. All maintenance logged in aircraft logbook. See attached maintenance schedule and sample logs.'
    },
    {
      id: 'req-020',
      category: 'equipment',
      order: 10,
      text: 'Describe the Ground Control Station (GCS) setup and capabilities.',
      shortText: 'GCS Setup & Capabilities',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail the GCS hardware, software, displays, and any redundancy measures.',
      responseType: 'document-reference',
      required: true,
      helpText: 'The GCS is the primary interface for BVLOS operations.',
      exampleResponse: 'GCS: DJI RC Plus controller with integrated display. Backup: Tablet with DJI Pilot 2 app. Displays: Real-time video feed, telemetry overlay, map view with position, geofence status. Power: Internal battery plus external power bank (4+ hours operation). Sun shade for outdoor visibility. See GCS setup checklist.'
    },

    // ============================================
    // SECTION 3: Applicant / Operator / Pilot
    // ============================================
    {
      id: 'req-021',
      category: 'crew',
      order: 1,
      text: 'Provide details of the applicant organization, including company name, address, and primary contact.',
      shortText: 'Applicant Information',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include full legal company name, mailing address, and contact details for the person responsible for the SFOC.',
      responseType: 'text',
      required: true,
      helpText: 'Provide complete and accurate applicant information.',
      exampleResponse: 'Company: [Company Name]\nAddress: [Street, City, Province, Postal Code]\nPrimary Contact: [Name, Title]\nPhone: [Number]\nEmail: [Email]'
    },
    {
      id: 'req-022',
      category: 'crew',
      order: 2,
      text: 'Provide Transport Canada RPAS registration number(s) for all aircraft to be used.',
      shortText: 'RPAS Registration',
      regulatoryRef: 'CAR 901.03',
      guidance: 'List all TC registration numbers. Aircraft must be properly registered and marked.',
      responseType: 'text',
      required: true,
      suggestedPolicies: ['1008'],
      helpText: 'All aircraft used must be registered with Transport Canada.',
      exampleResponse: 'Primary Aircraft: C-XXXX (DJI Matrice 300 RTK)\nSecondary Aircraft: C-YYYY (DJI Matrice 30T)'
    },
    {
      id: 'req-023',
      category: 'crew',
      order: 3,
      text: 'Provide pilot certification details for all pilots who will conduct BVLOS operations.',
      shortText: 'Pilot Certifications',
      regulatoryRef: 'CAR 901.54',
      guidance: 'Include certificate type (Basic/Advanced), certificate number, and any additional ratings or endorsements.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1010'],
      autoPopulateFrom: ['project.crew'],
      helpText: 'Pilots must hold appropriate certificates for BVLOS operations.',
      exampleResponse: 'PIC: [Name] - Advanced RPAS Certificate #[Number], Medical Category 1/3. Issued: [Date]. Additional: Night Rating, Ground Instructor. See attached certificate copies.'
    },
    {
      id: 'req-024',
      category: 'crew',
      order: 4,
      text: 'Describe the training and experience requirements for pilots conducting BVLOS operations.',
      shortText: 'Pilot Training Requirements',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail specific BVLOS training, flight hour requirements, and currency requirements.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1010', '1011', '1044'],
      helpText: 'BVLOS operations typically require additional training beyond standard certification.',
      exampleResponse: 'BVLOS Pilot Requirements: 1) Valid Advanced RPAS Certificate. 2) Minimum 50 hours on type. 3) Company BVLOS ground school (8 hours). 4) BVLOS practical training (10 hours supervised). 5) Annual proficiency check. 6) Current within 90 days on type. See Training Manual Section 3.'
    },
    {
      id: 'req-025',
      category: 'crew',
      order: 5,
      text: 'Describe the roles and responsibilities of all crew members involved in BVLOS operations.',
      shortText: 'Crew Roles & Responsibilities',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Define each crew position (PIC, VO, GCS Operator, etc.) and their specific responsibilities.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1013', '1015', '1016'],
      autoPopulateFrom: ['project.crew'],
      helpText: 'Clear role definition ensures safe crew coordination.',
      exampleResponse: 'Pilot in Command (PIC): Overall flight safety responsibility, aircraft control, go/no-go decisions. Visual Observer (VO): Scan for traffic, maintain awareness of RPAS position, relay observations to PIC. Ground Operations Lead: Site safety, communications coordination, emergency response lead. See Operations Manual Section 2 for detailed responsibilities matrix.'
    },
    {
      id: 'req-026',
      category: 'crew',
      order: 6,
      text: 'Describe the training requirements and qualifications for visual observers.',
      shortText: 'Visual Observer Training',
      regulatoryRef: 'CAR 901.70',
      guidance: 'Detail VO training curriculum, competency requirements, and any certification or documentation.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1015', '1044'],
      helpText: 'VOs play a critical role in BVLOS situational awareness.',
      exampleResponse: 'VO Training Requirements: 1) Company VO ground school (4 hours). 2) Radio communication procedures. 3) Aircraft recognition and tracking. 4) Emergency procedures briefing. 5) Site-specific briefing for each operation. VOs must pass practical assessment. Records maintained in training database.'
    },
    {
      id: 'req-027',
      category: 'crew',
      order: 7,
      text: 'Provide a copy of the Operations Manual or relevant sections covering BVLOS procedures.',
      shortText: 'Operations Manual',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include the complete Operations Manual or, at minimum, sections covering BVLOS-specific procedures, emergency procedures, and crew duties.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1001', '1012'],
      suggestedDocTypes: ['operations-manual'],
      validationRules: [
        { type: 'requiresDocument', docTypes: ['operations-manual'] }
      ],
      helpText: 'The Operations Manual is a key compliance document.',
      exampleResponse: 'Operations Manual Version 3.0, dated [Date]. Relevant sections attached: Section 3 (Flight Operations), Section 4 (BVLOS Procedures), Section 5 (Crew Duties), Section 6 (Emergency Procedures). Full manual available upon request.'
    },
    {
      id: 'req-028',
      category: 'crew',
      order: 8,
      text: 'Describe the Safety Management System (SMS) or safety culture within the organization.',
      shortText: 'Safety Management System',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Describe how safety is managed within the organization, including hazard reporting, incident investigation, and continuous improvement.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1007', '1040', '1041', '1045'],
      helpText: 'A safety culture supports safe BVLOS operations.',
      exampleResponse: 'Safety Management System includes: 1) Hazard identification and risk assessment process. 2) Confidential safety reporting system. 3) Incident investigation procedures. 4) CAPA process for continuous improvement. 5) Regular safety meetings. 6) Safety KPIs and monitoring. See SMS Manual and Policy 1045.'
    },
    {
      id: 'req-029',
      category: 'crew',
      order: 9,
      text: 'Provide evidence of liability insurance coverage appropriate for BVLOS operations.',
      shortText: 'Insurance Coverage',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include certificate of insurance showing coverage amounts and that BVLOS operations are covered.',
      responseType: 'document-reference',
      required: true,
      suggestedDocTypes: ['insurance-certificate'],
      validationRules: [
        { type: 'requiresDocument', docTypes: ['insurance-certificate'] }
      ],
      helpText: 'Insurance must cover BVLOS operations specifically.',
      exampleResponse: 'Liability Insurance: [Insurance Company], Policy #[Number]. Coverage: $[Amount] per occurrence. Policy specifically endorses BVLOS operations. Certificate of Insurance attached. Expiry: [Date].'
    },
    {
      id: 'req-030',
      category: 'crew',
      order: 10,
      text: 'Describe any previous SFOC history or BVLOS operational experience.',
      shortText: 'SFOC / BVLOS Experience',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include previous SFOCs held, number of BVLOS flight hours, and any relevant operational history.',
      responseType: 'text',
      required: false,
      helpText: 'Operational experience demonstrates capability.',
      exampleResponse: 'Previous SFOCs: [List previous SFOC numbers and purposes]. Total BVLOS flight hours: [Hours]. Operations conducted without incident since [Year]. Reference letters available upon request.'
    },
    {
      id: 'req-031',
      category: 'crew',
      order: 11,
      text: 'Provide proposed SFOC validity period and operational dates.',
      shortText: 'SFOC Validity Period',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Specify requested start date, end date, and any seasonal or schedule limitations.',
      responseType: 'text',
      required: true,
      helpText: 'Specify the period for which SFOC approval is requested.',
      exampleResponse: 'Requested validity period: [Start Date] to [End Date] (12 months). Operations expected: [Frequency, e.g., 2-3 times per month during summer season]. Request renewal process details if available.'
    },
    {
      id: 'req-032',
      category: 'crew',
      order: 12,
      text: 'Describe how compliance with SFOC conditions will be monitored and maintained.',
      shortText: 'Compliance Monitoring',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Explain the internal audit or monitoring processes to ensure ongoing SFOC compliance.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1012', '1045', '1053'],
      helpText: 'Ongoing compliance monitoring is expected.',
      exampleResponse: 'Compliance maintained through: 1) Pre-flight SFOC conditions review. 2) Flight logs documenting compliance with conditions. 3) Quarterly internal audit of SFOC requirements. 4) Document control system for current procedures. 5) Training records verification. See Quality Assurance Manual.'
    }
  ],

  // Export configuration
  exportFormat: {
    type: 'matrix',
    columns: ['requirement', 'response', 'documentRef'],
    includeGuidance: false,
    tcFormNumber: '26-0835'
  },

  // Related templates
  relatedTemplates: ['sfoc-25kg-903-01a', 'sfoc-night-ops'],

  // Status
  status: 'active',
  isPublic: true
}

// ============================================
// SEED FUNCTIONS
// ============================================

/**
 * Seed all compliance templates
 * @param {string} userId - User performing the seed
 * @returns {Promise<Object>} Result with counts
 */
export async function seedAllComplianceTemplates(userId = null) {
  const results = {
    success: true,
    seeded: [],
    errors: []
  }

  // All available templates - General templates first, then SFOC-specific
  const templates = [
    GENERAL_COMPLIANCE_TEMPLATE,
    CLIENT_PREQUALIFICATION_TEMPLATE,
    SFOC_BVLOS_TEMPLATE,
    SFOC_25KG_TEMPLATE,
    SFOC_400FT_TEMPLATE,
    SFOC_MULTI_RPA_TEMPLATE
  ]

  for (const template of templates) {
    try {
      await seedComplianceTemplate({
        ...template,
        createdBy: userId,
        updatedBy: userId
      })
      results.seeded.push(template.id)
    } catch (error) {
      logger.error(`Error seeding template ${template.id}:`, error)
      results.errors.push({ id: template.id, error: error.message })
      results.success = false
    }
  }

  return results
}

/**
 * Seed just the SFOC BVLOS template
 * @param {string} userId - User performing the seed
 * @returns {Promise<Object>}
 */
export async function seedSFOCBVLOSTemplate(userId = null) {
  return await seedComplianceTemplate({
    ...SFOC_BVLOS_TEMPLATE,
    createdBy: userId,
    updatedBy: userId
  })
}

export default {
  // General Templates
  GENERAL_COMPLIANCE_TEMPLATE,
  CLIENT_PREQUALIFICATION_TEMPLATE,
  // SFOC Templates
  SFOC_BVLOS_TEMPLATE,
  SFOC_25KG_TEMPLATE,
  SFOC_400FT_TEMPLATE,
  SFOC_MULTI_RPA_TEMPLATE,
  // Seed Functions
  seedAllComplianceTemplates,
  seedSFOCBVLOSTemplate
}
