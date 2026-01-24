/**
 * Rating Component
 * Star ratings and review inputs
 *
 * @location src/components/ui/Rating.jsx
 */

import React, { useState } from 'react'
import { Star, Heart, ThumbsUp, Smile, Frown, Meh } from 'lucide-react'

// ============================================
// BASE STAR RATING
// ============================================

/**
 * Star rating component
 */
export function StarRating({
  value = 0,
  onChange,
  max = 5,
  size = 'md',
  color = 'yellow',
  readOnly = false,
  showValue = false,
  precision = 1,
  className = ''
}) {
  const [hoverValue, setHoverValue] = useState(0)

  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  }

  const colorClasses = {
    yellow: { filled: 'text-yellow-400', empty: 'text-gray-300' },
    orange: { filled: 'text-orange-400', empty: 'text-gray-300' },
    red: { filled: 'text-red-500', empty: 'text-gray-300' },
    blue: { filled: 'text-blue-500', empty: 'text-gray-300' },
    green: { filled: 'text-green-500', empty: 'text-gray-300' }
  }

  const colors = colorClasses[color] || colorClasses.yellow
  const displayValue = hoverValue || value

  const handleClick = (newValue) => {
    if (!readOnly && onChange) {
      onChange(newValue)
    }
  }

  const handleMouseEnter = (newValue) => {
    if (!readOnly) {
      setHoverValue(newValue)
    }
  }

  const handleMouseLeave = () => {
    setHoverValue(0)
  }

  const renderStar = (index) => {
    const starValue = index + 1
    const fillPercentage = Math.min(Math.max((displayValue - index) * 100, 0), 100)
    const isFilled = fillPercentage >= 100
    const isPartial = fillPercentage > 0 && fillPercentage < 100

    if (precision === 0.5) {
      // Half-star support
      return (
        <div key={index} className="relative">
          <Star className={`${sizeClasses[size]} ${colors.empty}`} />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${fillPercentage}%` }}
          >
            <Star className={`${sizeClasses[size]} ${colors.filled} fill-current`} />
          </div>
          {!readOnly && (
            <>
              <button
                type="button"
                onClick={() => handleClick(index + 0.5)}
                onMouseEnter={() => handleMouseEnter(index + 0.5)}
                className="absolute inset-y-0 left-0 w-1/2"
              />
              <button
                type="button"
                onClick={() => handleClick(starValue)}
                onMouseEnter={() => handleMouseEnter(starValue)}
                className="absolute inset-y-0 right-0 w-1/2"
              />
            </>
          )}
        </div>
      )
    }

    return (
      <button
        key={index}
        type="button"
        onClick={() => handleClick(starValue)}
        onMouseEnter={() => handleMouseEnter(starValue)}
        disabled={readOnly}
        className={`${readOnly ? '' : 'cursor-pointer'}`}
      >
        <Star
          className={`
            ${sizeClasses[size]}
            ${isFilled ? `${colors.filled} fill-current` : colors.empty}
            transition-colors
          `}
        />
      </button>
    )
  }

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: max }, (_, i) => renderStar(i))}
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">
          {value.toFixed(precision === 0.5 ? 1 : 0)}
        </span>
      )}
    </div>
  )
}

// ============================================
// RATING WITH LABEL
// ============================================

/**
 * Rating with descriptive label
 */
export function RatingWithLabel({
  value = 0,
  onChange,
  max = 5,
  labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
  size = 'md',
  readOnly = false,
  className = ''
}) {
  const [hoverValue, setHoverValue] = useState(0)
  const displayValue = hoverValue || value
  const label = labels[Math.ceil(displayValue) - 1] || ''

  return (
    <div className={className}>
      <StarRating
        value={value}
        onChange={(v) => {
          onChange?.(v)
          setHoverValue(0)
        }}
        max={max}
        size={size}
        readOnly={readOnly}
      />
      {label && (
        <p className="mt-1 text-sm text-gray-600">{label}</p>
      )}
    </div>
  )
}

// ============================================
// HEART RATING
// ============================================

/**
 * Heart-based rating
 */
export function HeartRating({
  value = 0,
  onChange,
  max = 5,
  size = 'md',
  readOnly = false,
  className = ''
}) {
  const [hoverValue, setHoverValue] = useState(0)

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  }

  const displayValue = hoverValue || value

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      onMouseLeave={() => setHoverValue(0)}
    >
      {Array.from({ length: max }, (_, i) => {
        const isFilled = i < displayValue

        return (
          <button
            key={i}
            type="button"
            onClick={() => !readOnly && onChange?.(i + 1)}
            onMouseEnter={() => !readOnly && setHoverValue(i + 1)}
            disabled={readOnly}
            className={readOnly ? '' : 'cursor-pointer'}
          >
            <Heart
              className={`
                ${sizeClasses[size]}
                ${isFilled ? 'text-red-500 fill-current' : 'text-gray-300'}
                transition-colors
              `}
            />
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// EMOJI RATING
// ============================================

/**
 * Emoji-based rating (satisfaction)
 */
export function EmojiRating({
  value,
  onChange,
  size = 'md',
  readOnly = false,
  className = ''
}) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  }

  const emojis = [
    { value: 1, icon: Frown, label: 'Poor', color: 'text-red-500' },
    { value: 2, icon: Meh, label: 'Okay', color: 'text-yellow-500' },
    { value: 3, icon: Smile, label: 'Good', color: 'text-green-500' }
  ]

  return (
    <div className={`inline-flex items-center gap-4 ${className}`}>
      {emojis.map((emoji) => {
        const Icon = emoji.icon
        const isSelected = value === emoji.value

        return (
          <button
            key={emoji.value}
            type="button"
            onClick={() => !readOnly && onChange?.(emoji.value)}
            disabled={readOnly}
            className={`
              flex flex-col items-center gap-1
              ${readOnly ? '' : 'cursor-pointer'}
              ${isSelected ? '' : 'opacity-40 hover:opacity-70'}
              transition-opacity
            `}
          >
            <Icon className={`${sizeClasses[size]} ${emoji.color}`} />
            <span className="text-xs text-gray-600">{emoji.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// THUMBS RATING
// ============================================

/**
 * Thumbs up/down rating
 */
export function ThumbsRating({
  value,
  onChange,
  size = 'md',
  readOnly = false,
  showCounts = false,
  upCount = 0,
  downCount = 0,
  className = ''
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  }

  const buttonClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
    xl: 'p-3'
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => !readOnly && onChange?.('up')}
        disabled={readOnly}
        className={`
          ${buttonClasses[size]} rounded-full transition-colors
          ${value === 'up' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
          ${readOnly ? '' : 'cursor-pointer'}
        `}
      >
        <ThumbsUp className={sizeClasses[size]} />
      </button>
      {showCounts && (
        <span className="text-sm text-gray-600">{upCount}</span>
      )}
      <button
        type="button"
        onClick={() => !readOnly && onChange?.('down')}
        disabled={readOnly}
        className={`
          ${buttonClasses[size]} rounded-full transition-colors
          ${value === 'down' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
          ${readOnly ? '' : 'cursor-pointer'}
        `}
      >
        <ThumbsUp className={`${sizeClasses[size]} rotate-180`} />
      </button>
      {showCounts && (
        <span className="text-sm text-gray-600">{downCount}</span>
      )}
    </div>
  )
}

// ============================================
// RATING DISPLAY
// ============================================

/**
 * Display-only rating with count
 */
export function RatingDisplay({
  value,
  max = 5,
  count,
  size = 'md',
  className = ''
}) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <StarRating value={value} max={max} size={size} readOnly />
      <span className="text-sm font-medium text-gray-900">
        {value.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-sm text-gray-500">
          ({count.toLocaleString()} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  )
}

// ============================================
// RATING BREAKDOWN
// ============================================

/**
 * Rating breakdown by star level
 */
export function RatingBreakdown({
  ratings = {},
  total,
  average,
  showPercentage = true,
  className = ''
}) {
  const levels = [5, 4, 3, 2, 1]
  const totalCount = total || Object.values(ratings).reduce((sum, count) => sum + count, 0)

  return (
    <div className={className}>
      {average !== undefined && (
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl font-bold text-gray-900">{average.toFixed(1)}</span>
          <div>
            <StarRating value={average} readOnly size="md" />
            <p className="text-sm text-gray-500 mt-1">
              {totalCount.toLocaleString()} {totalCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {levels.map((level) => {
          const count = ratings[level] || 0
          const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0

          return (
            <div key={level} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-6">{level}</span>
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {showPercentage && (
                <span className="text-sm text-gray-500 w-12 text-right">
                  {Math.round(percentage)}%
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// RATING INPUT FIELD
// ============================================

/**
 * Rating with form field wrapper
 */
export function RatingField({
  label,
  value,
  onChange,
  max = 5,
  required,
  error,
  helpText,
  className = ''
}) {
  return (
    <fieldset className={className}>
      {label && (
        <legend className="text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </legend>
      )}
      <StarRating value={value} onChange={onChange} max={max} />
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </fieldset>
  )
}

// ============================================
// NUMBER RATING
// ============================================

/**
 * Number-based rating (1-10)
 */
export function NumberRating({
  value,
  onChange,
  min = 1,
  max = 10,
  size = 'md',
  readOnly = false,
  className = ''
}) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  }

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {Array.from({ length: max - min + 1 }, (_, i) => {
        const num = min + i
        const isSelected = num === value

        return (
          <button
            key={num}
            type="button"
            onClick={() => !readOnly && onChange?.(num)}
            disabled={readOnly}
            className={`
              ${sizeClasses[size]} rounded-full font-medium transition-colors
              ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              ${readOnly ? '' : 'cursor-pointer'}
            `}
          >
            {num}
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// SCALE RATING (NPS STYLE)
// ============================================

/**
 * NPS-style scale rating (0-10)
 */
export function ScaleRating({
  value,
  onChange,
  min = 0,
  max = 10,
  lowLabel = 'Not likely',
  highLabel = 'Very likely',
  readOnly = false,
  className = ''
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        {Array.from({ length: max - min + 1 }, (_, i) => {
          const num = min + i
          const isSelected = num === value

          // NPS colors
          let bgColor = 'bg-gray-100 hover:bg-gray-200'
          if (isSelected) {
            if (num <= 6) bgColor = 'bg-red-500 text-white'
            else if (num <= 8) bgColor = 'bg-yellow-500 text-white'
            else bgColor = 'bg-green-500 text-white'
          }

          return (
            <button
              key={num}
              type="button"
              onClick={() => !readOnly && onChange?.(num)}
              disabled={readOnly}
              className={`
                h-10 w-10 rounded font-medium transition-colors
                ${bgColor}
                ${readOnly ? '' : 'cursor-pointer'}
              `}
            >
              {num}
            </button>
          )
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500">{lowLabel}</span>
        <span className="text-xs text-gray-500">{highLabel}</span>
      </div>
    </div>
  )
}

// ============================================
// REVIEW CARD
// ============================================

/**
 * Review card with rating
 */
export function ReviewCard({
  rating,
  title,
  content,
  author,
  date,
  avatar,
  helpful = 0,
  onHelpful,
  verified = false,
  className = ''
}) {
  return (
    <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={author} className="h-10 w-10 rounded-full" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {author?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{author}</span>
              {verified && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{date}</p>
          </div>
        </div>
        <StarRating value={rating} readOnly size="sm" />
      </div>
      {title && (
        <h4 className="font-medium text-gray-900 mt-3">{title}</h4>
      )}
      {content && (
        <p className="text-sm text-gray-600 mt-2">{content}</p>
      )}
      {onHelpful && (
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={onHelpful}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Helpful ({helpful})
          </button>
        </div>
      )}
    </div>
  )
}

export default {
  StarRating,
  RatingWithLabel,
  HeartRating,
  EmojiRating,
  ThumbsRating,
  RatingDisplay,
  RatingBreakdown,
  RatingField,
  NumberRating,
  ScaleRating,
  ReviewCard
}
