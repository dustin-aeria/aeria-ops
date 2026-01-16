// ============================================
// PDF EXPORT SERVICE
// Professional PDF generation with branding
// Uses jsPDF + jspdf-autotable
// ============================================

import jsPDF from 'jspdf'
import 'jspdf-autotable'

// ============================================
// DEFAULT BRANDING (Aeria Solutions)
// ============================================
const DEFAULT_BRANDING = {
  operator: {
    name: 'Aeria Solutions Ltd.',
    registration: 'Transport Canada Operator #930355',
    tagline: 'Professional RPAS Operations',
    website: 'www.aeriasolutions.ca',
    email: 'ops@aeriasolutions.ca',
    phone: '',
    address: '',
    logo: null, // Base64 or URL
    colors: {
      primary: '#1e3a5f',    // Navy
      secondary: '#3b82f6',  // Blue
      accent: '#10b981',     // Green
      light: '#e0f2fe',      // Sky
      text: '#1f2937',       // Gray 800
      textLight: '#6b7280'   // Gray 500
    }
  },
  client: null // Optional client branding
}

// ============================================
// BRANDED PDF DOCUMENT CLASS
// ============================================
export class BrandedPDF {
  constructor(options = {}) {
    this.doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: 'letter'
    })
    
    this.branding = {
      ...DEFAULT_BRANDING,
      ...options.branding
    }
    
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin = options.margin || 20
    this.contentWidth = this.pageWidth - (this.margin * 2)
    this.currentY = this.margin
    this.pageNumber = 1
    this.totalPages = 1
    
    // Document metadata
    this.title = options.title || 'Document'
    this.subtitle = options.subtitle || ''
    this.projectName = options.projectName || ''
    this.projectCode = options.projectCode || ''
    this.clientName = options.clientName || ''
    this.generatedDate = new Date().toLocaleDateString('en-CA')
    
    // Register fonts (would need actual font files in production)
    this.fonts = {
      regular: 'helvetica',
      bold: 'helvetica',
      italic: 'helvetica'
    }
  }

  // ============================================
  // COLOR UTILITIES
  // ============================================
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  setColor(colorKey) {
    const hex = this.branding.operator.colors[colorKey] || colorKey
    const { r, g, b } = this.hexToRgb(hex)
    this.doc.setTextColor(r, g, b)
    return this
  }

  setFillColor(colorKey) {
    const hex = this.branding.operator.colors[colorKey] || colorKey
    const { r, g, b } = this.hexToRgb(hex)
    this.doc.setFillColor(r, g, b)
    return this
  }

  setDrawColor(colorKey) {
    const hex = this.branding.operator.colors[colorKey] || colorKey
    const { r, g, b } = this.hexToRgb(hex)
    this.doc.setDrawColor(r, g, b)
    return this
  }

  // ============================================
  // COVER PAGE
  // ============================================
  addCoverPage() {
    const colors = this.branding.operator.colors
    
    // Background gradient effect (solid color blocks)
    this.setFillColor('primary')
    this.doc.rect(0, 0, this.pageWidth, 80, 'F')
    
    // Accent stripe
    this.setFillColor('secondary')
    this.doc.rect(0, 80, this.pageWidth, 4, 'F')
    
    // Logo placeholder (top left)
    if (this.branding.operator.logo) {
      try {
        this.doc.addImage(this.branding.operator.logo, 'PNG', this.margin, 15, 50, 20)
      } catch (e) {
        // Logo failed, show text instead
        this.doc.setTextColor(255, 255, 255)
        this.doc.setFontSize(18)
        this.doc.setFont(this.fonts.bold, 'bold')
        this.doc.text(this.branding.operator.name, this.margin, 30)
      }
    } else {
      this.doc.setTextColor(255, 255, 255)
      this.doc.setFontSize(18)
      this.doc.setFont(this.fonts.bold, 'bold')
      this.doc.text(this.branding.operator.name, this.margin, 30)
    }
    
    // Registration number (top right)
    this.doc.setFontSize(9)
    this.doc.setFont(this.fonts.regular, 'normal')
    this.doc.setTextColor(200, 220, 255)
    const regWidth = this.doc.getTextWidth(this.branding.operator.registration)
    this.doc.text(this.branding.operator.registration, this.pageWidth - this.margin - regWidth, 30)
    
    // Document title
    this.doc.setFontSize(32)
    this.doc.setFont(this.fonts.bold, 'bold')
    this.doc.setTextColor(255, 255, 255)
    this.doc.text(this.title, this.margin, 60)
    
    // Subtitle
    if (this.subtitle) {
      this.doc.setFontSize(14)
      this.doc.setFont(this.fonts.regular, 'normal')
      this.doc.text(this.subtitle, this.margin, 70)
    }
    
    // Project info box
    const boxY = 110
    this.setFillColor('light')
    this.doc.roundedRect(this.margin, boxY, this.contentWidth, 60, 3, 3, 'F')
    
    this.setColor('text')
    this.doc.setFontSize(11)
    this.doc.setFont(this.fonts.bold, 'bold')
    this.doc.text('PROJECT DETAILS', this.margin + 10, boxY + 12)
    
    this.doc.setFont(this.fonts.regular, 'normal')
    this.doc.setFontSize(10)
    this.setColor('textLight')
    
    const details = [
      { label: 'Project:', value: this.projectName },
      { label: 'Code:', value: this.projectCode },
      { label: 'Client:', value: this.clientName || 'N/A' },
      { label: 'Generated:', value: this.generatedDate }
    ]
    
    let detailY = boxY + 25
    details.forEach(d => {
      this.doc.setFont(this.fonts.bold, 'bold')
      this.setColor('text')
      this.doc.text(d.label, this.margin + 10, detailY)
      this.doc.setFont(this.fonts.regular, 'normal')
      this.setColor('textLight')
      this.doc.text(d.value || 'N/A', this.margin + 45, detailY)
      detailY += 8
    })
    
    // Client logo (if co-branded)
    if (this.branding.client?.logo) {
      try {
        this.doc.addImage(this.branding.client.logo, 'PNG', this.pageWidth - this.margin - 40, boxY + 10, 30, 30)
      } catch (e) {
        // Client logo failed
      }
    }
    
    // Document classification/status box
    const statusY = 190
    this.setFillColor('accent')
    this.doc.roundedRect(this.margin, statusY, 60, 20, 2, 2, 'F')
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(10)
    this.doc.setFont(this.fonts.bold, 'bold')
    this.doc.text('OPERATIONAL', this.margin + 8, statusY + 13)
    
    // Footer with company info
    const footerY = this.pageHeight - 30
    this.setColor('textLight')
    this.doc.setFontSize(8)
    this.doc.setFont(this.fonts.regular, 'normal')
    
    const footerLines = [
      this.branding.operator.name,
      this.branding.operator.website,
      this.branding.operator.email
    ].filter(Boolean)
    
    footerLines.forEach((line, i) => {
      this.doc.text(line, this.margin, footerY + (i * 4))
    })
    
    // Confidentiality notice
    this.doc.setFontSize(7)
    this.doc.text(
      'This document contains confidential operational information. Unauthorized distribution is prohibited.',
      this.margin,
      this.pageHeight - 10
    )
    
    return this
  }

  // ============================================
  // HEADER & FOOTER FOR CONTENT PAGES
  // ============================================
  addHeader() {
    // Header bar
    this.setFillColor('primary')
    this.doc.rect(0, 0, this.pageWidth, 15, 'F')
    
    // Document title in header
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(9)
    this.doc.setFont(this.fonts.bold, 'bold')
    this.doc.text(this.title, this.margin, 10)
    
    // Project code on right
    const codeText = this.projectCode || this.projectName
    const codeWidth = this.doc.getTextWidth(codeText)
    this.doc.text(codeText, this.pageWidth - this.margin - codeWidth, 10)
    
    this.currentY = 25
    return this
  }

  addFooter(pageNum, totalPages) {
    const footerY = this.pageHeight - 10
    
    // Footer line
    this.setDrawColor('primary')
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5)
    
    // Company name
    this.setColor('textLight')
    this.doc.setFontSize(8)
    this.doc.setFont(this.fonts.regular, 'normal')
    this.doc.text(this.branding.operator.name, this.margin, footerY)
    
    // Page number
    const pageText = `Page ${pageNum} of ${totalPages}`
    const pageWidth = this.doc.getTextWidth(pageText)
    this.doc.text(pageText, this.pageWidth - this.margin - pageWidth, footerY)
    
    // Date in center
    const dateText = this.generatedDate
    const dateWidth = this.doc.getTextWidth(dateText)
    this.doc.text(dateText, (this.pageWidth - dateWidth) / 2, footerY)
    
    return this
  }

  // ============================================
  // CONTENT ELEMENTS
  // ============================================
  addNewPage() {
    this.doc.addPage()
    this.pageNumber++
    this.addHeader()
    return this
  }

  checkPageBreak(requiredSpace = 30) {
    if (this.currentY + requiredSpace > this.pageHeight - 25) {
      this.addNewPage()
    }
    return this
  }

  addSectionTitle(text, options = {}) {
    this.checkPageBreak(20)
    
    const { icon, color = 'primary' } = options
    
    // Section background
    this.setFillColor(color)
    this.doc.roundedRect(this.margin, this.currentY, this.contentWidth, 10, 2, 2, 'F')
    
    // Section text
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(11)
    this.doc.setFont(this.fonts.bold, 'bold')
    this.doc.text(text.toUpperCase(), this.margin + 5, this.currentY + 7)
    
    this.currentY += 15
    return this
  }

  addSubsectionTitle(text) {
    this.checkPageBreak(15)
    
    this.setColor('secondary')
    this.doc.setFontSize(10)
    this.doc.setFont(this.fonts.bold, 'bold')
    this.doc.text(text, this.margin, this.currentY)
    
    // Underline
    this.setDrawColor('secondary')
    this.doc.setLineWidth(0.3)
    const textWidth = this.doc.getTextWidth(text)
    this.doc.line(this.margin, this.currentY + 1, this.margin + textWidth, this.currentY + 1)
    
    this.currentY += 8
    return this
  }

  addParagraph(text, options = {}) {
    if (!text) return this
    
    const { fontSize = 9, color = 'text', indent = 0 } = options
    
    this.setColor(color)
    this.doc.setFontSize(fontSize)
    this.doc.setFont(this.fonts.regular, 'normal')
    
    const lines = this.doc.splitTextToSize(text, this.contentWidth - indent)
    
    lines.forEach(line => {
      this.checkPageBreak(6)
      this.doc.text(line, this.margin + indent, this.currentY)
      this.currentY += 5
    })
    
    this.currentY += 3
    return this
  }

  addLabelValue(label, value, options = {}) {
    if (!value && !options.showEmpty) return this
    
    this.checkPageBreak(8)
    
    const { labelWidth = 45 } = options
    
    this.setColor('text')
    this.doc.setFontSize(9)
    this.doc.setFont(this.fonts.bold, 'bold')
    this.doc.text(label + ':', this.margin, this.currentY)
    
    this.doc.setFont(this.fonts.regular, 'normal')
    this.setColor('textLight')
    this.doc.text(String(value || 'N/A'), this.margin + labelWidth, this.currentY)
    
    this.currentY += 6
    return this
  }

  addKeyValueGrid(items, columns = 2) {
    this.checkPageBreak(20)
    
    const colWidth = this.contentWidth / columns
    let col = 0
    let startY = this.currentY
    let maxY = startY
    
    items.forEach(({ label, value }) => {
      const x = this.margin + (col * colWidth)
      const y = this.currentY
      
      this.setColor('text')
      this.doc.setFontSize(8)
      this.doc.setFont(this.fonts.bold, 'bold')
      this.doc.text(label, x, y)
      
      this.doc.setFont(this.fonts.regular, 'normal')
      this.setColor('textLight')
      this.doc.setFontSize(9)
      this.doc.text(String(value || 'N/A'), x, y + 4)
      
      maxY = Math.max(maxY, y + 8)
      
      col++
      if (col >= columns) {
        col = 0
        this.currentY += 12
      }
    })
    
    this.currentY = maxY + 5
    return this
  }

  addBulletList(items, options = {}) {
    const { bullet = '•', indent = 5 } = options
    
    items.forEach(item => {
      if (!item) return
      this.checkPageBreak(6)
      
      this.setColor('secondary')
      this.doc.setFontSize(9)
      this.doc.text(bullet, this.margin + indent, this.currentY)
      
      this.setColor('text')
      this.doc.setFont(this.fonts.regular, 'normal')
      
      const lines = this.doc.splitTextToSize(item, this.contentWidth - indent - 8)
      lines.forEach((line, i) => {
        this.doc.text(line, this.margin + indent + 5, this.currentY)
        if (i < lines.length - 1) {
          this.currentY += 4
          this.checkPageBreak(6)
        }
      })
      
      this.currentY += 5
    })
    
    return this
  }

  addTable(headers, rows, options = {}) {
    this.checkPageBreak(30)
    
    const colors = this.branding.operator.colors
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [headers],
      body: rows,
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: this.hexToRgb(colors.primary),
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: options.columnStyles || {},
      ...options.tableOptions
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    return this
  }

  addStatusBadge(status, x, y, options = {}) {
    const { width = 25, height = 6 } = options
    
    const statusColors = {
      'ok': '#10b981',
      'warning': '#f59e0b',
      'error': '#ef4444',
      'info': '#3b82f6',
      'gap': '#ef4444',
      'compliant': '#10b981'
    }
    
    const color = statusColors[status.toLowerCase()] || '#6b7280'
    this.setFillColor(color)
    this.doc.roundedRect(x, y - 4, width, height, 1, 1, 'F')
    
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(6)
    this.doc.setFont(this.fonts.bold, 'bold')
    this.doc.text(status.toUpperCase(), x + 2, y)
    
    return this
  }

  addRiskMatrix(risks = [], options = {}) {
    this.checkPageBreak(60)
    
    const { title = 'Risk Matrix' } = options
    const matrixSize = 50
    const cellSize = 10
    const startX = this.margin + 20
    const startY = this.currentY + 10
    
    // Title
    this.setColor('text')
    this.doc.setFontSize(10)
    this.doc.setFont(this.fonts.bold, 'bold')
    this.doc.text(title, this.margin, this.currentY)
    
    // Draw 5x5 matrix
    const colors = [
      ['#10b981', '#10b981', '#84cc16', '#eab308', '#f59e0b'],
      ['#10b981', '#84cc16', '#eab308', '#f59e0b', '#ef4444'],
      ['#84cc16', '#eab308', '#f59e0b', '#ef4444', '#ef4444'],
      ['#eab308', '#f59e0b', '#ef4444', '#ef4444', '#dc2626'],
      ['#f59e0b', '#ef4444', '#ef4444', '#dc2626', '#dc2626']
    ]
    
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        this.setFillColor(colors[4 - row][col])
        this.doc.rect(startX + (col * cellSize), startY + (row * cellSize), cellSize, cellSize, 'F')
        
        // Cell border
        this.doc.setDrawColor(255, 255, 255)
        this.doc.setLineWidth(0.5)
        this.doc.rect(startX + (col * cellSize), startY + (row * cellSize), cellSize, cellSize, 'S')
      }
    }
    
    // Plot risks
    risks.forEach((risk, i) => {
      if (risk.likelihood && risk.severity) {
        const x = startX + ((risk.severity - 1) * cellSize) + (cellSize / 2)
        const y = startY + ((5 - risk.likelihood) * cellSize) + (cellSize / 2)
        
        this.doc.setFillColor(30, 58, 95)
        this.doc.circle(x, y, 3, 'F')
        this.doc.setTextColor(255, 255, 255)
        this.doc.setFontSize(6)
        this.doc.text(String(i + 1), x - 1.5, y + 1.5)
      }
    })
    
    // Axis labels
    this.setColor('textLight')
    this.doc.setFontSize(7)
    this.doc.text('Severity →', startX + 15, startY + matrixSize + 8)
    
    // Rotate for likelihood label
    this.doc.text('← Likelihood', startX - 15, startY + 25, { angle: 90 })
    
    this.currentY = startY + matrixSize + 15
    return this
  }

  addSpacer(height = 10) {
    this.currentY += height
    return this
  }

  addHorizontalLine(options = {}) {
    const { color = 'primary', width = 0.5 } = options
    this.setDrawColor(color)
    this.doc.setLineWidth(width)
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 5
    return this
  }

  addSignatureBlock(signers = []) {
    this.checkPageBreak(40)
    
    this.addSubsectionTitle('Signatures')
    
    signers.forEach(signer => {
      this.checkPageBreak(25)
      
      // Signature line
      this.setDrawColor('textLight')
      this.doc.setLineWidth(0.3)
      this.doc.line(this.margin, this.currentY + 10, this.margin + 60, this.currentY + 10)
      
      // Labels
      this.setColor('text')
      this.doc.setFontSize(8)
      this.doc.setFont(this.fonts.regular, 'normal')
      this.doc.text(signer.role || 'Signature', this.margin, this.currentY + 15)
      
      // Date line
      this.doc.line(this.margin + 80, this.currentY + 10, this.margin + 120, this.currentY + 10)
      this.doc.text('Date', this.margin + 80, this.currentY + 15)
      
      // Signer name if provided
      if (signer.name) {
        this.setColor('textLight')
        this.doc.setFontSize(7)
        this.doc.text(`(${signer.name})`, this.margin, this.currentY + 19)
      }
      
      this.currentY += 25
    })
    
    return this
  }

  // ============================================
  // FINALIZE & EXPORT
  // ============================================
  finalize() {
    // Add page numbers to all pages
    const totalPages = this.doc.internal.getNumberOfPages()
    
    for (let i = 2; i <= totalPages; i++) {
      this.doc.setPage(i)
      this.addFooter(i - 1, totalPages - 1) // -1 to exclude cover page
    }
    
    // Set document properties
    this.doc.setProperties({
      title: this.title,
      subject: this.subtitle,
      author: this.branding.operator.name,
      creator: 'Aeria Ops'
    })
    
    return this
  }

  save(filename) {
    this.finalize()
    this.doc.save(filename)
  }

  getBlob() {
    this.finalize()
    return this.doc.output('blob')
  }

  getDataUri() {
    this.finalize()
    return this.doc.output('datauristring')
  }

  open() {
    this.finalize()
    this.doc.output('dataurlnewwindow')
  }
}

