/**
 * LoadingSpinner.jsx
 * Reusable loading spinner component
 *
 * @location src/components/LoadingSpinner.jsx
 */

import PropTypes from 'prop-types'

export default function LoadingSpinner({
  size = 'md',
  message = null,
  fullScreen = false,
  className = ''
}) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
  }

  const spinner = (
    <div
      className={`${sizeClasses[size]} border-aeria-navy border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  )

  if (fullScreen) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center">
          {spinner}
          {message && <p className="text-gray-600 mt-4">{message}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        {spinner}
        {message && <p className="text-gray-500 mt-2 text-sm">{message}</p>}
      </div>
    </div>
  )
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  className: PropTypes.string
}
