/**
 * FileUpload Component
 * File upload controls and dropzones
 *
 * @location src/components/ui/FileUpload.jsx
 */

import React, { useState, useRef, useCallback } from 'react'
import {
  Upload,
  File,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  X,
  Check,
  AlertCircle,
  Loader2,
  Paperclip,
  Camera,
  Folder
} from 'lucide-react'

// ============================================
// FILE TYPE ICONS
// ============================================

const FILE_ICONS = {
  image: Image,
  video: Film,
  audio: Music,
  pdf: FileText,
  archive: Archive,
  default: File
}

function getFileIcon(file) {
  const type = file.type || ''
  if (type.startsWith('image/')) return FILE_ICONS.image
  if (type.startsWith('video/')) return FILE_ICONS.video
  if (type.startsWith('audio/')) return FILE_ICONS.audio
  if (type === 'application/pdf') return FILE_ICONS.pdf
  if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return FILE_ICONS.archive
  return FILE_ICONS.default
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ============================================
// BASE FILE UPLOAD (DROPZONE)
// ============================================

/**
 * Drag and drop file upload zone
 */
export function FileUpload({
  onUpload,
  accept,
  multiple = false,
  maxSize,
  maxFiles = 10,
  disabled = false,
  children,
  className = ''
}) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const validateFiles = (files) => {
    const validFiles = []
    const errors = []

    for (const file of files) {
      if (maxSize && file.size > maxSize) {
        errors.push(`${file.name} exceeds ${formatFileSize(maxSize)} limit`)
        continue
      }
      validFiles.push(file)
    }

    return { validFiles, errors }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    const filesToProcess = multiple ? files.slice(0, maxFiles) : [files[0]]
    const { validFiles, errors } = validateFiles(filesToProcess)

    if (validFiles.length > 0) {
      onUpload?.(multiple ? validFiles : validFiles[0], errors)
    }
  }, [disabled, multiple, maxFiles, maxSize, onUpload])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    const filesToProcess = multiple ? files.slice(0, maxFiles) : [files[0]]
    const { validFiles, errors } = validateFiles(filesToProcess)

    if (validFiles.length > 0) {
      onUpload?.(multiple ? validFiles : validFiles[0], errors)
    }

    // Reset input
    e.target.value = ''
  }

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        relative border-2 border-dashed rounded-lg transition-colors cursor-pointer
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled}
        className="sr-only"
      />
      {children || (
        <div className="p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
          </p>
          {accept && (
            <p className="mt-1 text-xs text-gray-500">
              {accept.split(',').join(', ')}
            </p>
          )}
          {maxSize && (
            <p className="text-xs text-gray-500">
              Max file size: {formatFileSize(maxSize)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// FILE LIST
// ============================================

/**
 * Display list of uploaded files
 */
export function FileList({
  files = [],
  onRemove,
  showSize = true,
  showPreview = true,
  className = ''
}) {
  return (
    <ul className={`divide-y divide-gray-200 ${className}`}>
      {files.map((file, index) => {
        const Icon = getFileIcon(file)
        const isImage = file.type?.startsWith('image/')

        return (
          <li key={file.name + index} className="flex items-center gap-3 py-3">
            {showPreview && isImage && file.preview ? (
              <img
                src={file.preview}
                alt={file.name}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                <Icon className="h-5 w-5 text-gray-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              {showSize && (
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              )}
            </div>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(file, index)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

// ============================================
// FILE UPLOAD WITH PREVIEW
// ============================================

/**
 * File upload with inline preview
 */
export function FileUploadWithPreview({
  files = [],
  onChange,
  accept = 'image/*',
  multiple = true,
  maxSize,
  maxFiles = 10,
  disabled = false,
  className = ''
}) {
  const handleUpload = (newFiles) => {
    const filesArray = Array.isArray(newFiles) ? newFiles : [newFiles]
    const withPreviews = filesArray.map((file) => {
      if (file.type.startsWith('image/')) {
        return Object.assign(file, { preview: URL.createObjectURL(file) })
      }
      return file
    })
    onChange([...files, ...withPreviews].slice(0, maxFiles))
  }

  const handleRemove = (_, index) => {
    const file = files[index]
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className={className}>
      <FileUpload
        onUpload={handleUpload}
        accept={accept}
        multiple={multiple}
        maxSize={maxSize}
        maxFiles={maxFiles - files.length}
        disabled={disabled || files.length >= maxFiles}
      />
      {files.length > 0 && (
        <FileList
          files={files}
          onRemove={handleRemove}
          className="mt-4"
        />
      )}
    </div>
  )
}

// ============================================
// IMAGE UPLOAD GRID
// ============================================

/**
 * Image upload with grid preview
 */
export function ImageUploadGrid({
  images = [],
  onChange,
  maxImages = 6,
  aspectRatio = 'square',
  disabled = false,
  className = ''
}) {
  const inputRef = useRef(null)

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[2/1]',
    tall: 'aspect-[1/2]'
  }

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter((f) => f.type.startsWith('image/'))
    const withPreviews = imageFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    )
    onChange([...images, ...withPreviews].slice(0, maxImages))
    e.target.value = ''
  }

  const handleRemove = (index) => {
    const image = images[index]
    if (image.preview) {
      URL.revokeObjectURL(image.preview)
    }
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {images.map((image, index) => (
        <div
          key={image.preview || index}
          className={`relative rounded-lg overflow-hidden bg-gray-100 ${aspectClasses[aspectRatio]}`}
        >
          <img
            src={image.preview || image.url}
            alt=""
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      {images.length < maxImages && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className={`
            ${aspectClasses[aspectRatio]}
            border-2 border-dashed border-gray-300 rounded-lg
            flex flex-col items-center justify-center
            text-gray-400 hover:text-gray-500 hover:border-gray-400
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <Camera className="h-6 w-6" />
          <span className="text-xs mt-1">Add</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        disabled={disabled}
        className="sr-only"
      />
    </div>
  )
}

// ============================================
// FILE UPLOAD BUTTON
// ============================================

/**
 * Simple file upload button
 */
export function FileUploadButton({
  onUpload,
  accept,
  multiple = false,
  disabled = false,
  variant = 'default',
  size = 'md',
  children,
  className = ''
}) {
  const inputRef = useRef(null)

  const variantClasses = {
    default: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const handleChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onUpload?.(multiple ? files : files[0])
    }
    e.target.value = ''
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={`
          inline-flex items-center gap-2 font-medium rounded-md
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
      >
        <Paperclip className="h-4 w-4" />
        {children || 'Upload file'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
      />
    </>
  )
}

// ============================================
// FILE UPLOAD PROGRESS
// ============================================

/**
 * File upload with progress indicator
 */
export function FileUploadProgress({
  file,
  progress = 0,
  status = 'uploading',
  error,
  onCancel,
  onRetry,
  onRemove,
  className = ''
}) {
  const Icon = getFileIcon(file)

  const statusConfig = {
    uploading: { color: 'bg-blue-600', label: 'Uploading...' },
    processing: { color: 'bg-yellow-500', label: 'Processing...' },
    completed: { color: 'bg-green-600', label: 'Completed' },
    error: { color: 'bg-red-600', label: 'Failed' }
  }

  const config = statusConfig[status] || statusConfig.uploading

  return (
    <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded bg-white flex items-center justify-center border border-gray-200">
          <Icon className="h-5 w-5 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <div className="flex items-center gap-1">
              {status === 'uploading' && onCancel && (
                <button
                  onClick={onCancel}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              )}
              {status === 'error' && onRetry && (
                <button
                  onClick={onRetry}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Retry
                </button>
              )}
              {(status === 'completed' || status === 'error') && onRemove && (
                <button
                  onClick={onRemove}
                  className="p-0.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
            {status === 'uploading' && (
              <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
            )}
            {status === 'completed' && (
              <Check className="h-3 w-3 text-green-600" />
            )}
            {status === 'error' && (
              <AlertCircle className="h-3 w-3 text-red-600" />
            )}
          </div>
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
          {(status === 'uploading' || status === 'processing') && (
            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${config.color} transition-all duration-300 ${status === 'processing' ? 'animate-pulse' : ''}`}
                style={{ width: status === 'processing' ? '100%' : `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// AVATAR UPLOAD
// ============================================

/**
 * Avatar/profile image upload
 */
export function AvatarUpload({
  src,
  onChange,
  size = 'lg',
  disabled = false,
  className = ''
}) {
  const inputRef = useRef(null)

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-20 w-20',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32'
  }

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onChange?.(file)
    }
    e.target.value = ''
  }

  return (
    <div className={`relative inline-flex ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200
          flex items-center justify-center
        `}
      >
        {src ? (
          <img src={src} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <Camera className="h-1/3 w-1/3 text-gray-400" />
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={`
          absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full
          shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
      >
        <Camera className="h-4 w-4" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
      />
    </div>
  )
}

// ============================================
// FOLDER UPLOAD
// ============================================

/**
 * Folder/directory upload
 */
export function FolderUpload({
  onUpload,
  disabled = false,
  className = ''
}) {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      // Group files by path
      const filesByPath = files.reduce((acc, file) => {
        const path = file.webkitRelativePath || file.name
        const dir = path.split('/').slice(0, -1).join('/')
        if (!acc[dir]) acc[dir] = []
        acc[dir].push(file)
        return acc
      }, {})

      onUpload?.(files, filesByPath)
    }
    e.target.value = ''
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        border-2 border-dashed border-gray-300 rounded-lg p-8
        text-center cursor-pointer hover:border-gray-400
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <Folder className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        <span className="font-medium text-blue-600">Click to select folder</span>
      </p>
      <p className="mt-1 text-xs text-gray-500">
        All files in the folder will be uploaded
      </p>
      <input
        ref={inputRef}
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
      />
    </div>
  )
}

// ============================================
// COMPACT FILE INPUT
// ============================================

/**
 * Compact file input field
 */
export function CompactFileInput({
  value,
  onChange,
  accept,
  placeholder = 'No file selected',
  disabled = false,
  error,
  className = ''
}) {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    onChange?.(file || null)
    e.target.value = ''
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange?.(null)
  }

  return (
    <div className={className}>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          flex items-center gap-2 px-3 py-2 border rounded-md
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer hover:bg-gray-50'}
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}
      >
        <Paperclip className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <span className={`text-sm flex-1 truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {value?.name || placeholder}
        </span>
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
      />
    </div>
  )
}

export default {
  FileUpload,
  FileList,
  FileUploadWithPreview,
  ImageUploadGrid,
  FileUploadButton,
  FileUploadProgress,
  AvatarUpload,
  FolderUpload,
  CompactFileInput,
  getFileIcon,
  formatFileSize
}