// ============================================
// REPORT GENERATORS
// ============================================

/**
 * Generate full Operations Plan PDF
 */
export function generateOperationsPlanPDF(project, branding = {}) {
  const pdf = new BrandedPDF({
    title: 'RPAS Operations Plan',
    subtitle: 'Flight Operations Documentation',
    projectName: project.name,
    projectCode: project.projectCode,
    clientName: project.clientName,
    branding
  })
  
  // Cover page
  pdf.addCoverPage()
  
  // Start content
  pdf.addNewPage()
  
  // Project Overview
  pdf.addSectionTitle('Project Overview')
  pdf.addKeyValueGrid([
    { label: 'Project Name', value: project.name },
    { label: 'Project Code', value: project.projectCode },
    { label: 'Client', value: project.clientName },
    { label: 'Start Date', value: project.startDate },
    { label: 'End Date', value: project.endDate },
    { label: 'Status', value: project.status?.toUpperCase() }
  ])
  
  if (project.description) {
    pdf.addSubsectionTitle('Description')
    pdf.addParagraph(project.description)
  }
  
  // Crew
  if (project.crew?.length > 0) {
    pdf.addSectionTitle('Crew Roster')
    const crewRows = project.crew.map(c => [
      c.role || 'N/A',
      c.name || 'N/A',
      c.certifications || 'N/A',
      c.phone || 'N/A'
    ])
    pdf.addTable(['Role', 'Name', 'Certifications', 'Phone'], crewRows)
  }
  
  // Flight Plan
  if (project.sections?.flightPlan && project.flightPlan) {
    pdf.addSectionTitle('Flight Plan')
    const fp = project.flightPlan
    pdf.addKeyValueGrid([
      { label: 'Operation Type', value: fp.operationType },
      { label: 'Max Altitude', value: `${fp.maxAltitudeAGL || fp.maxAltitude || 'N/A'} m AGL` },
      { label: 'Flight Duration', value: fp.duration || 'N/A' },
      { label: 'Takeoff Location', value: fp.takeoffLocation || 'N/A' }
    ])
    
    if (fp.aircraft?.length > 0) {
      pdf.addSubsectionTitle('Aircraft')
      const acRows = fp.aircraft.map(a => [
        a.registration || 'N/A',
        `${a.make || ''} ${a.model || ''}`.trim() || 'N/A',
        a.serialNumber || 'N/A',
        a.isPrimary ? 'Yes' : 'No'
      ])
      pdf.addTable(['Registration', 'Make/Model', 'Serial #', 'Primary'], acRows)
    }
  }
  
  // Site Survey
  if (project.sections?.siteSurvey && project.siteSurvey) {
    pdf.addSectionTitle('Site Survey')
    const ss = project.siteSurvey
    pdf.addKeyValueGrid([
      { label: 'Site Name', value: ss.general?.siteName },
      { label: 'Location', value: ss.general?.location },
      { label: 'Coordinates', value: ss.general?.coordinates ? 
        `${ss.general.coordinates.lat}, ${ss.general.coordinates.lng}` : 'N/A' },
      { label: 'Date Surveyed', value: ss.general?.dateSurveyed }
    ])
  }
  
  // Risk Assessment
  if (project.soraAssessment || project.hseRiskAssessment) {
    pdf.addSectionTitle('Risk Assessment')
    
    if (project.soraAssessment) {
      const sora = project.soraAssessment
      pdf.addSubsectionTitle('SORA Assessment')
      pdf.addKeyValueGrid([
        { label: 'SAIL', value: sora.sail || 'N/A' },
        { label: 'Final GRC', value: sora.finalGRC || 'N/A' },
        { label: 'Residual ARC', value: sora.residualARC || sora.initialARC || 'N/A' }
      ])
    }
    
    if (project.hseRiskAssessment?.hazards?.length > 0) {
      pdf.addSubsectionTitle('Identified Hazards')
      const hazardRows = project.hseRiskAssessment.hazards.map((h, i) => [
        String(i + 1),
        h.description || 'N/A',
        `${h.likelihood || '-'}x${h.severity || '-'}`,
        h.controls || 'N/A'
      ])
      pdf.addTable(['#', 'Hazard', 'Risk', 'Controls'], hazardRows)
    }
  }
  
  // Emergency Plan
  if (project.emergencyPlan) {
    pdf.addSectionTitle('Emergency Response')
    const ep = project.emergencyPlan
    pdf.addKeyValueGrid([
      { label: 'Primary Contact', value: ep.primaryEmergencyContact?.name },
      { label: 'Contact Phone', value: ep.primaryEmergencyContact?.phone },
      { label: 'Nearest Hospital', value: ep.nearestHospital },
      { label: 'Rally Point', value: ep.rallyPoint }
    ])
    
    if (ep.emergencyProcedure) {
      pdf.addSubsectionTitle('Emergency Procedure')
      pdf.addParagraph(ep.emergencyProcedure)
    }
  }
  
  // Approvals
  pdf.addSectionTitle('Approvals')
  pdf.addSignatureBlock([
    { role: 'Pilot in Command', name: project.crew?.find(c => c.role === 'PIC')?.name },
    { role: 'Operations Manager', name: '' },
    { role: 'Client Representative', name: '' }
  ])
  
  return pdf
}

