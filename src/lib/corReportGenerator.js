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
// - 3 Master Manuals
// 
// @location src/lib/corReportGenerator.js
// @action REPLACE
// ============================================

import { BrandedPDF } from './pdfExportService'

// ============================================
// COMPLETE PROGRAM STRUCTURE
// All 53 Policies + 4 Procedures Documented
// ============================================
export const PROGRAM_STRUCTURE = {
  hse: {
    name: 'Health, Safety & Environment (HSE)',
    masterDocument: 'Aeria_HSE_Policies_Master_Document',
    description: 'Comprehensive workplace safety management aligned with BC OHS Regulation and WorkSafeBC requirements',
    sections: {
      management_commitment: {
        name: 'Management Commitment',
        policies: [
          { id: 'HSE1022', code: 'HSE1022', name: 'Health & Safety Pledge', description: 'Formal commitment to zero harm and proactive safety culture' },
          { id: 'HSE1023', code: 'HSE1023', name: 'Commitment Statement', description: 'Leadership commitment to safety resources and accountability' },
          { id: 'HSE1024', code: 'HSE1024', name: 'Workers Rights', description: 'Right to know, participate, and refuse unsafe work' },
          { id: 'HSE1025', code: 'HSE1025', name: 'Safety Management System', description: 'Structured SMS framework aligned with ISO 45001' },
          { id: 'HSE1026', code: 'HSE1026', name: 'Certifications & Qualifications', description: 'Credential management for safety-sensitive work' },
          { id: 'HSE1027', code: 'HSE1027', name: 'Health & Safety Policy', description: 'Foundational H&S policy statement' }
        ]
      },
      health_safety_policies: {
        name: 'Health & Safety Policies',
        policies: [
          { id: 'HSE1028', code: 'HSE1028', name: 'Personal Protective Equipment', description: 'PPE program aligned with CSA/ANSI standards' },
          { id: 'HSE1029', code: 'HSE1029', name: 'Vehicle Safety', description: 'Fleet safety including pre-shift inspections and spotter requirements' },
          { id: 'HSE1030', code: 'HSE1030', name: 'COVID-19 Policy', description: 'Pandemic-specific health protocols' },
          { id: 'HSE1031', code: 'HSE1031', name: 'Pandemic Disease Policy', description: 'General pandemic preparedness and response' },
          { id: 'HSE1032', code: 'HSE1032', name: 'Open Communication', description: 'Non-punitive reporting and safety feedback culture' },
          { id: 'HSE1033', code: 'HSE1033', name: 'Drug & Alcohol Policy', description: 'Substance-free workplace with testing protocols' },
          { id: 'HSE1034', code: 'HSE1034', name: 'Refuse Unsafe Work', description: 'Worker right to refuse per BC Workers Compensation Act Part 3 Division 4' },
          { id: 'HSE1035', code: 'HSE1035', name: 'Harassment & Violence', description: 'Prevention and response per BC OHS Regulation Section 4.27' },
          { id: 'HSE1036', code: 'HSE1036', name: 'Environmental Policy', description: 'Environmental stewardship aligned with ISO 14001' },
          { id: 'HSE1037', code: 'HSE1037', name: 'Security Policy', description: 'Workplace and operational security measures' },
          { id: 'HSE1038', code: 'HSE1038', name: 'Waste Disposal', description: 'Proper waste handling and environmental protection' },
          { id: 'HSE1039', code: 'HSE1039', name: 'Fatigue Management', description: 'Fatigue recognition and mitigation protocols' },
          { id: 'HSE1040', code: 'HSE1040', name: 'Company Rules', description: 'General workplace conduct standards' },
          { id: 'HSE1041', code: 'HSE1041', name: 'General Safety Rules', description: 'Universal safety requirements for all personnel' },
          { id: 'HSE1042', code: 'HSE1042', name: 'Grounds for Dismissal', description: 'Safety-related disciplinary consequences' }
        ]
      },
      public_contractors: {
        name: 'Public, Visitors & Contractors',
        policies: [
          { id: 'HSE1043', code: 'HSE1043', name: 'Public & Visitors Policy', description: 'Safety requirements for non-employees on site' },
          { id: 'HSE1044', code: 'HSE1044', name: 'Contractors Policy', description: 'Contractor safety management including selection, prequalification, and oversight' },
          { id: 'HSE1045', code: 'HSE1045', name: 'Employer Duties', description: 'Legal employer obligations under BC OHS Regulation' }
        ]
      },
      hazard_management: {
        name: 'Hazard Assessment & Control',
        policies: [
          { id: 'HSE1047', code: 'HSE1047', name: 'Hazard Assessment Policy', description: 'Systematic hazard identification per BC OHS Regulation Section 3.5' },
          { id: 'HSE1048', code: 'HSE1048', name: 'Hazard Control Policy', description: 'Hierarchy of controls implementation per Section 3.6' }
        ]
      },
      inspections_maintenance: {
        name: 'Inspections & Maintenance',
        policies: [
          { id: 'HSE1049', code: 'HSE1049', name: 'Inspection Policy', description: 'Formal and informal workplace inspection program' },
          { id: 'HSE1050', code: 'HSE1050', name: 'Preventative Maintenance', description: 'Scheduled maintenance per Section 4.4' }
        ]
      },
      emergency_investigations: {
        name: 'Emergency Response & Investigations',
        policies: [
          { id: 'HSE1051', code: 'HSE1051', name: 'Emergency Response Policy', description: 'ERP development, drills, and response procedures' },
          { id: 'HSE1052', code: 'HSE1052', name: 'Investigations Policy', description: 'Incident investigation and root cause analysis' }
        ]
      },
      program_admin: {
        name: 'Program Administration',
        policies: [
          { id: 'HSE1046', code: 'HSE1046', name: 'Part 13 Code Requirements', description: 'Joint committee structure and requirements' },
          { id: 'HSE1053', code: 'HSE1053', name: 'Systems Overview & Audit', description: 'Internal audit procedures and program review' }
        ]
      }
    },
    totalPolicies: 32
  },
  
  rpas: {
    name: 'RPAS Operations',
    masterDocument: 'Aeria_RPAS_Operations_Manual_Master_Document',
    transportCanadaCode: '930355',
    description: 'Flight safety management aligned with Canadian Aviation Regulations Part IX and JARUS SORA methodology',
    sections: {
      crew_management: {
        name: 'Crew Management',
        policies: [
          { 
            id: 'RPAS1001', 
            code: 'RPAS1001', 
            name: 'Team Competencies', 
            description: 'Crew fitness, certification requirements (Basic/Advanced/Complex), ROC-A, First Aid',
            requirements: ['Age 18+', 'Basic/Advanced RPAS Certificate', 'ROC-A for radio operations', 'Emergency First Aid & CPR', 'Wilderness First Aid for remote ops']
          },
          { 
            id: 'RPAS1002', 
            code: 'RPAS1002', 
            name: 'Roles & Responsibilities', 
            description: 'Defined roles: Accountable Executive, Maintenance Manager, Operations Manager, PIC, VO'
          }
        ]
      },
      equipment_management: {
        name: 'Equipment Management',
        policies: [
          { 
            id: 'RPAS1003', 
            code: 'RPAS1003', 
            name: 'Airworthiness & Maintenance', 
            description: 'RPAS registration per CAR 901.02, pre-operation inspections, maintenance tracking via AirData'
          },
          { 
            id: 'RPAS1004', 
            code: 'RPAS1004', 
            name: 'Personal Protective Equipment', 
            description: 'RPAS-specific PPE requirements identified through hazard assessment'
          },
          { 
            id: 'RPAS1012', 
            code: 'RPAS1012', 
            name: 'Equipment Testing', 
            description: 'Testing schedule: New, Pre-Operation, Post-Maintenance, Annual. CLEAR/LOCKOUT status tracking'
          }
        ]
      },
      operations: {
        name: 'Operations',
        policies: [
          { 
            id: 'RPAS1005', 
            code: 'RPAS1005', 
            name: 'General Procedures', 
            description: '20+ standardized flows covering entire operation lifecycle'
          },
          { 
            id: 'RPAS1007', 
            code: 'RPAS1007', 
            name: 'Communication Protocol', 
            description: 'Standardized phraseology, sterile cockpit, pilot handover, GCS handover procedures'
          },
          { 
            id: 'RPAS1008', 
            code: 'RPAS1008', 
            name: 'Detect, Avoid & Separate', 
            description: 'Ground/airborne collision avoidance, conflict scheme, descend protocol'
          },
          { 
            id: 'RPAS1009', 
            code: 'RPAS1009', 
            name: 'Minimum Weather Requirements', 
            description: 'Operations within 80% of manufacturer limits, icing protocol'
          }
        ]
      },
      planning_risk: {
        name: 'Planning & Risk Assessment',
        policies: [
          { 
            id: 'RPAS1011', 
            code: 'RPAS1011', 
            name: 'Site Survey & Flight Plan', 
            description: 'Comprehensive site assessment covering ground risk, air risk, wildlife, emergency preparedness'
          }
        ]
      },
      emergency_reporting: {
        name: 'Emergency & Reporting',
        policies: [
          { 
            id: 'RPAS1006', 
            code: 'RPAS1006', 
            name: 'Emergency Procedures', 
            description: 'Control station failure, RPAS failure, crash, fly-away, C2 link loss, emergency landing'
          },
          { 
            id: 'RPAS1010', 
            code: 'RPAS1010', 
            name: 'Incident & Accident Reporting', 
            description: 'Reporting to Transport Canada per CAR 901.49(1), TSB notification requirements'
          }
        ]
      }
    },
    procedures: [
      { 
        id: 'RPAS-GP-001', 
        name: 'RPAS General Procedures', 
        version: 'V25_01',
        flows: [
          'Operation Planning Flow',
          'Kit Preparation Flow', 
          'Weather & NOTAM Review Flow',
          'Team Briefing Flow',
          'Site Setup Flow',
          'RPAS Setup Flow',
          'Records Checklist',
          'Operations Ready Checklist',
          'Power-Up Flow',
          'Take-Off Checklist',
          'Take-Off Flow',
          'During Flight Flow',
          'Pre-Landing Flow',
          'Landing and Battery Swap Flow',
          'Landing and Post-Flight Flow',
          'Pack Up Flow',
          'Team Debrief Flow',
          'Data Debrief Flow',
          'Equipment Management Flow'
        ]
      },
      { 
        id: 'RPAS-EP-001', 
        name: 'RPAS Emergency Procedures', 
        version: 'V25_01',
        emergencies: [
          'Control Station Failure',
          'Ground Equipment Failure',
          'RPAS Failure',
          'Crash Event',
          'Emergency Landing',
          'Fly-Away',
          'Flight Termination',
          'Communication Failures',
          'Command and Control Link Failure',
          'Unintentional Loss of Visual Contact',
          'Inadvertent Airspace Entry'
        ]
      },
      { id: 'RPAS-AP-001', name: 'RPAS Advanced Procedures', version: 'V25_01' },
      { id: 'RPAS-SS-001', name: 'Site Survey & Flight Plan Procedure', version: 'V25_01' }
    ],
    totalPolicies: 12,
    totalProcedures: 4
  },
  
  crm: {
    name: 'Crew Resource Management (CRM)',
    masterDocument: 'Aeria_Crew_Resource_Management_Master_Document',
    description: 'Human factors management aligned with Transport Canada AC 700-042 Appendix A',
    sections: {
      threat_error: {
        name: 'Threat & Error Management',
        policies: [
          { 
            id: 'CRM1013', 
            code: 'CRM1013', 
            name: 'Threat & Error Management', 
            description: 'ATM strategies: Avoid, Trap, Mitigate. Error types and risk area identification'
          }
        ]
      },
      communication: {
        name: 'Communication',
        policies: [
          { 
            id: 'CRM1014', 
            code: 'CRM1014', 
            name: 'Communication', 
            description: 'P.A.C.E. protocol (Probe, Alert, Challenge, Emergency), sender/receiver model, feedback loops'
          }
        ]
      },
      awareness: {
        name: 'Awareness & Monitoring',
        policies: [
          { 
            id: 'CRM1015', 
            code: 'CRM1015', 
            name: 'Situational Awareness', 
            description: 'Three levels of SA: Perception, Comprehension, Projection. SA loss recognition and recovery'
          }
        ]
      },
      human_performance: {
        name: 'Human Performance',
        policies: [
          { 
            id: 'CRM1016', 
            code: 'CRM1016', 
            name: 'Pressure & Stress Management', 
            description: 'Stressor identification, tactical breathing, task rotation'
          },
          { 
            id: 'CRM1017', 
            code: 'CRM1017', 
            name: 'Fatigue Management', 
            description: 'Self-assessment, 15-minute breaks for 2+ hour missions, crew monitoring per CAR 901.19'
          },
          { 
            id: 'CRM1018', 
            code: 'CRM1018', 
            name: 'Workload Management', 
            description: 'Task prioritization, delegation, dynamic workload balancing'
          }
        ]
      },
      decision_leadership: {
        name: 'Decision Making & Leadership',
        policies: [
          { 
            id: 'CRM1019', 
            code: 'CRM1019', 
            name: 'Decision Making Process', 
            description: 'Decision matrices, collaborative decision-making, real-time adjustment'
          },
          { 
            id: 'CRM1020', 
            code: 'CRM1020', 
            name: 'Leadership & Team Building', 
            description: 'Authority and assertiveness balance, group dynamics, professional discipline'
          }
        ]
      },
      automation: {
        name: 'Technology Management',
        policies: [
          { 
            id: 'CRM1021', 
            code: 'CRM1021', 
            name: 'Automation & Technology Management', 
            description: 'Four automation levels, HITL oversight, mode awareness, automation bias prevention'
          }
        ]
      }
    },
    totalPolicies: 9
  }
}

