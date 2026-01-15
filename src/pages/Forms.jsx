import { useState, useEffect } from 'react'
import { 
  ClipboardList,
  Plus,
  Search,
  FileText,
  CheckCircle2,
  ChevronRight,
  Trash2,
  Edit3,
  Calendar,
  FolderKanban,
  X,
  ArrowLeft,
  Save,
  Printer,
  Check
} from 'lucide-react'

// Form templates with actual fields
const formTemplates = [
  { 
    id: 'preflight_checklist', 
    name: 'Pre-Flight Checklist',
    description: 'Aircraft inspection and systems check before flight',
    category: 'flight',
    fields: [
      { type: 'section', label: 'Aircraft Information' },
      { id: 'aircraft', type: 'text', label: 'Aircraft ID / Registration', required: true },
      { id: 'pilot', type: 'text', label: 'Pilot in Command', required: true },
      { id: 'date', type: 'date', label: 'Date', required: true },
      { id: 'location', type: 'text', label: 'Location', required: true },
      { type: 'section', label: 'Visual Inspection' },
      { id: 'check_frame', type: 'checkbox', label: 'Frame/body - no damage, cracks, or loose parts' },
      { id: 'check_props', type: 'checkbox', label: 'Propellers - no damage, secure, correct orientation' },
      { id: 'check_motors', type: 'checkbox', label: 'Motors - spin freely, no debris, secure' },
      { id: 'check_landing', type: 'checkbox', label: 'Landing gear - secure, no damage' },
      { id: 'check_camera', type: 'checkbox', label: 'Camera/gimbal - secure, clean lens, moves freely' },
      { id: 'check_antennas', type: 'checkbox', label: 'Antennas - secure, no damage, properly oriented' },
      { type: 'section', label: 'Battery Check' },
      { id: 'battery_id', type: 'text', label: 'Battery ID' },
      { id: 'battery_voltage', type: 'text', label: 'Battery Voltage' },
      { id: 'check_battery_damage', type: 'checkbox', label: 'Battery - no swelling, damage, or deformation' },
      { id: 'check_battery_secure', type: 'checkbox', label: 'Battery - properly seated and secured' },
      { id: 'check_battery_contacts', type: 'checkbox', label: 'Battery contacts - clean, no corrosion' },
      { type: 'section', label: 'Control Systems' },
      { id: 'check_controller', type: 'checkbox', label: 'Controller - powered on, charged, no errors' },
      { id: 'check_sticks', type: 'checkbox', label: 'Control sticks - centered, move freely' },
      { id: 'check_telemetry', type: 'checkbox', label: 'Telemetry link - connected, signal strong' },
      { id: 'check_gps', type: 'checkbox', label: 'GPS - acquired, sufficient satellites' },
      { id: 'check_compass', type: 'checkbox', label: 'Compass - calibrated, no interference' },
      { id: 'check_rth', type: 'checkbox', label: 'RTH altitude and location - set correctly' },
      { type: 'section', label: 'Final Checks' },
      { id: 'check_sd', type: 'checkbox', label: 'SD card - inserted, sufficient space' },
      { id: 'check_firmware', type: 'checkbox', label: 'Firmware - up to date, no updates pending' },
      { id: 'check_airspace', type: 'checkbox', label: 'Airspace - checked, cleared for operation' },
      { id: 'check_weather', type: 'checkbox', label: 'Weather - within limits' },
      { id: 'notes', type: 'textarea', label: 'Notes / Discrepancies' },
      { id: 'ready', type: 'checkbox', label: 'AIRCRAFT READY FOR FLIGHT', required: true }
    ]
  },
  { 
    id: 'postflight_checklist', 
    name: 'Post-Flight Checklist',
    description: 'Aircraft inspection and data management after flight',
    category: 'flight',
    fields: [
      { type: 'section', label: 'Flight Information' },
      { id: 'aircraft', type: 'text', label: 'Aircraft ID', required: true },
      { id: 'pilot', type: 'text', label: 'Pilot in Command', required: true },
      { id: 'date', type: 'date', label: 'Date', required: true },
      { id: 'flight_time', type: 'text', label: 'Total Flight Time' },
      { type: 'section', label: 'Aircraft Condition' },
      { id: 'check_damage', type: 'checkbox', label: 'Aircraft inspected for damage - none found' },
      { id: 'check_props_post', type: 'checkbox', label: 'Propellers - no damage or wear' },
      { id: 'check_motors_post', type: 'checkbox', label: 'Motors - normal temperature, no issues' },
      { id: 'check_battery_post', type: 'checkbox', label: 'Battery - removed, inspected, no swelling' },
      { type: 'section', label: 'Data Management' },
      { id: 'check_data_download', type: 'checkbox', label: 'Flight data downloaded' },
      { id: 'check_media_backup', type: 'checkbox', label: 'Media backed up' },
      { id: 'check_sd_removed', type: 'checkbox', label: 'SD card removed/formatted' },
      { id: 'check_logs', type: 'checkbox', label: 'Flight logs exported' },
      { type: 'section', label: 'Storage' },
      { id: 'check_powered_off', type: 'checkbox', label: 'Aircraft powered off' },
      { id: 'check_battery_storage', type: 'checkbox', label: 'Battery set to storage charge' },
      { id: 'check_case', type: 'checkbox', label: 'Aircraft stored in case' },
      { id: 'check_controller_off', type: 'checkbox', label: 'Controller powered off' },
      { id: 'issues', type: 'textarea', label: 'Issues / Maintenance Required' },
      { id: 'complete', type: 'checkbox', label: 'POST-FLIGHT COMPLETE', required: true }
    ]
  },
  { 
    id: 'flight_log', 
    name: 'Flight Log',
    description: 'Individual flight record with times, locations, and notes',
    category: 'flight',
    fields: [
      { type: 'section', label: 'Flight Information' },
      { id: 'flight_number', type: 'text', label: 'Flight Number', required: true },
      { id: 'date', type: 'date', label: 'Date', required: true },
      { id: 'aircraft', type: 'text', label: 'Aircraft ID', required: true },
      { id: 'pilot', type: 'text', label: 'Pilot in Command', required: true },
      { id: 'vo', type: 'text', label: 'Visual Observer(s)' },
      { type: 'section', label: 'Location' },
      { id: 'site_name', type: 'text', label: 'Site Name' },
      { id: 'latitude', type: 'text', label: 'Latitude' },
      { id: 'longitude', type: 'text', label: 'Longitude' },
      { type: 'section', label: 'Times' },
      { id: 'takeoff_time', type: 'time', label: 'Takeoff Time', required: true },
      { id: 'landing_time', type: 'time', label: 'Landing Time', required: true },
      { id: 'flight_duration', type: 'text', label: 'Flight Duration' },
      { type: 'section', label: 'Flight Parameters' },
      { id: 'max_altitude', type: 'text', label: 'Max Altitude (AGL)' },
      { id: 'max_distance', type: 'text', label: 'Max Distance' },
      { id: 'operation_type', type: 'select', label: 'Operation Type', options: ['VLOS', 'EVLOS', 'BVLOS'] },
      { type: 'section', label: 'Conditions' },
      { id: 'weather', type: 'text', label: 'Weather Conditions' },
      { id: 'wind', type: 'text', label: 'Wind Speed/Direction' },
      { id: 'temperature', type: 'text', label: 'Temperature' },
      { type: 'section', label: 'Battery' },
      { id: 'battery_id', type: 'text', label: 'Battery ID' },
      { id: 'battery_start', type: 'text', label: 'Start Charge %' },
      { id: 'battery_end', type: 'text', label: 'End Charge %' },
      { type: 'section', label: 'Notes' },
      { id: 'purpose', type: 'textarea', label: 'Flight Purpose / Objectives' },
      { id: 'notes', type: 'textarea', label: 'Notes / Observations' },
      { id: 'incidents', type: 'textarea', label: 'Incidents / Anomalies' }
    ]
  },
  { 
    id: 'battery_log', 
    name: 'Battery Log',
    description: 'Battery cycle tracking and health monitoring',
    category: 'equipment',
    fields: [
      { type: 'section', label: 'Battery Information' },
      { id: 'battery_id', type: 'text', label: 'Battery ID', required: true },
      { id: 'date', type: 'date', label: 'Date', required: true },
      { id: 'aircraft', type: 'text', label: 'Aircraft Used In' },
      { type: 'section', label: 'Cycle Data' },
      { id: 'cycle_number', type: 'text', label: 'Cycle Number' },
      { id: 'charge_start', type: 'text', label: 'Charge Before Flight (%)' },
      { id: 'charge_end', type: 'text', label: 'Charge After Flight (%)' },
      { id: 'voltage_start', type: 'text', label: 'Voltage Before (V)' },
      { id: 'voltage_end', type: 'text', label: 'Voltage After (V)' },
      { id: 'flight_time', type: 'text', label: 'Flight Time (min)' },
      { type: 'section', label: 'Condition Check' },
      { id: 'check_physical', type: 'checkbox', label: 'Physical condition good - no swelling/damage' },
      { id: 'check_temperature', type: 'checkbox', label: 'Temperature normal during flight' },
      { id: 'check_performance', type: 'checkbox', label: 'Performance normal' },
      { id: 'storage_charge', type: 'checkbox', label: 'Set to storage charge after use' },
      { id: 'notes', type: 'textarea', label: 'Notes / Issues' }
    ]
  },
  { 
    id: 'maintenance_record', 
    name: 'Maintenance Record',
    description: 'Equipment maintenance and repair documentation',
    category: 'equipment',
    fields: [
      { type: 'section', label: 'Equipment Information' },
      { id: 'equipment_id', type: 'text', label: 'Equipment ID', required: true },
      { id: 'equipment_type', type: 'text', label: 'Equipment Type', required: true },
      { id: 'date', type: 'date', label: 'Date', required: true },
      { id: 'technician', type: 'text', label: 'Performed By', required: true },
      { type: 'section', label: 'Maintenance Type' },
      { id: 'type_scheduled', type: 'checkbox', label: 'Scheduled Maintenance' },
      { id: 'type_unscheduled', type: 'checkbox', label: 'Unscheduled Maintenance' },
      { id: 'type_repair', type: 'checkbox', label: 'Repair' },
      { id: 'type_inspection', type: 'checkbox', label: 'Inspection' },
      { id: 'type_upgrade', type: 'checkbox', label: 'Upgrade / Modification' },
      { type: 'section', label: 'Details' },
      { id: 'description', type: 'textarea', label: 'Work Description', required: true },
      { id: 'parts_replaced', type: 'textarea', label: 'Parts Replaced' },
      { id: 'parts_cost', type: 'text', label: 'Parts Cost' },
      { id: 'labor_hours', type: 'text', label: 'Labor Hours' },
      { type: 'section', label: 'Verification' },
      { id: 'check_tested', type: 'checkbox', label: 'Equipment tested after maintenance' },
      { id: 'check_returned', type: 'checkbox', label: 'Returned to service' },
      { id: 'next_maintenance', type: 'date', label: 'Next Scheduled Maintenance' },
      { id: 'notes', type: 'textarea', label: 'Additional Notes' }
    ]
  },
  { 
    id: 'site_inspection', 
    name: 'Site Inspection Form',
    description: 'On-site hazard assessment and conditions check',
    category: 'safety',
    fields: [
      { type: 'section', label: 'Site Information' },
      { id: 'site_name', type: 'text', label: 'Site Name', required: true },
      { id: 'date', type: 'date', label: 'Date', required: true },
      { id: 'inspector', type: 'text', label: 'Inspector', required: true },
      { id: 'address', type: 'text', label: 'Address / Location' },
      { id: 'coordinates', type: 'text', label: 'GPS Coordinates' },
      { type: 'section', label: 'Site Conditions' },
      { id: 'check_access', type: 'checkbox', label: 'Site access confirmed' },
      { id: 'check_terrain', type: 'checkbox', label: 'Terrain suitable for operations' },
      { id: 'check_gcp', type: 'checkbox', label: 'GCP locations identified (if applicable)' },
      { id: 'check_launch', type: 'checkbox', label: 'Launch/landing area identified' },
      { type: 'section', label: 'Hazards' },
      { id: 'check_obstacles', type: 'checkbox', label: 'Obstacles identified and mapped' },
      { id: 'obstacles_desc', type: 'textarea', label: 'Obstacle Description' },
      { id: 'check_powerlines', type: 'checkbox', label: 'Power lines identified' },
      { id: 'check_towers', type: 'checkbox', label: 'Towers/antennas identified' },
      { id: 'check_wildlife', type: 'checkbox', label: 'Wildlife hazards assessed' },
      { id: 'check_people', type: 'checkbox', label: 'Public access points identified' },
      { type: 'section', label: 'Airspace' },
      { id: 'airspace_class', type: 'text', label: 'Airspace Classification' },
      { id: 'check_notam', type: 'checkbox', label: 'NOTAMs checked' },
      { id: 'check_authorization', type: 'checkbox', label: 'Airspace authorization obtained (if required)' },
      { type: 'section', label: 'Communications' },
      { id: 'cell_coverage', type: 'select', label: 'Cell Coverage', options: ['Good', 'Fair', 'Poor', 'None'] },
      { id: 'radio_check', type: 'checkbox', label: 'Radio communications tested' },
      { type: 'section', label: 'Emergency' },
      { id: 'hospital', type: 'text', label: 'Nearest Hospital' },
      { id: 'rally_point', type: 'text', label: 'Emergency Rally Point' },
      { id: 'notes', type: 'textarea', label: 'Additional Notes / Concerns' },
      { id: 'approved', type: 'checkbox', label: 'SITE APPROVED FOR OPERATIONS', required: true }
    ]
  },
  { 
    id: 'incident_report', 
    name: 'Incident Report',
    description: 'Documentation of incidents, accidents, or near-misses',
    category: 'safety',
    fields: [
      { type: 'section', label: 'Incident Information' },
      { id: 'date', type: 'date', label: 'Date of Incident', required: true },
      { id: 'time', type: 'time', label: 'Time of Incident', required: true },
      { id: 'location', type: 'text', label: 'Location', required: true },
      { id: 'reporter', type: 'text', label: 'Reported By', required: true },
      { id: 'report_date', type: 'date', label: 'Report Date', required: true },
      { type: 'section', label: 'Incident Type' },
      { id: 'type_accident', type: 'checkbox', label: 'Accident' },
      { id: 'type_incident', type: 'checkbox', label: 'Incident' },
      { id: 'type_nearmiss', type: 'checkbox', label: 'Near Miss' },
      { id: 'type_damage', type: 'checkbox', label: 'Equipment Damage' },
      { id: 'type_injury', type: 'checkbox', label: 'Personal Injury' },
      { id: 'type_airspace', type: 'checkbox', label: 'Airspace Violation' },
      { type: 'section', label: 'Personnel Involved' },
      { id: 'pic', type: 'text', label: 'PIC' },
      { id: 'others', type: 'textarea', label: 'Other Personnel Involved' },
      { type: 'section', label: 'Equipment Involved' },
      { id: 'aircraft', type: 'text', label: 'Aircraft ID' },
      { id: 'other_equipment', type: 'text', label: 'Other Equipment' },
      { type: 'section', label: 'Description' },
      { id: 'description', type: 'textarea', label: 'Detailed Description of Incident', required: true },
      { id: 'conditions', type: 'textarea', label: 'Conditions at Time of Incident' },
      { id: 'immediate_actions', type: 'textarea', label: 'Immediate Actions Taken' },
      { type: 'section', label: 'Analysis' },
      { id: 'causes', type: 'textarea', label: 'Contributing Factors / Root Cause' },
      { id: 'corrective', type: 'textarea', label: 'Corrective Actions' },
      { id: 'preventive', type: 'textarea', label: 'Preventive Measures' },
      { type: 'section', label: 'Notifications' },
      { id: 'notify_tc', type: 'checkbox', label: 'Transport Canada notification required' },
      { id: 'notify_client', type: 'checkbox', label: 'Client notified' },
      { id: 'notify_insurance', type: 'checkbox', label: 'Insurance notified' },
      { id: 'followup', type: 'textarea', label: 'Follow-up Required' }
    ]
  },
  { 
    id: 'jsa_form', 
    name: 'Job Safety Analysis (JSA)',
    description: 'Task-specific hazard identification and controls',
    category: 'safety',
    fields: [
      { type: 'section', label: 'Job Information' },
      { id: 'job_name', type: 'text', label: 'Job / Task Name', required: true },
      { id: 'date', type: 'date', label: 'Date', required: true },
      { id: 'prepared_by', type: 'text', label: 'Prepared By', required: true },
      { id: 'location', type: 'text', label: 'Location' },
      { type: 'section', label: 'Step 1' },
      { id: 'step1_task', type: 'text', label: 'Task Description' },
      { id: 'step1_hazards', type: 'textarea', label: 'Potential Hazards' },
      { id: 'step1_controls', type: 'textarea', label: 'Controls / Safe Procedures' },
      { type: 'section', label: 'Step 2' },
      { id: 'step2_task', type: 'text', label: 'Task Description' },
      { id: 'step2_hazards', type: 'textarea', label: 'Potential Hazards' },
      { id: 'step2_controls', type: 'textarea', label: 'Controls / Safe Procedures' },
      { type: 'section', label: 'Step 3' },
      { id: 'step3_task', type: 'text', label: 'Task Description' },
      { id: 'step3_hazards', type: 'textarea', label: 'Potential Hazards' },
      { id: 'step3_controls', type: 'textarea', label: 'Controls / Safe Procedures' },
      { type: 'section', label: 'Step 4' },
      { id: 'step4_task', type: 'text', label: 'Task Description' },
      { id: 'step4_hazards', type: 'textarea', label: 'Potential Hazards' },
      { id: 'step4_controls', type: 'textarea', label: 'Controls / Safe Procedures' },
      { type: 'section', label: 'PPE Required' },
      { id: 'ppe_hardhat', type: 'checkbox', label: 'Hard Hat' },
      { id: 'ppe_vest', type: 'checkbox', label: 'High-Vis Vest' },
      { id: 'ppe_boots', type: 'checkbox', label: 'Safety Boots' },
      { id: 'ppe_glasses', type: 'checkbox', label: 'Safety Glasses' },
      { id: 'ppe_gloves', type: 'checkbox', label: 'Gloves' },
      { id: 'ppe_other', type: 'text', label: 'Other PPE' },
      { type: 'section', label: 'Acknowledgment' },
      { id: 'reviewed', type: 'checkbox', label: 'JSA reviewed with all crew members', required: true }
    ]
  },
  { 
    id: 'crew_signoff', 
    name: 'Crew Sign-Off Sheet',
    description: 'Daily crew briefing acknowledgment',
    category: 'admin',
    fields: [
      { type: 'section', label: 'Briefing Information' },
      { id: 'project', type: 'text', label: 'Project Name', required: true },
      { id: 'date', type: 'date', label: 'Date', required: true },
      { id: 'briefing_time', type: 'time', label: 'Briefing Time' },
      { id: 'conducted_by', type: 'text', label: 'Briefing Conducted By', required: true },
      { type: 'section', label: 'Topics Covered' },
      { id: 'topic_scope', type: 'checkbox', label: 'Scope of work' },
      { id: 'topic_hazards', type: 'checkbox', label: 'Site hazards' },
      { id: 'topic_emergency', type: 'checkbox', label: 'Emergency procedures' },
      { id: 'topic_comms', type: 'checkbox', label: 'Communications' },
      { id: 'topic_ppe', type: 'checkbox', label: 'PPE requirements' },
      { id: 'topic_weather', type: 'checkbox', label: 'Weather conditions' },
      { id: 'additional_topics', type: 'textarea', label: 'Additional Topics' },
      { type: 'section', label: 'Crew Acknowledgment' },
      { id: 'crew1_name', type: 'text', label: 'Crew Member 1 - Name' },
      { id: 'crew1_ack', type: 'checkbox', label: 'Acknowledged' },
      { id: 'crew2_name', type: 'text', label: 'Crew Member 2 - Name' },
      { id: 'crew2_ack', type: 'checkbox', label: 'Acknowledged' },
      { id: 'crew3_name', type: 'text', label: 'Crew Member 3 - Name' },
      { id: 'crew3_ack', type: 'checkbox', label: 'Acknowledged' },
      { id: 'crew4_name', type: 'text', label: 'Crew Member 4 - Name' },
      { id: 'crew4_ack', type: 'checkbox', label: 'Acknowledged' }
    ]
  },
  { 
    id: 'client_signoff', 
    name: 'Client Sign-Off',
    description: 'Client acceptance of deliverables',
    category: 'admin',
    fields: [
      { type: 'section', label: 'Project Information' },
      { id: 'project', type: 'text', label: 'Project Name', required: true },
      { id: 'date', type: 'date', label: 'Date', required: true },
      { id: 'client_name', type: 'text', label: 'Client Name', required: true },
      { id: 'client_rep', type: 'text', label: 'Client Representative', required: true },
      { type: 'section', label: 'Deliverables' },
      { id: 'deliverables', type: 'textarea', label: 'Deliverables Provided', required: true },
      { id: 'data_format', type: 'text', label: 'Data Format(s)' },
      { id: 'delivery_method', type: 'text', label: 'Delivery Method' },
      { type: 'section', label: 'Acceptance' },
      { id: 'check_received', type: 'checkbox', label: 'Deliverables received' },
      { id: 'check_reviewed', type: 'checkbox', label: 'Deliverables reviewed' },
      { id: 'check_complete', type: 'checkbox', label: 'Deliverables complete and acceptable' },
      { id: 'feedback', type: 'textarea', label: 'Client Feedback / Comments' },
      { type: 'section', label: 'Sign-Off' },
      { id: 'accepted', type: 'checkbox', label: 'CLIENT ACCEPTS DELIVERABLES', required: true },
      { id: 'signature_name', type: 'text', label: 'Printed Name' },
      { id: 'signature_date', type: 'date', label: 'Signature Date' }
    ]
  },
  { 
    id: 'data_transfer', 
    name: 'Data Transfer Log',
    description: 'Chain of custody for collected data',
    category: 'admin',
    fields: [
      { type: 'section', label: 'Transfer Information' },
      { id: 'date', type: 'date', label: 'Transfer Date', required: true },
      { id: 'project', type: 'text', label: 'Project Name', required: true },
      { id: 'transferred_by', type: 'text', label: 'Transferred By', required: true },
      { id: 'received_by', type: 'text', label: 'Received By', required: true },
      { type: 'section', label: 'Data Description' },
      { id: 'data_type', type: 'text', label: 'Data Type' },
      { id: 'file_count', type: 'text', label: 'Number of Files' },
      { id: 'total_size', type: 'text', label: 'Total Size' },
      { id: 'date_range', type: 'text', label: 'Data Date Range' },
      { type: 'section', label: 'Transfer Method' },
      { id: 'method_physical', type: 'checkbox', label: 'Physical media (USB, HDD)' },
      { id: 'method_cloud', type: 'checkbox', label: 'Cloud transfer' },
      { id: 'method_network', type: 'checkbox', label: 'Network transfer' },
      { id: 'media_id', type: 'text', label: 'Media ID (if physical)' },
      { type: 'section', label: 'Verification' },
      { id: 'check_integrity', type: 'checkbox', label: 'Data integrity verified' },
      { id: 'check_complete', type: 'checkbox', label: 'All files transferred' },
      { id: 'check_backup', type: 'checkbox', label: 'Source data backed up' },
      { id: 'notes', type: 'textarea', label: 'Notes' }
    ]
  }
]

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'flight', label: 'Flight Operations' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'safety', label: 'Safety' },
  { value: 'admin', label: 'Administrative' }
]

