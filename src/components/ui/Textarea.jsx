/**
 * Textarea Component
 * Multi-line text input fields
 *
 * @location src/components/ui/Textarea.jsx
 */

import React, { forwardRef, useState, useRef, useEffect } from 'react'
import { AlertCircle, CheckCircle, HelpCircle } from 'lucide-react'

// ============================================
// BASE TEXTAREA
// ============================================

/**
 * Base textarea component
 */
export const Textarea = forwardRef(({
  value,
  onChange,
  placeholder,
  rows = 4,
  minRows,
  maxRows,
  resize = 'vertical',
  autoResize = false,
  disabled = false,
  readOnly = false,
  error,
  success,
  maxLength,
  showCount = false,
  className = '',
  ...props
}, ref) => {
  const textareaRef = useRef(null)
  const combinedRef = ref || textareaRef

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  }

  const stateClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
  }

  const state = error ? 'error' : success ? 'success' : 'default'

  // Auto-resize functionality
  useEffect(() => {
    if (autoResize && combinedRef.current) {
      const textarea = combinedRef.current
      textarea.style.height = 'auto'

      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
      const minHeight = minRows ? minRows * lineHeight : lineHeight * rows
      const maxHeight = maxRows ? maxRows * lineHeight : Infinity

      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`
    }
  }, [value, autoResize, minRows, maxRows, rows, combinedRef])

  const currentLength = typeof value === 'string' ? value.length : 0

  return (
    <div className={className}>
      <textarea
        ref={combinedRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={autoResize ? minRows || rows : rows}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        className={`
          block w-full rounded-md border shadow-sm
          px-3 py-2 text-sm
          focus:outline-none focus:ring-1
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${resizeClasses[autoResize ? 'none' : resize]}
          ${stateClasses[state]}
        `}
        {...props}
      />
      {(showCount || maxLength) && (
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${currentLength >= (maxLength || Infinity) ? 'text-red-500' : 'text-gray-500'}`}>
            {currentLength}{maxLength ? ` / ${maxLength}` : ''}
          </span>
        </div>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

// ============================================
// TEXTAREA FIELD
// ============================================

/**
 * Textarea with form field wrapper
 */
export function TextareaField({
  label,
  htmlFor,
  required,
  error,
  success,
  helpText,
  className = '',
  ...textareaProps
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Textarea
        id={htmlFor}
        error={error}
        success={success}
        {...textareaProps}
      />
      {helpText && !error && !success && (
        <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
          <HelpCircle className="h-3 w-3" />
          {helpText}
        </p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      {success && !error && (
        <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {success}
        </p>
      )}
    </div>
  )
}

// ============================================
// RICH TEXTAREA
// ============================================

/**
 * Textarea with formatting toolbar
 */
export function RichTextarea({
  value,
  onChange,
  placeholder,
  rows = 6,
  disabled = false,
  className = ''
}) {
  const textareaRef = useRef(null)

  const insertFormat = (before, after = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange({ target: { value: newText } })

    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        end + before.length
      )
    }, 0)
  }

  const toolbarButtons = [
    { label: 'Bold', action: () => insertFormat('**', '**'), icon: 'B' },
    { label: 'Italic', action: () => insertFormat('_', '_'), icon: 'I' },
    { label: 'Code', action: () => insertFormat('`', '`'), icon: '</>' },
    { label: 'Link', action: () => insertFormat('[', '](url)'), icon: '🔗' },
    { label: 'List', action: () => insertFormat('\n- '), icon: '•' },
    { label: 'Quote', action: () => insertFormat('\n> '), icon: '"' }
  ]

  return (
    <div className={`border border-gray-300 rounded-md overflow-hidden ${disabled ? 'opacity-50' : ''} ${className}`}>
      <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 border-b border-gray-300">
        {toolbarButtons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.action}
            disabled={disabled}
            title={btn.label}
            className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded disabled:cursor-not-allowed"
          >
            {btn.icon}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="block w-full px-3 py-2 text-sm resize-none border-0 focus:ring-0 focus:outline-none disabled:bg-gray-100"
      />
    </div>
  )
}

// ============================================
// CODE TEXTAREA
// ============================================

/**
 * Textarea for code input with line numbers
 */
export function CodeTextarea({
  value,
  onChange,
  language = 'text',
  rows = 10,
  showLineNumbers = true,
  disabled = false,
  className = ''
}) {
  const lines = (value || '').split('\n')

  return (
    <div className={`flex border border-gray-300 rounded-md overflow-hidden bg-gray-900 ${className}`}>
      {showLineNumbers && (
        <div className="flex-shrink-0 py-3 px-3 bg-gray-800 text-gray-500 text-sm font-mono select-none text-right">
          {lines.map((_, index) => (
            <div key={index} className="leading-5">
              {index + 1}
            </div>
          ))}
        </div>
      )}
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        spellCheck={false}
        className="flex-1 px-3 py-3 text-sm font-mono text-green-400 bg-gray-900 resize-none border-0 focus:ring-0 focus:outline-none leading-5 disabled:opacity-50"
        style={{ tabSize: 2 }}
      />
    </div>
  )
}

// ============================================
// MENTION TEXTAREA
// ============================================

/**
 * Textarea with @mention support
 */
export function MentionTextarea({
  value,
  onChange,
  users = [],
  placeholder,
  rows = 4,
  disabled = false,
  className = ''
}) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef(null)

  const handleChange = (e) => {
    const newValue = e.target.value
    const position = e.target.selectionStart
    setCursorPosition(position)

    // Check for @ trigger
    const textBeforeCursor = newValue.substring(0, position)
    const atMatch = textBeforeCursor.match(/@(\w*)$/)

    if (atMatch) {
      const query = atMatch[1].toLowerCase()
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query)
      )
      setSuggestions(filtered.slice(0, 5))
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }

    onChange(e)
  }

  const insertMention = (user) => {
    const textBeforeCursor = value.substring(0, cursorPosition)
    const atIndex = textBeforeCursor.lastIndexOf('@')
    const textAfterCursor = value.substring(cursorPosition)

    const newValue = textBeforeCursor.substring(0, atIndex) +
      `@${user.username || user.name} ` +
      textAfterCursor

    onChange({ target: { value: newValue } })
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  return (
    <div className={`relative ${className}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
      />
      {showSuggestions && (
        <div className="absolute z-10 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1">
          {suggestions.map((user) => (
            <button
              key={user.id || user.username}
              type="button"
              onClick={() => insertMention(user)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-6 w-6 rounded-full" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900">{user.name}</div>
                {user.username && (
                  <div className="text-xs text-gray-500">@{user.username}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// EXPANDABLE TEXTAREA
// ============================================

/**
 * Textarea that expands on focus
 */
export function ExpandableTextarea({
  value,
  onChange,
  placeholder = 'Write a comment...',
  collapsedRows = 1,
  expandedRows = 4,
  onSubmit,
  submitLabel = 'Submit',
  disabled = false,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = () => {
    onSubmit?.(value)
    setIsExpanded(false)
  }

  return (
    <div className={className}>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={isExpanded ? expandedRows : collapsedRows}
        disabled={disabled}
        onFocus={() => setIsExpanded(true)}
        className="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 resize-none transition-all"
      />
      {isExpanded && (
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value?.trim() || disabled}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitLabel}
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// TEXTAREA WITH PREVIEW
// ============================================

/**
 * Textarea with markdown preview
 */
export function TextareaWithPreview({
  value,
  onChange,
  placeholder,
  rows = 6,
  renderPreview,
  disabled = false,
  className = ''
}) {
  const [activeTab, setActiveTab] = useState('write')

  return (
    <div className={`border border-gray-300 rounded-md overflow-hidden ${className}`}>
      <div className="flex border-b border-gray-300">
        <button
          type="button"
          onClick={() => setActiveTab('write')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'write'
              ? 'text-blue-600 border-b-2 border-blue-600 -mb-px bg-white'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'preview'
              ? 'text-blue-600 border-b-2 border-blue-600 -mb-px bg-white'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Preview
        </button>
      </div>
      {activeTab === 'write' ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className="block w-full px-3 py-2 text-sm resize-none border-0 focus:ring-0 focus:outline-none disabled:bg-gray-100"
        />
      ) : (
        <div className="px-3 py-2 min-h-[150px] prose prose-sm max-w-none">
          {renderPreview ? (
            renderPreview(value)
          ) : (
            <div className="text-gray-600 whitespace-pre-wrap">{value || 'Nothing to preview'}</div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// TEXTAREA WITH TAGS
// ============================================

/**
 * Textarea with tag suggestions
 */
export function TextareaWithTags({
  value,
  onChange,
  tags = [],
  placeholder,
  rows = 4,
  disabled = false,
  className = ''
}) {
  const insertTag = (tag) => {
    const newValue = value + (value ? ' ' : '') + `#${tag}`
    onChange({ target: { value: newValue } })
  }

  return (
    <div className={className}>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="block w-full rounded-t-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 py-2 bg-gray-50 border border-t-0 border-gray-300 rounded-b-md">
          <span className="text-xs text-gray-500 mr-1">Tags:</span>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => insertTag(tag)}
              disabled={disabled}
              className="px-2 py-0.5 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100 disabled:cursor-not-allowed"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// BORDERED TEXTAREA
// ============================================

/**
 * Textarea with colored border variants
 */
export function BorderedTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  variant = 'default',
  disabled = false,
  className = ''
}) {
  const variantClasses = {
    default: 'border-gray-300 focus:border-blue-500',
    primary: 'border-blue-300 focus:border-blue-500 bg-blue-50',
    success: 'border-green-300 focus:border-green-500 bg-green-50',
    warning: 'border-yellow-300 focus:border-yellow-500 bg-yellow-50',
    danger: 'border-red-300 focus:border-red-500 bg-red-50'
  }

  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`
        block w-full rounded-md border-2 shadow-sm px-3 py-2 text-sm
        focus:outline-none focus:ring-0
        disabled:bg-gray-100 disabled:cursor-not-allowed resize-y
        ${variantClasses[variant]}
        ${className}
      `}
    />
  )
}

export default {
  Textarea,
  TextareaField,
  RichTextarea,
  CodeTextarea,
  MentionTextarea,
  ExpandableTextarea,
  TextareaWithPreview,
  TextareaWithTags,
  BorderedTextarea
}