// ============================================
// COR AUDIT ELEMENTS (Provincial Standards)
// Mapped to Aeria Program Structure
// ============================================
export const COR_ELEMENTS = {
  management: {
    id: 'management',
    name: 'Management Leadership & Organizational Commitment',
    weight: 10,
    description: 'Demonstrated leadership commitment through policies, responsibilities, and resource allocation',
    requirements: [
      'Written H&S policy signed by senior management',
      'Defined roles and responsibilities for all levels',
      'Resource allocation for safety programs',
      'Management participation in safety activities',
      'Annual program review and objectives'
    ],
    aeriaEvidence: {
      policies: ['HSE1022', 'HSE1023', 'HSE1024', 'HSE1025', 'HSE1027', 'HSE1032', 'HSE1034', 'HSE1045', 'RPAS1002', 'CRM1020'],
      documents: ['Health & Safety Pledge (signed)', 'Commitment Statement', 'Organizational Structure', 'SMS Framework'],
      activities: ['Annual program review', 'Management safety meetings', 'Resource allocation records']
    }
  },
  hazard_assessment: {
    id: 'hazard_assessment',
    name: 'Hazard Assessment & Control',
    weight: 15,
    description: 'Formal and field-level hazard identification, assessment, and control measures',
    requirements: [
      'Formal hazard assessment process',
      'Field-level hazard assessments (FLHA)',
      'Hierarchy of controls implementation',
      'Risk matrix and scoring methodology',
      'Hazard communication to workers'
    ],
    aeriaEvidence: {
      policies: ['HSE1047', 'HSE1048', 'RPAS1011', 'CRM1013'],
      documents: ['5x5 Risk Matrix', 'Hierarchy of Controls', 'Site Survey template', 'FLHA forms'],
      activities: ['Formal hazard assessments per site', 'FLHA per operation', 'SORA risk assessments', 'TEM during briefings']
    }
  },
  safe_work: {
    id: 'safe_work',
    name: 'Safe Work Practices & Procedures',
    weight: 10,
    description: 'Documented procedures, job safety analyses, and safe work practices',
    requirements: [
      'Written safe work procedures',
      'Job safety analysis for high-risk tasks',
      'PPE program and requirements',
      'Equipment operation procedures',
      'Communication protocols'
    ],
    aeriaEvidence: {
      policies: ['HSE1028', 'HSE1029', 'HSE1033', 'HSE1035', 'HSE1037', 'HSE1039', 'HSE1040', 'HSE1041', 
                 'RPAS1004', 'RPAS1005', 'RPAS1007', 'RPAS1008', 'RPAS1009',
                 'CRM1014', 'CRM1015', 'CRM1016', 'CRM1017', 'CRM1018', 'CRM1019', 'CRM1021'],
      documents: ['RPAS General Procedures (19 flows)', 'RPAS Emergency Procedures (11 scenarios)', 
                  'Communication Protocol', 'P.A.C.E. Strategy', 'PPE Requirements'],
      activities: ['Pre-flight checklists', 'Tailgate briefings', 'Sterile cockpit procedures', 'Team briefings/debriefs']
    }
  },
  training: {
    id: 'training',
    name: 'Training & Competency',
    weight: 15,
    description: 'Worker training, orientation, certification management, and competency verification',
    requirements: [
      'Orientation program for new workers',
      'Job-specific training programs',
      'Certification tracking and renewal',
      'Competency verification process',
      'Training documentation and records'
    ],
    aeriaEvidence: {
      policies: ['HSE1026', 'RPAS1001'],
      documents: ['Certification requirements matrix', 'Training records', 'Competency verification forms'],
      certifications: [
        'Basic/Advanced RPAS Pilot Certificate',
        'Complex Level 1 Declaration',
        'ROC-A (Radio Operator Certificate)',
        'Emergency First Aid & CPR',
        'Wilderness First Aid (remote ops)',
        'CRM Training completion'
      ]
    }
  },
  inspections: {
    id: 'inspections',
    name: 'Inspections',
    weight: 10,
    description: 'Workplace, equipment, and system inspections',
    requirements: [
      'Scheduled workplace inspections',
      'Pre-use equipment inspections',
      'Preventative maintenance program',
      'Inspection documentation',
      'Corrective action tracking'
    ],
    aeriaEvidence: {
      policies: ['HSE1049', 'HSE1050', 'RPAS1003', 'RPAS1012'],
      documents: ['Inspection checklists', 'Maintenance logs', 'Equipment testing sheets', 'CLEAR/LOCKOUT status'],
      schedule: {
        workplace: 'Monthly formal inspections',
        preflight: 'Every operation',
        equipment: 'New/Pre-Op/Post-Maintenance/Annual',
        vehicle: 'Daily pre-use'
      }
    }
  },
  investigations: {
    id: 'investigations',
    name: 'Incident Investigation & Reporting',
    weight: 15,
    description: 'Incident reports, root cause analysis, corrective actions, and regulatory reporting',
    requirements: [
      'Incident reporting procedures',
      'Investigation methodology',
      'Root cause analysis process',
      'Corrective action implementation',
      'Regulatory notification requirements'
    ],
    aeriaEvidence: {
      policies: ['HSE1052', 'RPAS1010'],
      documents: ['Incident Report forms', 'Investigation templates', 'CAPA tracking', 'Reporting matrix'],
      regulatoryReporting: {
        internal: '24 hours for all incidents',
        transportCanada: 'Per CAR 901.49(1) for RPAS incidents',
        worksafebc: 'Serious injuries, fatalities per Workers Compensation Act',
        tsb: 'Immediately for fatalities, serious injuries, collision with manned aircraft'
      }
    }
  },
  emergency: {
    id: 'emergency',
    name: 'Emergency Preparedness & Response',
    weight: 10,
    description: 'Emergency response plans, drills, equipment, and communication',
    requirements: [
      'Written emergency response plan',
      'Emergency drills and exercises',
      'Emergency equipment and resources',
      'Emergency contact information',
      'Post-incident procedures'
    ],
    aeriaEvidence: {
      policies: ['HSE1051', 'RPAS1006'],
      documents: ['Emergency Response Plan', 'RPAS Emergency Procedures (11 scenarios)', 'Emergency contacts', 'Muster point maps'],
      rpasEmergencies: [
        'Control Station Failure',
        'RPAS Failure',
        'Crash Event',
        'Emergency Landing',
        'Fly-Away',
        'Flight Termination',
        'C2 Link Failure',
        'Loss of Visual Contact',
        'Inadvertent Airspace Entry'
      ]
    }
  },
  records: {
    id: 'records',
    name: 'Records & Statistics',
    weight: 10,
    description: 'KPIs, trend analysis, documentation, and performance tracking',
    requirements: [
      'Incident and injury statistics',
      'Leading indicator tracking',
      'Trend analysis and reporting',
      'Record retention procedures',
      'Statistical reporting'
    ],
    aeriaEvidence: {
      policies: ['HSE1053'],
      documents: ['KPI Dashboard', 'Trend reports', 'Form statistics', 'Annual reports'],
      tracking: ['AirData flight logs', 'SiteDocs forms', 'Aeria Ops platform']
    }
  },
  program_admin: {
    id: 'program_admin',
    name: 'Program Administration',
    weight: 5,
    description: 'Document control, reviews, audits, and continuous improvement',
    requirements: [
      'Document control procedures',
      'Annual program review',
      'Internal audit process',
      'Continuous improvement mechanisms',
      'Regulatory compliance tracking'
    ],
    aeriaEvidence: {
      policies: ['HSE1036', 'HSE1038', 'HSE1042', 'HSE1046', 'HSE1053'],
      documents: ['Document control register', 'Audit checklists', 'Management meeting minutes'],
      reviewCycle: 'Annual review for all policies with amendment tracking'
    }
  }
}

