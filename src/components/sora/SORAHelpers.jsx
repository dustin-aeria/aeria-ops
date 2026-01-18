/**
 * SORAHelpers.jsx
 * SORA 2.5 helper components and utilities
 * 
 * Provides specialized components for:
 * - iGRC Matrix visualization
 * - SAIL Matrix visualization
 * - Containment requirements
 * - Risk summary cards
 * - Export helpers
 * 
 * @location src/components/sora/SORAHelpers.jsx
 * @action NEW
 */

import React, { useMemo } from 'react'
import {
  Shield,
  AlertTriangle,
  Check,
  X,
  Info,
  Download,
  Printer,
  ArrowRight,
  Target,
  Users,
  Plane,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import {
  populationCategories,
  uaCharacteristics,
  intrinsicGRCMatrix,
  sailMatrix,
  sailColors,
  sailDescriptions,
  containmentRobustness,
  getContainmentRequirement
} from '../../lib/soraConfig'

// ============================================
// iGRC MATRIX VISUALIZATION
// ============================================

export function IGRCMatrixDisplay({ 
  selectedPopulation, 
  selectedUA, 
  highlightValue = null,
  onSelect 
}) {
  const getGRCColor = (grc) => {
    if (grc === null) return 'bg-gray-800 text-white'
    if (grc <= 2) return 'bg-green-500 text-white'
    if (grc <= 4) return 'bg-yellow-500 text-gray-900'
    if (grc <= 6) return 'bg-orange-500 text-white'
    return 'bg-red-500 text-white'
  }
  
  const populations = Object.keys(populationCategories)
  const uaChars = Object.keys(uaCharacteristics)
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left bg-gray-100 border border-gray-200">Population</th>
            {uaChars.map(ua => (
              <th 
                key={ua} 
                className={`p-2 text-center border border-gray-200 ${
                  selectedUA === ua ? 'bg-aeria-navy text-white' : 'bg-gray-100'
                }`}
              >
                {uaCharacteristics[ua].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {populations.map(pop => (
            <tr key={pop}>
              <td 
                className={`p-2 border border-gray-200 font-medium ${
                  selectedPopulation === pop ? 'bg-aeria-navy text-white' : 'bg-gray-50'
                }`}
              >
                {populationCategories[pop].label.split('(')[0].trim()}
              </td>
              {uaChars.map(ua => {
                const grc = intrinsicGRCMatrix[pop]?.[ua]
                const isSelected = selectedPopulation === pop && selectedUA === ua
                const isHighlighted = highlightValue !== null && grc === highlightValue
                
                return (
                  <td 
                    key={ua}
                    onClick={() => onSelect?.(pop, ua)}
                    className={`p-2 text-center border border-gray-200 font-bold cursor-pointer transition-all ${
                      getGRCColor(grc)
                    } ${isSelected ? 'ring-4 ring-aeria-navy ring-offset-2' : ''} ${
                      isHighlighted ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {grc ?? 'N/A'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="flex items-center gap-4 mt-4 text-xs">
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded" /> GRC 1-2
        </span>
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-500 rounded" /> GRC 3-4
        </span>
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 bg-orange-500 rounded" /> GRC 5-6
        </span>
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-500 rounded" /> GRC 7+
        </span>
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-800 rounded" /> Outside SORA
        </span>
      </div>
    </div>
  )
}

// ============================================
// SAIL MATRIX VISUALIZATION
// ============================================

export function SAILMatrixDisplay({ 
  selectedGRC, 
  selectedARC, 
  highlightSAIL = null 
}) {
  const grcValues = [1, 2, 3, 4, 5, 6, 7]
  const arcValues = ['ARC-a', 'ARC-b', 'ARC-c', 'ARC-d']
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left bg-gray-100 border border-gray-200">Final GRC</th>
            {arcValues.map(arc => (
              <th 
                key={arc} 
                className={`p-2 text-center border border-gray-200 ${
                  selectedARC === arc ? 'bg-aeria-navy text-white' : 'bg-gray-100'
                }`}
              >
                {arc}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grcValues.map(grc => (
            <tr key={grc}>
              <td 
                className={`p-2 border border-gray-200 font-medium text-center ${
                  selectedGRC === grc ? 'bg-aeria-navy text-white' : 'bg-gray-50'
                }`}
              >
                {grc}
              </td>
              {arcValues.map(arc => {
                const sail = sailMatrix[grc]?.[arc]
                const color = sail ? sailColors[sail] : '#E5E7EB'
                const isSelected = selectedGRC === grc && selectedARC === arc
                const isHighlighted = highlightSAIL && sail === highlightSAIL
                
                return (
                  <td 
                    key={arc}
                    className={`p-2 text-center border border-gray-200 font-bold transition-all ${
                      isSelected ? 'ring-4 ring-aeria-navy ring-offset-2' : ''
                    } ${isHighlighted ? 'ring-2 ring-blue-500' : ''}`}
                    style={{ 
                      backgroundColor: color,
                      color: sail === 'I' || sail === 'II' ? '#1F2937' : '#FFFFFF'
                    }}
                  >
                    {sail || '-'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="flex items-center gap-4 mt-4 text-xs flex-wrap">
        {['I', 'II', 'III', 'IV', 'V', 'VI'].map(sail => (
          <span key={sail} className="flex items-center gap-1">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: sailColors[sail] }}
            />
            SAIL {sail}
          </span>
        ))}
      </div>
    </div>
  )
}

// ============================================
// CONTAINMENT REQUIREMENTS DISPLAY
// ============================================

export function ContainmentRequirementsDisplay({ 
  adjacentPopulation, 
  sail, 
  uaSize = '1m'
}) {
  const requirement = getContainmentRequirement(adjacentPopulation, sail)
  
  const robustnessColors = {
    none: 'bg-gray-100 text-gray-600',
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700'
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <Target className="w-4 h-4" />
        Containment Requirements
      </h4>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Adjacent Area Population:</span>
          <span className="font-medium">
            {populationCategories[adjacentPopulation]?.label.split('(')[0].trim() || 'Not set'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current SAIL:</span>
          <span 
            className="px-2 py-0.5 rounded text-sm font-medium"
            style={{ 
              backgroundColor: sail ? sailColors[sail] : '#E5E7EB',
              color: sail === 'I' || sail === 'II' ? '#1F2937' : '#FFFFFF'
            }}
          >
            {sail || 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-gray-600">Required Containment Robustness:</span>
          <span className={`px-3 py-1 rounded font-medium ${robustnessColors[requirement] || robustnessColors.low}`}>
            {requirement ? requirement.charAt(0).toUpperCase() + requirement.slice(1) : 'Low'}
          </span>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <Info className="w-4 h-4 inline mr-1" />
          Containment prevents the UA from exiting the operational volume into adjacent areas.
          Higher population in adjacent areas requires more robust containment.
        </p>
      </div>
    </div>
  )
}

// ============================================
// RISK SUMMARY CARD
// ============================================

export function RiskSummaryCard({ 
  siteName,
  iGRC, 
  fGRC, 
  initialARC, 
  residualARC, 
  sail,
  mitigationsApplied = [],
  compact = false
}) {
  const isWithinScope = fGRC !== null && fGRC <= 7
  
  const getGRCStatus = (grc) => {
    if (grc === null) return { color: 'gray', label: 'N/A' }
    if (grc <= 3) return { color: 'green', label: 'Low' }
    if (grc <= 5) return { color: 'amber', label: 'Medium' }
    if (grc <= 7) return { color: 'red', label: 'High' }
    return { color: 'red', label: 'Outside Scope' }
  }
  
  const grcStatus = getGRCStatus(fGRC)
  
  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{siteName}</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span>iGRC: <strong>{iGRC ?? '-'}</strong></span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <span>fGRC: <strong>{fGRC ?? '-'}</strong></span>
          <span>ARC: <strong>{residualARC || initialARC || '-'}</strong></span>
          {sail && (
            <span 
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ 
                backgroundColor: sailColors[sail],
                color: sail === 'I' || sail === 'II' ? '#1F2937' : '#FFFFFF'
              }}
            >
              SAIL {sail}
            </span>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className={`rounded-lg border-2 p-4 ${
      isWithinScope ? 'border-gray-200' : 'border-red-300 bg-red-50'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {siteName} Risk Summary
        </h4>
        {sail && (
          <span 
            className="px-3 py-1 rounded-full text-sm font-bold"
            style={{ 
              backgroundColor: sailColors[sail],
              color: sail === 'I' || sail === 'II' ? '#1F2937' : '#FFFFFF'
            }}
          >
            SAIL {sail}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Intrinsic GRC</p>
          <p className="text-2xl font-bold">{iGRC ?? '?'}</p>
        </div>
        <div className="text-center p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Final GRC</p>
          <p className="text-2xl font-bold">{fGRC ?? '?'}</p>
        </div>
        <div className="text-center p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Initial ARC</p>
          <p className="text-lg font-bold">{initialARC || '?'}</p>
        </div>
        <div className="text-center p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Residual ARC</p>
          <p className="text-lg font-bold text-green-600">{residualARC || '?'}</p>
        </div>
      </div>
      
      {mitigationsApplied.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Mitigations Applied:</p>
          <div className="flex flex-wrap gap-2">
            {mitigationsApplied.map((m, i) => (
              <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {!isWithinScope && (
        <div className="flex items-start gap-2 p-3 bg-red-100 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">
            Operation is outside SORA scope (GRC &gt; 7). Additional regulatory approval required.
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================
// SORA STEP PROGRESS
// ============================================

export function SORAStepProgress({ currentStep, completedSteps = [] }) {
  const steps = [
    { num: 1, label: 'ConOps' },
    { num: 2, label: 'iGRC' },
    { num: 3, label: 'fGRC' },
    { num: 4, label: 'Init ARC' },
    { num: 5, label: 'Res ARC' },
    { num: 6, label: 'SAIL' },
    { num: 7, label: 'OSO' },
    { num: 8, label: 'Contain' },
    { num: 9, label: 'Adjacent' },
    { num: 10, label: 'Complete' }
  ]
  
  return (
    <div className="flex items-center justify-between overflow-x-auto pb-2">
      {steps.map((step, index) => {
        const isComplete = completedSteps.includes(step.num)
        const isCurrent = currentStep === step.num
        
        return (
          <React.Fragment key={step.num}>
            <div className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isComplete 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                    ? 'bg-aeria-navy text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isComplete ? <Check className="w-4 h-4" /> : step.num}
              </div>
              <span className={`text-xs mt-1 whitespace-nowrap ${
                isCurrent ? 'text-aeria-navy font-medium' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${
                completedSteps.includes(step.num) ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ============================================
// SORA QUICK REFERENCE
// ============================================

export function SORAQuickReference() {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <h4 className="font-medium text-gray-900 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        SORA 2.5 Quick Reference
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Ground Risk Mitigations</h5>
          <ul className="space-y-1 text-gray-600">
            <li><strong>M1(A)</strong> - Sheltering: L=-1, M=-2</li>
            <li><strong>M1(B)</strong> - Operational Restrictions: M=-1, H=-2</li>
            <li><strong>M1(C)</strong> - Ground Observation: L=-1</li>
            <li><strong>M2</strong> - Impact Dynamics: M=-1, H=-2</li>
            <li className="text-amber-600">M3 (ERP) removed in SORA 2.5</li>
          </ul>
        </div>
        
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Air Risk Classes</h5>
          <ul className="space-y-1 text-gray-600">
            <li><strong>ARC-a</strong> - Atypical/Segregated airspace</li>
            <li><strong>ARC-b</strong> - Uncontrolled, rural, low altitude</li>
            <li><strong>ARC-c</strong> - Controlled or urban uncontrolled</li>
            <li><strong>ARC-d</strong> - Airport environment, high traffic</li>
          </ul>
        </div>
        
        <div>
          <h5 className="font-medium text-gray-700 mb-2">SAIL Levels</h5>
          <ul className="space-y-1 text-gray-600">
            <li><strong>I-II</strong> - Declaration or self-assessment</li>
            <li><strong>III-IV</strong> - Third-party verification recommended</li>
            <li><strong>V-VI</strong> - Authority approval required</li>
          </ul>
        </div>
        
        <div>
          <h5 className="font-medium text-gray-700 mb-2">TMPR Options</h5>
          <ul className="space-y-1 text-gray-600">
            <li><strong>VLOS</strong> - Pilot see-and-avoid (-1 ARC)</li>
            <li><strong>EVLOS</strong> - Observer assisted (-1 ARC)</li>
            <li><strong>DAA</strong> - Detect and Avoid system (-2 ARC)</li>
          </ul>
        </div>
      </div>
      
      <div className="pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Reference: JARUS SORA 2.5 (JAR_doc_25), Annex B (JAR_doc_27)
        </p>
      </div>
    </div>
  )
}

// ============================================
// SORA EXPORT SUMMARY
// ============================================

export function SORAExportSummary({ 
  projectName,
  sites = [],
  calculations = {},
  onExport
}) {
  const summary = useMemo(() => {
    const siteSummaries = sites.map(site => {
      const calc = calculations[site.id] || {}
      return {
        name: site.name,
        ...calc
      }
    })
    
    const maxSAIL = siteSummaries.reduce((max, s) => {
      const sailOrder = ['I', 'II', 'III', 'IV', 'V', 'VI']
      const currentIdx = sailOrder.indexOf(s.sail)
      const maxIdx = sailOrder.indexOf(max)
      return currentIdx > maxIdx ? s.sail : max
    }, 'I')
    
    return {
      sites: siteSummaries,
      maxSAIL,
      allWithinScope: siteSummaries.every(s => s.withinScope !== false)
    }
  }, [sites, calculations])
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">{projectName} - SORA Summary</h4>
        <div className="flex gap-2">
          <button
            onClick={() => onExport?.('pdf')}
            className="px-3 py-1.5 bg-aeria-navy text-white rounded text-sm flex items-center gap-1 hover:bg-aeria-navy/90"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm flex items-center gap-1 hover:bg-gray-200"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-500">Sites Assessed</p>
          <p className="text-2xl font-bold">{summary.sites.length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Governing SAIL</p>
          <span 
            className="inline-block px-3 py-1 rounded-full text-lg font-bold"
            style={{ 
              backgroundColor: summary.maxSAIL ? sailColors[summary.maxSAIL] : '#E5E7EB',
              color: summary.maxSAIL === 'I' || summary.maxSAIL === 'II' ? '#1F2937' : '#FFFFFF'
            }}
          >
            {summary.maxSAIL || 'N/A'}
          </span>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">SORA Scope</p>
          <p className="text-xl font-bold flex items-center justify-center gap-1">
            {summary.allWithinScope ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-green-600">Within</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-600">Outside</span>
              </>
            )}
          </p>
        </div>
      </div>
      
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2">Site</th>
            <th className="text-center py-2">iGRC</th>
            <th className="text-center py-2">fGRC</th>
            <th className="text-center py-2">ARC</th>
            <th className="text-center py-2">SAIL</th>
            <th className="text-center py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {summary.sites.map((site, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="py-2">{site.name}</td>
              <td className="text-center py-2">{site.iGRC ?? '-'}</td>
              <td className="text-center py-2">{site.fGRC ?? '-'}</td>
              <td className="text-center py-2">{site.residualARC || site.initialARC || '-'}</td>
              <td className="text-center py-2">
                {site.sail && (
                  <span 
                    className="px-2 py-0.5 rounded text-xs font-bold"
                    style={{ 
                      backgroundColor: sailColors[site.sail],
                      color: site.sail === 'I' || site.sail === 'II' ? '#1F2937' : '#FFFFFF'
                    }}
                  >
                    {site.sail}
                  </span>
                )}
              </td>
              <td className="text-center py-2">
                {site.withinScope !== false ? (
                  <Check className="w-4 h-4 text-green-500 mx-auto" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500 mx-auto" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================
// SORA VALIDATION CHECKLIST
// ============================================

export function SORAValidationChecklist({ siteSORA = {}, calculations = {} }) {
  const checks = [
    {
      id: 'population',
      label: 'Population category selected',
      complete: !!siteSORA.populationCategory,
      required: true
    },
    {
      id: 'uaChar',
      label: 'UA characteristics defined',
      complete: !!siteSORA.uaCharacteristics,
      required: true
    },
    {
      id: 'iGRC',
      label: 'iGRC determined',
      complete: calculations.iGRC !== null && calculations.iGRC !== undefined,
      required: true
    },
    {
      id: 'mitigations',
      label: 'Ground mitigations reviewed',
      complete: siteSORA.mitigations && Object.keys(siteSORA.mitigations).length > 0,
      required: false
    },
    {
      id: 'initialARC',
      label: 'Initial ARC assessed',
      complete: !!siteSORA.initialARC,
      required: true
    },
    {
      id: 'tmpr',
      label: 'TMPR evaluated',
      complete: siteSORA.tmpr?.enabled !== undefined,
      required: false
    },
    {
      id: 'sail',
      label: 'SAIL determined',
      complete: !!calculations.sail,
      required: true
    },
    {
      id: 'withinScope',
      label: 'Within SORA scope',
      complete: calculations.withinScope === true,
      required: true
    }
  ]
  
  const requiredComplete = checks.filter(c => c.required && c.complete).length
  const requiredTotal = checks.filter(c => c.required).length
  const percentage = Math.round((requiredComplete / requiredTotal) * 100)
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Assessment Validation</h4>
        <span className={`text-lg font-bold ${
          percentage === 100 ? 'text-green-600' : 
          percentage >= 75 ? 'text-amber-600' : 'text-red-600'
        }`}>
          {percentage}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className={`h-2 rounded-full transition-all ${
            percentage === 100 ? 'bg-green-500' : 
            percentage >= 75 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="space-y-2">
        {checks.map(check => (
          <div key={check.id} className="flex items-center gap-2 text-sm">
            {check.complete ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className={`w-4 h-4 ${check.required ? 'text-red-500' : 'text-gray-400'}`} />
            )}
            <span className={check.complete ? 'text-gray-700' : check.required ? 'text-red-700' : 'text-gray-500'}>
              {check.label}
              {check.required && !check.complete && <span className="text-xs ml-1">(required)</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default {
  IGRCMatrixDisplay,
  SAILMatrixDisplay,
  ContainmentRequirementsDisplay,
  RiskSummaryCard,
  SORAStepProgress,
  SORAQuickReference,
  SORAExportSummary,
  SORAValidationChecklist
}