/**
 * Generate SORA Assessment PDF
 */
export function generateSORAPDF(project, soraCalculations, branding = {}) {
  const pdf = new BrandedPDF({
    title: 'SORA 2.5 Assessment',
    subtitle: 'Specific Operations Risk Assessment',
    projectName: project.name,
    projectCode: project.projectCode,
    clientName: project.clientName,
    branding
  })
  
  const sora = project.soraAssessment || {}
  const { intrinsicGRC, finalGRC, residualARC, sail } = soraCalculations
  
  // Cover
  pdf.addCoverPage()
  pdf.addNewPage()
  
  // Executive Summary
  pdf.addSectionTitle('Executive Summary')
  pdf.addKeyValueGrid([
    { label: 'SAIL Level', value: sail || 'N/A' },
    { label: 'Final GRC', value: finalGRC || 'N/A' },
    { label: 'Residual ARC', value: residualARC || 'N/A' },
    { label: 'Assessment Status', value: 'Complete' }
  ])
  
  // ConOps
  pdf.addSectionTitle('Step 1: Concept of Operations')
  pdf.addKeyValueGrid([
    { label: 'Operation Type', value: sora.operationType },
    { label: 'Max Altitude AGL', value: `${sora.maxAltitudeAGL || 120}m` }
  ])
  
  // Ground Risk
  pdf.addSectionTitle('Steps 2-3: Ground Risk')
  pdf.addKeyValueGrid([
    { label: 'Population Category', value: sora.populationCategory },
    { label: 'UA Characteristic', value: sora.uaCharacteristic },
    { label: 'Intrinsic GRC', value: intrinsicGRC },
    { label: 'Final GRC', value: finalGRC }
  ])
  
  // Mitigations
  if (sora.mitigations) {
    pdf.addSubsectionTitle('Applied Mitigations')
    const mitRows = Object.entries(sora.mitigations)
      .filter(([_, m]) => m?.enabled)
      .map(([id, m]) => [id, m.robustness || 'none', m.evidence || 'N/A'])
    
    if (mitRows.length > 0) {
      pdf.addTable(['Mitigation', 'Robustness', 'Evidence'], mitRows)
    } else {
      pdf.addParagraph('No mitigations applied')
    }
  }
  
  // Air Risk
  pdf.addSectionTitle('Steps 4-6: Air Risk')
  pdf.addKeyValueGrid([
    { label: 'Initial ARC', value: sora.initialARC },
    { label: 'TMPR Type', value: sora.tmpr?.type },
    { label: 'TMPR Robustness', value: sora.tmpr?.robustness },
    { label: 'Residual ARC', value: residualARC }
  ])
  
  // SAIL
  pdf.addSectionTitle('Step 7: SAIL Determination')
  pdf.addLabelValue('SAIL Level', sail)
  
  // OSO Compliance
  pdf.addSectionTitle('Step 9: OSO Compliance')
  if (sora.osoCompliance) {
    const osoRows = Object.entries(sora.osoCompliance)
      .filter(([_, o]) => o?.robustness && o.robustness !== 'none')
      .map(([id, o]) => [id, o.robustness, o.evidence || 'N/A'])
    
    if (osoRows.length > 0) {
      pdf.addTable(['OSO', 'Robustness', 'Evidence'], osoRows)
    }
  }
  
  return pdf
}