// ============================================
// QUANTITATIVE KPI DEFINITIONS
// Comprehensive metrics for safety tracking
// ============================================
export const KPI_DEFINITIONS = {
  // ----------------------------------------
  // LEADING INDICATORS (Proactive measures)
  // ----------------------------------------
  leading: {
    // Training & Competency
    training_completion: {
      name: 'Training Completion Rate',
      description: 'Percentage of required training completed on time',
      target: 95,
      unit: '%',
      category: 'training',
      calculation: '(Completed training / Required training) x 100'
    },
    cert_currency: {
      name: 'Certification Currency Rate',
      description: 'Operators with current certifications',
      target: 100,
      unit: '%',
      category: 'training',
      calculation: '(Operators with valid certs / Total operators) x 100'
    },
    crm_completion: {
      name: 'CRM Training Completion',
      description: 'Crew resource management training completed',
      target: 100,
      unit: '%',
      category: 'training'
    },
    
    // Hazard Assessment
    flha_completion: {
      name: 'FLHA Completion Rate',
      description: 'Field-level hazard assessments completed per operation',
      target: 100,
      unit: '%',
      category: 'hazard_assessment',
      calculation: '(FLHAs completed / Operations conducted) x 100'
    },
    site_survey_completion: {
      name: 'Site Survey Completion',
      description: 'Site surveys completed per new operation area',
      target: 100,
      unit: '%',
      category: 'hazard_assessment'
    },
    sora_completion: {
      name: 'SORA Assessment Completion',
      description: 'SORA risk assessments completed for applicable operations',
      target: 100,
      unit: '%',
      category: 'hazard_assessment'
    },
    
    // Safe Work Practices
    preflight_completion: {
      name: 'Pre-Flight Checklist Completion',
      description: 'Pre-flight checklists completed per flight',
      target: 100,
      unit: '%',
      category: 'safe_work'
    },
    tailgate_completion: {
      name: 'Tailgate Briefing Rate',
      description: 'Tailgate safety briefings conducted per operation',
      target: 100,
      unit: '%',
      category: 'safe_work'
    },
    team_briefing_completion: {
      name: 'Team Briefing Completion',
      description: 'Pre-operation team briefings conducted',
      target: 100,
      unit: '%',
      category: 'safe_work'
    },
    team_debrief_completion: {
      name: 'Team Debrief Completion',
      description: 'Post-operation debriefs conducted',
      target: 100,
      unit: '%',
      category: 'safe_work'
    },
    
    // Inspections
    inspection_completion: {
      name: 'Inspection Completion Rate',
      description: 'Scheduled inspections completed on time',
      target: 100,
      unit: '%',
      category: 'inspections'
    },
    equipment_testing_completion: {
      name: 'Equipment Testing Compliance',
      description: 'Equipment tests completed per schedule',
      target: 100,
      unit: '%',
      category: 'inspections'
    },
    maintenance_compliance: {
      name: 'Maintenance Compliance',
      description: 'Scheduled maintenance completed on time',
      target: 100,
      unit: '%',
      category: 'inspections'
    },
    vehicle_inspection_completion: {
      name: 'Vehicle Inspection Rate',
      description: 'Daily vehicle inspections completed',
      target: 100,
      unit: '%',
      category: 'inspections'
    },
    
    // Proactive Reporting
    near_miss_reporting: {
      name: 'Near Miss Reports',
      description: 'Near misses reported (higher indicates healthy safety culture)',
      target: 5,
      unit: 'per year minimum',
      category: 'investigations'
    },
    safety_observations: {
      name: 'Safety Observations',
      description: 'Proactive safety observations reported',
      target: 12,
      unit: 'per year',
      category: 'investigations'
    },
    hazard_reports: {
      name: 'Hazard Reports Submitted',
      description: 'Worker-submitted hazard reports',
      target: null,
      unit: 'count',
      category: 'hazard_assessment'
    },
    
    // Emergency Preparedness
    emergency_drill_completion: {
      name: 'Emergency Drill Completion',
      description: 'Emergency drills conducted per schedule',
      target: 100,
      unit: '%',
      category: 'emergency'
    },
    
    // Program Administration
    policy_review_completion: {
      name: 'Policy Review Completion',
      description: 'Annual policy reviews completed on time',
      target: 100,
      unit: '%',
      category: 'program_admin'
    },
    employee_acknowledgment: {
      name: 'Employee Acknowledgment Rate',
      description: 'Employees who have signed off on current policies',
      target: 100,
      unit: '%',
      category: 'program_admin'
    }
  },
  
  // ----------------------------------------
  // LAGGING INDICATORS (Reactive measures)
  // ----------------------------------------
  lagging: {
    recordable_incidents: {
      name: 'Recordable Incidents',
      description: 'Total recordable workplace incidents',
      target: 0,
      unit: 'YTD count',
      category: 'investigations'
    },
    lost_time_injuries: {
      name: 'Lost Time Injuries (LTI)',
      description: 'Injuries resulting in time away from work',
      target: 0,
      unit: 'YTD count',
      category: 'investigations'
    },
    days_since_incident: {
      name: 'Days Since Last Recordable Incident',
      description: 'Calendar days since last recordable incident',
      target: 365,
      unit: 'days',
      category: 'investigations'
    },
    trir: {
      name: 'Total Recordable Incident Rate',
      description: 'Incidents per 200,000 hours worked',
      target: 0,
      unit: 'rate',
      category: 'investigations',
      calculation: '(Recordable incidents x 200,000) / Hours worked'
    },
    ltir: {
      name: 'Lost Time Incident Rate',
      description: 'LTIs per 200,000 hours worked',
      target: 0,
      unit: 'rate',
      category: 'investigations'
    },
    first_aid_cases: {
      name: 'First Aid Cases',
      description: 'Incidents requiring first aid treatment',
      target: null,
      unit: 'YTD count',
      category: 'investigations'
    },
    property_damage: {
      name: 'Property Damage Events',
      description: 'Events resulting in property damage',
      target: 0,
      unit: 'YTD count',
      category: 'investigations'
    },
    
    // RPAS-Specific Lagging
    flight_incidents: {
      name: 'Flight Safety Incidents',
      description: 'RPAS-related safety incidents',
      target: 0,
      unit: 'YTD count',
      category: 'investigations'
    },
    fly_away_events: {
      name: 'Fly-Away Events',
      description: 'Loss of aircraft control events',
      target: 0,
      unit: 'YTD count',
      category: 'investigations'
    },
    emergency_landings: {
      name: 'Emergency Landings',
      description: 'Unplanned emergency landing events',
      target: 0,
      unit: 'YTD count',
      category: 'investigations'
    },
    c2_link_losses: {
      name: 'C2 Link Loss Events',
      description: 'Command and control link failures',
      target: 0,
      unit: 'YTD count',
      category: 'investigations'
    },
    airspace_violations: {
      name: 'Airspace Violations',
      description: 'Inadvertent controlled airspace entries',
      target: 0,
      unit: 'YTD count',
      category: 'investigations'
    },
    rth_activations: {
      name: 'RTH Activations',
      description: 'Return-to-home activations (unplanned)',
      target: null,
      unit: 'YTD count',
      category: 'investigations'
    }
  },
  
  // ----------------------------------------
  // CAPA METRICS
  // ----------------------------------------
  capa: {
    capa_closure_rate: {
      name: 'CAPA Closure Rate',
      description: 'Corrective actions closed vs opened',
      target: 90,
      unit: '%',
      category: 'investigations',
      calculation: '(Closed CAPAs / Total CAPAs) x 100'
    },
    capa_on_time: {
      name: 'CAPA On-Time Completion',
      description: 'Corrective actions completed by target date',
      target: 85,
      unit: '%',
      category: 'investigations'
    },
    open_capas: {
      name: 'Open CAPAs',
      description: 'Currently open corrective actions',
      target: 5,
      unit: 'max count',
      category: 'investigations'
    },
    overdue_capas: {
      name: 'Overdue CAPAs',
      description: 'Corrective actions past due date',
      target: 0,
      unit: 'count',
      category: 'investigations'
    },
    effectiveness_verified: {
      name: 'CAPA Effectiveness Verified',
      description: 'Closed CAPAs with verified effectiveness',
      target: 100,
      unit: '%',
      category: 'investigations'
    },
    avg_closure_time: {
      name: 'Average CAPA Closure Time',
      description: 'Average days to close a CAPA',
      target: 30,
      unit: 'days',
      category: 'investigations'
    }
  },
  
  // ----------------------------------------
  // RPAS OPERATIONAL METRICS
  // ----------------------------------------
  rpas: {
    flight_hours: {
      name: 'Total Flight Hours',
      description: 'Cumulative RPAS flight hours',
      target: null,
      unit: 'hours',
      category: 'records'
    },
    flights_completed: {
      name: 'Flights Completed',
      description: 'Total successful flight operations',
      target: null,
      unit: 'count',
      category: 'records'
    },
    mission_success_rate: {
      name: 'Mission Success Rate',
      description: 'Missions completed as planned',
      target: 95,
      unit: '%',
      category: 'records'
    },
    mission_abort_rate: {
      name: 'Safety Mission Abort Rate',
      description: 'Flights aborted for safety reasons (can indicate good decision-making)',
      target: null,
      unit: '%',
      category: 'safe_work'
    },
    equipment_availability: {
      name: 'Equipment Availability',
      description: 'RPAS fleet availability rate',
      target: 95,
      unit: '%',
      category: 'inspections'
    },
    clear_status_rate: {
      name: 'Equipment CLEAR Status Rate',
      description: 'Equipment with CLEAR (not LOCKOUT) status',
      target: 95,
      unit: '%',
      category: 'inspections'
    }
  }
}

