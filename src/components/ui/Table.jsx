/**
 * Table Component
 * Data tables with sorting, selection, and responsive features
 *
 * @location src/components/ui/Table.jsx
 */

import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, MoreVertical, Search } from 'lucide-react'

// ============================================
// BASE TABLE COMPONENTS
// ============================================

/**
 * Base table wrapper
 */
export function Table({
  children,
  striped = false,
  hoverable = true,
  bordered = false,
  compact = false,
  className = ''
}) {
  return (
    <div className={`overflow-x-auto ${bordered ? 'border border-gray-200 rounded-lg' : ''}`}>
      <table
        className={`
          min-w-full divide-y divide-gray-200
          ${striped ? '[&_tbody_tr:nth-child(odd)]:bg-gray-50' : ''}
          ${hoverable ? '[&_tbody_tr:hover]:bg-gray-50' : ''}
          ${compact ? '[&_th]:py-2 [&_td]:py-2' : ''}
          ${className}
        `}
      >
        {children}
      </table>
    </div>
  )
}

/**
 * Table head
 */
export function TableHead({ children, className = '' }) {
  return (
    <thead className={`bg-gray-50 ${className}`}>
      {children}
    </thead>
  )
}

/**
 * Table body
 */
export function TableBody({ children, className = '' }) {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  )
}

/**
 * Table row
 */
export function TableRow({
  children,
  selected = false,
  clickable = false,
  onClick,
  className = ''
}) {
  return (
    <tr
      onClick={onClick}
      className={`
        ${selected ? 'bg-blue-50' : ''}
        ${clickable || onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </tr>
  )
}

/**
 * Table header cell
 */
export function TableHeader({
  children,
  align = 'left',
  sortable = false,
  sortDirection,
  onSort,
  width,
  className = ''
}) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const handleClick = () => {
    if (sortable && onSort) {
      onSort()
    }
  }

  return (
    <th
      scope="col"
      onClick={handleClick}
      style={width ? { width } : undefined}
      className={`
        px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider
        ${alignClasses[align]}
        ${sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''}
        ${className}
      `}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : ''}`}>
        {children}
        {sortable && (
          <span className="flex-shrink-0">
            {sortDirection === 'asc' ? (
              <ChevronUp className="h-4 w-4" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-gray-300" />
            )}
          </span>
        )}
      </div>
    </th>
  )
}

/**
 * Table data cell
 */
export function TableCell({
  children,
  align = 'left',
  truncate = false,
  className = ''
}) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <td
      className={`
        px-4 py-3 text-sm text-gray-900
        ${alignClasses[align]}
        ${truncate ? 'truncate max-w-xs' : ''}
        ${className}
      `}
    >
      {children}
    </td>
  )
}

/**
 * Table footer
 */
export function TableFooter({ children, className = '' }) {
  return (
    <tfoot className={`bg-gray-50 ${className}`}>
      {children}
    </tfoot>
  )
}

// ============================================
// DATA TABLE (FULL FEATURED)
// ============================================

/**
 * Full-featured data table
 */
