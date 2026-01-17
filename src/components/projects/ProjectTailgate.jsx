import { useState, useEffect } from 'react'
import { 
  FileText,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Users,
  MapPin,
  Plane,
  Radio,
  Shield,
  Clock,
  Phone,
  Wind,
  ChevronDown,
  ChevronUp,
  Printer,
  CheckCircle2,
  AlertOctagon,
  Thermometer,
  Eye,
  UserCheck,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  ClipboardCheck,
  Download,
  HardHat,
  Loader2,
  Zap
} from 'lucide-react'
import { BrandedPDF } from '../../lib/pdfExportService'

export default function ProjectTailgate({ project, onUpdate }) {
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    briefing: true,
    checklist: true,
    attendance: true
  })

  // Initialize tailgate data if not present
  useEffect(() => {
    if (!project.tailgate) {
      onUpdate({
        tailgate: {
          generatedAt: null,
          customNotes: '',
          weatherBriefing: '',
          checklistCompleted: {
            siteSecured: false,
            equipmentChecked: false,
            crewBriefed: false,
            commsVerified: false,
            emergencyReviewed: false,
            notamsChecked: false,
            weatherConfirmed: false,
            riskReviewed: false,
            clientNotified: false,
            ppeConfirmed: false
          },
          crewAttendance: {},
          briefingStartTime: '',
          briefingEndTime: '',
          goNoGoDecision: null,
          goNoGoNotes: '',
          weatherMinimumsConfirmed: false,
          safetyTopics: []
        }
      })
    }
  }, [project.tailgate])

  const tailgate = project.tailgate || {}
  
  const updateTailgate = (updates) => {
    onUpdate({
      tailgate: {
        ...tailgate,
        ...updates
      }
    })
  }

  const updateChecklist = (item, value) => {
    updateTailgate({
      checklistCompleted: {
        ...(tailgate.checklistCompleted || {}),
        [item]: value
      }
    })
  }

  const updateCrewAttendance = (crewId, attended) => {
    updateTailgate({
      crewAttendance: {
        ...(tailgate.crewAttendance || {}),
        [crewId]: {
          attended,
          timestamp: attended ? new Date().toISOString() : null
        }
      }
    })
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Generate briefing content from project data
  const generateBriefing = () => {
    updateTailgate({
      generatedAt: new Date().toISOString(),
      briefingStartTime: new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })
    })
  }

  // Copy briefing to clipboard
  const copyBriefing = () => {
    const text = generateBriefingText()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Get crew by role
  const getCrew = (role) => {
    return (project.crew || []).filter(c => c.role === role)
  }

  const pic = getCrew('PIC')[0]
  const allCrew = project.crew || []

  // Format helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set'
    return new Date(dateStr).toLocaleDateString('en-CA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Get PPE items from project
  const getPPEItems = () => {
    const ppe = project.ppe || {}
    const items = []
    
    // Get selected common items
    if (ppe.selectedItems?.length > 0) {
      const commonPPE = {
        'hi_vis_vest': 'High-Visibility Vest',
        'safety_boots': 'Safety Boots (CSA)',
        'hard_hat': 'Hard Hat',
        'safety_glasses': 'Safety Glasses',
        'ear_plugs': 'Hearing Protection',
        'work_gloves': 'Work Gloves',
        'sunscreen': 'Sunscreen',
        'winter_jacket': 'Winter Jacket',
        'rain_gear': 'Rain Gear'
      }
      ppe.selectedItems.forEach(id => {
        if (commonPPE[id]) items.push(commonPPE[id])
        else items.push(id.replace(/_/g, ' '))
      })
    }
    
    // Get custom items
    if (ppe.customItems?.length > 0) {
      ppe.customItems.forEach(item => items.push(item.item))
    }
    
    // Old structure fallback
    if (ppe.items?.length > 0 && items.length === 0) {
      ppe.items.forEach(item => items.push(item.item || item.name || item))
    }
    
    // Default if nothing
    if (items.length === 0) {
      return ['Safety Vest', 'Safety Boots', 'Safety Glasses (as required)']
    }
    
    return items
  }

  // Get hazards from project
  const getHazards = () => {
    const hazards = project.hseRiskAssessment?.hazards || project.riskAssessment?.hazards || []
    return hazards.slice(0, 6) // Limit to top 6 for briefing
  }

  // Generate plain text version for copying
  const generateBriefingText = () => {
    const ppeItems = getPPEItems()
    const hazards = getHazards()
    
    const lines = [
      `PRE-DEPLOYMENT BRIEFING - ${project.name || 'Untitled Project'}`,
      `═`.repeat(50),
      `Date: ${formatDate(project.startDate)}`,
      `Project Code: ${project.projectCode || 'N/A'}`,
      `Client: ${project.clientName || 'N/A'}`,
      '',
      '─── CREW ───',
      ...allCrew.map(c => `• ${c.role}: ${c.name}${c.phone ? ` (${c.phone})` : ''}`),
      '',
      '─── OPERATION OVERVIEW ───',
      `Description: ${project.description || 'No description'}`,
      `Operation Type: ${project.flightPlan?.operationType || 'Standard'}`,
      `Max Altitude: ${project.flightPlan?.maxAltitudeAGL || project.flightPlan?.maxAltitude || 'N/A'} m AGL`,
      '',
      '─── SITE INFORMATION ───',
      `Location: ${project.siteSurvey?.location?.siteName || project.siteSurvey?.general?.siteName || 'Not specified'}`,
      `Coordinates: ${project.siteSurvey?.location?.coordinates?.lat || 'N/A'}, ${project.siteSurvey?.location?.coordinates?.lng || 'N/A'}`,
      `Access: ${project.siteSurvey?.access?.type || 'Not specified'}`,
      '',
      '─── EMERGENCY CONTACTS ───',
      `Primary: ${project.emergencyPlan?.primaryEmergencyContact?.name || 'Not set'} - ${project.emergencyPlan?.primaryEmergencyContact?.phone || 'N/A'}`,
      `Hospital: ${project.emergencyPlan?.nearestHospital || 'Not set'}`,
      `Rally Point: ${project.emergencyPlan?.rallyPoint || 'Not set'}`,
      '',
      '─── COMMUNICATIONS ───',
      `Primary Channel: ${project.communications?.primaryChannel || 'Not set'}`,
      `Backup: ${project.communications?.backupChannel || 'Not set'}`,
      `Lost Link: ${project.communications?.lostLinkProcedure || 'RTH'}`,
      '',
      '─── KEY HAZARDS & CONTROLS ───',
      ...(hazards.length > 0 
        ? hazards.map(h => `• ${h.description || 'Unnamed hazard'}\n  → Controls: ${h.controls || 'None documented'}`)
        : ['No hazards documented']),
      '',
      '─── PPE REQUIREMENTS ───',
      ...ppeItems.map(item => `• ${item}`),
      '',
      '─── WEATHER BRIEFING ───',
      tailgate.weatherBriefing || 'Not recorded',
      '',
      tailgate.customNotes ? `─── ADDITIONAL NOTES ───\n${tailgate.customNotes}` : '',
      '',
      `═`.repeat(50),
      `Briefing Generated: ${new Date().toLocaleString()}`,
      `Go/No-Go Decision: ${tailgate.goNoGoDecision === true ? 'GO' : tailgate.goNoGoDecision === false ? 'NO-GO' : 'Pending'}`
    ]
    return lines.filter(l => l !== '').join('\n')
  }

  // Export to PDF
  const exportToPDF = async () => {
    setExporting(true)
    try {
      const pdf = new BrandedPDF({
        title: 'Pre-Deployment Briefing',
        subtitle: 'Tailgate Safety Meeting',
        projectName: project.name,
        projectCode: project.projectCode,
        clientName: project.clientName
      })
      
      await pdf.init()
      pdf.addCoverPage()
      pdf.addNewPage()
      
      // Project Info
      pdf.addSectionTitle('Operation Details')
      pdf.addKeyValueGrid([
        { label: 'Project', value: project.name },
        { label: 'Client', value: project.clientName || 'N/A' },
        { label: 'Date', value: project.startDate || 'Not set' },
        { label: 'Operation Type', value: project.flightPlan?.operationType || 'Standard' },
        { label: 'Max Altitude', value: `${project.flightPlan?.maxAltitudeAGL || 'N/A'} m AGL` },
        { label: 'Briefing Time', value: tailgate.briefingStartTime || new Date().toLocaleTimeString() }
      ])
      
      // Crew
      if (allCrew.length > 0) {
        pdf.addSectionTitle('Crew Roster')
        const crewRows = allCrew.map(c => [
          c.role || 'N/A',
          c.name || 'N/A',
          c.phone || 'N/A',
          tailgate.crewAttendance?.[c.id || c.name]?.attended ? '✓ Present' : '○ Absent'
        ])
        pdf.addTable(['Role', 'Name', 'Phone', 'Attendance'], crewRows)
      }
      
      // Site Info
      pdf.addSectionTitle('Site Information')
      pdf.addKeyValueGrid([
        { label: 'Location', value: project.siteSurvey?.location?.siteName || 'Not specified' },
        { label: 'Coordinates', value: `${project.siteSurvey?.location?.coordinates?.lat || 'N/A'}, ${project.siteSurvey?.location?.coordinates?.lng || 'N/A'}` },
        { label: 'Access', value: project.siteSurvey?.access?.type || 'Not specified' },
        { label: 'Ground Conditions', value: project.siteSurvey?.groundConditions?.type || 'Not specified' }
      ])
      
      // Emergency Info
      pdf.addSectionTitle('Emergency Information')
      pdf.addKeyValueGrid([
        { label: 'Emergency Contact', value: `${project.emergencyPlan?.primaryEmergencyContact?.name || 'Not set'} - ${project.emergencyPlan?.primaryEmergencyContact?.phone || 'N/A'}` },
        { label: 'Nearest Hospital', value: project.emergencyPlan?.nearestHospital || 'Not set' },
        { label: 'Rally Point', value: project.emergencyPlan?.rallyPoint || 'Not set' }
      ])
      
      // Communications
      pdf.addSectionTitle('Communications')
      pdf.addKeyValueGrid([
        { label: 'Primary Channel', value: project.communications?.primaryChannel || 'Not set' },
        { label: 'Backup Channel', value: project.communications?.backupChannel || 'Not set' },
        { label: 'Lost Link Procedure', value: project.communications?.lostLinkProcedure || 'RTH' }
      ])
      
      // Hazards
      const hazards = getHazards()
      if (hazards.length > 0) {
        pdf.addSectionTitle('Key Hazards & Controls')
        const hazardRows = hazards.map((h, i) => [
          String(i + 1),
          h.description || 'Unnamed',
          h.controls || 'None documented'
        ])
        pdf.addTable(['#', 'Hazard', 'Controls'], hazardRows)
      }
      
      // PPE
      pdf.addSectionTitle('Required PPE')
      const ppeItems = getPPEItems()
      pdf.addParagraph(ppeItems.join(' • '))
      
      // Weather
      if (tailgate.weatherBriefing) {
        pdf.addSectionTitle('Weather Briefing')
        pdf.addParagraph(tailgate.weatherBriefing)
      }
      
      // Go/No-Go
      pdf.addSectionTitle('Go/No-Go Decision')
      pdf.addKeyValueGrid([
        { label: 'Decision', value: tailgate.goNoGoDecision === true ? 'GO' : tailgate.goNoGoDecision === false ? 'NO-GO' : 'Pending' },
        { label: 'Decision Time', value: new Date().toLocaleString() }
      ])
      if (tailgate.goNoGoNotes) {
        pdf.addParagraph(tailgate.goNoGoNotes)
      }
      
      // Checklist Summary
      const checklist = tailgate.checklistCompleted || {}
      const completedItems = Object.entries(checklist).filter(([_, v]) => v).length
      pdf.addSectionTitle('Pre-Flight Checklist')
      pdf.addParagraph(`${completedItems} of 10 items completed`)
      
      // Signatures
      pdf.addSectionTitle('Briefing Acknowledgment')
      pdf.addSignatureBlock([
        { role: 'Pilot in Command', name: pic?.name },
        { role: 'All Crew Present', name: `${allCrew.filter(c => tailgate.crewAttendance?.[c.id || c.name]?.attended).length} of ${allCrew.length}` }
      ])
      
      const filename = `Tailgate_${project.projectCode || project.name || 'briefing'}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(filename)
    } catch (err) {
      console.error('PDF export failed:', err)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  // Calculate checklist progress
  const checklistItems = tailgate.checklistCompleted || {}
  const completedCount = Object.values(checklistItems).filter(Boolean).length
  const totalChecklistItems = 10

  // Calculate crew attendance
  const crewAttendance = tailgate.crewAttendance || {}
  const attendedCount = Object.values(crewAttendance).filter(a => a?.attended).length
  const allCrewAttended = allCrew.length > 0 && attendedCount === allCrew.length

  // SAIL level from SORA assessment
  const sail = project.soraAssessment?.sail || null

  // Check if ready for operations
  const isReadyForOps = completedCount === totalChecklistItems && 
                        allCrewAttended && 
                        tailgate.goNoGoDecision === true

  // Get hazards for display
  const hazards = getHazards()
  const ppeItems = getPPEItems()

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Pre-Deployment Briefing</h2>
          <p className="text-sm text-gray-500">
            {tailgate.generatedAt 
              ? `Last generated: ${new Date(tailgate.generatedAt).toLocaleString()}`
              : 'Generate a briefing summary for your tailgate meeting'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateBriefing}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {tailgate.generatedAt ? 'Refresh' : 'Generate'}
          </button>
          <button
            onClick={copyBriefing}
            className="btn-secondary inline-flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={exportToPDF}
            disabled={exporting}
            className="btn-primary inline-flex items-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Readiness Status */}
      <div className={`p-4 rounded-lg border-2 ${
        isReadyForOps 
          ? 'bg-green-50 border-green-500' 
          : 'bg-amber-50 border-amber-300'
      }`}>
        <div className="flex items-center gap-3">
          {isReadyForOps ? (
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          )}
          <div>
            <h3 className={`font-semibold ${isReadyForOps ? 'text-green-800' : 'text-amber-800'}`}>
              {isReadyForOps ? 'Ready for Operations' : 'Pre-Flight Items Pending'}
            </h3>
            <p className={`text-sm ${isReadyForOps ? 'text-green-600' : 'text-amber-600'}`}>
              Checklist: {completedCount}/{totalChecklistItems} • 
              Crew: {attendedCount}/{allCrew.length} • 
              Decision: {tailgate.goNoGoDecision === true ? 'GO' : tailgate.goNoGoDecision === false ? 'NO-GO' : 'Pending'}
            </p>
          </div>
        </div>
      </div>

      {/* Go / No-Go Decision */}
      <div className="card border-2 border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-aeria-blue" />
          Go / No-Go Decision
        </h3>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={() => updateTailgate({ goNoGoDecision: true })}
            className={`flex-1 min-w-[150px] p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-3 ${
              tailgate.goNoGoDecision === true 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
            }`}
          >
            <ThumbsUp className="w-6 h-6" />
            <span className="text-lg font-semibold">GO</span>
          </button>
          
          <button
            onClick={() => updateTailgate({ goNoGoDecision: false })}
            className={`flex-1 min-w-[150px] p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-3 ${
              tailgate.goNoGoDecision === false 
                ? 'border-red-500 bg-red-50 text-red-700' 
                : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
            }`}
          >
            <ThumbsDown className="w-6 h-6" />
            <span className="text-lg font-semibold">NO-GO</span>
          </button>
        </div>
        
        {tailgate.goNoGoDecision === false && (
          <div>
            <label className="label">Reason for No-Go</label>
            <textarea
              value={tailgate.goNoGoNotes || ''}
              onChange={(e) => updateTailgate({ goNoGoNotes: e.target.value })}
              className="input min-h-[80px]"
              placeholder="Document the reason for the No-Go decision..."
            />
          </div>
        )}
      </div>

      {/* Crew Attendance */}
      <div className="card">
        <button
          onClick={() => toggleSection('attendance')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-aeria-blue" />
            Crew Attendance
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              allCrewAttended 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {attendedCount}/{allCrew.length}
            </span>
          </h2>
          {expandedSections.attendance ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.attendance && (
          <div className="mt-4 space-y-2">
            {allCrew.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No crew assigned to this project</p>
            ) : (
              allCrew.map((member) => {
                const attendance = crewAttendance[member.id || member.name]
                const hasAttended = attendance?.attended
                
                return (
                  <div 
                    key={member.id || member.name}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      hasAttended 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        hasAttended ? 'bg-green-200' : 'bg-gray-200'
                      }`}>
                        {hasAttended ? (
                          <UserCheck className="w-5 h-5 text-green-700" />
                        ) : (
                          <Users className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateCrewAttendance(member.id || member.name, !hasAttended)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        hasAttended
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {hasAttended ? 'Present ✓' : 'Mark Present'}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Pre-Flight Checklist */}
      <div className="card">
        <button
          onClick={() => toggleSection('checklist')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-aeria-blue" />
            Pre-Flight Checklist
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              completedCount === totalChecklistItems 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {completedCount}/{totalChecklistItems}
            </span>
          </h2>
          {expandedSections.checklist ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.checklist && (
          <div className="mt-4 space-y-2">
            {[
              { key: 'siteSecured', label: 'Site secured and perimeter established', icon: MapPin },
              { key: 'equipmentChecked', label: 'Aircraft and equipment pre-flight complete', icon: Plane },
              { key: 'crewBriefed', label: 'Crew briefed on operation plan', icon: Users },
              { key: 'commsVerified', label: 'Communications verified', icon: Radio },
              { key: 'emergencyReviewed', label: 'Emergency procedures reviewed', icon: AlertOctagon },
              { key: 'notamsChecked', label: 'NOTAMs and airspace checked', icon: Zap },
              { key: 'weatherConfirmed', label: 'Weather conditions confirmed acceptable', icon: Wind },
              { key: 'riskReviewed', label: 'Risk assessment reviewed with crew', icon: Shield },
              { key: 'clientNotified', label: 'Client/stakeholders notified', icon: Phone },
              { key: 'ppeConfirmed', label: 'All required PPE confirmed', icon: HardHat }
            ].map(item => {
              const Icon = item.icon
              const isChecked = checklistItems[item.key]
              return (
                <label
                  key={item.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isChecked 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => updateChecklist(item.key, e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600"
                  />
                  <Icon className={`w-4 h-4 ${isChecked ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`text-sm ${isChecked ? 'text-green-800' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Briefing Content */}
      <div className="card">
        <button
          onClick={() => toggleSection('briefing')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-aeria-blue" />
            Briefing Summary
          </h2>
          {expandedSections.briefing ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.briefing && (
          <div className="mt-4 space-y-4">
            {/* Project Header */}
            <div className="p-4 bg-gradient-to-r from-aeria-navy to-aeria-blue text-white rounded-lg">
              <h3 className="text-xl font-bold">{project.name || 'Untitled Project'}</h3>
              <div className="grid sm:grid-cols-4 gap-4 mt-3 text-sm">
                <div>
                  <p className="text-white/70">Project Code</p>
                  <p className="font-semibold">{project.projectCode || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-white/70">Client</p>
                  <p className="font-semibold">{project.clientName || 'No client'}</p>
                </div>
                <div>
                  <p className="text-white/70">Date</p>
                  <p className="font-semibold">{formatDate(project.startDate)}</p>
                </div>
                <div>
                  <p className="text-white/70">Operation Type</p>
                  <p className="font-semibold">{project.flightPlan?.operationType || 'Standard'}</p>
                </div>
              </div>
            </div>

            {/* SORA / Risk Level */}
            {(sail || project.soraAssessment) && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Risk Assessment Summary
                </h4>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-purple-700">SAIL Level</p>
                    <p className="font-bold text-purple-900 text-lg">{sail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-purple-700">Final GRC</p>
                    <p className="font-bold text-purple-900 text-lg">{project.soraAssessment?.finalGRC || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-purple-700">Residual ARC</p>
                    <p className="font-bold text-purple-900 text-lg">{project.soraAssessment?.residualARC || project.soraAssessment?.initialARC || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Crew List */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-aeria-blue" />
                Crew
              </h4>
              {allCrew.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-2">
                  {allCrew.map((member, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-700">{member.role}:</span>
                      <span className="text-gray-900">{member.name}</span>
                      {member.phone && <span className="text-gray-500">({member.phone})</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No crew assigned</p>
              )}
            </div>

            {/* Site Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-aeria-blue" />
                Site Information
              </h4>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Location</p>
                  <p className="font-medium">{project.siteSurvey?.location?.siteName || project.siteSurvey?.general?.siteName || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Max Altitude</p>
                  <p className="font-medium">{project.flightPlan?.maxAltitudeAGL || project.flightPlan?.maxAltitude || 'N/A'} m AGL</p>
                </div>
              </div>
            </div>

            {/* Communications */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Radio className="w-4 h-4 text-aeria-blue" />
                Communications
              </h4>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Primary Channel</p>
                  <p className="font-medium">{project.communications?.primaryChannel || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Backup</p>
                  <p className="font-medium">{project.communications?.backupChannel || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Lost Link Action</p>
                  <p className="font-medium">{project.communications?.lostLinkProcedure || 'RTH'}</p>
                </div>
              </div>
            </div>

            {/* Emergency Information */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" />
                Emergency Information
              </h4>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-red-700">Emergency Contact</p>
                  <p className="font-medium text-red-900">
                    {project.emergencyPlan?.primaryEmergencyContact?.name || 'Not set'}
                    {project.emergencyPlan?.primaryEmergencyContact?.phone && (
                      <span className="ml-2">{project.emergencyPlan.primaryEmergencyContact.phone}</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-red-700">Nearest Hospital</p>
                  <p className="font-medium text-red-900">{project.emergencyPlan?.nearestHospital || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-red-700">Rally Point</p>
                  <p className="font-medium text-red-900">{project.emergencyPlan?.rallyPoint || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-red-700">Emergency Procedure</p>
                  <p className="font-medium text-red-900">{project.emergencyPlan?.emergencyProcedure || 'Standard ERP'}</p>
                </div>
              </div>
            </div>

            {/* Key Hazards */}
            {hazards.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Key Hazards & Controls
                </h4>
                <div className="space-y-2">
                  {hazards.map((hazard, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium text-amber-900">{hazard.description || 'Unnamed hazard'}</p>
                      <p className="text-amber-700">→ {hazard.controls || 'No controls documented'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PPE */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <HardHat className="w-4 h-4" />
                Required PPE
              </h4>
              <div className="flex flex-wrap gap-2">
                {ppeItems.map((item, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Weather Notes */}
            <div>
              <label className="label flex items-center gap-2">
                <Wind className="w-4 h-4" />
                Weather Briefing Notes
              </label>
              <textarea
                value={tailgate.weatherBriefing || ''}
                onChange={(e) => updateTailgate({ weatherBriefing: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Current conditions, forecast, wind, visibility, METAR/TAF..."
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="label">Additional Briefing Notes</label>
              <textarea
                value={tailgate.customNotes || ''}
                onChange={(e) => updateTailgate({ customNotes: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Any other items to discuss during the briefing..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
