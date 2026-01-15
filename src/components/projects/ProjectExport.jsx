import { useState } from 'react'
import { 
  Download,
  FileText,
  FileCheck,
  Printer,
  Mail,
  Copy,
  Check,
  Loader2,
  Package,
  File,
  AlertTriangle,
  CheckCircle2,
  Info,
  Settings
} from 'lucide-react'

const exportSections = [
  { id: 'overview', label: 'Project Overview', included: true },
  { id: 'crew', label: 'Crew Roster', included: true },
  { id: 'siteSurvey', label: 'Site Survey', included: true, conditional: true },
  { id: 'flightPlan', label: 'Flight Plan', included: true, conditional: true },
  { id: 'riskAssessment', label: 'Risk Assessment', included: true },
  { id: 'emergency', label: 'Emergency Plan', included: true },
  { id: 'ppe', label: 'PPE Requirements', included: true },
  { id: 'communications', label: 'Communications', included: true },
  { id: 'approvals', label: 'Approvals & Signatures', included: true },
  { id: 'forms', label: 'Forms Checklist', included: false },
]

export default function ProjectExport({ project, onUpdate }) {
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState(null)
  const [copied, setCopied] = useState(false)
  const [selectedSections, setSelectedSections] = useState(
    exportSections.reduce((acc, s) => ({ ...acc, [s.id]: s.included }), {})
  )
  const [includeAppendices, setIncludeAppendices] = useState(true)
  const [includeCoverPage, setIncludeCoverPage] = useState(true)

  const toggleSection = (sectionId) => {
    setSelectedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  // Generate text summary
  const generateTextSummary = () => {
    const lines = []
    
    // Header
    lines.push('═'.repeat(60))
    lines.push(`RPAS OPERATIONS PLAN`)
    lines.push('═'.repeat(60))
    lines.push('')
    lines.push(`Project: ${project.name || 'Untitled'}`)
    lines.push(`Code: ${project.projectCode || 'N/A'}`)
    lines.push(`Client: ${project.clientName || 'N/A'}`)
    lines.push(`Date: ${project.startDate || 'TBD'}`)
    lines.push(`Status: ${project.status?.toUpperCase() || 'DRAFT'}`)
    lines.push('')

    // Crew
    if (selectedSections.crew) {
      lines.push('─'.repeat(40))
      lines.push('CREW')
      lines.push('─'.repeat(40))
      if (project.crew?.length > 0) {
        project.crew.forEach(member => {
          lines.push(`${member.role}: ${member.name}`)
          if (member.phone) lines.push(`  Phone: ${member.phone}`)
          if (member.certifications) lines.push(`  Certs: ${member.certifications}`)
        })
      } else {
        lines.push('No crew assigned')
      }
      lines.push('')
    }

    // Flight Plan
    if (selectedSections.flightPlan && project.sections?.flightPlan) {
      lines.push('─'.repeat(40))
      lines.push('FLIGHT PLAN')
      lines.push('─'.repeat(40))
      const fp = project.flightPlan || {}
      lines.push(`Operation Type: ${fp.operationType || 'VLOS'}`)
      lines.push(`Max Altitude: ${fp.maxAltitude || 'N/A'} ${fp.altitudeUnit || 'AGL'}`)
      lines.push(`Aircraft: ${fp.aircraft || 'N/A'}`)
      lines.push(`Ground Type: ${fp.groundType?.replace('_', ' ') || 'N/A'}`)
      if (fp.flightArea) lines.push(`Flight Area: ${fp.flightArea}`)
      lines.push('')
    }

    // Site Survey
    if (selectedSections.siteSurvey && project.sections?.siteSurvey) {
      lines.push('─'.repeat(40))
      lines.push('SITE SURVEY')
      lines.push('─'.repeat(40))
      const ss = project.siteSurvey || {}
      lines.push(`Site: ${ss.siteName || 'N/A'}`)
      if (ss.latitude && ss.longitude) {
        lines.push(`Coordinates: ${ss.latitude}, ${ss.longitude}`)
      }
      if (ss.hazards) lines.push(`Hazards: ${ss.hazards}`)
      if (ss.obstacles) lines.push(`Obstacles: ${ss.obstacles}`)
      lines.push('')
    }

    // Risk Assessment
    if (selectedSections.riskAssessment) {
      lines.push('─'.repeat(40))
      lines.push('RISK ASSESSMENT')
      lines.push('─'.repeat(40))
      const ra = project.riskAssessment || {}
      if (ra.sora) {
        lines.push(`Operation Type: ${ra.sora.operationType || 'VLOS'}`)
        lines.push(`Initial ARC: ${ra.sora.initialARC || 'ARC-a'}`)
        lines.push(`Risk Acceptable: ${ra.overallRiskAcceptable ? 'YES' : 'REVIEW REQUIRED'}`)
      }
      if (ra.hazards?.length > 0) {
        lines.push('')
        lines.push('Identified Hazards:')
        ra.hazards.forEach((h, i) => {
          lines.push(`${i + 1}. ${h.description || 'Unnamed hazard'}`)
          lines.push(`   Controls: ${h.controls || 'None documented'}`)
        })
      }
      lines.push('')
    }

    // Emergency
    if (selectedSections.emergency) {
      lines.push('─'.repeat(40))
      lines.push('EMERGENCY PLAN')
      lines.push('─'.repeat(40))
      const ep = project.emergencyPlan || {}
      const contact = ep.primaryEmergencyContact || {}
      lines.push(`Emergency Contact: ${contact.name || 'Not set'}`)
      if (contact.phone) lines.push(`  Phone: ${contact.phone}`)
      lines.push(`Hospital: ${ep.nearestHospital || 'Not set'}`)
      lines.push(`Rally Point: ${ep.rallyPoint || 'Not set'}`)
      if (ep.emergencyProcedure) lines.push(`Procedure: ${ep.emergencyProcedure}`)
      lines.push('')
    }

    // Communications
    if (selectedSections.communications) {
      lines.push('─'.repeat(40))
      lines.push('COMMUNICATIONS')
      lines.push('─'.repeat(40))
      const comm = project.communications || {}
      lines.push(`Primary: ${comm.primaryChannel || 'Not set'}`)
      lines.push(`Backup: ${comm.backupChannel || 'Not set'}`)
      lines.push(`Lost Link: ${comm.lostLinkProcedure || 'RTH'}`)
      lines.push('')
    }

    // PPE
    if (selectedSections.ppe) {
      lines.push('─'.repeat(40))
      lines.push('PPE REQUIREMENTS')
      lines.push('─'.repeat(40))
      const ppe = project.ppe || {}
      if (ppe.required?.length > 0) {
        ppe.required.forEach(item => lines.push(`• ${item}`))
      } else {
        lines.push('Standard PPE')
      }
      lines.push('')
    }

    // Approvals
    if (selectedSections.approvals) {
      lines.push('─'.repeat(40))
      lines.push('APPROVALS')
      lines.push('─'.repeat(40))
      const app = project.approvals || {}
      lines.push(`Status: ${app.status?.toUpperCase() || 'PENDING'}`)
      if (app.submittedBy) lines.push(`Submitted by: ${app.submittedBy} on ${app.submittedDate}`)
      if (app.reviewer?.name) lines.push(`Reviewed by: ${app.reviewer.name} on ${app.reviewDate}`)
      lines.push('')
    }

    // Footer
    lines.push('═'.repeat(60))
    lines.push(`Generated: ${new Date().toLocaleString()}`)
    lines.push(`Aeria Solutions Ltd. - Transport Canada Operator #930355`)
    lines.push('═'.repeat(60))

    return lines.join('\n')
  }

  // Export handlers
  const handleExport = async (type) => {
    setExporting(true)
    setExportType(type)

    try {
      switch (type) {
        case 'text':
          const text = generateTextSummary()
          const blob = new Blob([text], { type: 'text/plain' })
          downloadBlob(blob, `${project.projectCode || 'ops-plan'}-${project.name || 'export'}.txt`)
          break

        case 'copy':
          const copyText = generateTextSummary()
          await navigator.clipboard.writeText(copyText)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
          break

        case 'json':
          const jsonData = {
            exportDate: new Date().toISOString(),
            project: {
              ...project,
              // Remove internal fields if needed
            }
          }
          const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
          downloadBlob(jsonBlob, `${project.projectCode || 'ops-plan'}-${project.name || 'export'}.json`)
          break

        case 'print':
          window.print()
          break

        case 'html':
          const htmlContent = generateHTMLReport()
          const htmlBlob = new Blob([htmlContent], { type: 'text/html' })
          downloadBlob(htmlBlob, `${project.projectCode || 'ops-plan'}-${project.name || 'export'}.html`)
          break

        default:
          console.log('Export type not implemented:', type)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
      setExportType(null)
    }
  }

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Generate HTML report
  const generateHTMLReport = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${project.name || 'Operations Plan'} - Aeria Solutions</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; }
    h1 { color: #1e3a5f; border-bottom: 3px solid #1e3a5f; padding-bottom: 10px; }
    h2 { color: #1e3a5f; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .header { background: #1e3a5f; color: white; padding: 20px; margin: -40px -20px 30px; }
    .header h1 { color: white; border: none; margin: 0; }
    .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0; }
    .meta-item { background: #f5f5f5; padding: 10px; border-radius: 4px; }
    .meta-label { font-size: 12px; color: #666; }
    .meta-value { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; font-weight: 600; }
    .emergency { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 4px; margin: 15px 0; }
    .emergency h3 { color: #dc2626; margin-top: 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
    @media print { .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${project.name || 'Operations Plan'}</h1>
    <div style="opacity: 0.8; margin-top: 10px;">
      ${project.projectCode ? `Code: ${project.projectCode} | ` : ''}
      ${project.clientName ? `Client: ${project.clientName} | ` : ''}
      Date: ${project.startDate || 'TBD'}
    </div>
  </div>

  <div class="meta">
    <div class="meta-item">
      <div class="meta-label">Status</div>
      <div class="meta-value">${project.status?.toUpperCase() || 'DRAFT'}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Operation Type</div>
      <div class="meta-value">${project.flightPlan?.operationType || 'VLOS'}</div>
    </div>
  </div>

  ${selectedSections.crew ? `
  <h2>Crew</h2>
  <table>
    <tr><th>Role</th><th>Name</th><th>Contact</th></tr>
    ${(project.crew || []).map(m => `
      <tr><td>${m.role}</td><td>${m.name}</td><td>${m.phone || '-'}</td></tr>
    `).join('')}
  </table>
  ` : ''}

  ${selectedSections.emergency ? `
  <div class="emergency">
    <h3>⚠️ Emergency Information</h3>
    <p><strong>Emergency Contact:</strong> ${project.emergencyPlan?.primaryEmergencyContact?.name || 'Not set'} 
       ${project.emergencyPlan?.primaryEmergencyContact?.phone ? `(${project.emergencyPlan.primaryEmergencyContact.phone})` : ''}</p>
    <p><strong>Hospital:</strong> ${project.emergencyPlan?.nearestHospital || 'Not set'}</p>
    <p><strong>Rally Point:</strong> ${project.emergencyPlan?.rallyPoint || 'Not set'}</p>
  </div>
  ` : ''}

  ${selectedSections.riskAssessment && project.riskAssessment?.hazards?.length > 0 ? `
  <h2>Key Hazards</h2>
  <table>
    <tr><th>Hazard</th><th>Controls</th></tr>
    ${(project.riskAssessment.hazards || []).slice(0, 5).map(h => `
      <tr><td>${h.description || '-'}</td><td>${h.controls || '-'}</td></tr>
    `).join('')}
  </table>
  ` : ''}

  <div class="footer">
    <p>Generated ${new Date().toLocaleString()}</p>
    <p><strong>Aeria Solutions Ltd.</strong> | Transport Canada Operator #930355</p>
  </div>
</body>
</html>
    `
  }

  // Check project readiness
  const readinessChecks = [
    { label: 'Project name', ok: !!project.name },
    { label: 'Crew assigned', ok: project.crew?.length > 0 },
    { label: 'PIC assigned', ok: project.crew?.some(c => c.role === 'PIC') },
    { label: 'Emergency contact', ok: !!project.emergencyPlan?.primaryEmergencyContact?.name },
    { label: 'Risk assessment reviewed', ok: project.riskAssessment?.overallRiskAcceptable !== null },
    { label: 'Plan approved', ok: ['approved', 'conditional'].includes(project.approvals?.status) }
  ]

  const readyCount = readinessChecks.filter(c => c.ok).length

  return (
    <div className="space-y-6">
      {/* Readiness Check */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-aeria-blue" />
          Export Readiness
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            readyCount === readinessChecks.length 
              ? 'bg-green-100 text-green-700' 
              : 'bg-amber-100 text-amber-700'
          }`}>
            {readyCount}/{readinessChecks.length}
          </span>
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {readinessChecks.map((check, i) => (
            <div 
              key={i}
              className={`flex items-center gap-2 p-2 rounded ${
                check.ok ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              {check.ok ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-gray-400" />
              )}
              <span className={`text-sm ${check.ok ? 'text-green-800' : 'text-gray-500'}`}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section Selection */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-aeria-blue" />
          Export Sections
        </h2>
        
        <div className="grid sm:grid-cols-2 gap-2 mb-4">
          {exportSections.map((section) => {
            const isConditional = section.conditional && !project.sections?.[section.id]
            
            return (
              <label 
                key={section.id}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer ${
                  isConditional ? 'opacity-50' : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSections[section.id] && !isConditional}
                  onChange={() => toggleSection(section.id)}
                  disabled={isConditional}
                  className="w-4 h-4 text-aeria-navy rounded"
                />
                <span className="text-sm text-gray-700">{section.label}</span>
                {isConditional && (
                  <span className="text-xs text-gray-400">(not enabled)</span>
                )}
              </label>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCoverPage}
              onChange={(e) => setIncludeCoverPage(e.target.checked)}
              className="w-4 h-4 text-aeria-navy rounded"
            />
            <span className="text-sm text-gray-700">Include cover page</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAppendices}
              onChange={(e) => setIncludeAppendices(e.target.checked)}
              className="w-4 h-4 text-aeria-navy rounded"
            />
            <span className="text-sm text-gray-700">Include appendices</span>
          </label>
        </div>
      </div>

      {/* Export Options */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-aeria-blue" />
          Export Options
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* HTML Report */}
          <button
            onClick={() => handleExport('html')}
            disabled={exporting}
            className="p-4 border border-gray-200 rounded-lg hover:border-aeria-blue hover:bg-aeria-sky transition-colors text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">HTML Report</span>
            </div>
            <p className="text-sm text-gray-500">
              Formatted report viewable in any browser
            </p>
            {exporting && exportType === 'html' && (
              <Loader2 className="w-4 h-4 animate-spin mt-2" />
            )}
          </button>

          {/* Plain Text */}
          <button
            onClick={() => handleExport('text')}
            disabled={exporting}
            className="p-4 border border-gray-200 rounded-lg hover:border-aeria-blue hover:bg-aeria-sky transition-colors text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <File className="w-5 h-5 text-gray-600" />
              </div>
              <span className="font-medium text-gray-900">Plain Text</span>
            </div>
            <p className="text-sm text-gray-500">
              Simple text file for printing or email
            </p>
            {exporting && exportType === 'text' && (
              <Loader2 className="w-4 h-4 animate-spin mt-2" />
            )}
          </button>

          {/* Copy to Clipboard */}
          <button
            onClick={() => handleExport('copy')}
            disabled={exporting}
            className="p-4 border border-gray-200 rounded-lg hover:border-aeria-blue hover:bg-aeria-sky transition-colors text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-green-600" />
                )}
              </div>
              <span className="font-medium text-gray-900">
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Copy summary to paste in email or document
            </p>
          </button>

          {/* JSON Export */}
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="p-4 border border-gray-200 rounded-lg hover:border-aeria-blue hover:bg-aeria-sky transition-colors text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium text-gray-900">JSON Data</span>
            </div>
            <p className="text-sm text-gray-500">
              Full project data for backup or import
            </p>
            {exporting && exportType === 'json' && (
              <Loader2 className="w-4 h-4 animate-spin mt-2" />
            )}
          </button>

          {/* Print */}
          <button
            onClick={() => handleExport('print')}
            disabled={exporting}
            className="p-4 border border-gray-200 rounded-lg hover:border-aeria-blue hover:bg-aeria-sky transition-colors text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Printer className="w-5 h-5 text-amber-600" />
              </div>
              <span className="font-medium text-gray-900">Print</span>
            </div>
            <p className="text-sm text-gray-500">
              Print current view directly
            </p>
          </button>

          {/* Email (placeholder) */}
          <div className="p-4 border border-gray-200 rounded-lg opacity-50 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <span className="font-medium text-gray-500">Email</span>
            </div>
            <p className="text-sm text-gray-400">
              Coming soon
            </p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Export Notes</h3>
            <p className="text-sm text-blue-700 mt-1">
              Exports include all selected sections with current data. For official submissions, 
              ensure the plan is approved and all crew have acknowledged. HTML reports can be 
              saved as PDF using your browser's print function (Print → Save as PDF).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
