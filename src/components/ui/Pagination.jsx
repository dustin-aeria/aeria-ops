/**
 * Pagination Component
 * Page navigation controls
 *
 * @location src/components/ui/Pagination.jsx
 */

import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react'

// ============================================
// BASE PAGINATION
// ============================================

/**
 * Base pagination component
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  size = 'md',
  variant = 'default',
  className = ''
}) {
  const sizeClasses = {
    sm: { button: 'h-7 min-w-7 text-xs', icon: 'h-3 w-3' },
    md: { button: 'h-9 min-w-9 text-sm', icon: 'h-4 w-4' },
    lg: { button: 'h-11 min-w-11 text-base', icon: 'h-5 w-5' }
  }

  const config = sizeClasses[size] || sizeClasses.md

  // Generate page numbers
  const generatePages = () => {
    const pages = []
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    const showLeftDots = leftSiblingIndex > 2
    const showRightDots = rightSiblingIndex < totalPages - 1

    if (!showLeftDots && showRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      for (let i = 1; i <= Math.min(leftItemCount, totalPages); i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    } else if (showLeftDots && !showRightDots) {
      pages.push(1)
      pages.push('...')
      const rightItemCount = 3 + 2 * siblingCount
      for (let i = Math.max(totalPages - rightItemCount + 1, 1); i <= totalPages; i++) {
        pages.push(i)
      }
    } else if (showLeftDots && showRightDots) {
      pages.push(1)
      pages.push('...')
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    } else {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  const pages = generatePages()

  const getButtonClasses = (isActive = false, isDisabled = false) => {
    if (variant === 'outline') {
      return `
        ${config.button} px-3 rounded-md border transition-colors
        ${isActive ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
      `
    }

    return `
      ${config.button} px-3 rounded-md transition-colors
      ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}
      ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
    `
  }

  return (
    <nav className={`flex items-center gap-1 ${className}`} aria-label="Pagination">
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={getButtonClasses(false, currentPage === 1)}
          aria-label="Go to first page"
        >
          <ChevronsLeft className={config.icon} />
        </button>
      )}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={getButtonClasses(false, currentPage === 1)}
        aria-label="Go to previous page"
      >
        <ChevronLeft className={config.icon} />
      </button>

      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`dots-${index}`}
              className={`${config.button} px-2 flex items-center justify-center text-gray-400`}
            >
              <MoreHorizontal className={config.icon} />
            </span>
          )
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={getButtonClasses(page === currentPage)}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={getButtonClasses(false, currentPage === totalPages)}
        aria-label="Go to next page"
      >
        <ChevronRight className={config.icon} />
      </button>
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={getButtonClasses(false, currentPage === totalPages)}
          aria-label="Go to last page"
        >
          <ChevronsRight className={config.icon} />
        </button>
      )}
    </nav>
  )
}

// ============================================
// SIMPLE PAGINATION
// ============================================

/**
 * Simple prev/next pagination
 */
export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageInfo = true,
  size = 'md',
  className = ''
}) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          px-4 py-2 ${sizeClasses[size]} font-medium rounded-md
          border border-gray-300 text-gray-700
          hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
      >
        Previous
      </button>
      {showPageInfo && (
        <span className={`${sizeClasses[size]} text-gray-700`}>
          Page {currentPage} of {totalPages}
        </span>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          px-4 py-2 ${sizeClasses[size]} font-medium rounded-md
          border border-gray-300 text-gray-700
          hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
      >
        Next
      </button>
    </div>
  )
}

// ============================================
// PAGINATION WITH INFO
// ============================================

/**
 * Pagination with item count info
 */
export function PaginationWithInfo({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  size = 'md',
  className = ''
}) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <p className="text-sm text-gray-700">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </p>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        size={size}
      />
    </div>
  )
}

// ============================================
// PAGINATION WITH PAGE SIZE
// ============================================

/**
 * Pagination with page size selector
 */
export function PaginationWithPageSize({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  size = 'md',
  className = ''
}) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-sm text-gray-700">
            Show
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700">per page</span>
        </div>
        <span className="text-sm text-gray-500">
          {startItem}-{endItem} of {totalItems}
        </span>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        size={size}
      />
    </div>
  )
}

