/**
 * defaultPolicyTemplates.js
 * Generalized policy templates based on industry best practices
 *
 * These templates are designed to be:
 * - Universally applicable (no company-specific references)
 * - Customizable with placeholders [Company Name], [Contact Info], etc.
 * - Based on Canadian drone regulations (CARs, SFOC)
 * - Aligned with SORA methodology
 *
 * Structure:
 * - RPAS Operations (1001-1012): Core drone operations policies
 * - CRM (1013-1021): Crew resource management policies
 * - HSE (1022-1045): Health, safety & environment policies
 *
 * @location src/data/defaultPolicyTemplates.js
 */

export const DEFAULT_POLICY_TEMPLATES = [
  // ============================================
  // RPAS OPERATIONS (1001-1012)
  // ============================================
  {
    number: '1001',
    title: 'RPAS Operations Policy',
    category: 'rpas',
    description: 'Establishes the framework for all remotely piloted aircraft system operations, defining responsibilities, authorization requirements, and operational standards.',
    version: '1.0',
    owner: 'Chief Pilot',
    status: 'active',
    type: 'default',
    isTemplate: true,
    content: `# RPAS Operations Policy

## 1. Purpose
This policy establishes the operational framework for [Company Name]'s RPAS (Remotely Piloted Aircraft System) operations, ensuring compliance with Canadian Aviation Regulations (CARs) Part IX and maintaining the highest standards of safety.

## 2. Scope
This policy applies to all personnel involved in RPAS operations, including pilots, visual observers, ground crew, and management.

## 3. Responsibilities

### 3.1 Accountable Executive
- Overall accountability for RPAS operations safety
- Resource allocation for safe operations
- Regulatory compliance oversight

### 3.2 Chief Pilot
- Operational oversight and crew qualification
- Training program management
- Flight authorization review

### 3.3 Pilots-in-Command
- Safe conduct of each flight
- Pre-flight planning and risk assessment
- Compliance with operational procedures

## 4. Authorization Requirements
All flights must be authorized through the internal flight authorization process before commencement. Authorization considers:
- Crew qualifications and currency
- Aircraft serviceability
- Site survey completion
- Risk assessment results
- Regulatory requirements (Basic, Advanced, or SFOC)

## 5. Operational Standards
Operations shall be conducted in accordance with:
- Transport Canada regulations (CARs 901, 903)
- Company Standard Operating Procedures
- Aircraft manufacturer limitations
- Site-specific restrictions

## 6. Compliance Monitoring
Compliance shall be monitored through:
- Operational audits
- Incident reporting and review
- Pilot proficiency evaluations
- Safety management system processes`,
    keywords: ['operations', 'framework', 'authorization', 'standards', 'rpas', 'drone'],
    relatedPolicies: ['1002', '1003', '1009'],
    regulatoryRefs: ['CARs 901', 'CARs 903', 'SFOC Guidelines'],
    sections: [
      { id: 'sec-1', title: 'Purpose and Scope', content: '', order: 0 },
      { id: 'sec-2', title: 'Responsibilities', content: '', order: 1 },
      { id: 'sec-3', title: 'Authorization Requirements', content: '', order: 2 },
      { id: 'sec-4', title: 'Operational Categories', content: '', order: 3 },
      { id: 'sec-5', title: 'Training Requirements', content: '', order: 4 },
      { id: 'sec-6', title: 'Documentation', content: '', order: 5 },
      { id: 'sec-7', title: 'Compliance Monitoring', content: '', order: 6 }
    ]
  },
  {
    number: '1002',
    title: 'Flight Authorization Procedure',
    category: 'rpas',
    description: 'Defines the process for obtaining internal flight authorization, including risk assessment review, crew qualification verification, and operational approval.',
    version: '1.0',
    owner: 'Operations Manager',
    status: 'active',
    type: 'default',
    isTemplate: true,
    content: `# Flight Authorization Procedure

## 1. Purpose
To establish a standardized process for requesting, reviewing, and approving RPAS flight operations.

## 2. Authorization Process

### 2.1 Request Submission
Pilots must submit authorization requests minimum 24 hours before intended operations, including:
- Operation date, time, and location
- Mission objectives
- Aircraft and crew assignments
- Risk assessment results

### 2.2 Review Process
Authorization requests are reviewed for:
- Crew qualifications and currency
- Aircraft airworthiness status
- Site survey completion
- Weather suitability
- Airspace requirements
- Risk assessment adequacy

### 2.3 Approval Authority
- Routine operations: Operations Manager
- Complex/high-risk operations: Chief Pilot
- SFOC operations: Accountable Executive

## 3. Documentation
All authorization records shall be retained for minimum 2 years.`,
    keywords: ['authorization', 'approval', 'risk assessment', 'flight', 'permission'],
    relatedPolicies: ['1001', '1005', '1006'],
    regulatoryRefs: ['CARs 901.71', 'CARs 903.03'],
    sections: [
      { id: 'sec-1', title: 'Authorization Request Process', content: '', order: 0 },
      { id: 'sec-2', title: 'Risk Assessment Requirements', content: '', order: 1 },
      { id: 'sec-3', title: 'Crew Qualification Verification', content: '', order: 2 },
      { id: 'sec-4', title: 'Site Survey Requirements', content: '', order: 3 },
      { id: 'sec-5', title: 'Approval Authority Matrix', content: '', order: 4 },
      { id: 'sec-6', title: 'Documentation Requirements', content: '', order: 5 }
    ]
  },
  {
    number: '1003',
    title: 'Airspace Authorization',
    category: 'rpas',
    description: 'Procedures for obtaining airspace authorization from NAV CANADA and operating in controlled airspace, including NOTAM requirements.',
    version: '1.0',
    owner: 'Chief Pilot',
    status: 'active',
    type: 'default',
    isTemplate: true,
    content: `# Airspace Authorization Procedure

## 1. Purpose
To establish procedures for obtaining authorization to operate in controlled airspace and compliance with NAV CANADA requirements.

## 2. Airspace Classification
Understanding airspace classes and their requirements:
- Class G: Uncontrolled - Basic/Advanced certificate requirements
- Class E, D, C: Controlled - Authorization required
- Class B, A: Restricted - Special authorization required

## 3. Authorization Process

### 3.1 NAV CANADA Drone Flight Authorization
- Submit request through NAV Drone portal minimum 14 days in advance
- Include detailed flight plan and emergency procedures
- Maintain communication capability as required

### 3.2 NOTAM Procedures
File NOTAM for operations as required by regulation or authorization conditions.

## 4. Real-time Coordination
Maintain communication with appropriate ATC units during controlled airspace operations.`,
    keywords: ['airspace', 'NAV CANADA', 'controlled', 'authorization', 'ATC'],
    relatedPolicies: ['1001', '1004'],
    regulatoryRefs: ['CARs 901.64', 'CARs 901.65', 'NAV CANADA RPAS Guidelines'],
    sections: [
      { id: 'sec-1', title: 'Airspace Classification Overview', content: '', order: 0 },
      { id: 'sec-2', title: 'Authorization Requirements by Class', content: '', order: 1 },
      { id: 'sec-3', title: 'NAV CANADA Application Process', content: '', order: 2 },
      { id: 'sec-4', title: 'NOTAM Procedures', content: '', order: 3 },
      { id: 'sec-5', title: 'Real-time Coordination', content: '', order: 4 },
      { id: 'sec-6', title: 'Emergency Procedures', content: '', order: 5 }
    ]
  },
  {
    number: '1006',
    title: 'Emergency Procedures',
    category: 'rpas',
    description: 'Standard emergency procedures for RPAS operations including flyaways, loss of control link, battery emergencies, and collision response.',
    version: '1.0',
    owner: 'Chief Pilot',
    status: 'active',
    type: 'default',
    isTemplate: true,
    content: `# Emergency Procedures

## 1. Purpose
To establish standardized emergency response procedures for RPAS operations.

## 2. Emergency Classification
- **Emergency**: Immediate danger to persons or property
- **Abnormal**: Requires immediate pilot attention but not immediately dangerous
- **Contingency**: Pre-planned response to anticipated scenarios

## 3. Emergency Procedures

### 3.1 Loss of Control Link
1. Note last known position
2. Wait 30 seconds for automatic return-to-home
3. If no response, activate flight termination if available
4. Contact FIC if aircraft cannot be recovered
5. Search last known area

### 3.2 Flyaway
1. Immediately contact NAV CANADA FIC: [FIC Phone Number]
2. Provide aircraft description, last known position, direction of flight
3. Document incident for Transport Canada reporting

### 3.3 Low Battery Emergency
1. Immediately initiate return-to-home
2. Identify nearest safe landing area
3. Land with minimum 20% battery remaining

### 3.4 Fire/Smoke
1. Land immediately in safe area
2. Do not approach burning aircraft
3. Call emergency services if required
4. Evacuate area and restrict access

## 4. Post-Emergency
All emergencies must be documented and reported through the incident reporting system.`,
    keywords: ['emergency', 'flyaway', 'loss of link', 'battery', 'collision', 'procedures'],
    relatedPolicies: ['1001', '1007'],
    regulatoryRefs: ['CARs 901.73', 'Transport Canada Advisory Circulars'],
    sections: [
      { id: 'sec-1', title: 'Emergency Classification', content: '', order: 0 },
      { id: 'sec-2', title: 'Flyaway Procedures', content: '', order: 1 },
      { id: 'sec-3', title: 'Loss of Control Link', content: '', order: 2 },
      { id: 'sec-4', title: 'Low Battery Emergency', content: '', order: 3 },
      { id: 'sec-5', title: 'Collision/Near-Miss Response', content: '', order: 4 },
      { id: 'sec-6', title: 'Post-Emergency Reporting', content: '', order: 5 }
    ]
  },
  {
    number: '1007',
    title: 'Incident Reporting',
    category: 'rpas',
    description: 'Requirements and procedures for reporting safety incidents, accidents, and near-misses, including Transport Canada notification requirements.',
    version: '1.0',
    owner: 'Safety Manager',
    status: 'active',
    type: 'default',
    isTemplate: true,
    content: `# Incident Reporting Procedure

## 1. Purpose
To establish requirements and procedures for reporting, documenting, and investigating safety incidents.

## 2. Reportable Events

### 2.1 Mandatory TSB Reporting
The following must be reported to the Transportation Safety Board:
- Injuries requiring medical attention
- Significant aircraft damage
- Mid-air collision or near-collision with manned aircraft
- Flyaway into controlled airspace

### 2.2 Internal Reporting
All of the following shall be reported internally:
- Any emergency situation
- Equipment malfunction
- Near-misses
- Safety hazards identified
- Property damage (any amount)

## 3. Reporting Process

### 3.1 Immediate Notification
- Notify supervisor immediately for any incident
- For TSB-reportable events: [Emergency Contact]

### 3.2 Documentation
Complete incident report within 24 hours including:
- Date, time, location
- Personnel involved
- Aircraft details
- Weather conditions
- Description of events
- Immediate actions taken

## 4. Investigation
All incidents shall be investigated to identify root causes and preventive measures.`,
    keywords: ['incident', 'accident', 'reporting', 'notification', 'safety', 'near-miss'],
    relatedPolicies: ['1006', '1045', '1046'],
    regulatoryRefs: ['CARs 901.75', 'TSB Regulations'],
    sections: [
      { id: 'sec-1', title: 'Reportable Events Definition', content: '', order: 0 },
      { id: 'sec-2', title: 'Internal Reporting Process', content: '', order: 1 },
      { id: 'sec-3', title: 'Transport Canada Notification', content: '', order: 2 },
      { id: 'sec-4', title: 'TSB Notification Requirements', content: '', order: 3 },
      { id: 'sec-5', title: 'Investigation Procedures', content: '', order: 4 },
      { id: 'sec-6', title: 'Documentation Requirements', content: '', order: 5 }
    ]
  },
  {
    number: '1009',
    title: 'Aircraft Maintenance',
    category: 'rpas',
    description: 'Maintenance requirements, inspection schedules, and airworthiness standards for the RPAS fleet, including pre-flight and periodic inspections.',
    version: '1.0',
    owner: 'Maintenance Manager',
    status: 'active',
    type: 'default',
    isTemplate: true,
    content: `# Aircraft Maintenance Policy

## 1. Purpose
To establish maintenance standards ensuring continued airworthiness of all RPAS in the fleet.

## 2. Pre-Flight Inspection
Before each flight, pilots shall:
- Inspect airframe for damage
- Check propeller condition and attachment
- Verify battery condition and charge level
- Test control surfaces
- Verify GPS and sensor function
- Confirm firmware is current

## 3. Periodic Inspections

### 3.1 25-Hour Inspection
- Complete airframe inspection
- Motor and ESC check
- Battery cycle analysis
- Firmware updates

### 3.2 100-Hour Inspection
- Comprehensive inspection per manufacturer guidelines
- Component replacement as required
- Flight test after major work

## 4. Component Life Limits
- Propellers: Per manufacturer or 50 hours
- Batteries: Per manufacturer cycle count
- Motors: Per manufacturer or 200 hours

## 5. Documentation
All maintenance shall be recorded in the aircraft technical log.`,
    keywords: ['maintenance', 'inspection', 'airworthiness', 'pre-flight', 'periodic'],
    relatedPolicies: ['1001', '1008'],
    regulatoryRefs: ['CARs 901.29', 'Manufacturer Maintenance Manuals'],
    sections: [
      { id: 'sec-1', title: 'Maintenance Philosophy', content: '', order: 0 },
      { id: 'sec-2', title: 'Pre-flight Inspection', content: '', order: 1 },
      { id: 'sec-3', title: 'Periodic Inspection Schedule', content: '', order: 2 },
      { id: 'sec-4', title: 'Component Life Limits', content: '', order: 3 },
      { id: 'sec-5', title: 'Maintenance Documentation', content: '', order: 4 },
      { id: 'sec-6', title: 'Defect Reporting and Rectification', content: '', order: 5 }
    ]
  },
  {
    number: '1010',
    title: 'Pilot Certification',
    category: 'rpas',
    description: 'Requirements for pilot certification, currency, and proficiency, including Basic and Advanced certificate requirements.',
    version: '1.0',
    owner: 'Chief Pilot',
    status: 'active',
    type: 'default',
    isTemplate: true,
    content: `# Pilot Certification Requirements

## 1. Purpose
To establish minimum certification and proficiency requirements for RPAS pilots.

## 2. Certification Requirements

### 2.1 Basic Operations Certificate
Required for operations in:
- Uncontrolled airspace
- More than 30m horizontal from bystanders
- Outside controlled airspace

### 2.2 Advanced Operations Certificate
Required for operations:
- In controlled airspace
- Over bystanders
- Less than 30m horizontal from bystanders (with compliant aircraft)

## 3. Company Requirements
In addition to Transport Canada certification, pilots must:
- Complete company ground school
- Pass operational knowledge exam (80% minimum)
- Complete supervised practical training
- Demonstrate proficiency on each aircraft type

## 4. Currency Requirements
Pilots must maintain:
- 3 takeoffs/landings per 90 days per aircraft type
- Annual proficiency check
- Recurrent training as required

## 5. Record Keeping
Pilot training and certification records shall be maintained for the duration of employment plus 2 years.`,
    keywords: ['certification', 'pilot', 'basic', 'advanced', 'currency', 'proficiency'],
    relatedPolicies: ['1001', '1011'],
    regulatoryRefs: ['CARs 901.54', 'CARs 901.55', 'CARs 901.56'],
    sections: [
      { id: 'sec-1', title: 'Certification Requirements', content: '', order: 0 },
      { id: 'sec-2', title: 'Basic vs Advanced Operations', content: '', order: 1 },
      { id: 'sec-3', title: 'Currency Requirements', content: '', order: 2 },
      { id: 'sec-4', title: 'Proficiency Standards', content: '', order: 3 },
      { id: 'sec-5', title: 'Recertification Process', content: '', order: 4 },
      { id: 'sec-6', title: 'Record Keeping', content: '', order: 5 }
    ]
  },

  // ============================================
  // CRM POLICIES (1013-1021)
  // ============================================
  {
    number: '1013',
    title: 'Crew Resource Management',
    category: 'crm',
    description: 'CRM principles and practices for RPAS operations, including communication, decision making, and situational awareness.',
    version: '1.0',
    owner: 'Chief Pilot',
    status: 'active',
    type: 'default',
    isTemplate: true,
    content: `# Crew Resource Management Policy

## 1. Purpose
To establish CRM principles and practices that enhance crew coordination, communication, and safety during RPAS operations.

## 2. CRM Principles

### 2.1 Communication
- Use standardized terminology
- Practice closed-loop communication
- Challenge and respond appropriately
- Debrief all operations

### 2.2 Situational Awareness
- Maintain awareness of aircraft position and status
- Monitor weather and airspace changes
- Anticipate potential hazards
- Share information with crew members

### 2.3 Decision Making
- Use structured decision-making models
- Consider all available information
- Involve crew in critical decisions
- Re-evaluate decisions as conditions change

### 2.4 Workload Management
- Distribute tasks appropriately
- Prioritize safety-critical tasks
- Avoid task saturation
- Support team members when needed

## 3. Training Requirements
All crew members shall complete CRM training:
- Initial: 4 hours
- Recurrent: 2 hours annually`,
    keywords: ['CRM', 'crew', 'resource', 'management', 'communication', 'teamwork'],
    relatedPolicies: ['1014', '1017', '1018'],
    regulatoryRefs: ['Transport Canada CRM Guidelines', 'ICAO Doc 9995'],
    sections: [
      { id: 'sec-1', title: 'CRM Principles', content: '', order: 0 },
      { id: 'sec-2', title: 'Communication Standards', content: '', order: 1 },
      { id: 'sec-3', title: 'Situational Awareness', content: '', order: 2 },
      { id: 'sec-4', title: 'Workload Management', content: '', order: 3 },
      { id: 'sec-5', title: 'Team Coordination', content: '', order: 4 },
      { id: 'sec-6', title: 'Error Management', content: '', order: 5 }
    ]
  },
  {
    number: '1017',
    title: 'Aeronautical Decision Making',
    category: 'crm',
    description: 'Framework for aeronautical decision making including the FORDEC model and risk-based decision processes.',
    version: '1.0',
    owner: 'Chief Pilot',
    status: 'active',
    type: 'default',
    isTemplate: true,
    content: `# Aeronautical Decision Making

## 1. Purpose
To establish a structured approach to decision making that promotes safe outcomes in RPAS operations.

## 2. FORDEC Model
Use FORDEC for significant decisions:
- **F**acts: What do we know?
- **O**ptions: What can we do?
- **R**isks: What are the risks of each option?
- **D**ecision: Choose the best option
- **E**xecution: Implement the decision
- **C**heck: Monitor and adjust

## 3. Go/No-Go Decisions
Consider the IMSAFE checklist:
- **I**llness
- **M**edication
- **S**tress
- **A**lcohol
- **F**atigue
- **E**motion

## 4. In-Flight Decisions
When conditions change:
1. Recognize the change
2. Assess the impact
3. Consider options
4. Make and communicate decision
5. Monitor results

## 5. Hazardous Attitudes
Recognize and counter:
- Anti-authority
- Impulsivity
- Invulnerability
- Macho
- Resignation`,
    keywords: ['decision making', 'FORDEC', 'ADM', 'risk', 'judgment'],
    relatedPolicies: ['1013', '1018'],
    regulatoryRefs: ['Transport Canada ADM Guidelines'],
    sections: [
      { id: 'sec-1', title: 'Decision Making Framework', content: '', order: 0 },
      { id: 'sec-2', title: 'FORDEC Model', content: '', order: 1 },
      { id: 'sec-3', title: 'Risk Assessment Integration', content: '', order: 2 },
      { id: 'sec-4', title: 'Go/No-Go Decisions', content: '', order: 3 },
      { id: 'sec-5', title: 'In-Flight Decision Making', content: '', order: 4 },
      { id: 'sec-6', title: 'Post-Decision Review', content: '', order: 5 }
    ]
  },
  {
    number: '1019',
    title: 'Fatigue Risk Management',
    category: 'crm',
    description: 'Fatigue risk management system including duty time limitations, rest requirements, and fatigue reporting.',
    version: '1.0',
    owner: 'Operations Manager',
    status: 'active',
    type: 'default',
    isTemplate: true,
    content: `# Fatigue Risk Management

## 1. Purpose
To establish a fatigue risk management system that ensures crew members are fit for duty.

## 2. Duty Time Limitations
- Maximum flight duty period: 10 hours
- Maximum consecutive duty days: 6
- Minimum rest between duty periods: 10 hours

## 3. Rest Requirements
Adequate rest includes:
- Opportunity for 8 hours sleep
- Time for meals and personal needs
- Freedom from work responsibilities

## 4. Fatigue Indicators
Recognize signs of fatigue:
- Difficulty concentrating
- Slow reaction time
- Memory lapses
- Mood changes
- Physical tiredness

## 5. Reporting
Crew members must report when fatigue may affect safety. No punitive action shall be taken for fatigue reports made in good faith.

## 6. Scheduling Considerations
- Avoid scheduling during circadian low points
- Allow recovery time after early starts or late finishes
- Consider cumulative fatigue over extended periods`,
    keywords: ['fatigue', 'duty time', 'rest', 'FRMS', 'hours'],
    relatedPolicies: ['1020'],
    regulatoryRefs: ['Transport Canada FRMS Guidelines'],
    sections: [
      { id: 'sec-1', title: 'Fatigue Risk Factors', content: '', order: 0 },
      { id: 'sec-2', title: 'Duty Time Limitations', content: '', order: 1 },
      { id: 'sec-3', title: 'Rest Requirements', content: '', order: 2 },
      { id: 'sec-4', title: 'Fatigue Reporting', content: '', order: 3 },
      { id: 'sec-5', title: 'Scheduling Considerations', content: '', order: 4 },
      { id: 'sec-6', title: 'Fatigue Countermeasures', content: '', order: 5 }
    ]
  },

  // ============================================
  // HSE POLICIES (1022-1045)
  // ============================================
  {
    number: '1022',
    title: 'Health and Safety Policy',
    category: 'hse',
    description: 'Overarching health and safety policy establishing commitment, responsibilities, and HSE management system framework.',
    version: '1.0',
    owner: 'HSE Manager',
    status: 'active',
    type: 'default',
    isTemplate: true,
    content: `# Health and Safety Policy

## 1. Policy Statement
[Company Name] is committed to providing a safe and healthy workplace for all employees, contractors, and visitors. We believe all incidents are preventable and safety is everyone's responsibility.

## 2. Management Commitment
Management commits to:
- Providing safe work environments and equipment
- Allocating resources for safety programs
- Leading by example in safety practices
- Continuous improvement of safety performance

## 3. Responsibilities

### 3.1 Employer
- Establish and maintain HSE management system
- Provide training and supervision
- Ensure equipment is safe
- Investigate incidents

### 3.2 Supervisors
- Ensure workers follow safe procedures
- Conduct workplace inspections
- Report and address hazards
- Provide job-specific training

### 3.3 Workers
- Follow safe work procedures
- Use required PPE
- Report hazards and incidents
- Refuse unsafe work

## 4. Performance Monitoring
Safety performance shall be monitored through:
- Leading indicators (inspections, training completion)
- Lagging indicators (incident rates)
- Regular management review`,
    keywords: ['health', 'safety', 'policy', 'HSE', 'OHS', 'management'],
    relatedPolicies: ['1023', '1024'],
    regulatoryRefs: ['OH&S Act', 'COR Requirements'],
    sections: [
      { id: 'sec-1', title: 'Policy Statement', content: '', order: 0 },
      { id: 'sec-2', title: 'Management Commitment', content: '', order: 1 },
      { id: 'sec-3', title: 'Responsibilities', content: '', order: 2 },
      { id: 'sec-4', title: 'HSE Management System', content: '', order: 3 },
      { id: 'sec-5', title: 'Performance Monitoring', content: '', order: 4 },
      { id: 'sec-6', title: 'Continuous Improvement', content: '', order: 5 }
    ]
  },
  {
    number: '1023',
    title: 'Hazard Identification and Risk Assessment',
    category: 'hse',
    description: 'Procedures for identifying workplace hazards and conducting risk assessments using the 5x5 risk matrix.',
    version: '1.0',
    owner: 'HSE Manager',
    status: 'active',
    type: 'default',
    isTemplate: true,
    content: `# Hazard Identification and Risk Assessment

## 1. Purpose
To establish procedures for systematically identifying hazards and assessing risks in the workplace.

## 2. Hazard Identification Process
Hazards shall be identified through:
- Workplace inspections
- Task analysis
- Incident investigations
- Worker input
- Equipment assessments

## 3. Risk Assessment Methodology

### 3.1 5x5 Risk Matrix
Risk = Likelihood x Severity

**Likelihood Scale:**
1 - Rare
2 - Unlikely
3 - Possible
4 - Likely
5 - Almost Certain

**Severity Scale:**
1 - Negligible
2 - Minor
3 - Moderate
4 - Major
5 - Catastrophic

### 3.2 Risk Ranking
- 1-4: Low (monitor)
- 5-9: Medium (control required)
- 10-16: High (significant control required)
- 17-25: Extreme (work should not proceed)

## 4. Control Measures
Apply hierarchy of controls:
1. Elimination
2. Substitution
3. Engineering controls
4. Administrative controls
5. PPE

## 5. Documentation
All assessments shall be documented and reviewed annually or when conditions change.`,
    keywords: ['hazard', 'HIRA', 'risk assessment', 'matrix', 'identification'],
    relatedPolicies: ['1022', '1024'],
    regulatoryRefs: ['OH&S Act', 'COR Requirements', 'CSA Z1002'],
    sections: [
      { id: 'sec-1', title: 'Hazard Identification Process', content: '', order: 0 },
      { id: 'sec-2', title: 'Risk Assessment Methodology', content: '', order: 1 },
      { id: 'sec-3', title: '5x5 Risk Matrix', content: '', order: 2 },
      { id: 'sec-4', title: 'Risk Ranking and Prioritization', content: '', order: 3 },
      { id: 'sec-5', title: 'Control Measures', content: '', order: 4 },
      { id: 'sec-6', title: 'Documentation Requirements', content: '', order: 5 }
    ]
  },
  {
    number: '1025',
    title: 'Personal Protective Equipment',
    category: 'hse',
    description: 'PPE requirements, selection, use, maintenance, and training for all operational activities.',
    version: '1.0',
    owner: 'HSE Manager',
    status: 'active',
    type: 'default',
    isTemplate: true,
    content: `# Personal Protective Equipment

## 1. Purpose
To establish requirements for the selection, use, and maintenance of PPE.

## 2. PPE Requirements by Task

### 2.1 Standard Field Operations
- High-visibility vest (ANSI Class 2)
- Safety footwear (CSA Grade 1)
- Sun protection (hat, sunscreen)
- Eye protection (as needed)

### 2.2 Enhanced PPE Situations
Additional PPE may be required based on:
- Client site requirements
- Environmental conditions
- Task-specific hazards

## 3. PPE Selection
PPE shall be:
- Appropriate for the hazard
- Properly sized for the worker
- Compatible with other PPE
- CSA or equivalent certified

## 4. Use and Limitations
- Inspect PPE before each use
- Use as trained
- Do not modify PPE
- Understand limitations

## 5. Maintenance
- Clean and store properly
- Replace when damaged or worn
- Follow manufacturer guidelines
- Document inspections

## 6. Training
Workers shall receive training on:
- Proper use of assigned PPE
- Limitations of PPE
- Inspection and maintenance
- When to replace`,
    keywords: ['PPE', 'protective', 'equipment', 'safety gear', 'protection'],
    relatedPolicies: ['1024'],
    regulatoryRefs: ['OH&S Act', 'CSA Standards'],
    sections: [
      { id: 'sec-1', title: 'PPE Requirements by Task', content: '', order: 0 },
      { id: 'sec-2', title: 'Selection Criteria', content: '', order: 1 },
      { id: 'sec-3', title: 'Use and Limitations', content: '', order: 2 },
      { id: 'sec-4', title: 'Inspection and Maintenance', content: '', order: 3 },
      { id: 'sec-5', title: 'Training Requirements', content: '', order: 4 },
      { id: 'sec-6', title: 'Procurement Standards', content: '', order: 5 }
    ]
  },
  {
    number: '1026',
    title: 'Emergency Response Plan',
    category: 'hse',
    description: 'Emergency response procedures for medical emergencies, fires, severe weather, and other emergency situations.',
    version: '1.0',
    owner: 'HSE Manager',
    status: 'active',
    type: 'default',
    isTemplate: true,
    content: `# Emergency Response Plan

## 1. Purpose
To establish procedures for responding to emergencies during operations.

## 2. Emergency Contacts
- Emergency Services: 911
- Company Emergency Line: [Phone Number]
- NAV CANADA FIC: [FIC Phone Number]
- Poison Control: [Phone Number]

## 3. Emergency Classification
- **Life-Threatening**: Immediate danger to life (call 911)
- **Urgent**: Requires prompt response but not immediately life-threatening
- **Non-Urgent**: Can be managed with standard first aid

## 4. Response Procedures

### 4.1 Medical Emergency
1. Ensure scene safety
2. Call 911 if life-threatening
3. Provide first aid as trained
4. Do not move injured person unless necessary
5. Notify supervisor

### 4.2 Fire
1. Alert others and evacuate
2. Call 911
3. Use fire extinguisher only if safe
4. Meet at designated assembly point
5. Account for all personnel

### 4.3 Severe Weather
1. Monitor weather forecasts
2. Secure equipment and seek shelter
3. Follow lightning safety procedures
4. Resume operations when safe

## 5. Assembly Points
- Field operations: Minimum 100m from hazard area
- Vehicles serve as shelter of last resort

## 6. Emergency Equipment
Each crew shall have:
- First aid kit
- Fire extinguisher
- Communication device
- Emergency contact list`,
    keywords: ['emergency', 'response', 'plan', 'ERP', 'evacuation'],
    relatedPolicies: ['1006', '1027', '1028'],
    regulatoryRefs: ['OH&S Act', 'Fire Code'],
    sections: [
      { id: 'sec-1', title: 'Emergency Classification', content: '', order: 0 },
      { id: 'sec-2', title: 'Response Procedures', content: '', order: 1 },
      { id: 'sec-3', title: 'Evacuation Procedures', content: '', order: 2 },
      { id: 'sec-4', title: 'Emergency Contacts', content: '', order: 3 },
      { id: 'sec-5', title: 'Emergency Equipment', content: '', order: 4 },
      { id: 'sec-6', title: 'Drill Requirements', content: '', order: 5 }
    ]
  },
  {
    number: '1040',
    title: 'Incident Investigation',
    category: 'hse',
    description: 'Procedures for investigating workplace incidents and near-misses to identify root causes and prevent recurrence.',
    version: '1.0',
    owner: 'HSE Manager',
    status: 'active',
    type: 'default',
    isTemplate: true,
    content: `# Incident Investigation Procedure

## 1. Purpose
To establish procedures for investigating incidents to identify root causes and prevent recurrence.

## 2. Investigation Triggers
Investigations required for:
- All injuries requiring medical treatment
- Property damage over $500
- Equipment failures
- Near-misses with serious potential
- Environmental releases

## 3. Investigation Process

### 3.1 Immediate Actions
1. Ensure scene safety
2. Provide first aid as needed
3. Secure the scene
4. Notify supervisor and HSE

### 3.2 Investigation Steps
1. Gather evidence (photos, statements, documents)
2. Interview witnesses
3. Identify immediate and root causes
4. Develop corrective actions
5. Document findings

## 4. Root Cause Analysis
Use appropriate techniques:
- 5 Whys
- Fishbone diagram
- Timeline analysis
- Fault tree analysis

## 5. Corrective Actions
Actions shall be:
- Specific and measurable
- Assigned to responsible person
- Given target completion date
- Tracked to completion

## 6. Documentation
Investigation reports shall include:
- Incident description
- Causal factors
- Root causes
- Corrective actions
- Follow-up requirements`,
    keywords: ['incident', 'investigation', 'root cause', 'analysis', 'near miss'],
    relatedPolicies: ['1007', '1041'],
    regulatoryRefs: ['OH&S Act', 'COR Requirements'],
    sections: [
      { id: 'sec-1', title: 'Investigation Requirements', content: '', order: 0 },
      { id: 'sec-2', title: 'Investigation Team', content: '', order: 1 },
      { id: 'sec-3', title: 'Root Cause Analysis', content: '', order: 2 },
      { id: 'sec-4', title: 'Documentation', content: '', order: 3 },
      { id: 'sec-5', title: 'Corrective Actions', content: '', order: 4 },
      { id: 'sec-6', title: 'Lessons Learned', content: '', order: 5 }
    ]
  }
]

/**
 * Function to seed default templates to Firestore
 * Call this during initial setup or when updating templates
 */
export async function seedDefaultTemplates(createPolicyFn) {
  const results = []

  for (const template of DEFAULT_POLICY_TEMPLATES) {
    try {
      const result = await createPolicyFn({
        ...template,
        type: 'default',
        isTemplate: true,
        effectiveDate: new Date().toISOString().split('T')[0],
        reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      results.push({ success: true, number: template.number, id: result.id })
    } catch (error) {
      results.push({ success: false, number: template.number, error: error.message })
    }
  }

  return results
}

export default DEFAULT_POLICY_TEMPLATES
