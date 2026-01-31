// ============================================
// EQUIPMENT IMPORT COMPONENT
// Bulk import from Excel/CSV files
// ============================================

import { useState, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import * as XLSX from 'xlsx'
import {
  Upload,
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Download,
  MapPin,
  Target,
  Camera,
  Shield,
  Truck,
  Zap,
  Radio,
  Briefcase,
  Package,
  Archive
} from 'lucide-react'
import { createEquipment, EQUIPMENT_CATEGORIES } from '../lib/firestore'
import { useOrganization } from '../hooks/useOrganization'

// ============================================
// EQUIPMENT FIELDS FOR MAPPING
// ============================================
const EQUIPMENT_FIELDS = [
  { key: 'name', label: 'Name', required: true },
  { key: 'manufacturer', label: 'Manufacturer' },
  { key: 'model', label: 'Model' },
  { key: 'serialNumber', label: 'Serial Number' },
  { key: 'purchaseDate', label: 'Purchase Date' },
  { key: 'purchasePrice', label: 'Purchase Price' },
  { key: 'condition', label: 'Condition' },
  { key: 'notes', label: 'Notes' },
  { key: 'maintenanceInterval', label: 'Service Interval (days)' },
  { key: 'lastServiceDate', label: 'Last Service Date' },
  { key: 'nextServiceDate', label: 'Next Service Date' }
]

// Category icons
const categoryIcons = {
  positioning: MapPin,
  ground_control: Target,
  payloads: Camera,
  safety: Shield,
  vehicles: Truck,
  power: Zap,
  communication: Radio,
  support: Briefcase,
  rpas: Package,
  other: Archive
}

// ============================================
// STEP INDICATORS
// ============================================
const steps = [
  { id: 1, name: 'Upload File' },
  { id: 2, name: 'Map Columns' },
  { id: 3, name: 'Review & Import' }
]

// ============================================
// MAIN COMPONENT
// ============================================
export default function EquipmentImport({ isOpen, onClose, onImportComplete }) {
  const fileInputRef = useRef(null)
  const { organizationId } = useOrganization()

  // State
  const [currentStep, setCurrentStep] = useState(1)
  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [headers, setHeaders] = useState([])
  const [columnMapping, setColumnMapping] = useState({})
  const [selectedCategory, setSelectedCategory] = useState('support')
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })
  const [importResults, setImportResults] = useState({ success: [], errors: [] })
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // Reset state
  const resetState = () => {
    setCurrentStep(1)
    setFile(null)
    setParsedData([])
    setHeaders([])
    setColumnMapping({})
    setSelectedCategory('support')
    setImporting(false)
    setImportProgress({ current: 0, total: 0 })
    setImportResults({ success: [], errors: [] })
    setError('')
  }

  // Handle close
  const handleClose = () => {
    resetState()
    onClose()
  }

  // ============================================
  // FILE HANDLING
  // ============================================
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleFileSelect = async (selectedFile) => {
    setError('')

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv',
      'application/csv'
    ]

    const fileExtension = selectedFile.name.split('.').pop().toLowerCase()
    const isValidExtension = ['xlsx', 'xls', 'csv'].includes(fileExtension)

    if (!validTypes.includes(selectedFile.type) && !isValidExtension) {
      setError('Please upload an Excel (.xlsx, .xls) or CSV file.')
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.')
      return
    }

    setFile(selectedFile)

    try {
      await parseFile(selectedFile)
    } catch (err) {
      setError(`Failed to parse file: ${err.message}`)
      setFile(null)
    }
  }

  // ============================================
  // PARSE FILE
  // ============================================
  const parseFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })

          // Get first sheet
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

          if (jsonData.length < 2) {
            reject(new Error('File must contain at least a header row and one data row.'))
            return
          }

          // Extract headers and data
          const fileHeaders = jsonData[0].map(h => String(h || '').trim())
          const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))

          setHeaders(fileHeaders)
          setParsedData(dataRows)

          // Auto-map columns based on header names
          autoMapColumns(fileHeaders)

          resolve()
        } catch (err) {
          reject(err)
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  // ============================================
  // AUTO-MAP COLUMNS
  // ============================================
  const autoMapColumns = (fileHeaders) => {
    const mapping = {}

    const headerLower = fileHeaders.map(h => h.toLowerCase())

    // Try to auto-map based on common column names
    EQUIPMENT_FIELDS.forEach(field => {
      const possibleNames = getPossibleColumnNames(field.key)

      for (const name of possibleNames) {
        const index = headerLower.findIndex(h => h.includes(name))
        if (index !== -1 && !Object.values(mapping).includes(index)) {
          mapping[field.key] = index
          break
        }
      }
    })

    setColumnMapping(mapping)
  }

  // Get possible column names for a field
  const getPossibleColumnNames = (fieldKey) => {
    const nameMap = {
      name: ['name', 'equipment name', 'item name', 'item', 'description'],
      manufacturer: ['manufacturer', 'make', 'brand', 'vendor'],
      model: ['model', 'model number', 'model #', 'part number'],
      serialNumber: ['serial', 'serial number', 'serial #', 's/n', 'sn'],
      purchaseDate: ['purchase date', 'purchased', 'date purchased', 'acquisition date'],
      purchasePrice: ['price', 'purchase price', 'cost', 'value'],
      condition: ['condition', 'status', 'state'],
      notes: ['notes', 'comments', 'remarks', 'description'],
      maintenanceInterval: ['interval', 'service interval', 'maintenance interval'],
      lastServiceDate: ['last service', 'last serviced', 'last maintenance'],
      nextServiceDate: ['next service', 'next maintenance', 'service due']
    }

    return nameMap[fieldKey] || [fieldKey.toLowerCase()]
  }

  // ============================================
  // IMPORT EQUIPMENT
  // ============================================
  const handleImport = async () => {
    setImporting(true)
    setImportProgress({ current: 0, total: parsedData.length })
    setImportResults({ success: [], errors: [] })

    const results = { success: [], errors: [] }

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i]
      setImportProgress({ current: i + 1, total: parsedData.length })

      try {
        // Build equipment data from row using mapping
        const equipmentData = {
          category: selectedCategory,
          status: 'available',
          customFields: {}
        }

        // Map each field
        Object.entries(columnMapping).forEach(([fieldKey, columnIndex]) => {
          if (columnIndex !== undefined && columnIndex !== null && columnIndex !== -1) {
            const value = row[columnIndex]
            if (value !== null && value !== undefined && value !== '') {
              // Handle special fields
              if (fieldKey === 'purchasePrice') {
                const numValue = parseFloat(String(value).replace(/[$,]/g, ''))
                if (!isNaN(numValue)) {
                  equipmentData[fieldKey] = numValue
                }
              } else if (fieldKey === 'maintenanceInterval') {
                const numValue = parseInt(String(value), 10)
                if (!isNaN(numValue)) {
                  equipmentData[fieldKey] = numValue
                }
              } else if (fieldKey === 'purchaseDate' || fieldKey === 'lastServiceDate' || fieldKey === 'nextServiceDate') {
                // Try to parse date
                const dateValue = parseDate(value)
                if (dateValue) {
                  equipmentData[fieldKey] = dateValue
                }
              } else {
                equipmentData[fieldKey] = String(value).trim()
              }
            }
          }
        })

        // Validate required fields
        if (!equipmentData.name || !equipmentData.name.trim()) {
          throw new Error('Name is required')
        }

        // Create equipment
        await createEquipment(equipmentData, organizationId)
        results.success.push({ row: i + 1, name: equipmentData.name })

      } catch (err) {
        results.errors.push({
          row: i + 1,
          name: row[columnMapping.name] || `Row ${i + 1}`,
          error: err.message
        })
      }
    }

    setImportResults(results)
    setImporting(false)
    setCurrentStep(3)

    if (results.success.length > 0 && onImportComplete) {
      onImportComplete()
    }
  }

  // Parse date from various formats
  const parseDate = (value) => {
    if (!value) return null

    // If it's already a date object
    if (value instanceof Date) {
      return value.toISOString().split('T')[0]
    }

    // If it's a number (Excel serial date)
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value)
      if (date) {
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
      }
    }

    // Try parsing string
    const dateStr = String(value)
    const parsed = new Date(dateStr)
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0]
    }

    return null
  }

  // ============================================
  // RENDER
  // ============================================
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-aeria-sky rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-aeria-navy" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Import Equipment</h2>
                <p className="text-sm text-gray-500">Bulk import from Excel or CSV</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                        ? 'bg-aeria-navy text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`ml-2 text-sm ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-gray-300 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Upload File */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-aeria-blue bg-aeria-sky/30'
                      : file
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  {file ? (
                    <div className="flex items-center justify-center gap-4">
                      <FileSpreadsheet className="w-12 h-12 text-green-500" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {parsedData.length} rows found
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setFile(null)
                          setParsedData([])
                          setHeaders([])
                          setColumnMapping({})
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-1">
                        Drop your file here
                      </p>
                      <p className="text-gray-500 mb-4">
                        or click to browse
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-primary"
                      >
                        Select File
                      </button>
                      <p className="text-xs text-gray-400 mt-4">
                        Supports Excel (.xlsx, .xls) and CSV files up to 10MB
                      </p>
                    </>
                  )}
                </div>

                {/* Category Selection */}
                {file && (
                  <div>
                    <label className="label">Equipment Category</label>
                    <p className="text-sm text-gray-500 mb-3">
                      All imported items will be assigned to this category
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(EQUIPMENT_CATEGORIES).map(([key, cat]) => {
                        const Icon = categoryIcons[key]
                        const isSelected = selectedCategory === key
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedCategory(key)}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              isSelected
                                ? 'border-aeria-navy bg-aeria-sky/30'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-aeria-navy' : 'text-gray-400'}`} />
                            <p className={`text-sm font-medium ${isSelected ? 'text-aeria-navy' : 'text-gray-700'}`}>
                              {cat.label}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Download Template */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Download className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Need a template?</p>
                    <p className="text-xs text-gray-500">Download our Excel template with the correct column headers</p>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="btn-secondary btn-sm"
                  >
                    Download
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Map Columns */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Map your spreadsheet columns to equipment fields. Required fields are marked with *.
                  </p>
                </div>

                <div className="space-y-3">
                  {EQUIPMENT_FIELDS.map(field => (
                    <div key={field.key} className="flex items-center gap-4">
                      <div className="w-48">
                        <span className="text-sm font-medium text-gray-700">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <select
                        value={columnMapping[field.key] ?? -1}
                        onChange={(e) => setColumnMapping(prev => ({
                          ...prev,
                          [field.key]: parseInt(e.target.value, 10)
                        }))}
                        className="input flex-1"
                      >
                        <option value={-1}>-- Select Column --</option>
                        {headers.map((header, index) => (
                          <option key={index} value={index}>
                            {header || `Column ${index + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Preview */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Preview (first 5 rows)</h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-2 px-3 text-left text-gray-600 font-medium">Row</th>
                          {EQUIPMENT_FIELDS.filter(f => columnMapping[f.key] !== undefined && columnMapping[f.key] !== -1).map(field => (
                            <th key={field.key} className="py-2 px-3 text-left text-gray-600 font-medium">
                              {field.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-t border-gray-100">
                            <td className="py-2 px-3 text-gray-500">{rowIndex + 1}</td>
                            {EQUIPMENT_FIELDS.filter(f => columnMapping[f.key] !== undefined && columnMapping[f.key] !== -1).map(field => (
                              <td key={field.key} className="py-2 px-3 text-gray-900">
                                {row[columnMapping[field.key]] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Import Results */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {importing ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-aeria-navy mx-auto mb-4 animate-spin" />
                    <p className="text-lg font-medium text-gray-900 mb-2">Importing Equipment...</p>
                    <p className="text-gray-500">
                      {importProgress.current} of {importProgress.total} items
                    </p>
                    <div className="w-64 mx-auto mt-4 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-aeria-navy h-2 rounded-full transition-all"
                        style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-8 h-8 text-green-500" />
                          <div>
                            <p className="text-2xl font-bold text-green-700">{importResults.success.length}</p>
                            <p className="text-sm text-green-600">Successfully imported</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-8 h-8 text-red-500" />
                          <div>
                            <p className="text-2xl font-bold text-red-700">{importResults.errors.length}</p>
                            <p className="text-sm text-red-600">Failed to import</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Error Details */}
                    {importResults.errors.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Errors</h4>
                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="py-2 px-3 text-left text-gray-600">Row</th>
                                <th className="py-2 px-3 text-left text-gray-600">Item</th>
                                <th className="py-2 px-3 text-left text-gray-600">Error</th>
                              </tr>
                            </thead>
                            <tbody>
                              {importResults.errors.map((err, index) => (
                                <tr key={index} className="border-t border-gray-100">
                                  <td className="py-2 px-3 text-gray-500">{err.row}</td>
                                  <td className="py-2 px-3 text-gray-900">{err.name}</td>
                                  <td className="py-2 px-3 text-red-600">{err.error}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Success List */}
                    {importResults.success.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Successfully Imported ({importResults.success.length})
                        </h4>
                        <div className="max-h-32 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                          <div className="flex flex-wrap gap-2">
                            {importResults.success.map((item, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                              >
                                {item.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div>
              {currentStep > 1 && currentStep < 3 && (
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleClose} className="btn-secondary">
                {currentStep === 3 ? 'Close' : 'Cancel'}
              </button>
              {currentStep === 1 && file && (
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-primary flex items-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {currentStep === 2 && (
                <button
                  onClick={handleImport}
                  disabled={columnMapping.name === undefined || columnMapping.name === -1}
                  className="btn-primary flex items-center gap-2"
                >
                  Import {parsedData.length} Items
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {currentStep === 3 && !importing && importResults.success.length > 0 && (
                <button
                  onClick={() => {
                    resetState()
                    setCurrentStep(1)
                  }}
                  className="btn-primary"
                >
                  Import More
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// DOWNLOAD TEMPLATE
// ============================================
function downloadTemplate() {
  const headers = [
    'Name',
    'Manufacturer',
    'Model',
    'Serial Number',
    'Purchase Date',
    'Purchase Price',
    'Condition',
    'Notes',
    'Service Interval (days)',
    'Last Service Date',
    'Next Service Date'
  ]

  const exampleRow = [
    'Trimble R10',
    'Trimble',
    'R10 Model 2',
    'SN123456789',
    '2024-01-15',
    '15000',
    'Excellent',
    'Primary survey receiver',
    '365',
    '2024-01-15',
    '2025-01-15'
  ]

  const worksheet = XLSX.utils.aoa_to_sheet([headers, exampleRow])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Equipment')

  // Set column widths
  worksheet['!cols'] = headers.map(() => ({ wch: 20 }))

  XLSX.writeFile(workbook, 'equipment_import_template.xlsx')
}

EquipmentImport.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImportComplete: PropTypes.func
}