// ============================================
// COMPACT PAGINATION
// ============================================

/**
 * Compact pagination for small spaces
 */
export function CompactPagination({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm text-gray-600 min-w-[4rem] text-center">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

// ============================================
// PAGINATION WITH INPUT
// ============================================

/**
 * Pagination with page number input
 */
export function PaginationWithInput({
  currentPage,
  totalPages,
  onPageChange,
  size = 'md',
  className = ''
}) {
  const [inputValue, setInputValue] = React.useState(currentPage.toString())

  React.useEffect(() => {
    setInputValue(currentPage.toString())
  }, [currentPage])

  const handleSubmit = (e) => {
    e.preventDefault()
    const page = parseInt(inputValue, 10)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page)
    } else {
      setInputValue(currentPage.toString())
    }
  }

  const sizeClasses = {
    sm: { input: 'w-12 h-7 text-xs', text: 'text-xs' },
    md: { input: 'w-14 h-9 text-sm', text: 'text-sm' },
    lg: { input: 'w-16 h-11 text-base', text: 'text-base' }
  }

  const config = sizeClasses[size] || sizeClasses.md

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <span className={`${config.text} text-gray-700`}>Page</span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={`
            ${config.input} px-2 border border-gray-300 rounded-md text-center
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          `}
        />
        <span className={`${config.text} text-gray-700`}>of {totalPages}</span>
      </form>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

// ============================================
// LOAD MORE BUTTON
// ============================================

/**
 * Load more button for infinite scroll
 */
export function LoadMoreButton({
  onClick,
  loading = false,
  hasMore = true,
  loadingText = 'Loading...',
  loadMoreText = 'Load more',
  noMoreText = 'No more items',
  variant = 'default',
  className = ''
}) {
  if (!hasMore) {
    return (
      <p className={`text-center text-sm text-gray-500 py-4 ${className}`}>
        {noMoreText}
      </p>
    )
  }

  const variantClasses = {
    default: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        w-full py-3 px-4 rounded-md font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {loadingText}
        </span>
      ) : (
        loadMoreText
      )}
    </button>
  )
}

// ============================================
// CURSOR PAGINATION
// ============================================

/**
 * Cursor-based pagination (for API pagination)
 */
export function CursorPagination({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  loading = false,
  className = ''
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <button
        onClick={onPrevious}
        disabled={!hasPrevious || loading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>
      <button
        onClick={onNext}
        disabled={!hasNext || loading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

// ============================================
// MOBILE PAGINATION
// ============================================

/**
 * Mobile-friendly pagination
 */
export function MobilePagination({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex-1 py-3 px-6 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex-1 py-3 px-6 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (currentPage <= 3) {
            pageNum = i + 1
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = currentPage - 2 + i
          }

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`
                h-2 w-2 rounded-full transition-colors
                ${currentPage === pageNum ? 'bg-blue-600' : 'bg-gray-300'}
              `}
              aria-label={`Page ${pageNum}`}
            />
          )
        })}
      </div>
      <p className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </p>
    </div>
  )
}

// ============================================
// USE PAGINATION HOOK
// ============================================

/**
 * Hook for managing pagination state
 */
export function usePagination({
  totalItems,
  initialPage = 1,
  initialPageSize = 10
}) {
  const [currentPage, setCurrentPage] = React.useState(initialPage)
  const [pageSize, setPageSize] = React.useState(initialPageSize)

  const totalPages = Math.ceil(totalItems / pageSize)

  const goToPage = React.useCallback((page) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }, [totalPages])

  const nextPage = React.useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const previousPage = React.useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  const changePageSize = React.useCallback((newSize) => {
    setPageSize(newSize)
    setCurrentPage(1) // Reset to first page when page size changes
  }, [])

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  return {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages
  }
}

export default {
  Pagination,
  SimplePagination,
  PaginationWithInfo,
  PaginationWithPageSize,
  CompactPagination,
  PaginationWithInput,
  LoadMoreButton,
  CursorPagination,
  MobilePagination,
  usePagination
}