/**
 * Generate HSE Risk Assessment PDF
 */
export function generateHSERiskPDF(project, branding = {}) {
  const pdf = new BrandedPDF({
    title: 'HSE Risk Assessment',
    subtitle: 'Health, Safety & Environment Assessment',
    projectName: project.name,
    projectCode: project.projectCode,
    clientName: project.clientName,
    branding
  })
  
  const hse = project.hseRiskAssessment || {}
  
  // Cover
  pdf.addCoverPage()
  pdf.addNewPage()
  
  // Summary
  pdf.addSectionTitle('Assessment Summary')
  pdf.addKeyValueGrid([
    { label: 'Total Hazards', value: hse.hazards?.length || 0 },
    { label: 'High Risk Items', value: hse.hazards?.filter(h => (h.likelihood * h.severity) >= 15).length || 0 },
    { label: 'Risk Acceptable', value: hse.overallRiskAcceptable ? 'Yes' : 'Review Required' }
  ])
  
  // Risk Matrix
  if (hse.hazards?.length > 0) {
    pdf.addRiskMatrix(hse.hazards, { title: 'Risk Matrix' })
  }
  
  // Hazard Register
  pdf.addSectionTitle('Hazard Register')
  if (hse.hazards?.length > 0) {
    hse.hazards.forEach((hazard, i) => {
      pdf.addSubsectionTitle(`${i + 1}. ${hazard.description || 'Unnamed Hazard'}`)
      pdf.addKeyValueGrid([
        { label: 'Category', value: hazard.category },
        { label: 'Likelihood', value: hazard.likelihood },
        { label: 'Severity', value: hazard.severity },
        { label: 'Risk Score', value: (hazard.likelihood * hazard.severity) || 'N/A' }
      ])
      
      if (hazard.controls) {
        pdf.addLabelValue('Controls', hazard.controls)
      }
      
      if (hazard.residualLikelihood && hazard.residualSeverity) {
        pdf.addLabelValue('Residual Risk', 
          `${hazard.residualLikelihood} x ${hazard.residualSeverity} = ${hazard.residualLikelihood * hazard.residualSeverity}`)
      }
      
      pdf.addSpacer(5)
    })
  } else {
    pdf.addParagraph('No hazards identified')
  }
  
  // Signatures
  pdf.addSectionTitle('Approvals')
  pdf.addSignatureBlock([
    { role: 'Assessor' },
    { role: 'Reviewer' }
  ])
  
  return pdf
}

// ============================================
// EXPORT UTILITY
// ============================================
export async function exportToPDF(type, project, options = {}) {
  const { branding, calculations } = options
  
  let pdf
  
  switch (type) {
    case 'operations-plan':
      pdf = generateOperationsPlanPDF(project, branding)
      break
    case 'sora':
      pdf = generateSORAPDF(project, calculations, branding)
      break
    case 'hse-risk':
      pdf = generateHSERiskPDF(project, branding)
      break
    default:
      throw new Error(`Unknown export type: ${type}`)
  }
  
  const filename = `${type}_${project.projectCode || project.name || 'export'}_${new Date().toISOString().split('T')[0]}.pdf`
  
  pdf.save(filename)
  return filename
}

export default {
  BrandedPDF,
  generateOperationsPlanPDF,
  generateSORAPDF,
  generateHSERiskPDF,
  exportToPDF
}