export function DataTable({
  columns,
  data,
  keyField = 'id',
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  sortable = true,
  defaultSort,
  onSort,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  rowActions,
  striped = false,
  compact = false,
  className = ''
}) {
  const [sortConfig, setSortConfig] = useState(defaultSort || { key: null, direction: null })
  const [actionMenuOpen, setActionMenuOpen] = useState(null)

  // Handle sorting
  const handleSort = (columnKey) => {
    let direction = 'asc'
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc'
    } else if (sortConfig.key === columnKey && sortConfig.direction === 'desc') {
      direction = null
    }

    const newConfig = { key: direction ? columnKey : null, direction }
    setSortConfig(newConfig)
    onSort?.(newConfig)
  }

  // Sort data if no external handler
  const sortedData = useMemo(() => {
    if (!sortConfig.key || onSort) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = aVal < bVal ? -1 : 1
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [data, sortConfig, onSort])

  // Handle selection
  const allSelected = data.length > 0 && selectedRows.length === data.length
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange?.([])
    } else {
      onSelectionChange?.(data.map((row) => row[keyField]))
    }
  }

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      onSelectionChange?.(selectedRows.filter((rowId) => rowId !== id))
    } else {
      onSelectionChange?.([...selectedRows, id])
    }
  }

  return (
    <Table
      striped={striped}
      hoverable={!!onRowClick}
      compact={compact}
      className={className}
    >
      <TableHead>
        <TableRow>
          {selectable && (
            <TableHeader width="40px">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected
                }}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </TableHeader>
          )}
          {columns.map((column) => (
            <TableHeader
              key={column.key}
              align={column.align}
              width={column.width}
              sortable={sortable && column.sortable !== false}
              sortDirection={sortConfig.key === column.key ? sortConfig.direction : null}
              onSort={() => handleSort(column.key)}
            >
              {column.header}
            </TableHeader>
          ))}
          {rowActions && <TableHeader width="50px" />}
        </TableRow>
      </TableHead>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell
              colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
              align="center"
              className="py-8"
            >
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                Loading...
              </div>
            </TableCell>
          </TableRow>
        ) : sortedData.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
              align="center"
              className="py-8 text-gray-500"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          sortedData.map((row) => {
            const rowId = row[keyField]
            const isSelected = selectedRows.includes(rowId)

            return (
              <TableRow
                key={rowId}
                selected={isSelected}
                clickable={!!onRowClick}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRow(rowId)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align} truncate={column.truncate}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </TableCell>
                ))}
                {rowActions && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === rowId ? null : rowId)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {actionMenuOpen === rowId && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                          {rowActions.map((action, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                action.onClick(row)
                                setActionMenuOpen(null)
                              }}
                              disabled={action.disabled?.(row)}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 disabled:opacity-50 ${
                                action.danger ? 'text-red-600' : 'text-gray-700'
                              }`}
                            >
                              {action.icon && <action.icon className="inline h-4 w-4 mr-2" />}
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}

// ============================================
// TABLE WITH SEARCH
// ============================================

/**
 * Data table with built-in search
 */
export function SearchableTable({
  columns,
  data,
  searchKeys,
  searchPlaceholder = 'Search...',
  ...tableProps
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data

    const term = searchTerm.toLowerCase()
    const keys = searchKeys || columns.map((c) => c.key)

    return data.filter((row) =>
      keys.some((key) => {
        const value = row[key]
        return value && String(value).toLowerCase().includes(term)
      })
    )
  }, [data, searchTerm, searchKeys, columns])

  return (
    <div>
      <div className="mb-4">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <DataTable columns={columns} data={filteredData} {...tableProps} />
    </div>
  )
}

// ============================================
// RESPONSIVE TABLE
// ============================================

/**
 * Table that stacks on mobile
 */
export function ResponsiveTable({
  columns,
  data,
  keyField = 'id',
  mobileBreakpoint = 'md',
  className = ''
}) {
  return (
    <div className={className}>
      {/* Desktop view */}
      <div className={`hidden ${mobileBreakpoint}:block`}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableHeader key={column.key} align={column.align}>
                  {column.header}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row[keyField]}>
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view - stacked cards */}
      <div className={`${mobileBreakpoint}:hidden space-y-4`}>
        {data.map((row) => (
          <div
            key={row[keyField]}
            className="bg-white rounded-lg border border-gray-200 p-4 space-y-2"
          >
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">
                  {column.header}
                </span>
                <span className="text-sm text-gray-900">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// SIMPLE TABLE
// ============================================

/**
 * Simple table from array data
 */
export function SimpleTable({
  headers,
  rows,
  striped = true,
  className = ''
}) {
  return (
    <Table striped={striped} className={className}>
      <TableHead>
        <TableRow>
          {headers.map((header, index) => (
            <TableHeader key={index}>{header}</TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <TableCell key={cellIndex}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ============================================
// KEY VALUE TABLE
// ============================================

/**
 * Two-column key-value table
 */
export function KeyValueTable({
  data,
  keyWidth = '40%',
  striped = true,
  className = ''
}) {
  return (
    <Table striped={striped} bordered className={className}>
      <TableBody>
        {Object.entries(data).map(([key, value]) => (
          <TableRow key={key}>
            <TableCell
              className="font-medium text-gray-700 bg-gray-50"
              style={{ width: keyWidth }}
            >
              {key}
            </TableCell>
            <TableCell>{value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ============================================
// TABLE PAGINATION
// ============================================

/**
 * Table pagination controls
 */
export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSize = true,
  className = ''
}) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className={`flex items-center justify-between px-4 py-3 border-t border-gray-200 ${className}`}>
      <div className="flex items-center gap-4">
        {showPageSize && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
        <span className="text-sm text-gray-700">
          {startItem}-{endItem} of {totalItems}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <div className="flex items-center gap-1">
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
                className={`w-8 h-8 text-sm rounded-md ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}

// ============================================
// EXPANDABLE TABLE ROW
// ============================================

/**
 * Table with expandable row details
 */
export function ExpandableTable({
  columns,
  data,
  keyField = 'id',
  renderExpanded,
  className = ''
}) {
  const [expandedRows, setExpandedRows] = useState([])

  const toggleRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    )
  }

  return (
    <Table className={className}>
      <TableHead>
        <TableRow>
          <TableHeader width="40px" />
          {columns.map((column) => (
            <TableHeader key={column.key} align={column.align}>
              {column.header}
            </TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row) => {
          const rowId = row[keyField]
          const isExpanded = expandedRows.includes(rowId)

          return (
            <React.Fragment key={rowId}>
              <TableRow>
                <TableCell>
                  <button
                    onClick={() => toggleRow(rowId)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
              {isExpanded && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="bg-gray-50 p-4"
                  >
                    {renderExpanded(row)}
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          )
        })}
      </TableBody>
    </Table>
  )
}

// ============================================
// VIRTUAL TABLE (for large datasets)
// ============================================

/**
 * Virtualized table for large datasets
 * Note: For very large datasets, consider using react-window
 */
export function VirtualTable({
  columns,
  data,
  keyField = 'id',
  rowHeight = 48,
  visibleRows = 10,
  className = ''
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerHeight = rowHeight * visibleRows
  const totalHeight = rowHeight * data.length

  const startIndex = Math.floor(scrollTop / rowHeight)
  const endIndex = Math.min(startIndex + visibleRows + 1, data.length)
  const visibleData = data.slice(startIndex, endIndex)
  const offsetY = startIndex * rowHeight

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop)
  }

  return (
    <div className={className}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableHeader key={column.key} align={column.align}>
                {column.header}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
      </Table>
      <div
        style={{ height: containerHeight, overflow: 'auto' }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            <Table>
              <TableBody>
                {visibleData.map((row) => (
                  <TableRow key={row[keyField]} style={{ height: rowHeight }}>
                    {columns.map((column) => (
                      <TableCell key={column.key} align={column.align}>
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// CHECKBOX COLUMN HELPER
// ============================================

/**
 * Create a checkbox column configuration
 */
export function createCheckboxColumn(keyField = 'id') {
  return {
    key: '_checkbox',
    header: '',
    width: '40px',
    render: (_, row, { selectedRows, onSelectRow }) => (
      <input
        type="checkbox"
        checked={selectedRows.includes(row[keyField])}
        onChange={() => onSelectRow(row[keyField])}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    )
  }
}

export default {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableFooter,
  DataTable,
  SearchableTable,
  ResponsiveTable,
  SimpleTable,
  KeyValueTable,
  TablePagination,
  ExpandableTable,
  VirtualTable,
  createCheckboxColumn
}
