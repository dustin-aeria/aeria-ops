/**
 * Policy Content Data
 * Full content extracted from Aeria policy PDF documents
 *
 * Structure matches the standard Aeria policy format:
 * 1. Document Control
 * 2. Purpose & Scope
 * 3. Definitions & References
 * 4. Policy Statement
 * 5. Procedures
 * 6. Roles & Responsibilities
 * 7. Monitoring, Compliance & Enforcement
 * 8. Sign-Off & Acknowledgment
 *
 * @location src/data/policyContent.js
 */

export const POLICY_CONTENT = {
  // ============================================
  // RPAS OPERATIONS POLICIES (1001-1012)
  // ============================================

  '1001': {
    number: '1001',
    title: 'RPAS Operations - Team Competencies Policy',
    category: 'rpas',
    description: 'Defines the minimum competencies required for all crew members engaged in RPAS operations, ensuring safe, compliant, and professional operations.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations, Part IX', 'CAR 901.19'],
    keywords: ['competencies', 'certification', 'training', 'crew', 'pilot', 'recency'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To define the minimum competencies required for all crew members engaged in Remotely Piloted Aircraft Systems (RPAS) operations with Aeria Solutions. This ensures safe, compliant, and professional operations in line with Canadian Aviation Regulations and internal company standards.

Scope:
This policy applies to all RPAS crew members, including Pilots in Command (PIC), Visual Observers (VO), Operations Managers, Maintenance Managers, subcontractors, and trainees operating under Aeria Solutions.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• RPAS – Remotely Piloted Aircraft Systems
• PIC – Pilot in Command
• VO – Visual Observer

References:
• Canadian Aviation Regulations, Part IX`
      },
      {
        title: 'Policy Statement',
        content: `All Aeria RPAS operations shall only be conducted by competent crew members who meet minimum training, licensing, and certification standards, and who demonstrate ongoing compliance with fitness-for-duty requirements.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Verify Crew Eligibility:
• Confirm crew member is ≥18 years of age.
• Confirm compliance with Aeria policies and procedures.

Fitness for Duty:
• Crew must meet fatigue and fitness requirements under CAR 901.19 (minimum rest periods, alcohol/drug restrictions, mental health readiness).

Certification Verification:
• Non-pilots: Basic RPAS Operator Certificate.
• Pilots: Advanced RPAS Operator Certificates at minimum (Complex level 1 preferred and when required) and current recency requirements.
• ROC-A certification for any crew responsible for aeronautical communications.
• Emergency First Aid & CPR for all crew; Wilderness First Aid required for remote ops.

Practice Requirements:
• Minimum 25 minutes of airtime per month logged in Aeria's AirData system.
• At least 5 take-offs/landings per month.
• Flight logs must be synced to Aeria AirData for validation.

Tools, Forms, or Checklists:
• AirData platform (flight logs, maintenance, recurrency tracking)
• RPAS Operations Checklists
• HSE Forms

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX
• First Aid certification valid and accessible at all work sites
• Adherence to fatigue management and alcohol/drug-free policies

Reporting or Escalation:
• Crew who do not meet competency requirements must be reported to the Operations Manager.
• Non-compliance escalates to the Accountable Executive for review and corrective action.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure all crew meet certification and practice requirements.
• Allocate resources for training, recurrency, and health checks.

Supervisors:
• Verify compliance prior to each operation.
• Maintain certification records.
• Conduct periodic audits of AirData logs.

Staff:
• Maintain certifications and logbooks.
• Report any deficiencies or lapsed qualifications immediately.
• Participate in training, practice, and recertification.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Monthly audit of AirData flight logs.
• Quarterly review of training and certification records.
• Annual performance review, including recurrency validation.

Consequences for Non-Compliance:
• Removal from active duty until compliance is restored.
• Mandatory remedial training or recertification.
• Repeated non-compliance may result in termination of the operational role.

Reporting Obligations:
• Compliance with Transport Canada RPAS Recency reporting requirements.
• Submission of certification copies for internal audit.`
      }
    ]
  },

  '1002': {
    number: '1002',
    title: 'RPAS Operations - Roles & Responsibilities Policy',
    category: 'rpas',
    description: 'Defines the specific responsibilities of all roles involved in RPAS operations, ensuring compliance with Canadian Aviation Regulations and accountability across all mission phases.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations, Part IX'],
    keywords: ['roles', 'responsibilities', 'PIC', 'VO', 'operations manager', 'accountability'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To define the specific responsibilities of all roles involved in Aeria Solutions' RPAS operations, ensuring compliance with Canadian Aviation Regulations (CARs), safe operational practices, and accountability across all mission phases.

Scope:
This policy applies to all Aeria Solutions RPAS personnel, including Accountable Executives, Operations Managers, Maintenance Managers, Pilots in Command (PIC), and Visual Observers (VO), as well as subcontractors working under Aeria Solutions' operational control.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• RPAS – Remotely Piloted Aircraft Systems
• PIC – Pilot in Command
• VO – Visual Observer
• SFOC – Special Flight Operations Certificate

References:
• Canadian Aviation Regulations, Part IX`
      },
      {
        title: 'Policy Statement',
        content: `Aeria Solutions requires that all personnel involved in RPAS operations fulfill clearly defined roles and responsibilities. These responsibilities ensure compliance with Transport Canada regulations, operational safety, and company standards.`
      },
      {
        title: 'Procedures',
        content: `Tools, Forms, or Checklists:
• Operations Planning Documents (CONOPS, Site Survey, SORA, Flight Plan)
• AirData logs (pilot recency, maintenance)
• Safety Checklists (Take-off, Landing, Emergency Procedures, etc.)

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX
• Adherence to Aeria Solutions Policies and Procedures
• All personnel must complete relevant orientation, training, and recertification

Reporting or Escalation:
• Any failure to meet responsibilities must be reported to the Operations Manager.
• Serious breaches (e.g., regulatory non-compliance, safety risks) escalate to the Accountable Executive.
• Incident/accident reporting must follow the Aeria Operations Manual and HSE protocols.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Accountable Executive:
• Holds ultimate accountability for legal compliance of all RPAS activities.
• Confirms operational feasibility and regulatory permissions.
• Ensures personnel are properly licensed and certified.
• Oversees maintenance, storage, inventory, and tracking of equipment.
• Submits or approves flight requests for advanced and special operations.
• Maintains communication with Transport Canada and ensures insurance coverage.

Operations Manager:
• Plans and manages daily operations, logistics, and personnel deployment.
• Ensures compliance with safety regulations and Aeria procedures.
• Liaises with clients and stakeholders.
• Briefs crew on operational planning documents.
• Validates maintenance compliance and equipment readiness.
• Conducts incident and accident investigations.

Maintenance Manager:
• Manages maintenance scheduling and ensures compliance with manufacturer and regulatory standards.
• Maintains accurate maintenance logs and equipment records.
• Locks out non-compliant or damaged equipment.
• Ensures RPAS airworthiness before field deployment.
• Coordinates with manufacturers for repairs and updates.

Pilot in Command (PIC):
• Holds Advanced RPAS Operator Certificate and ROC-A license.
• Ensures personal compliance with recency and training requirements.
• Maintains fitness for duty in accordance with CAR 901.19.
• Has sole responsibility for RPAS safety while armed or in flight.
• Monitors RPAS performance and maintains constant communication with VO.
• Adheres to all operational planning documents and SOPs.

Visual Observer (VO):
• Maintains continuous VLOS (Visual Line of Sight) with RPAS.
• Monitors airspace for hazards and communicates risks to PIC.
• Maintains a sterile cockpit environment for the PIC.
• Supports situational awareness and flight safety.
• Participates in pre-flight and post-flight briefings and debriefings.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Internal audits of flight logs, training, and maintenance records.
• Regular operational reviews and crew performance assessments.
• Annual HSE and RPAS program review (AGM)

Consequences for Non-Compliance:
• Removal from operational duty.
• Mandatory retraining or recertification.
• Progressive discipline up to contract termination for repeated or serious violations.

Reporting Obligations:
• All operations must be logged in AirData and retained for 24 months.
• Mandatory reporting to Transport Canada and/or the Transportation Safety Board as required by law.`
      }
    ]
  },

  '1003': {
    number: '1003',
    title: 'RPAS Operations - Airworthiness & Maintenance Policy',
    category: 'rpas',
    description: 'Ensures all RPAS operated by Aeria Solutions remain airworthy, safe, and fully compliant with Transport Canada regulations and manufacturer specifications.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Maintenance Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations Part IX', 'CAR 901.02', 'CAR 901.48', 'CAR 901.76'],
    keywords: ['airworthiness', 'maintenance', 'inspection', 'AirData', 'equipment'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To ensure all Remotely Piloted Aircraft Systems (RPAS) operated by Aeria Solutions remain airworthy, safe, and fully compliant with Transport Canada regulations and manufacturer specifications.

Scope:
This policy applies to all RPAS, associated payloads, ground control stations, and batteries used in Aeria Solutions operations. It applies to the Accountable Executive, Maintenance Manager, Operations Manager, Pilots in Command (PIC), and all crew members performing inspections or reporting defects.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Airworthiness: Condition in which an RPAS is fit for safe operation in accordance with CAR Part IX.
• Pre-Operation Inspection: Checks are completed before an RPAS is deployed in the field.
• Scheduled Maintenance: Manufacturer-recommended or system-tracked service requirements.
• AirData: Digital tracking system used by Aeria Solutions to manage flight logs, maintenance, and battery records.

References:
• Canadian Aviation Regulations Part IX.
• Manufacturer maintenance manuals.`
      },
      {
        title: 'Policy Statement',
        content: `Aeria Solutions will not operate any RPAS that does not meet Transport Canada's recognition requirements or manufacturer safety declarations. All RPAS equipment must be regularly inspected, maintained, and documented in AirData to ensure operational safety, compliance, and reliability.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Registration Marking:
• All RPAS equipment is registered in compliance with CAR 901.02, ensuring regulatory adherence and traceability.
• All RPASs must carry a visible registration marking affixed to a permanent part of the RPAS's structure.
• Any faded or damaged markings must be restored to compliant standards immediately.

Pre-Operation Maintenance:
• Inspect RPAS for visible damage (nicks, dents, battery swelling).
• Verify that the firmware/software is current.
• Confirm maintenance checks logged in AirData.

Pre-Flight Inspection:
• Conduct tactile and visual inspection of airframe, motors, payloads, and batteries.
• Ensure registration markings are visible and legible (CAR 901.02).

Post-Flight Inspection:
• Re-inspect RPAS and components for damage after each flight.
• Log findings and corrective actions in AirData.

Scheduled Maintenance:
• The Maintenance Manager ensures service is completed per the manufacturer's schedule.
• Track via AirData, including battery cycles, service intervals, and alerts.

Repairs & Lockouts:
• If damage or malfunction is detected, the RPAS must be locked out until inspected and cleared by the Maintenance Manager.
• Repairs coordinated with the manufacturer or certified service providers.

Tools, Forms, or Checklists:
• AirData maintenance logs
• Pre-flight / post-flight checklists
• Manufacturer maintenance manuals

Safety/Compliance/Quality Requirements:
• Compliance with CARs (901.02, 901.48, 901.76)
• AirData records must be maintained for a minimum 24 months
• RPAS cannot be operated outside of 80% of the manufacturer's specified limits

Reporting or Escalation:
• Defects reported to the Maintenance Manager immediately
• Unsafe equipment must be grounded until cleared
• Safety issues escalated to the Accountable Executive if unresolved`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management (Accountable Executive & Operations Manager):
• Ensure resources, tools, and oversight are in place to maintain airworthiness.
• Approve policy amendments and verify compliance.

Maintenance Manager:
• Schedule and log all maintenance.
• Lock out non-compliant equipment.
• Ensure firmware/software are current.

Pilot in Command:
• Conduct pre-flight and post-flight inspections.
• Confirm equipment readiness before flight.

Crew Members:
• Follow inspection checklists.
• Report defects and anomalies immediately.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Monthly AirData audits by Maintenance Manager.
• Quarterly operational compliance checks by the Operations Manager.
• Annual policy review at AGM.

Consequences for Non-Compliance:
• Immediate grounding of non-compliant RPAS.
• Suspension of personnel from operations until retrained or recertified.
• Disciplinary action for repeated failures.

Reporting Obligations:
• All maintenance records must be retained for 24 months.
• Report significant failures or defects to Transport Canada if required under CAR 901.49.`
      }
    ]
  },

  '1004': {
    number: '1004',
    title: 'RPAS Operations - Personal Protective Equipment Policy',
    category: 'rpas',
    description: 'Ensures the safety and well-being of all personnel by mandating the provision, correct use, inspection, and maintenance of Personal Protective Equipment (PPE).',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC OHS Regulation, Part 8', 'CSA and ANSI Standards for PPE'],
    keywords: ['PPE', 'safety', 'equipment', 'protection', 'hazards'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To ensure the safety and well-being of all Aeria Solutions personnel by mandating the provision, correct use, inspection, and maintenance of Personal Protective Equipment (PPE). PPE serves as the last line of defense against workplace hazards when elimination, substitution, engineering, or administrative controls cannot fully mitigate risk.

Scope:
This policy applies to all employees, contractors, subcontractors, and visitors engaged in operations at Aeria Solutions worksites, including RPAS operations, fieldwork, office activities, and client sites.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• PPE: Equipment worn to minimize exposure to hazards, including eye, face, hand, head, hearing, respiratory, and body protection.
• Fit for Duty: PPE must be suitable for the task, properly fitted, and in good working condition.
• Specialized PPE: Task-specific equipment such as fall protection, chemical-resistant gear, or respiratory protection.

References:
• BC OHS Regulation, Part 8 – Personal Protective Equipment
• CSA and ANSI Standards for PPE`
      },
      {
        title: 'Policy Statement',
        content: `Aeria Solutions will provide, enforce, and maintain appropriate PPE for all tasks where hazards cannot be eliminated by other means. All employees, contractors, and visitors must wear required PPE at all times in designated areas and during operations, in compliance with applicable legislation, manufacturer requirements, and company standards.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Hazard Assessment:
• Identify PPE requirements through formal and field-level hazard assessments (FHAs and FLHAs).
• Apply the hierarchy of controls; PPE is used only where other measures cannot fully eliminate hazards.

Provision of PPE:
• Aeria provides CSA/ANSI-approved PPE at no cost to employees.
• Specialized PPE (e.g., fall protection, respirators) issued as required.

PPE Use:
• All workers must wear PPE appropriate to their task and site.
• Jewelry and loose clothing are prohibited during field operations, except stud earrings and wedding bands.

Inspection & Maintenance:
• Workers must inspect PPE before each use.
• Supervisors perform scheduled inspections; defective PPE must be removed from service immediately.

Training:
• All staff receive training on selection, use, limitations, and care of PPE.
• Refresher training is required periodically and after incidents of non-compliance.

Tools, Forms, or Checklists:
• PPE Inspection Logs
• Hazard Assessment Forms (FHAs, FLHAs)
• Site Orientation Forms

Safety/Compliance/Quality Requirements:
• Compliance with BC OHS Regulation, Part 8
• PPE must be CSA/ANSI-certified
• All workers must follow the manufacturer's instructions for use and care

Reporting or Escalation:
• Defective or missing PPE reported to supervisors immediately
• Non-compliance escalated to Operations Manager or Accountable Executive
• Repeat violations documented and subject to progressive discipline`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Provide resources for PPE purchase, training, and enforcement.
• Approve PPE standards and updates.

Supervisors:
• Ensure PPE availability and use on site.
• Enforce compliance through inspections and corrective action.

Staff/Contractors:
• Use assigned PPE correctly.
• Report damaged or missing PPE immediately.
• Participate in PPE training and refreshers.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Routine spot checks by supervisors.
• Scheduled inspections and audits by HSE Representative.
• Annual review of PPE standards and training.

Consequences for Non-Compliance:
• Verbal/written warnings for first offenses.
• Removal from worksite until compliance achieved.
• Disciplinary action up to termination for repeated violations.

Reporting Obligations:
• PPE deficiencies logged in inspection reports.
• PPE non-compliance recorded in safety meeting minutes.
• Incidents involving PPE failures reported to HSE Representative.`
      }
    ]
  },

  '1005': {
    number: '1005',
    title: 'RPAS Operations - General Procedures Policy',
    category: 'rpas',
    description: 'Establishes that all Aeria Solutions operations must follow approved general procedures, ensuring consistency, safety, and compliance across all RPAS activities.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations Part IX', 'Aeria RPAS Procedures'],
    keywords: ['procedures', 'operations', 'SOP', 'compliance', 'workflow'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To establish that all Aeria Solutions operations must follow approved general procedures, ensuring consistency, safety, and compliance across all RPAS activities.

Scope:
This policy applies to all Aeria Solutions personnel involved in RPAS operations, including employees, contractors, subcontractors, and visitors operating under Aeria Solutions' direction.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• General Procedures: Standardized operational workflows covering activities such as kit preparation, site setup, RPAS setup, checklists, communication protocols, and debrief processes.

References:
• Aeria RPAS Procedures
• Aeria HSE Procedures
• General Procedure PDFs (RPAS Procedures Docs)`
      },
      {
        title: 'Policy Statement',
        content: `All personnel engaged in RPAS operations with Aeria Solutions must follow the official General Procedures as defined in the approved procedure documents. These procedures are mandatory and form part of the company's standard operating procedures. Deviation is not permitted except under formally approved amendments.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Access Procedures:
• Operators must review the latest procedure PDFs available in the RPAS Procedures Docs before deployment.

Adherence:
• Procedures must be followed in their entirety during operations.
• No modifications, omissions, or substitutions are permitted unless approved by the Operations Manager and documented in amendment logs.

Incident Response:
• Any deviation or failure to follow procedures must be reported immediately through incident reporting protocols.

Tools, Forms, or Checklists:
• Procedure PDFs
• Training Acknowledgment Form
• Compliance Logs

Safety/Compliance/Quality Requirements:
• Procedures are written to comply with CARs, manufacturer guidance, and Aeria's internal safety standards.
• Failure to adhere may result in non-compliance with Transport Canada requirements.

Reporting or Escalation:
• Deviations or challenges following procedures must be reported through Aeria's Incident and Hazard Reporting system.
• Escalations go to the Operations Manager and, if unresolved, to the Accountable Executive.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure procedures are current, accessible, and formally approved.
• Allocate resources for training and compliance monitoring.

Supervisors/Operations Managers:
• Verify that crews follow procedures during operations.
• Address and correct any non-compliance immediately.

Staff/Crew Members:
• Review and follow procedures without exception.
• Report difficulties or potential improvements through formal amendment requests.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Spot checks during operations.
• Post-operation debrief reviews.
• Annual compliance audits.

Consequences for Non-Compliance:
• Removal from operational duty.
• Mandatory retraining.
• Progressive discipline up to termination for repeated or serious violations.

Reporting Obligations:
• Compliance with procedure use must be documented in operational logs.
• Non-compliance must be reported in accordance with incident reporting protocols.`
      }
    ]
  },

  '1006': {
    number: '1006',
    title: 'RPAS Operations - Emergency Procedures Policy',
    category: 'rpas',
    description: 'Ensures that all personnel engaged in Aeria Solutions operations are prepared to respond effectively to emergencies by following official Emergency Procedures.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations Part IX', 'Aeria HSE ERP'],
    keywords: ['emergency', 'procedures', 'response', 'ERP', 'safety'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To ensure that all personnel engaged in Aeria Solutions operations are prepared to respond effectively to emergencies by following the official Emergency Procedures.

Scope:
This policy applies to all Aeria Solutions employees, contractors, and subcontractors involved in RPAS operations and field activities.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Emergency Procedures: Formal workflows for responding to RPAS failures, communication losses, environmental hazards, crashes, and other operational emergencies.
• ERP (Emergency Response Plan): Broader company HSE emergency procedures that complement RPAS-specific protocols.

References:
• Aeria RPAS Procedures
• Aeria HSE Procedures
• Emergency Procedure PDFs (RPAS Procedures Docs)`
      },
      {
        title: 'Policy Statement',
        content: `All personnel must follow Aeria Solutions' approved Emergency Procedures during operations. These procedures are mandatory and define the standard response to RPAS-related or site-related emergencies. Deviation is not permitted except under approved amendments or adaptations by the Pilot in Command (PIC) in immediate safety-of-life circumstances.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Access Procedures:
• All personnel must be familiar with the Emergency Procedures PDFs provided in the RPAS Procedures Docs.

Adherence:
• Emergency Procedures must be followed in their entirety whenever an emergency occurs.
• If an unforeseen situation arises, the PIC must take immediate safe action and report the deviation.

Reporting:
• All emergency activations must be reported through the Incident Reporting and Investigation system.

Tools, Forms, or Checklists:
• Emergency Procedure PDFs (RPAS Procedures Docs)
• Incident Reporting Form
• ERP Training Acknowledgment

Safety/Compliance/Quality Requirements:
• Procedures are aligned with CARs Part IX requirements and Aeria HSE ERP standards.
• Non-compliance places personnel, equipment, and the public at risk and is considered a serious breach.

Reporting or Escalation:
• Emergencies must be reported immediately to the Operations Manager.
• Significant emergencies (injuries, collisions, fly-aways) must be escalated to the Accountable Executive and Transport Canada/TSB as required.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Maintain accurate and up-to-date emergency procedures.
• Allocate resources for training and drills.

Supervisors:
• Lead emergency responses in accordance with procedures.
• Report and document all emergency incidents.

Staff:
• Follow instructions during emergencies.
• Support the PIC and maintain compliance with procedures.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Emergency drill participation.
• Incident investigation reviews.
• Annual policy and ERP review.

Consequences for Non-Compliance:
• Immediate removal from operational duty.
• Mandatory retraining before return to duty.
• Disciplinary action up to termination for repeated or deliberate violations.

Reporting Obligations:
• All emergency responses must be documented in incident reports.
• Reports retained for minimum 12–24 months as required by CARs and HSE systems.`
      }
    ]
  },

  '1007': {
    number: '1007',
    title: 'RPAS Operations - Communication Policy',
    category: 'rpas',
    description: 'Ensures safe, reliable, and standardized communication practices during all RPAS operations by mandating adherence to approved communication protocols.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations Part IX', 'ROC-A Requirements'],
    keywords: ['communication', 'radio', 'protocols', 'sterile cockpit'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To ensure safe, reliable, and standardized communication practices during all RPAS operations by mandating adherence to Aeria Solutions' approved communication protocols.

Scope:
This policy applies to all Aeria Solutions employees, contractors, and subcontractors who participate in RPAS operations, including Pilots in Command (PIC), Visual Observers (VO), Operations Managers, and field crew.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Communication Protocols: Pre-established procedures and standards for verbal, radio, or digital communications before, during, and after RPAS operations.
• Sterile Cockpit: A communications rule requiring minimal distractions during critical phases of operation.

References:
• Aeria RPAS Policies
• Aeria HSE Policies
• Canadian Aviation Regulations Part IX`
      },
      {
        title: 'Policy Statement',
        content: `All RPAS operations conducted by Aeria Solutions must follow the company's approved communication procedures. These procedures are mandatory and form a critical part of operational safety. Clear, accurate, and timely communication is required between all crew members, clients, and external authorities as applicable.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Access Procedures:
• Operators must review the latest communication procedure PDFs provided in the Operators Access Folder.

Adherence:
• All personnel must use the approved protocols for pre-flight, in-flight, post-flight, and emergency communications.
• Unauthorized or improvised communication practices are prohibited.

Escalation:
• Any communication failure or deviation from protocol must be reported immediately as an incident.

Tools, Forms, or Checklists:
• Communication Procedure PDFs (RPAS Procedures Docs)
• Radio/Comms Equipment Inspection Logs
• Incident Reporting Forms

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX requirements for RPAS communications.
• Use of ROC-A-certified personnel for aeronautical radio communication.
• Communications must follow approved frequencies and avoid interference with other airspace users.

Reporting or Escalation:
• Communication failures logged as incidents.
• Escalations are directed to the Operations Manager and reported to the Accountable Executive if unresolved.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Approve, maintain, and update communications standards.
• Provide necessary tools, training, and oversight.

Supervisors:
• Ensure communications protocols are followed on-site.
• Conduct periodic audits of communication practices.

Staff:
• Follow communication procedures without deviation.
• Report failures or difficulties immediately.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Spot checks during operations.
• Post-flight debriefs.
• Annual compliance review.

Consequences for Non-Compliance:
• Removal from operational duty.
• Mandatory retraining in communication protocols.
• Disciplinary action for repeated or serious breaches.

Reporting Obligations:
• All communication-related incidents must be documented and retained in accordance with Aeria's record-keeping requirements.`
      }
    ]
  },

  '1008': {
    number: '1008',
    title: 'RPAS Operations - Detection, Avoidance & Separation Policy',
    category: 'rpas',
    description: 'Establishes policy on collision detection, avoidance, and separation during RPAS operations to ensure compliance with regulatory requirements and reduce risks.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations Part IX', 'CAR 901.17', 'CAR 901.18'],
    keywords: ['detection', 'avoidance', 'separation', 'collision', 'airspace'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To establish Aeria Solutions' policy on collision detection, avoidance, and separation during RPAS operations. This ensures compliance with regulatory requirements, prioritizes safety, and reduces risks of airspace or ground conflicts.

Scope:
This policy applies to all RPAS operations conducted by Aeria Solutions, including flights in controlled and uncontrolled airspace, BVLOS (Beyond Visual Line of Sight) missions, and operations near people, property, or other aircraft.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Detection: The process of identifying potential hazards or conflicting airspace users.
• Avoidance: Maneuvers or actions taken to prevent conflicts or collisions.
• Separation: Maintaining minimum safe distances between RPAS, manned aircraft, obstacles, and people.

References:
• Aeria RPAS Procedures
• Canadian Aviation Regulations Part IX
• Aeria HSE Policies
• Procedure PDFs (RPAS Procedures Docs)`
      },
      {
        title: 'Policy Statement',
        content: `Aeria Solutions requires all personnel to adhere to approved detection, avoidance, and separation procedures at all times. Operators must yield to manned aircraft, maintain safe ground and airspace separation, and follow Aeria Solutions' conflict avoidance standards. These requirements are mandatory and non-negotiable, forming a core element of operational safety.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Access Procedures:
• Operators must review the latest Detection, Avoidance & Separation procedure PDFs in the RPAS Procedures Docs.

Adherence:
• All RPAS crew must follow approved separation standards, conflict response protocols, and deconfliction measures.
• Unauthorized deviations are prohibited except in life-safety emergencies, which must be documented.

Reporting:
• All conflict, near-miss, or separation incidents must be reported immediately through Aeria's Incident Reporting system.

Tools, Forms, or Checklists:
• Detection, Avoidance & Separation Procedure PDFs
• Pre-flight hazard and airspace assessment checklists
• Incident/Near-Miss Report Forms

Safety/Compliance/Quality Requirements:
• CAR 901.17: RPAS must give way to manned aircraft.
• CAR 901.18: RPAS must not fly near or in a manner hazardous to people or property.
• Aeria Solutions' internal minimum separation standards.

Reporting or Escalation:
• Near-miss or conflict events reported immediately to Operations Manager.
• Escalated to Accountable Executive and reported to Transport Canada/TSB if required.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure detection and avoidance standards align with CARs and internal safety systems.
• Provide tools, resources, and training to enforce policy.

Supervisors:
• Enforce separation protocols during all operations.
• Document and report incidents of conflict or near-miss.

Staff:
• Support monitoring of ground and air risks.
• Alert PIC to hazards and comply with avoidance protocols.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Pre-flight planning and hazard assessment reviews.
• Post-flight debriefs and incident log audits.
• Annual compliance review during AGM.

Consequences for Non-Compliance:
• Removal from active operations until retraining is complete.
• Disciplinary measures up to termination for repeated or deliberate breaches.

Reporting Obligations:
• Near-miss and separation incidents logged and retained in compliance with CAR 901.49 and Aeria's record-keeping standards.`
      }
    ]
  },

  '1009': {
    number: '1009',
    title: 'RPAS Operations - Minimum Weather Requirements Policy',
    category: 'rpas',
    description: 'Defines the minimum weather requirements for RPAS operations, ensuring safety, compliance, and risk mitigation during all flight activities.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations Part IX'],
    keywords: ['weather', 'minimum requirements', 'wind', 'temperature', 'precipitation'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To define the minimum weather requirements for Aeria Solutions RPAS operations, ensuring safety, compliance, and risk mitigation during all flight activities.

Scope:
This policy applies to all RPAS operations conducted by Aeria Solutions, including basic, advanced, and special operations. It covers all crew members, contractors, and subcontractors involved in flight activities.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Operational Limits: Manufacturer-specified environmental tolerances, including wind, precipitation, and temperature.
• Weather Monitoring Tools: Approved forecasting and real-time monitoring systems used to assess weather suitability for flight.

References:
• Canadian Aviation Regulations Part IX
• Aeria RPAS Procedures
• Aeria HSE policy`
      },
      {
        title: 'Policy Statement',
        content: `RPAS operations must not be conducted outside of the defined minimum weather requirements. Aeria Solutions enforces an additional 20% safety buffer below the manufacturer's specified maximum weather limits (e.g., wind speed, temperature, precipitation). Operations must be postponed, adjusted, or cancelled if conditions exceed these thresholds.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Weather Assessment (Pre-Flight):
• Review weather forecasts using approved tools (e.g., Environment Canada, Windy).
• Confirm conditions fall within 80% of the manufacturer's stated limits.

Real-Time Monitoring (During Operations):
• Continuously monitor on-site conditions.
• Stop or suspend flights if weather conditions deteriorate beyond policy limits.

Postponement/Cancellation:
• Operations must be postponed or cancelled if forecasted or real-time conditions exceed thresholds.

Documentation:
• Record weather assessments and decisions in the pre-flight planning documents.

Tools, Forms, or Checklists:
• Environment Canada forecast system
• Windy application
• AirData application
• Site weather logs and pre-flight checklists

Safety/Compliance/Quality Requirements:
• All RPAS operations must comply with CARs operational weather limits.
• RPAS must not be flown if icing is present or expected.

Reporting or Escalation:
• Deviations must be reported immediately via the Incident Reporting process.
• Escalate unresolved safety concerns to the Operations Manager and Accountable Executive.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Provide access to approved weather forecasting and monitoring tools.
• Ensure annual review of weather limits based on regulatory updates and manufacturer specifications.

Supervisors:
• Confirm crews perform and document weather assessments.
• Stop operations if conditions exceed safe thresholds.

Staff:
• Conduct weather assessments and monitor conditions in real time.
• Suspend or abort operations when safety is compromised.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Review of pre-flight weather assessment logs.
• Spot checks during operations by the Operations Manager.
• Annual compliance review at AGM.

Consequences for Non-Compliance:
• Immediate grounding of operations.
• Mandatory retraining in operational safety.
• Progressive discipline for repeated violations.

Reporting Obligations:
• Weather assessments and related decisions must be documented and retained for 24 months in accordance with CAR 901.48.`
      }
    ]
  },

  '1010': {
    number: '1010',
    title: 'RPAS Operations - Incident & Accident Reporting Policy',
    category: 'rpas',
    description: 'Ensures all accidents, incidents, and near-misses are reported, documented, and escalated immediately to proper authorities and company representatives.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations 901.49(1)', 'Canada Labour Code, Part II'],
    keywords: ['incident', 'accident', 'reporting', 'near-miss', 'TSB'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To ensure all accidents, incidents, and near-misses are reported, documented, and escalated immediately to the proper authorities and company representatives.

Scope:
Applies to all Aeria Solutions employees, contractors, subcontractors, and visitors engaged in RPAS operations and related fieldwork.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Incident: An occurrence that could affect safety but does not result in injury or major damage.
• Accident: An event involving injury, death, or significant damage to RPAS, property, or environment.
• Near-Miss: An event with potential for harm but avoided due to chance or timely intervention.

References:
• Aeria RPAS Operations
• Aeria HSE Policy
• Canadian Aviation Regulations (CARs) 901.49(1)
• Canada Labour Code, Part II, Section 125(1)(c)`
      },
      {
        title: 'Policy Statement',
        content: `All accidents, incidents, and near-misses must be reported immediately. Reporting is mandatory and ensures compliance with regulatory requirements, supports corrective action, and improves operational safety.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

1. Medical Emergency (injury or fatality):
   • Call 911 immediately.
   • Then notify Aeria Accountable Executive.

2. Serious RPAS Accident (collision with manned aircraft, >25kg RPAS crash, injury, or death):
   • Call Transportation Safety Board (TSB): Toll-Free: 1-800-387-3557
   • Notify Transport Canada RPAS Centre of Excellence.
   • Notify Aeria Accountable Executive.

3. Other Incidents (loss of control, fly-away, property damage, near-miss):
   • Notify Transport Canada (via CADORS if applicable).
   • Notify Aeria Operations Manager.

4. Internal Reporting:
   • Complete Aeria Incident/Accident Report Form (SiteDocs).
   • Submit to Operations Manager and HSE Representative.

Call Order by Priority:
1. Emergency Services (if required for life safety)
2. TSB (for major aviation occurrences)
3. Transport Canada (for reportable RPAS events)
4. Aeria Accountable Executive
5. Aeria Operations Manager
6. Aeria HSE Representative

Tools, Forms, or Checklists:
• Aeria Incident/Accident Report Form (SiteDocs)
• TSB Reporting Form (if applicable)
• AirData flight logs for supporting evidence

Safety/Compliance/Quality Requirements:
• Compliance with CARs 901.49(1) for RPAS occurrences.
• Compliance with Canada Labour Code, Part II – Employer duty to investigate and report.
• All records are retained for 12–24 months, depending on regulatory requirements.

Reporting or Escalation:
• Escalate serious occurrences immediately to the Accountable Executive.
• External reporting required for RPAS accidents over 25kg, collisions with manned aircraft, any serious injury or death.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure reporting systems are functional and accessible.
• Submit required reports to regulators.
• Allocate resources for investigations.

Supervisors:
• Initiate reporting immediately after an event.
• Ensure scene preservation where safe and practical.
• Lead initial incident response until management takes over.

Staff:
• Report all incidents and near-misses without delay.
• Cooperate with investigations and corrective actions.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Regular audits of incident/accident logs.
• Annual safety program review.
• Tracking trends from investigations to identify recurring hazards.

Consequences for Non-Compliance:
• Failure to report is considered a serious violation.
• May result in removal from duty, retraining, or disciplinary action up to termination.

Reporting Obligations:
• Internal reports must be filed in SiteDocs.
• Reports retained in compliance with CAR 901.48 (24 months).
• External reporting to Transport Canada and/or TSB where required.`
      }
    ]
  },

  '1011': {
    number: '1011',
    title: 'RPAS Operations - Site Survey & Flight Plan Policy',
    category: 'rpas',
    description: 'Ensures all RPAS operations are conducted safely, lawfully, and consistently by requiring completion of a site survey and flight plan prior to any mission.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations Part IX', 'CAR 901.62'],
    keywords: ['site survey', 'flight plan', 'planning', 'SiteDocs', 'AirData'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To ensure all Aeria Solutions RPAS operations are conducted safely, lawfully, and consistently by requiring the completion of a site survey and flight plan prior to any mission.

Scope:
This policy applies to all Aeria Solutions personnel, contractors, and subcontractors involved in RPAS operations, including planning, piloting, observation, and operational management.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Site Survey: A structured assessment of the operational environment, including ground risks, airspace, wildlife, access, and emergency preparedness.
• Flight Plan: A documented plan that includes mission details, operational limits, and emergency procedures, submitted where required (e.g., NavCanada).

References:
• Aeria RPAS Operations Manual – Site Survey & Flight Planning
• Aeria HSE Policy – Hazard Assessment
• Canadian Aviation Regulations, Part IX (901.62 for Advanced Operations)
• SiteDocs – Hazard & Site Survey tools
• AirData – Flight planning, logging, and compliance tools`
      },
      {
        title: 'Policy Statement',
        content: `All operations conducted under Aeria Solutions must include a completed site survey and flight plan. These documents are mandatory requirements to ensure operational safety, regulatory compliance, and risk mitigation. Aeria Solutions utilizes SiteDocs and AirData as the primary tools for conducting, documenting, and retaining these records. No RPAS mission may be launched without these elements in place.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Pre-Operation Site Survey:
• Complete a site survey in SiteDocs covering ground, airspace, wildlife, and emergency factors.
• Record hazards and mitigation measures.

Flight Plan:
• Develop a flight plan using SiteDocs and/or AirData.
• Ensure compliance with CAR 901.62 for advanced operations.
• Submit flight plans to NavCanada if required.

Verification:
• Operations Manager confirms site survey and flight plan are complete before authorizing deployment.
• PIC reviews all planning documents prior to flight.

Tools, Forms, or Checklists:
• SiteDocs – for site surveys, hazard assessments, and planning documentation.
• AirData – for logging flights, compliance tracking, and flight record retention.

Safety/Compliance/Quality Requirements:
• Site surveys and flight plans must be retained for a minimum of 24 months.
• All operations must comply with CARs, including CAR 901.62 for advanced RPAS operations.
• Flight planning must incorporate hazard and risk assessments as required by the HSE system.

Reporting or Escalation:
• Incomplete or missing surveys/flight plans must be reported to the Operations Manager.
• Non-compliance escalates to the Accountable Executive for corrective action.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Provide and maintain access to SiteDocs and AirData.
• Approve procedural updates and allocate resources.

Supervisors:
• Confirm all surveys and flight plans are completed before operations begin.
• Maintain oversight of records and compliance.

Staff:
• Complete surveys and plans as part of pre-flight preparation.
• Follow plans during operations and report deviations.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Regular audits of SiteDocs and AirData records.
• Spot checks by Operations Manager.
• Annual compliance review at AGM.

Consequences for Non-Compliance:
• Immediate suspension of operations.
• Mandatory retraining in site survey and flight planning.
• Progressive discipline for repeated violations.

Reporting Obligations:
• All site surveys and flight plans must be logged and retained for 24 months.
• Non-compliance must be documented in incident reports.`
      }
    ]
  },

  '1012': {
    number: '1012',
    title: 'RPAS Operations - Equipment Testing Policy',
    category: 'rpas',
    description: 'Ensures every RPAS, payload, ground control station, and power system is tested, safe, and airworthy using standardized processes with clear pass/fail criteria.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Maintenance Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations Part IX', 'CAR 901.76'],
    keywords: ['testing', 'equipment', 'CLEAR', 'LOCKOUT', 'airworthiness'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To ensure every Remotely Piloted Aircraft System (RPAS), payload, ground control station, and associated power system is tested, safe, and airworthy before operational use, after maintenance or updates, and at defined intervals, using a standardized, documented process with clear pass/fail criteria (CLEAR vs LOCKOUT).

Scope:
Applies to all Aeria Solutions aircraft, payloads/sensors (e.g., LiDAR, RGB/MS, delivery payloads), ground control stations, firmware/software, antennas, data links, and batteries used in Aeria operations (newly acquired, in-service, repaired/updated, or annually re-certified).`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Equipment Testing: Structured verification that an RPAS system and its subsystems are ready for safe flight.
• CLEAR: The system passed all required test steps and is approved for operational use.
• LOCKOUT: The system failed one or more steps and is removed from service until corrected and re-tested.
• Test Schedules: New / Pre-Operation / Post-Maintenance / Annual recurrence.

References:
• RPAS Operations Manual – Equipment Testing
• RPAS Operations Manual – Airworthiness & Maintenance
• HSE Policy – records, incident reporting, audits
• CARs Part IX (records & operational requirements)`
      },
      {
        title: 'Policy Statement',
        content: `Aeria Solutions will not deploy any RPAS equipment operationally unless it has passed the defined equipment tests and is marked CLEAR. Any malfunction, anomaly, or incomplete test results in LOCKOUT, and the equipment remains out of service until corrective actions are completed and a full re-test passes. All testing must be documented in AirData (and SiteDocs, where applicable) and retained per record-keeping requirements.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

When to Test:
• All new equipment, prior to operations, after any maintenance or updates, and annually.

Testing Standards:
• Use Aeria's standardized RPAS Test Sheet covering startup, control link, payload, launch/hover, maneuvering, RTH, and battery performance.

Pass/Fail Criteria:
• CLEAR = all steps successful
• LOCKOUT = failure of any item until corrected and re-tested

Record Keeping:
• All results (including serials, anomalies, corrective actions) logged in AirData
• LOCKOUT tags applied where necessary

Corrective Action:
• Any issues must be repaired, documented, and followed by a full retest before returning to service.

Escalation:
• Safety-critical failures reported via HSE Incident Reporting Policy.

Tools, Forms, or Checklists:
• AirData (mandatory): flight/test logs, maintenance events, batteries, service intervals, reports
• Aeria RPAS Test Sheet / Checklist
• SiteDocs (optional): forms for test session, hazard notes, incident reports
• Manufacturer manuals for aircraft/payload specifics

Safety/Compliance/Quality Requirements:
• Testing must follow manufacturer limitations and Aeria's ≤80% weather margin policy.
• Comply with CARs Part IX and Aeria HSE policies.
• Use only recognized RPAS with manufacturer safety declaration (CAR 901.76).

Reporting or Escalation:
• LOCKOUT or safety-critical issues → immediate notification to Maintenance Manager & Operations Manager
• Repeated failures trending → raise to Accountable Executive for risk review`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Accountable Executive:
• Ensures resources for testing, approves policy changes, and oversees compliance.

Maintenance Manager:
• Owns the test program; configures schedule; approves CLEAR/LOCKOUT; manages corrective actions.

Operations Manager:
• Verifies equipment under assignment is CLEAR; denies deployment if LOCKOUT.

PIC:
• Conducts/assists testing steps; verifies configuration/RTH/weather; halts on anomalies.

VO / Crew:
• Support safe environment, observation, and documentation during tests.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Monthly AirData audits by Maintenance Manager.
• Spot checks by Operations Manager before deployments.
• Annual review at AGM.

Consequences for Non-Compliance:
• Equipment LOCKOUT.
• Removal from duty and retraining for personnel involved.
• Progressive discipline for repeated violations.

Reporting Obligations:
• Test and maintenance logs retained for a minimum 24 months.
• Regulatory reporting if equipment failure leads to a reportable incident.`
      }
    ]
  },

  // ============================================
  // CRM POLICIES (1013-1021)
  // ============================================

  '1013': {
    number: '1013',
    title: 'CRM - Threat and Error Management (TEM) Policy',
    category: 'crm',
    description: 'Establishes a structured Threat and Error Management (TEM) policy that ensures RPAS operations identify, prevent, and mitigate threats and errors during missions.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['Transport Canada Advisory Circular 700-042', 'Aeria CRM Manual'],
    keywords: ['TEM', 'threat', 'error', 'management', 'ATM', 'safety', 'CRM'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To establish a structured Threat and Error Management (TEM) policy that ensures Aeria RPAS operations identify, prevent, and mitigate threats and errors that may arise during missions.

Scope:
Applies to all Aeria RPAS operational crew members, including Pilots in Command (PICs), Visual Observers (VOs), Operations Managers, subcontractors, and support personnel engaged in RPAS operations.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Threat: An external factor or condition that increases operational risk (e.g., adverse weather, airspace complexity).
• Error: An action or inaction that leads to deviation from procedures, intentions, or safety standards.
• TEM: Threat and Error Management, the structured process of Avoid, Trap, Mitigate (ATM).
• Intentional Non-Compliance: Knowingly disregarding SOPs or regulations.

References:
• Aeria CRM Manual, Section: Threat and Error Management
• Aeria RPAS Operations Manual
• Transport Canada Advisory Circular 700-042, Appendix A`
      },
      {
        title: 'Policy Statement',
        content: `Aeria Solutions mandates that all RPAS crew adopt proactive Threat and Error Management strategies to ensure safety, operational effectiveness, and compliance. Operators are required to apply structured Avoidance, Trapping, and Mitigation (ATM) strategies throughout all phases of operation. Intentional non-compliance with SOPs or TEM requirements is strictly prohibited.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Identify Threats and Errors during pre-mission planning and in-flight monitoring.
• Avoid Threats by conducting thorough risk assessments, weather checks, and pre-flight surveys.
• Trap Threats/Errors through use of checklists, structured flows, and VO monitoring.
• Mitigate Impact using emergency procedures, return-to-home (RTH) systems, and external authority communication protocols.
• Debrief post-mission to review threats and errors encountered, documenting lessons learned.

Roles & Responsibilities for Each Step:
• PIC: Ensure adherence to SOPs, oversee threat identification, and apply mitigation strategies.
• VO: Actively monitor for external threats, provide timely feedback, and assist in error trapping.
• Operations Manager: Verify planning documents incorporate TEM controls.
• Crew Members: Report threats/errors openly, comply with checklists, and escalate issues via P.A.C.E. protocol.

Tools, Forms, or Checklists:
• RPAS Pre-Flight and In-Flight Checklists
• Site Survey & Operational Risk Assessment forms
• Aeria Fly-Away Emergency Communication Script

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX (RPAS regulations)
• Strict adherence to Aeria SOPs
• Mandatory recurrent TEM training

Reporting or Escalation:
• All identified threats/errors are logged in post-flight reports.
• Escalation through P.A.C.E. (Probe, Alert, Challenge, Emergency) when threat management requires intervention.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure TEM training is embedded in CRM training program.
• Review logged TEM events during audits.

Supervisors:
• Monitor adherence to TEM procedures on site.
• Conduct post-mission debriefs to capture threat/error learnings.

Staff:
• Apply ATM strategies in all operations.
• Report and document all threats/errors honestly and without fear of reprisal.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Annual TEM refresher training
• Random audits of flight logs and debrief reports
• Observation during field operations

Consequences for Non-Compliance:
• Corrective training for unintentional lapses.
• Formal disciplinary action for intentional non-compliance, up to termination.

Reporting Obligations:
• All TEM issues to be documented in operational reports.
• Significant errors or non-compliance reported to Accountable Executive.`
      }
    ]
  },

  '1014': {
    number: '1014',
    title: 'CRM - Communication Policy',
    category: 'crm',
    description: 'Establishes structured communication protocols that enhance safety, clarity, and teamwork in RPAS operations.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['Transport Canada Advisory Circular 700-042', 'Aeria CRM Manual'],
    keywords: ['communication', 'PACE', 'phraseology', 'feedback', 'CRM'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To establish structured communication protocols that enhance safety, clarity, and teamwork in RPAS operations. Effective communication ensures accurate information transfer, situational awareness, and timely decision-making.

Scope:
Applies to all Aeria RPAS operational personnel, including PICs, VOs, Operations Managers, subcontractors, and supporting staff engaged in pre-flight, in-flight, and post-flight phases.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• P.A.C.E. Protocol: Structured escalation method — Probe, Alert, Challenge, Emergency.
• Standard Phraseology: Defined terms and language to reduce ambiguity.
• Feedback Loop: Confirmation by recipient that a message was received and understood.

References:
• Aeria CRM Manual, Section: Communication
• Aeria RPAS Operations Manual, Section: Communication Techniques
• Transport Canada Advisory Circular 700-042, Appendix A`
      },
      {
        title: 'Policy Statement',
        content: `Aeria mandates clear, concise, and standardized communication across all operational phases. All team members must use structured protocols, confirmation loops, and escalation models to ensure that information is correctly exchanged and acted upon.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Pre-Flight:
• Conduct structured team briefings covering mission objectives, roles, communication standards, and contingency plans.
• Verify all communication tools are operational.

In-Flight:
• Use standardized phraseology (cardinal directions, metric values).
• Maintain continuous communication between PIC and VO.
• Confirm critical instructions using feedback loops.
• Escalate using P.A.C.E. if concerns are not resolved.

Post-Flight:
• Conduct debrief to review communication effectiveness.
• Document communication barriers, feedback, and lessons learned.

Tools, Forms, or Checklists:
• Pre-flight Communication Checklist
• Post-flight Debrief Template
• Aeria Fly-Away Communication Script

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX and RPAS communication regulations.
• Mandatory training in standardized phraseology and communication escalation protocols.

Reporting or Escalation:
• All communication breakdowns are logged in debrief reports.
• Escalation follows P.A.C.E. (Probe → Alert → Challenge → Emergency).`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure training and monitoring of CRM communication practices.
• Review logged communication challenges in audits.

Supervisors:
• Conduct and enforce structured briefings/debriefings.
• Ensure communication tools are functional and available.

Staff:
• Follow phraseology, feedback loops, and escalation protocols.
• Participate in open, assertive, and respectful communication.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Field audits of communication during live operations.
• Review of debrief documentation.
• Annual CRM communication refresher training.

Consequences for Non-Compliance:
• Retraining for unintentional lapses.
• Formal disciplinary action for persistent or intentional breaches.

Reporting Obligations:
• Significant communication failures must be documented and reported to the Accountable Executive.`
      }
    ]
  },

  '1015': {
    number: '1015',
    title: 'CRM - Situational Awareness Policy',
    category: 'crm',
    description: 'Establishes a structured policy for building, maintaining, and recovering situational awareness (SA) in RPAS operations.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['Transport Canada Advisory Circular 700-042', 'Aeria CRM Manual'],
    keywords: ['situational awareness', 'SA', 'perception', 'comprehension', 'projection'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To establish a structured policy for building, maintaining, and recovering situational awareness (SA) in RPAS operations. Maintaining SA ensures operators perceive, comprehend, and anticipate operational conditions to minimize threats, prevent errors, and ensure mission safety.

Scope:
Applies to all Aeria RPAS operational personnel, including Pilots in Command (PICs), Visual Observers (VOs), Operations Managers, subcontractors, and any supporting crew members involved in mission planning, execution, and debrief.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Situational Awareness (SA): The perception of environmental elements, comprehension of their meaning, and projection of their future status.
• Levels of SA: Perception (recognizing factors), Comprehension (understanding meaning), Projection (anticipating outcomes).
• SA Loss: A condition where an operator becomes disconnected from mission-critical factors, leading to degraded safety.

References:
• Aeria CRM Manual, Section: Situational Awareness
• Aeria RPAS Operations Manual, Section: Communication Techniques
• Transport Canada Advisory Circular 700-042, Appendix A`
      },
      {
        title: 'Policy Statement',
        content: `Aeria Solutions requires all operators to actively build and sustain situational awareness throughout all phases of RPAS missions. Operators must use structured countermeasures, communication protocols, and workload distribution techniques to anticipate threats, recognize early signs of SA loss, and recover awareness immediately.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Pre-Mission (Build SA):
• Conduct thorough site surveys, environmental assessments, and risk reviews.
• Establish baseline awareness of airspace, weather, and equipment status.

During Mission (Maintain SA):
• Monitor telemetry, airspace, and environmental factors continuously.
• Apply three levels of SA (Perception → Comprehension → Projection).
• Use VO updates and communication protocols to maintain shared awareness.

SA Challenges:
• Recognize stress, distraction, or automation over-reliance as threats to SA.
• Conduct regular crew check-ins to confirm shared mental models.

Recovery from SA Loss:
• Pause non-critical tasks.
• Seek VO feedback or repeat system status checks.
• Reassess mission priorities and restore shared SA before continuing.

Post-Mission (Debrief):
• Review SA strengths and weaknesses during team debrief.
• Document lapses, recovery methods, and lessons learned for future training.

Tools, Forms, or Checklists:
• SA Pre-Mission Checklist (weather, airspace, risk review)
• VO Communication Update Log
• SA Recovery SOP

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX regarding continuous RPAS monitoring.
• Adherence to Aeria SOPs for crew briefings and communication updates.

Reporting or Escalation:
• All instances of SA loss or recovery must be documented in debrief reports.
• Escalation via P.A.C.E. protocol when SA loss poses safety risk.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure SA protocols are integrated into training and field audits.
• Review SA-related debrief findings during safety meetings.

Supervisors:
• Confirm SA planning (weather, airspace, hazards) is completed before each mission.
• Lead post-mission reviews to capture SA lessons learned.

Staff:
• Apply SA techniques at all times.
• Report barriers to maintaining SA (e.g., fatigue, distraction).`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Field audits of SA performance during operations.
• Review of mission debriefs for documented SA lapses.
• Annual SA refresher training.

Consequences for Non-Compliance:
• Corrective coaching or retraining for lapses.
• Disciplinary action for negligence resulting in safety compromise.

Reporting Obligations:
• SA-related events must be logged in mission reports.
• Critical SA losses reported to the Accountable Executive.`
      }
    ]
  },

  '1027': {
    number: '1027',
    title: 'HSE Health & Safety Policy',
    category: 'hse',
    description: 'Establishes a framework for health, safety, and environmental management at Aeria Solutions Ltd., preventing workplace injuries and ensuring compliance with legal standards.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Occupational Health and Safety Regulation', 'Workers Compensation Act', 'ISO 14001:2015'],
    keywords: ['health', 'safety', 'HSE', 'workplace', 'hazard', 'environmental'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to establish a framework for health, safety, and environmental management at Aeria Solutions Ltd. Its objectives include preventing workplace injuries, ensuring compliance with legal and industry standards, and fostering a culture of safety, addressing the problem of occupational hazards and environmental risks.

Scope:
This policy applies to all employees, contractors, and visitors of Aeria Solutions Ltd., encompassing all departments, roles, activities, and locations where the company operates.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Health & Safety Policy: A set of guidelines and procedures to ensure a safe and healthy work environment.
• Occupational Hazard: Any condition or activity that poses a risk to employee health or safety.
• Environmental Management: Practices to minimize the company's ecological impact.

References:
• BC Occupational Health and Safety Regulation
• Workers Compensation Act (British Columbia)
• Aeria Solutions Ltd. Environmental Policy
• ISO 14001:2015 Environmental Management Systems`
      },
      {
        title: 'Policy Statement',
        content: `Aeria Solutions Ltd. is dedicated to providing a safe and healthy workplace for all employees, contractors, and visitors. We commit to complying with all applicable health, safety, and environmental regulations, integrating safety into our operations, and continuously improving our practices to prevent incidents and protect the environment.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Policy Development: Create and document the health and safety policy framework.
• Risk Assessment: Conduct regular hazard identification and risk assessments.
• Implementation: Enforce policy through training and safety protocols.
• Monitoring: Perform ongoing inspections and audits to ensure compliance.
• Review and Update: Periodically review and update the policy based on findings.

Roles & Responsibilities for Each Step:
• Policy Development: Management and HSE team
• Risk Assessment: HSE Representatives and supervisors
• Implementation: All employees and supervisors
• Monitoring: HSE team and safety officers
• Review and Update: Management and HSE Management

Tools, Forms, or Checklists:
• Hazard assessment forms (e.g., FLRA/FLHA)
• Inspection checklists
• Training logs
• Audit reports

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation, ISO 14001 standards, and internal safety protocols during all procedures.

Reporting or Escalation:
Report hazards or incidents to supervisors; escalate unresolved issues to HSE Representatives or management within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
Accountable for developing, funding, and enforcing the health and safety policy, providing necessary resources.

Supervisors:
Ensure team compliance with safety procedures, conduct regular checks, and report hazards.

Staff:
Follow safety protocols, report hazards, and participate in training programs.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
Through monthly safety audits, incident investigations, and annual policy reviews to ensure adherence.

Consequences for Non-Compliance:
Disciplinary actions including warnings, retraining, or termination, with legal action possible for serious breaches.

Reporting Obligations:
All incidents, hazards, or non-compliance issues must be reported to HSE Representatives within 24 hours.`
      }
    ]
  }
}

// Export function to get policy content by number
export function getPolicyContent(policyNumber) {
  return POLICY_CONTENT[policyNumber] || null
}

// Export list of available policy numbers
export function getAvailablePolicyNumbers() {
  return Object.keys(POLICY_CONTENT)
}

export default POLICY_CONTENT