// ============================================
// CALCULATE COMPREHENSIVE KPIs FROM DATA
// ============================================
export function calculateSafetyKPIs(data) {
  const { 
    incidents = [], 
    capas = [], 
    forms = [], 
    operators = [], 
    projects = [],
    aircraft = []
  } = data
  
  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)
  
  // ---- Filter YTD incidents ----
  const ytdIncidents = incidents.filter(i => {
    const date = i.dateOccurred?.toDate ? i.dateOccurred.toDate() : new Date(i.dateOccurred)
    return date >= yearStart
  })
  
  const recordableIncidents = ytdIncidents.filter(i => 
    i.type !== 'near_miss' && i.type !== 'observation' && i.type !== 'hazard_report'
  )
  const nearMisses = ytdIncidents.filter(i => i.type === 'near_miss')
  const observations = ytdIncidents.filter(i => i.type === 'observation' || i.type === 'safety_observation')
  const hazardReports = ytdIncidents.filter(i => i.type === 'hazard_report')
  
  // RPAS-specific incidents
  const flightIncidents = ytdIncidents.filter(i => 
    i.category === 'flight' || i.category === 'rpas' || i.category === 'aircraft'
  )
  const flyAways = ytdIncidents.filter(i => i.subtype === 'fly_away' || i.type === 'fly_away')
  const emergencyLandings = ytdIncidents.filter(i => i.subtype === 'emergency_landing')
  const c2LinkLosses = ytdIncidents.filter(i => i.subtype === 'c2_link_loss' || i.subtype === 'communication_failure')
  const airspaceViolations = ytdIncidents.filter(i => i.subtype === 'airspace_violation')
  
  // ---- Days since last recordable ----
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
  
  // ---- Form Analysis ----
  const formCounts = {}
  const completedFormCounts = {}
  forms.forEach(f => {
    const type = f.templateId || 'unknown'
    formCounts[type] = (formCounts[type] || 0) + 1
    if (f.status === 'completed') {
      completedFormCounts[type] = (completedFormCounts[type] || 0) + 1
    }
  })
  
  // Form type helpers
  const getFormRate = (templateIds) => {
    const matchingForms = forms.filter(f => templateIds.some(t => f.templateId?.includes(t)))
    const completed = matchingForms.filter(f => f.status === 'completed')
    return matchingForms.length > 0 ? Math.round((completed.length / matchingForms.length) * 100) : 100
  }
  
  const flhaRate = getFormRate(['flha', 'field_level_hazard'])
  const preflightRate = getFormRate(['preflight', 'pre_flight', 'pre-flight'])
  const tailgateRate = getFormRate(['tailgate'])
  const siteSurveyRate = getFormRate(['site_survey'])
  const inspectionRate = getFormRate(['inspection'])
  const teamBriefingRate = getFormRate(['team_briefing', 'briefing'])
  const teamDebriefRate = getFormRate(['debrief'])
  
  // ---- CAPA Metrics ----
  const openCapas = capas.filter(c => !['closed', 'verified_effective'].includes(c.status))
  const closedCapas = capas.filter(c => ['closed', 'verified_effective'].includes(c.status))
  const overdueCapas = openCapas.filter(c => {
    if (!c.targetDate) return false
    const target = c.targetDate?.toDate ? c.targetDate.toDate() : new Date(c.targetDate)
    return target < now
  })
  const verifiedCapas = capas.filter(c => c.status === 'verified_effective')
  const onTimeCapas = closedCapas.filter(c => c.metrics?.onTime !== false)
  
  const capaClosureRate = capas.length > 0 ? Math.round((closedCapas.length / capas.length) * 100) : 100
  const capaOnTimeRate = closedCapas.length > 0 ? Math.round((onTimeCapas.length / closedCapas.length) * 100) : 100
  const capaEffectivenessRate = closedCapas.length > 0 ? Math.round((verifiedCapas.length / closedCapas.length) * 100) : 100
  
  // ---- Training/Certification Metrics ----
  const operatorsWithValidCerts = operators.filter(o => {
    if (!o.certifications?.length) return false
    return o.certifications.some(cert => {
      if (!cert.expiryDate) return true
      const expiry = cert.expiryDate?.toDate ? cert.expiryDate.toDate() : new Date(cert.expiryDate)
      return expiry > now
    })
  })
  const certCurrencyRate = operators.length > 0 
    ? Math.round((operatorsWithValidCerts.length / operators.length) * 100) 
    : 100
  
  // Check for specific required certifications
  const pilotsWithRPASCert = operators.filter(o => 
    o.certifications?.some(c => c.type?.toLowerCase().includes('rpas') || c.type?.toLowerCase().includes('pilot'))
  )
  const operatorsWithFirstAid = operators.filter(o =>
    o.certifications?.some(c => c.type?.toLowerCase().includes('first aid') || c.type?.toLowerCase().includes('cpr'))
  )
  
  // ---- Equipment Metrics ----
  const activeAircraft = aircraft.filter(a => a.status === 'active' || a.status === 'operational' || a.status === 'CLEAR')
  const lockedOutAircraft = aircraft.filter(a => a.status === 'LOCKOUT' || a.status === 'grounded')
  const equipmentAvailability = aircraft.length > 0 ? Math.round((activeAircraft.length / aircraft.length) * 100) : 100
  const clearStatusRate = aircraft.length > 0 ? Math.round(((aircraft.length - lockedOutAircraft.length) / aircraft.length) * 100) : 100
  
  // ---- Project Metrics ----
  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in_progress')
  const completedProjects = projects.filter(p => p.status === 'completed')
  
  // ---- Calculate Rates ----
  const nearMissRatio = recordableIncidents.length > 0
    ? (nearMisses.length / recordableIncidents.length).toFixed(1)
    : nearMisses.length > 0 ? '∞' : 'N/A'
  
  return {
    // ===== LEADING INDICATORS =====
    leading: {
      // Training & Competency
      trainingCompletionRate: certCurrencyRate, // Proxy using cert currency
      certCurrencyRate,
      pilotsWithRPASCert: pilotsWithRPASCert.length,
      operatorsWithFirstAid: operatorsWithFirstAid.length,
      
      // Hazard Assessment
      flhaCompletionRate: flhaRate,
      siteSurveyCompletionRate: siteSurveyRate,
      soraAssessments: formCounts['sora'] || formCounts['sora_assessment'] || 0,
      
      // Safe Work Practices
      preflightCompletionRate: preflightRate,
      tailgateCompletionRate: tailgateRate,
      teamBriefingRate,
      teamDebriefRate,
      
      // Inspections
      inspectionCompletionRate: inspectionRate,
      equipmentTestingRate: getFormRate(['equipment_test', 'rpas_test']),
      vehicleInspectionRate: getFormRate(['vehicle_inspection']),
      
      // Proactive Reporting
      nearMissReports: nearMisses.length,
      safetyObservations: observations.length,
      hazardReports: hazardReports.length,
      
      // Program Administration
      totalFormsSubmitted: forms.length,
      completedForms: forms.filter(f => f.status === 'completed').length
    },
    
    // ===== LAGGING INDICATORS =====
    lagging: {
      // General Incident Metrics
      daysSinceIncident,
      ytdRecordableIncidents: recordableIncidents.length,
      ytdLostTimeInjuries: ytdIncidents.filter(i => i.lostTime).length,
      ytdFirstAidCases: ytdIncidents.filter(i => i.firstAid).length,
      ytdPropertyDamage: ytdIncidents.filter(i => i.propertyDamage).length,
      
      // RPAS-Specific
      ytdFlightIncidents: flightIncidents.length,
      ytdFlyAways: flyAways.length,
      ytdEmergencyLandings: emergencyLandings.length,
      ytdC2LinkLosses: c2LinkLosses.length,
      ytdAirspaceViolations: airspaceViolations.length,
      
      // Near miss tracking
      ytdNearMisses: nearMisses.length,
      nearMissRatio
    },
    
    // ===== CAPA METRICS =====
    capa: {
      totalCapas: capas.length,
      openCapas: openCapas.length,
      closedCapas: closedCapas.length,
      overdueCapas: overdueCapas.length,
      verifiedCapas: verifiedCapas.length,
      capaClosureRate,
      capaOnTimeRate,
      capaEffectivenessRate
    },
    
    // ===== RPAS OPERATIONAL =====
    rpas: {
      totalAircraft: aircraft.length,
      activeAircraft: activeAircraft.length,
      lockedOutAircraft: lockedOutAircraft.length,
      equipmentAvailability,
      clearStatusRate
    },
    
    // ===== PROGRAM STATISTICS =====
    program: {
      totalOperators: operators.length,
      activeOperators: operators.filter(o => o.status !== 'inactive').length,
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      
      // Form breakdown
      formCounts,
      completedFormCounts,
      
      // Policy counts
      totalPolicies: 53,
      hsePolicies: 32,
      rpasPolicies: 12,
      crmPolicies: 9,
      totalProcedures: 4
    }
  }
}

