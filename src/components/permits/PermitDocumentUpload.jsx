/**
 * PermitDocumentUpload.jsx
 * Document upload and management for permits
 *
 * @location src/components/permits/PermitDocumentUpload.jsx
 */

import React, { useState, useRef } from 'react'
import {
  Upload,
  FileText,
  File,
  Image,
  Trash2,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react'

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }
  return `${bytes.toFixed(1)} ${units[i]}`
}

function getFileIcon(type) {
  if (type?.startsWith('image/')) return Image
  if (type === 'application/pdf') return FileText
  return File
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function PermitDocumentUpload({
  documents = [],
  onUpload,
  onRemove,
  readOnly = false,
  maxFiles = 10
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check if adding these files would exceed the limit
    if (documents.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} documents allowed`)
      return
    }

    setError('')
    setUploading(true)

    try {
      for (const file of files) {
        await onUpload?.(file)
      }
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = async (document) => {
    if (window.confirm(`Delete "${document.name}"?`)) {
      try {
        await onRemove?.(document.path)
      } catch (err) {
        setError(err.message || 'Failed to delete document')
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (readOnly) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    if (documents.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} documents allowed`)
      return
    }

    setError('')
    setUploading(true)

    try {
      for (const file of files) {
        await onUpload?.(file)
      }
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Documents
        </h3>
        <span className="text-xs text-gray-500">{documents.length}/{maxFiles}</span>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Documents list */}
      {documents.length > 0 && (
        <div className="space-y-2 mb-4">
          {documents.map((doc, index) => {
            const FileIcon = getFileIcon(doc.type)
            return (
              <div
                key={doc.id || doc.path || index}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
              >
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatFileSize(doc.size)}</span>
                    {doc.uploadedAt && (
                      <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="View"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href={doc.url}
                    download={doc.name}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {!readOnly && (
                    <button
                      onClick={() => handleRemove(doc)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload area */}
      {!readOnly && documents.length < maxFiles && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            uploading
              ? 'border-cyan-300 bg-cyan-50'
              : 'border-gray-300 hover:border-cyan-400 hover:bg-cyan-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.webp"
            multiple
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
              <p className="text-sm text-cyan-700">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                <span className="font-medium text-cyan-600">Click to upload</span>
                {' '}or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, Word, Excel, or images (max 50MB each)
              </p>
            </div>
          )}
        </div>
      )}

      {!readOnly && documents.length >= maxFiles && (
        <div className="text-center py-4 text-sm text-gray-500">
          Maximum number of documents reached
        </div>
      )}
    </div>
  )
}
