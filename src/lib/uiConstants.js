/**
 * UI Constants & Theme
 * Centralized UI configuration for consistency
 *
 * @location src/lib/uiConstants.js
 */

// ============================================
// STATUS COLORS
// ============================================

export const STATUS_COLORS = {
  // Generic statuses
  active: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500', dot: 'bg-green-500' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-500', dot: 'bg-gray-500' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-500', dot: 'bg-yellow-500' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500', dot: 'bg-green-500' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-500', dot: 'bg-gray-500' },
  archived: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-400', dot: 'bg-gray-400' },

  // Project statuses
  planning: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-500', dot: 'bg-purple-500' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500', dot: 'bg-blue-500' },
  on_hold: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-500', dot: 'bg-orange-500' },

  // Incident severity
  low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500', dot: 'bg-green-500' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-500', dot: 'bg-yellow-500' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-500', dot: 'bg-orange-500' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500', dot: 'bg-red-500' },

  // Equipment statuses
  available: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500', dot: 'bg-green-500' },
  in_use: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500', dot: 'bg-blue-500' },
  maintenance: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-500', dot: 'bg-orange-500' },
  out_of_service: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500', dot: 'bg-red-500' },

  // Compliance statuses
  compliant: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500', dot: 'bg-green-500' },
  non_compliant: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500', dot: 'bg-red-500' },
  due_soon: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-500', dot: 'bg-yellow-500' },
  overdue: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500', dot: 'bg-red-500' }
}

// ============================================
// BUTTON VARIANTS
// ============================================

export const BUTTON_VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  link: 'bg-transparent hover:underline text-blue-600',
  outline: 'bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700',
  'outline-primary': 'bg-transparent border border-blue-600 hover:bg-blue-50 text-blue-600',
  'outline-danger': 'bg-transparent border border-red-600 hover:bg-red-50 text-red-600'
}

export const BUTTON_SIZES = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
  xl: 'px-6 py-3 text-lg'
}

// ============================================
// BADGE VARIANTS
// ============================================

export const BADGE_VARIANTS = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-cyan-100 text-cyan-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  pink: 'bg-pink-100 text-pink-700'
}

export const BADGE_SIZES = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-xs',
  lg: 'px-2.5 py-1 text-sm'
}

// ============================================
// INPUT STYLES
// ============================================

export const INPUT_BASE = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'

export const INPUT_SIZES = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base'
}

export const INPUT_STATES = {
  default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
  disabled: 'bg-gray-100 cursor-not-allowed text-gray-500'
}

// ============================================
// CARD STYLES
// ============================================

export const CARD_BASE = 'bg-white rounded-lg shadow'

export const CARD_VARIANTS = {
  default: 'bg-white border border-gray-200',
  elevated: 'bg-white shadow-md',
  bordered: 'bg-white border-2 border-gray-200',
  flat: 'bg-gray-50 border border-gray-100'
}

export const CARD_PADDING = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
}

// ============================================
// LAYOUT CONSTANTS
// ============================================

export const SPACING = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem'  // 64px
}

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}

export const CONTAINER_WIDTHS = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full'
}

// ============================================
// AVATAR SIZES
// ============================================

export const AVATAR_SIZES = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
  '2xl': 'h-20 w-20 text-2xl'
}

// ============================================
// MODAL SIZES
// ============================================

export const MODAL_SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-full mx-4'
}

// ============================================
// TABLE STYLES
// ============================================

export const TABLE_STYLES = {
  header: 'bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  row: 'border-b border-gray-200 hover:bg-gray-50',
  cell: 'px-6 py-4 whitespace-nowrap text-sm',
  cellCompact: 'px-4 py-2 whitespace-nowrap text-sm',
  sortable: 'cursor-pointer hover:bg-gray-100 select-none'
}

// ============================================
// ALERT VARIANTS
// ============================================

export const ALERT_VARIANTS = {
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    message: 'text-blue-700'
  },
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-500',
    title: 'text-green-800',
    message: 'text-green-700'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-500',
    title: 'text-yellow-800',
    message: 'text-yellow-700'
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    message: 'text-red-700'
  }
}

// ============================================
// ICON SIZES
// ============================================

export const ICON_SIZES = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  '2xl': 'h-10 w-10'
}

// ============================================
// ANIMATION CLASSES
// ============================================

export const ANIMATIONS = {
  fadeIn: 'animate-fadeIn',
  fadeOut: 'animate-fadeOut',
  slideIn: 'animate-slideIn',
  slideOut: 'animate-slideOut',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce'
}

export const TRANSITIONS = {
  fast: 'transition-all duration-150 ease-in-out',
  normal: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
  colors: 'transition-colors duration-200 ease-in-out',
  opacity: 'transition-opacity duration-200 ease-in-out',
  transform: 'transition-transform duration-200 ease-in-out'
}

// ============================================
// Z-INDEX LAYERS
// ============================================

export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get status color classes
 */
export function getStatusColor(status) {
  return STATUS_COLORS[status] || STATUS_COLORS.inactive
}

/**
 * Get button classes
 */
export function getButtonClasses(variant = 'primary', size = 'md') {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  return `${baseClasses} ${BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary} ${BUTTON_SIZES[size] || BUTTON_SIZES.md}`
}

/**
 * Get badge classes
 */
export function getBadgeClasses(variant = 'default', size = 'md') {
  const baseClasses = 'inline-flex items-center font-medium rounded-full'
  return `${baseClasses} ${BADGE_VARIANTS[variant] || BADGE_VARIANTS.default} ${BADGE_SIZES[size] || BADGE_SIZES.md}`
}

/**
 * Get input classes
 */
export function getInputClasses(size = 'md', state = 'default') {
  return `${INPUT_BASE} ${INPUT_SIZES[size] || INPUT_SIZES.md} ${INPUT_STATES[state] || INPUT_STATES.default}`
}

/**
 * Get card classes
 */
export function getCardClasses(variant = 'default', padding = 'md') {
  return `${CARD_VARIANTS[variant] || CARD_VARIANTS.default} ${CARD_PADDING[padding] || CARD_PADDING.md} rounded-lg`
}

/**
 * Get avatar classes
 */
export function getAvatarClasses(size = 'md') {
  return `${AVATAR_SIZES[size] || AVATAR_SIZES.md} rounded-full overflow-hidden`
}

/**
 * Get icon size classes
 */
export function getIconClasses(size = 'md') {
  return ICON_SIZES[size] || ICON_SIZES.md
}

/**
 * Combine class names (filter falsy values)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default {
  STATUS_COLORS,
  BUTTON_VARIANTS,
  BUTTON_SIZES,
  BADGE_VARIANTS,
  BADGE_SIZES,
  INPUT_BASE,
  INPUT_SIZES,
  INPUT_STATES,
  CARD_VARIANTS,
  CARD_PADDING,
  SPACING,
  BREAKPOINTS,
  CONTAINER_WIDTHS,
  AVATAR_SIZES,
  MODAL_SIZES,
  TABLE_STYLES,
  ALERT_VARIANTS,
  ICON_SIZES,
  ANIMATIONS,
  TRANSITIONS,
  Z_INDEX,
  getStatusColor,
  getButtonClasses,
  getBadgeClasses,
  getInputClasses,
  getCardClasses,
  getAvatarClasses,
  getIconClasses,
  cn
}