// ============================================
// CALCULATE AUDIT READINESS SCORE
// ============================================
export function calculateAuditReadinessScore(kpis) {
  let score = 0
  let maxScore = 0
  const breakdown = {}
  
  // Management Leadership (10%)
  maxScore += 10
  const mgmtScore = 10 // Full score for having documented policies
  score += mgmtScore
  breakdown.management = { score: mgmtScore, max: 10, status: 'strong' }
  
  // Hazard Assessment (15%)
  maxScore += 15
  const hazardBase = kpis.leading.flhaCompletionRate || 100
  const hazardScore = (hazardBase / 100) * 15
  score += hazardScore
  breakdown.hazard_assessment = { 
    score: Math.round(hazardScore * 10) / 10, 
    max: 15,
    status: hazardBase >= 95 ? 'strong' : hazardBase >= 80 ? 'adequate' : 'needs_work'
  }
  
  // Safe Work Practices (10%)
  maxScore += 10
  const safeWorkAvg = (
    (kpis.leading.preflightCompletionRate || 100) + 
    (kpis.leading.tailgateCompletionRate || 100) +
    (kpis.leading.teamBriefingRate || 100)
  ) / 3
  const safeWorkScore = (safeWorkAvg / 100) * 10
  score += safeWorkScore
  breakdown.safe_work = { 
    score: Math.round(safeWorkScore * 10) / 10, 
    max: 10,
    status: safeWorkAvg >= 95 ? 'strong' : safeWorkAvg >= 80 ? 'adequate' : 'needs_work'
  }
  
  // Training (15%)
  maxScore += 15
  const trainingBase = kpis.leading.certCurrencyRate || 100
  const trainingScore = (trainingBase / 100) * 15
  score += trainingScore
  breakdown.training = { 
    score: Math.round(trainingScore * 10) / 10, 
    max: 15,
    status: trainingBase >= 95 ? 'strong' : trainingBase >= 80 ? 'adequate' : 'needs_work'
  }
  
  // Inspections (10%)
  maxScore += 10
  const inspectionBase = kpis.leading.inspectionCompletionRate || 100
  const inspectionScore = (inspectionBase / 100) * 10
  score += inspectionScore
  breakdown.inspections = { 
    score: Math.round(inspectionScore * 10) / 10, 
    max: 10,
    status: inspectionBase >= 95 ? 'strong' : inspectionBase >= 80 ? 'adequate' : 'needs_work'
  }
  
  // Investigations (15%)
  maxScore += 15
  let investigationScore = 15
  if (kpis.lagging.ytdRecordableIncidents > 0) investigationScore -= 3
  if (kpis.capa.overdueCapas > 0) investigationScore -= 2
  if (kpis.capa.capaClosureRate < 90) investigationScore -= 2
  investigationScore = Math.max(0, investigationScore)
  score += investigationScore
  breakdown.investigations = { 
    score: Math.round(investigationScore * 10) / 10, 
    max: 15,
    status: investigationScore >= 13 ? 'strong' : investigationScore >= 10 ? 'adequate' : 'needs_work'
  }
  
  // Emergency (10%)
  maxScore += 10
  const emergencyScore = 10 // Full score for documented ERP
  score += emergencyScore
  breakdown.emergency = { score: emergencyScore, max: 10, status: 'strong' }
  
  // Records (10%)
  maxScore += 10
  const recordsBase = Math.min((kpis.leading.totalFormsSubmitted || 0) / 50 * 100, 100)
  const recordsScore = (recordsBase / 100) * 10
  score += recordsScore
  breakdown.records = { 
    score: Math.round(recordsScore * 10) / 10, 
    max: 10,
    status: recordsBase >= 80 ? 'strong' : recordsBase >= 50 ? 'adequate' : 'needs_work'
  }
  
  // Program Admin (5%)
  maxScore += 5
  const adminScore = 5 // Full score for documented procedures
  score += adminScore
  breakdown.program_admin = { score: adminScore, max: 5, status: 'strong' }
  
  return {
    totalScore: Math.round((score / maxScore) * 100),
    breakdown,
    maxScore: 100,
    grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'
  }
}