const statusColors = {
  draft: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  issue: 'bg-amber-100 text-amber-700'
}

export default function Forms() {
  const [forms, setForms] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showNewFormModal, setShowNewFormModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [editingForm, setEditingForm] = useState(null)
  const [newFormData, setNewFormData] = useState({ projectName: '' })

  // Load forms from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aeria_forms')
    if (saved) {
      setForms(JSON.parse(saved))
    }
  }, [])

  // Save forms
  const saveForms = (updatedForms) => {
    setForms(updatedForms)
    localStorage.setItem('aeria_forms', JSON.stringify(updatedForms))
  }

  // Create new form
  const createForm = () => {
    if (!selectedTemplate) return

    const newForm = {
      id: Date.now().toString(),
      templateId: selectedTemplate.id,
      name: selectedTemplate.name,
      category: selectedTemplate.category,
      projectName: newFormData.projectName,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {}
    }

    const updatedForms = [newForm, ...forms]
    saveForms(updatedForms)
    setShowNewFormModal(false)
    setSelectedTemplate(null)
    setNewFormData({ projectName: '' })
    setEditingForm(newForm)
  }

  // Update form field
  const updateFormData = (fieldId, value) => {
    if (!editingForm) return
    setEditingForm({
      ...editingForm,
      data: { ...editingForm.data, [fieldId]: value },
      updatedAt: new Date().toISOString()
    })
  }

  // Save form
  const saveForm = (status) => {
    if (!editingForm) return
    const updated = {
      ...editingForm,
      status: status || editingForm.status,
      updatedAt: new Date().toISOString(),
      completedAt: status === 'completed' ? new Date().toISOString() : editingForm.completedAt
    }
    saveForms(forms.map(f => f.id === updated.id ? updated : f))
    setEditingForm(null)
  }

  // Delete form
  const deleteForm = (formId) => {
    if (!confirm('Delete this form?')) return
    saveForms(forms.filter(f => f.id !== formId))
    if (editingForm?.id === formId) setEditingForm(null)
  }

  // Get template
  const getTemplate = (templateId) => formTemplates.find(t => t.id === templateId)

  // Filter
  const filteredForms = forms.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         form.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || form.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Stats
  const stats = {
    total: forms.length,
    completed: forms.filter(f => f.status === 'completed').length,
    inProgress: forms.filter(f => f.status === 'in_progress').length,
    draft: forms.filter(f => f.status === 'draft').length
  }

  // FORM EDITOR VIEW
  if (editingForm) {
    const template = getTemplate(editingForm.templateId)
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setEditingForm(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{editingForm.name}</h1>
              {editingForm.projectName && <p className="text-sm text-gray-500">{editingForm.projectName}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={editingForm.status}
              onChange={(e) => setEditingForm({ ...editingForm, status: e.target.value })}
              className={`input text-sm py-1 ${statusColors[editingForm.status]}`}
            >
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="issue">Issue</option>
            </select>
            <button onClick={() => window.print()} className="btn-secondary inline-flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button onClick={() => saveForm()} className="btn-primary inline-flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        <div className="card">
          <div className="space-y-6">
            {template?.fields.map((field, index) => {
              if (field.type === 'section') {
                return (
                  <div key={index} className="border-b border-gray-200 pb-2 pt-4 first:pt-0">
                    <h3 className="font-semibold text-gray-900">{field.label}</h3>
                  </div>
                )
              }

              const value = editingForm.data[field.id] || ''

              if (field.type === 'checkbox') {
                return (
                  <label key={field.id} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!value}
                      onChange={(e) => updateFormData(field.id, e.target.checked)}
                      className="w-5 h-5 text-aeria-navy rounded mt-0.5"
                    />
                    <span className={`text-sm ${value ? 'text-green-700' : 'text-gray-700'}`}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                    {value && <Check className="w-4 h-4 text-green-600" />}
                  </label>
                )
              }

              if (field.type === 'textarea') {
                return (
                  <div key={field.id}>
                    <label className="label">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <textarea
                      value={value}
                      onChange={(e) => updateFormData(field.id, e.target.value)}
                      className="input min-h-[100px]"
                    />
                  </div>
                )
              }

              if (field.type === 'select') {
                return (
                  <div key={field.id}>
                    <label className="label">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <select
                      value={value}
                      onChange={(e) => updateFormData(field.id, e.target.value)}
                      className="input"
                    >
                      <option value="">Select...</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                )
              }

              return (
                <div key={field.id}>
                  <label className="label">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    value={value}
                    onChange={(e) => updateFormData(field.id, e.target.value)}
                    className="input"
                  />
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-between">
          <button onClick={() => deleteForm(editingForm.id)} className="text-red-600 hover:text-red-700 text-sm">
            Delete Form
          </button>
          <div className="flex gap-3">
            <button onClick={() => setEditingForm(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => saveForm('completed')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Save & Complete
            </button>
          </div>
        </div>
      </div>
    )
  }

  // FORMS LIST VIEW
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
          <p className="text-gray-500">Field forms and checklists</p>
        </div>
        <button onClick={() => setShowNewFormModal(true)} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Form
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Forms</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          <p className="text-sm text-gray-500">In Progress</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-400">{stats.draft}</p>
          <p className="text-sm text-gray-500">Drafts</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
            placeholder="Search forms..."
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input w-full sm:w-auto">
          {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
        </select>
      </div>

      {filteredForms.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {forms.length === 0 ? 'No forms yet' : 'No forms match your search'}
          </h3>
          <p className="text-gray-500 mb-4">
            {forms.length === 0 ? 'Start a new form to track field operations' : 'Try adjusting your search or filter'}
          </p>
          {forms.length === 0 && (
            <button onClick={() => setShowNewFormModal(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Start a Form
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredForms.map((form) => (
            <div key={form.id} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setEditingForm(form)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{form.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${statusColors[form.status]}`}>
                      {form.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    {form.projectName && (
                      <span className="inline-flex items-center gap-1">
                        <FolderKanban className="w-3 h-3" />
                        {form.projectName}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(form.createdAt).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-1 capitalize">
                      <FileText className="w-3 h-3" />
                      {form.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setEditingForm(form) }} className="p-2 text-gray-400 hover:text-aeria-blue rounded">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteForm(form.id) }} className="p-2 text-gray-400 hover:text-red-500 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowNewFormModal(false); setSelectedTemplate(null) }} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">New Form</h2>
              <button onClick={() => { setShowNewFormModal(false); setSelectedTemplate(null) }} className="p-2 text-gray-400 hover:text-gray-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {!selectedTemplate ? (
                <>
                  <p className="text-sm text-gray-500 mb-4">Select a form template:</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {formTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className="p-3 text-left border border-gray-200 rounded-lg hover:border-aeria-blue hover:bg-aeria-sky transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{template.name}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500">{template.description}</p>
                        <span className="text-xs text-gray-400 capitalize mt-1 inline-block">{template.category}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => setSelectedTemplate(null)} className="text-sm text-aeria-blue hover:underline mb-4 inline-flex items-center gap-1">
                    ← Back to templates
                  </button>
                  <div className="p-3 bg-gray-50 rounded-lg mb-4">
                    <p className="font-medium text-gray-900">{selectedTemplate.name}</p>
                    <p className="text-sm text-gray-500">{selectedTemplate.description}</p>
                  </div>
                  <div>
                    <label className="label">Project / Job Name (optional)</label>
                    <input
                      type="text"
                      value={newFormData.projectName}
                      onChange={(e) => setNewFormData({ projectName: e.target.value })}
                      className="input"
                      placeholder="e.g., Pipeline Inspection - Site A"
                    />
                  </div>
                </>
              )}
            </div>

            {selectedTemplate && (
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
                <button onClick={() => { setShowNewFormModal(false); setSelectedTemplate(null) }} className="btn-secondary">Cancel</button>
                <button onClick={createForm} className="btn-primary">Create & Open Form</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
