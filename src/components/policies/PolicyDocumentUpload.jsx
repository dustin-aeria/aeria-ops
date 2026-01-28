/**
 * PolicyDocumentUpload.jsx
 * Upload PDF/Word documents and extract content for policies
 *
 * Features:
 * - Drag and drop file upload
 * - PDF text extraction (client-side with pdf.js)
 * - Preview extracted content
 * - Create policy from extracted content
 *
 * @location src/components/policies/PolicyDocumentUpload.jsx
 */

import { useState, useRef, useCallback } from 'react'
import {
  X,
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileUp,
  Eye,
  Edit3,
  Plus
} from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import { useAuth } from '../../contexts/AuthContext'
import { createPolicyEnhanced } from '../../lib/firestorePolicies'
import { logger } from '../../lib/logger'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const textContent = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => item.str).join(' ')
    textContent.push(pageText)
  }

  return {
    text: textContent.join('\n\n'),
    pageCount: pdf.numPages,
    metadata: await pdf.getMetadata().catch(() => null)
  }
}

/**
 * Parse extracted text to identify policy sections
 */
function parseExtractedContent(text, filename) {
  // Common section patterns
  const sectionPatterns = [
    /^(\d+\.?\s*)?PURPOSE/im,
    /^(\d+\.?\s*)?SCOPE/im,
    /^(\d+\.?\s*)?DEFINITIONS/im,
    /^(\d+\.?\s*)?RESPONSIBILITIES/im,
    /^(\d+\.?\s*)?POLICY\s*(STATEMENT)?/im,
    /^(\d+\.?\s*)?PROCEDURE/im,
    /^(\d+\.?\s*)?REQUIREMENTS/im,
    /^(\d+\.?\s*)?COMPLIANCE/im,
    /^(\d+\.?\s*)?REFERENCES/im,
    /^(\d+\.?\s*)?REVISION\s*HISTORY/im
  ]

  const sections = []
  let lastIndex = 0

  // Find sections
  for (const pattern of sectionPatterns) {
    const match = text.match(pattern)
    if (match) {
      sections.push({
        title: match[0].replace(/^\d+\.?\s*/, '').trim(),
        index: match.index
      })
    }
  }

  // Sort by position
  sections.sort((a, b) => a.index - b.index)

  // Extract section content
  const parsedSections = sections.map((section, i) => {
    const startIndex = section.index
    const endIndex = sections[i + 1]?.index || text.length
    const content = text.substring(startIndex, endIndex).trim()
    return {
      title: section.title,
      content: content.substring(content.indexOf('\n') + 1).trim() || content
    }
  })

  // Try to extract title from first line or filename
  let title = ''
  const firstLine = text.split('\n')[0]?.trim()
  if (firstLine && firstLine.length < 100 && !firstLine.match(/^\d+\./)) {
    title = firstLine
  } else {
    // Extract from filename
    title = filename
      .replace(/\.pdf$/i, '')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  // Try to extract policy number
  const numberMatch = text.match(/policy\s*#?\s*:?\s*(\d{3,4})/i) ||
    filename.match(/(\d{4})/) ||
    text.match(/^(\d{4})\s/m)
  const number = numberMatch ? numberMatch[1] : ''

  return {
    title,
    number,
    sections: parsedSections,
    fullText: text
  }
}

export default function PolicyDocumentUpload({ isOpen, onClose, onCreated }) {
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [extractedContent, setExtractedContent] = useState(null)

  // Editable policy fields
  const [policyData, setPolicyData] = useState({
    number: '',
    title: '',
    category: 'rpas',
    description: '',
    owner: '',
    status: 'draft'
  })

  // Handle file selection
  const handleFile = useCallback(async (selectedFile) => {
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.name.match(/\.(pdf)$/i)) {
      setError('Please upload a PDF file')
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setFile(selectedFile)
    setError('')
    setExtracting(true)

    try {
      const extracted = await extractTextFromPDF(selectedFile)
      const parsed = parseExtractedContent(extracted.text, selectedFile.name)

      setExtractedContent({
        ...parsed,
        pageCount: extracted.pageCount,
        metadata: extracted.metadata
      })

      // Pre-fill policy data
      setPolicyData(prev => ({
        ...prev,
        number: parsed.number || '',
        title: parsed.title || '',
        description: parsed.sections[0]?.content?.substring(0, 500) || ''
      }))
    } catch (err) {
      logger.error('Failed to extract PDF content:', err)
      setError('Failed to extract content from PDF. The file may be corrupted or password-protected.')
    } finally {
      setExtracting(false)
    }
  }, [])

  // Drag handlers
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

    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [handleFile])

  // Create policy from extracted content
  const handleCreatePolicy = async () => {
    if (!user || !extractedContent) return

    setCreating(true)
    setError('')

    try {
      // Build content object from sections
      const content = {
        sections: extractedContent.sections.map(s => ({
          title: s.title,
          content: s.content
        })),
        sourceDocument: file?.name,
        extractedAt: new Date().toISOString()
      }

      await createPolicyEnhanced({
        number: policyData.number,
        title: policyData.title,
        category: policyData.category,
        description: policyData.description,
        content,
        version: '1.0',
        status: policyData.status,
        owner: policyData.owner,
        effectiveDate: new Date().toISOString().split('T')[0],
        isCustomized: true,
        sourceType: 'document_upload'
      }, user.uid)

      onCreated?.()
      handleClose()
    } catch (err) {
      logger.error('Failed to create policy:', err)
      setError('Failed to create policy. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  // Reset state on close
  const handleClose = () => {
    setFile(null)
    setExtractedContent(null)
    setPolicyData({
      number: '',
      title: '',
      category: 'rpas',
      description: '',
      owner: '',
      status: 'draft'
    })
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Upload Policy Document</h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload a PDF to extract content and create a new policy
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {!extractedContent ? (
            // Upload zone
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-aeria-navy bg-aeria-sky/20'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
              />

              {extracting ? (
                <div className="py-8">
                  <Loader2 className="w-12 h-12 text-aeria-navy mx-auto animate-spin mb-4" />
                  <p className="text-gray-600">Extracting content from PDF...</p>
                </div>
              ) : (
                <>
                  <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Drop your PDF here
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Select File
                  </button>
                  <p className="text-xs text-gray-400 mt-4">
                    Supported: PDF files up to 10MB
                  </p>
                </>
              )}
            </div>
          ) : (
            // Extracted content preview and edit
            <div className="space-y-6">
              {/* File info */}
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-800">{file?.name}</p>
                  <p className="text-sm text-green-600">
                    {extractedContent.pageCount} pages • {extractedContent.sections.length} sections detected
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile(null)
                    setExtractedContent(null)
                  }}
                  className="text-sm text-green-700 hover:underline"
                >
                  Upload different file
                </button>
              </div>

              {/* Policy details form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    value={policyData.number}
                    onChange={(e) => setPolicyData(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="e.g., 1001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={policyData.category}
                    onChange={(e) => setPolicyData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                  >
                    <option value="rpas">RPAS Operations</option>
                    <option value="crm">Crew Resource Management</option>
                    <option value="hse">Health, Safety & Environment</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={policyData.title}
                    onChange={(e) => setPolicyData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Policy title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={policyData.description}
                    onChange={(e) => setPolicyData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the policy"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner
                  </label>
                  <input
                    type="text"
                    value={policyData.owner}
                    onChange={(e) => setPolicyData(prev => ({ ...prev, owner: e.target.value }))}
                    placeholder="e.g., Chief Pilot"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={policyData.status}
                    onChange={(e) => setPolicyData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>

              {/* Detected sections preview */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Detected Sections ({extractedContent.sections.length})
                </h3>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  {extractedContent.sections.length > 0 ? (
                    extractedContent.sections.map((section, i) => (
                      <div key={i} className="p-3">
                        <p className="font-medium text-gray-900 text-sm">{section.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {section.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No standard sections detected. The full text will be imported.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          {extractedContent && (
            <button
              onClick={handleCreatePolicy}
              disabled={creating || !policyData.title}
              className="px-4 py-2 bg-aeria-navy text-white rounded-lg hover:bg-aeria-navy/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Policy
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