// ============================================
// GENERATE COMPREHENSIVE COR REPORT
// ============================================
export async function generateCORReport(data, options = {}) {
  const {
    branding = null,
    includeAppendices = true,
    reportPeriod = `${new Date().getFullYear()}`
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
    projectCode: `COR-${reportPeriod}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
    branding
  })
  
  await pdf.init()
  pdf.addCoverPage()
  
  // ============================================
  // EXECUTIVE SUMMARY
  // ============================================
  pdf.addNewSection('1. Executive Summary')
  
  pdf.addParagraph(`This Health, Safety & Environment Program Report documents Aeria Solutions Ltd.'s comprehensive safety management system for Certificate of Recognition (COR) audit purposes. The program integrates workplace safety, RPAS flight operations safety, and human factors management through 53 documented policies, 4 detailed procedures, and 3 master manuals.`)
  
  pdf.addSpacer(5)
  
  pdf.addSubsectionTitle('Program Scope')
  pdf.addTable(
    ['Domain', 'Policies', 'Procedures', 'Focus'],
    [
      ['Health, Safety & Environment', '32', '—', 'BC OHS Regulation, WorkSafeBC compliance'],
      ['RPAS Operations', '12', '4', 'CARs Part IX, SORA methodology'],
      ['Crew Resource Management', '9', '—', 'Human factors, TC AC 700-042'],
      ['Total', '53', '4', 'Integrated safety management']
    ]
  )
  
  pdf.addSpacer(5)
  
  pdf.addSubsectionTitle('Audit Readiness Score')
  pdf.addKPIRow([
    { label: 'Overall Score', value: `${auditScore.totalScore}%` },
    { label: 'Grade', value: auditScore.grade },
    { label: 'Days Incident-Free', value: kpis.lagging.daysSinceIncident ?? '∞' },
    { label: 'Open CAPAs', value: kpis.capa.openCapas }
  ])
  
  // ============================================
  // SECTION 2: MANAGEMENT COMMITMENT
  // ============================================
  pdf.addNewSection('2. Management Leadership & Commitment')
  
  pdf.addParagraph(`Aeria Solutions demonstrates management commitment through documented policies, defined responsibilities, and active safety program participation.`)
  
  pdf.addSubsectionTitle('2.1 Foundational Policies')
  pdf.addTable(
    ['Policy ID', 'Name', 'Description'],
    [
      ['HSE1022', 'Health & Safety Pledge', 'Zero harm commitment and proactive safety culture'],
      ['HSE1023', 'Commitment Statement', 'Leadership accountability and resource allocation'],
      ['HSE1024', 'Workers Rights', 'Right to know, participate, and refuse unsafe work'],
      ['HSE1025', 'Safety Management System', 'ISO 45001-aligned SMS framework'],
      ['HSE1027', 'Health & Safety Policy', 'Foundational H&S policy statement']
    ]
  )
  
  pdf.addSubsectionTitle('2.2 Organizational Structure')
  pdf.addBulletList([
    'Accountable Executive: Overall safety program accountability',
    'Operations Manager: Day-to-day safety implementation',
    'Maintenance Manager: Equipment airworthiness and maintenance',
    'HSE Representatives: Worker safety support and reporting',
    'Pilot in Command (PIC): Flight operation safety authority',
    'Visual Observer (VO): Situational awareness support'
  ])
  
  // ============================================
  // SECTION 3: HAZARD ASSESSMENT
  // ============================================
  pdf.addNewSection('3. Hazard Assessment & Control')
  
  pdf.addParagraph(`Hazard identification and control is implemented through formal assessments, field-level hazard assessments (FLHA), SORA risk assessments, and CRM threat and error management.`)
  
  pdf.addSubsectionTitle('3.1 Assessment Types')
  pdf.addTable(
    ['Assessment Type', 'Frequency', 'Policy Reference'],
    [
      ['Formal Hazard Assessment', 'Per site/major change', 'HSE1047'],
      ['Field-Level Hazard Assessment (FLHA)', 'Every operation', 'HSE1047'],
      ['Site Survey', 'Per operation area', 'RPAS1011'],
      ['SORA Risk Assessment', 'Per flight operation', 'RPAS Operations Manual'],
      ['Threat & Error Management (TEM)', 'Every briefing', 'CRM1013']
    ]
  )
  
  pdf.addSubsectionTitle('3.2 Risk Matrix')
  pdf.addParagraph(`5x5 risk matrix used for hazard scoring. Controls applied using hierarchy: Elimination > Substitution > Engineering > Administrative > PPE`)
  
  pdf.addSubsectionTitle('3.3 Performance')
  pdf.addKPIRow([
    { label: 'FLHA Completion', value: `${kpis.leading.flhaCompletionRate}%` },
    { label: 'Site Surveys', value: `${kpis.leading.siteSurveyCompletionRate}%` },
    { label: 'Hazard Reports', value: kpis.leading.hazardReports }
  ])
  
  // ============================================
  // SECTION 4: SAFE WORK PRACTICES
  // ============================================
  pdf.addNewSection('4. Safe Work Practices & Procedures')
  
  pdf.addParagraph(`Comprehensive safe work procedures cover all phases of RPAS operations, supported by CRM protocols for human factors management.`)
  
  pdf.addSubsectionTitle('4.1 RPAS General Procedures (RPAS-GP-001)')
  pdf.addBulletList([
    'Operation Planning Flow - Documentation and pre-departure preparation',
    'Kit Preparation Flow - Equipment, batteries, software readiness',
    'Weather & NOTAM Review Flow - Meteorological and airspace assessment',
    'Team Briefing Flow - Objectives, roles, safety, conditions alignment',
    'Site Setup Flow - Area inspection, perimeter, comms, emergency gear',
    'RPAS Setup Flow - Assembly, calibration, system checks',
    'Power-Up Flow - Ground control and RPAS power sequence',
    'Take-Off Checklist - Final verification before flight',
    'During Flight Flow - Active monitoring and communication',
    'Landing and Post-Flight Flow - Safe recovery and equipment care',
    'Team Debrief Flow - Post-operation review and lessons learned'
  ])
  
  pdf.addSubsectionTitle('4.2 CRM Protocols')
  pdf.addTable(
    ['Protocol', 'Policy', 'Application'],
    [
      ['P.A.C.E. Escalation', 'CRM1014', 'Probe → Alert → Challenge → Emergency'],
      ['Situational Awareness', 'CRM1015', 'Perception → Comprehension → Projection'],
      ['Workload Management', 'CRM1018', 'Task prioritization and delegation'],
      ['Decision Making', 'CRM1019', 'Structured decision matrices']
    ]
  )
  
  pdf.addSubsectionTitle('4.3 Performance')
  pdf.addKPIRow([
    { label: 'Pre-Flight Completion', value: `${kpis.leading.preflightCompletionRate}%` },
    { label: 'Tailgate Briefings', value: `${kpis.leading.tailgateCompletionRate}%` },
    { label: 'Team Briefings', value: `${kpis.leading.teamBriefingRate}%` }
  ])
  
  // ============================================
  // SECTION 5: TRAINING & COMPETENCY
  // ============================================
  pdf.addNewSection('5. Training & Competency')
  
  pdf.addParagraph(`All personnel receive comprehensive training covering safety procedures, RPAS operations, and crew resource management.`)
  
  pdf.addSubsectionTitle('5.1 Required Certifications (RPAS1001)')
  pdf.addTable(
    ['Certification', 'Requirement', 'Renewal'],
    [
      ['RPAS Pilot Certificate', 'Basic/Advanced/Complex as required', 'Per TC requirements'],
      ['ROC-A', 'For aeronautical radio operations', '5 years'],
      ['Emergency First Aid & CPR', 'All crew', '3 years'],
      ['Wilderness First Aid', 'Remote operations', '3 years'],
      ['CRM Training', 'All flight crew', 'Annual refresher']
    ]
  )
  
  pdf.addSubsectionTitle('5.2 Competency Status')
  pdf.addKPIRow([
    { label: 'Certification Currency', value: `${kpis.leading.certCurrencyRate}%` },
    { label: 'Total Operators', value: kpis.program.totalOperators },
    { label: 'With RPAS Cert', value: kpis.leading.pilotsWithRPASCert },
    { label: 'With First Aid', value: kpis.leading.operatorsWithFirstAid }
  ])
  
  // ============================================
  // SECTION 6: INSPECTIONS
  // ============================================
  pdf.addNewSection('6. Inspections & Maintenance')
  
  pdf.addSubsectionTitle('6.1 Inspection Schedule')
  pdf.addTable(
    ['Inspection Type', 'Frequency', 'Policy'],
    [
      ['Workplace Inspection', 'Monthly', 'HSE1049'],
      ['Pre-Flight Inspection', 'Every operation', 'RPAS1003'],
      ['Equipment Testing', 'New/Pre-Op/Post-Maintenance/Annual', 'RPAS1012'],
      ['Vehicle Pre-Use', 'Daily', 'HSE1029'],
      ['PPE Inspection', 'Per use', 'HSE1028']
    ]
  )
  
  pdf.addSubsectionTitle('6.2 Equipment Testing (RPAS1012)')
  pdf.addParagraph(`RPAS equipment uses CLEAR/LOCKOUT status system. Equipment must pass all test procedures before operational use.`)
  
  pdf.addKPIRow([
    { label: 'Inspection Rate', value: `${kpis.leading.inspectionCompletionRate}%` },
    { label: 'Equipment Available', value: `${kpis.rpas.equipmentAvailability}%` },
    { label: 'CLEAR Status', value: `${kpis.rpas.clearStatusRate}%` },
    { label: 'Locked Out', value: kpis.rpas.lockedOutAircraft }
  ])
  
  // ============================================
  // SECTION 7: INCIDENT INVESTIGATION
  // ============================================
  pdf.addNewSection('7. Incident Investigation & Reporting')
  
  pdf.addSubsectionTitle('7.1 Reporting Requirements')
  pdf.addTable(
    ['Authority', 'Timeframe', 'Trigger'],
    [
      ['Internal', '24 hours', 'All incidents and near misses'],
      ['Transport Canada', 'Per CAR 901.49(1)', 'RPAS incidents as specified'],
      ['WorkSafeBC', 'Immediately', 'Serious injuries, fatalities'],
      ['TSB', 'Immediately', 'Fatalities, serious injury, manned aircraft collision']
    ]
  )
  
  pdf.addSubsectionTitle('7.2 Incident Statistics')
  pdf.addTable(
    ['Metric', 'YTD', 'Target', 'Status'],
    [
      ['Recordable Incidents', kpis.lagging.ytdRecordableIncidents, '0', kpis.lagging.ytdRecordableIncidents === 0 ? 'Met' : 'Not Met'],
      ['Lost Time Injuries', kpis.lagging.ytdLostTimeInjuries, '0', kpis.lagging.ytdLostTimeInjuries === 0 ? 'Met' : 'Not Met'],
      ['Flight Incidents', kpis.lagging.ytdFlightIncidents, '0', kpis.lagging.ytdFlightIncidents === 0 ? 'Met' : 'Not Met'],
      ['Fly-Away Events', kpis.lagging.ytdFlyAways, '0', kpis.lagging.ytdFlyAways === 0 ? 'Met' : 'Not Met'],
      ['Near Miss Reports', kpis.lagging.ytdNearMisses, '≥5', kpis.lagging.ytdNearMisses >= 5 ? 'Met' : 'Below Target'],
      ['Days Since Incident', kpis.lagging.daysSinceIncident ?? '∞', '≥90', (kpis.lagging.daysSinceIncident === null || kpis.lagging.daysSinceIncident >= 90) ? 'Met' : 'Not Met']
    ]
  )
  
  pdf.addSubsectionTitle('7.3 CAPA Performance')
  pdf.addKPIRow([
    { label: 'Open CAPAs', value: kpis.capa.openCapas },
    { label: 'Overdue', value: kpis.capa.overdueCapas },
    { label: 'Closure Rate', value: `${kpis.capa.capaClosureRate}%` },
    { label: 'On-Time Rate', value: `${kpis.capa.capaOnTimeRate}%` }
  ])
  
  // ============================================
  // SECTION 8: EMERGENCY RESPONSE
  // ============================================
  pdf.addNewSection('8. Emergency Preparedness & Response')
  
  pdf.addSubsectionTitle('8.1 RPAS Emergency Procedures (RPAS-EP-001)')
  pdf.addBulletList([
    'Control Station Failure - Backup procedures and RTH activation',
    'Ground Equipment Failure - Safe shutdown and isolation',
    'RPAS Failure - Emergency landing or flight termination',
    'Crash Event - Scene preservation, notification, investigation',
    'Fly-Away - Tracking, notification, recovery procedures',
    'Flight Termination - Controlled termination protocols',
    'Communication Failures - Backup communication, lost link procedures',
    'C2 Link Failure - Automated failsafe activation',
    'Loss of Visual Contact - Recovery procedures',
    'Inadvertent Airspace Entry - ATC notification, immediate exit'
  ])
  
  pdf.addSubsectionTitle('8.2 Emergency Contacts')
  pdf.addTable(
    ['Service', 'Contact'],
    [
      ['Emergency Services', '911'],
      ['WorkSafeBC (24hr)', '1-888-621-7233'],
      ['Poison Control BC', '1-800-567-8911'],
      ['Transport Canada Civil Aviation', '1-888-463-0521'],
      ['NAV CANADA', '1-866-992-7433'],
      ['TSB Occurrence Reporting', '1-819-994-3741']
    ]
  )
  
  // ============================================
  // SECTION 9: RECORDS & STATISTICS
  // ============================================
  pdf.addNewSection('9. Records & Statistics')
  
  pdf.addSubsectionTitle('9.1 Leading Indicators')
  pdf.addTable(
    ['Indicator', 'Target', 'Actual', 'Status'],
    [
      ['Training/Cert Currency', '95%', `${kpis.leading.certCurrencyRate}%`, kpis.leading.certCurrencyRate >= 95 ? 'Met' : 'Not Met'],
      ['FLHA Completion', '100%', `${kpis.leading.flhaCompletionRate}%`, kpis.leading.flhaCompletionRate >= 100 ? 'Met' : 'Not Met'],
      ['Pre-Flight Completion', '100%', `${kpis.leading.preflightCompletionRate}%`, kpis.leading.preflightCompletionRate >= 100 ? 'Met' : 'Not Met'],
      ['Inspection Completion', '100%', `${kpis.leading.inspectionCompletionRate}%`, kpis.leading.inspectionCompletionRate >= 100 ? 'Met' : 'Not Met'],
      ['Near Miss Reports', '≥5/year', kpis.leading.nearMissReports, kpis.leading.nearMissReports >= 5 ? 'Met' : 'Review'],
      ['Safety Observations', '≥12/year', kpis.leading.safetyObservations, kpis.leading.safetyObservations >= 12 ? 'Met' : 'Review']
    ]
  )
  
  pdf.addSubsectionTitle('9.2 Form Statistics')
  if (Object.keys(kpis.program.formCounts).length > 0) {
    const formRows = Object.entries(kpis.program.formCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([type, count]) => [
        type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count,
        kpis.program.completedFormCounts[type] || 0
      ])
    
    pdf.addTable(['Form Type', 'Total', 'Completed'], formRows)
  }
  
  // ============================================
  // SECTION 10: PROGRAM ADMINISTRATION
  // ============================================
  pdf.addNewSection('10. Program Administration')
  
  pdf.addSubsectionTitle('10.1 Document Control')
  pdf.addBulletList([
    'All policies version controlled with revision history',
    'Annual review cycle with documented amendments',
    'Electronic distribution through Aeria Ops platform',
    'Employee acknowledgment tracking',
    'Records retained per regulatory requirements'
  ])
  
  pdf.addSubsectionTitle('10.2 Regulatory Compliance')
  pdf.addBulletList([
    'BC Workers Compensation Act and OHS Regulation',
    'Canadian Aviation Regulations Part IX (RPAS)',
    'Transport Canada Advisory Circulars',
    'JARUS SORA 2.5 methodology',
    'ISO 45001:2018 principles'
  ])
  
  pdf.addSubsectionTitle('10.3 Audit Element Summary')
  const elementRows = Object.entries(auditScore.breakdown).map(([key, data]) => {
    const element = COR_ELEMENTS[key]
    return [
      element?.name || key,
      `${data.score}/${data.max}`,
      `${Math.round((data.score / data.max) * 100)}%`,
      data.status === 'strong' ? 'Strong' : data.status === 'adequate' ? 'Adequate' : 'Needs Work'
    ]
  })
  pdf.addTable(['COR Element', 'Score', 'Percentage', 'Status'], elementRows)
  
  // ============================================
  // APPENDICES
  // ============================================
  if (includeAppendices) {
    // Appendix A: Complete Policy Index
    pdf.addNewSection('Appendix A: Complete Policy Index')
    
    pdf.addSubsectionTitle('HSE Policies (32)')
    const allHSEPolicies = Object.values(PROGRAM_STRUCTURE.hse.sections).flatMap(s => s.policies)
    const hseRows = allHSEPolicies.map(p => [p.code, p.name])
    pdf.addTable(['Code', 'Policy Name'], hseRows)
    
    pdf.addSubsectionTitle('RPAS Operations Policies (12)')
    const allRPASPolicies = Object.values(PROGRAM_STRUCTURE.rpas.sections).flatMap(s => s.policies)
    const rpasRows = allRPASPolicies.map(p => [p.code, p.name])
    pdf.addTable(['Code', 'Policy Name'], rpasRows)
    
    pdf.addSubsectionTitle('CRM Policies (9)')
    const allCRMPolicies = Object.values(PROGRAM_STRUCTURE.crm.sections).flatMap(s => s.policies)
    const crmRows = allCRMPolicies.map(p => [p.code, p.name])
    pdf.addTable(['Code', 'Policy Name'], crmRows)
    
    pdf.addSubsectionTitle('Procedures Documents (4)')
    const procRows = PROGRAM_STRUCTURE.rpas.procedures.map(p => [p.id, p.name, p.version])
    pdf.addTable(['Code', 'Name', 'Version'], procRows)
    
    // Appendix B: Operator Registry
    if (operators.length > 0) {
      pdf.addNewSection('Appendix B: Operator Registry')
      const opRows = operators.slice(0, 25).map(op => [
        op.name || `${op.firstName || ''} ${op.lastName || ''}`.trim() || 'Unknown',
        op.role || 'Operator',
        op.pilotCertificate || 'N/A',
        (op.certifications || []).slice(0, 2).map(c => c.type || c.name || c).join(', ') || 'None'
      ])
      pdf.addTable(['Name', 'Role', 'Pilot Cert', 'Key Certifications'], opRows)
    }
    
    // Appendix C: Equipment Registry
    if (aircraft.length > 0) {
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
  }
  
  // ============================================
  // CERTIFICATION PAGE
  // ============================================
  pdf.addNewSection('Certification & Approval')
  
  pdf.addParagraph(`I certify that the information contained in this report accurately represents the Health, Safety & Environment program of Aeria Solutions Ltd. as of the date indicated. This program encompasses 53 documented policies, 4 detailed procedures, and supporting documentation as described herein.`)
  
  pdf.addSpacer(20)
  
  pdf.addSignatureBlock([
    { role: 'Health & Safety Manager', name: '' },
    { role: 'Operations Manager', name: '' },
    { role: 'Accountable Executive', name: '' }
  ])
  
  pdf.addSpacer(15)
  
  pdf.addParagraph(`Report Generated: ${new Date().toLocaleDateString('en-CA')}`)
  pdf.addParagraph(`Transport Canada Company File: 930355`)
  
  return pdf
}

// ============================================
// EXPORT FUNCTION
// ============================================
export async function exportCORReport(data, options = {}) {
  const pdf = await generateCORReport(data, options)
  const filename = `Aeria_COR_Report_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(filename)
  return filename
}

export default {
  PROGRAM_STRUCTURE,
  COR_ELEMENTS,
  KPI_DEFINITIONS,
  calculateSafetyKPIs,
  calculateAuditReadinessScore,
  generateCORReport,
  exportCORReport
}
