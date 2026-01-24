/**
 * Checkbox and Radio Components
 * Form controls for selections
 *
 * @location src/components/ui/Checkbox.jsx
 */

import React, { forwardRef, createContext, useContext } from 'react'
import { Check, Minus } from 'lucide-react'

// ============================================
// BASE CHECKBOX
// ============================================

/**
 * Base checkbox component
 */
export const Checkbox = forwardRef(({
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  size = 'md',
  label,
  description,
  error,
  className = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  }

  const labelSizes = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  }

  const handleChange = (e) => {
    if (!disabled) {
      onChange?.(e.target.checked, e)
    }
  }

  // Set indeterminate property
  const inputRef = (el) => {
    if (el) {
      el.indeterminate = indeterminate
    }
    if (typeof ref === 'function') {
      ref(el)
    } else if (ref) {
      ref.current = el
    }
  }

  const checkbox = (
    <div className="relative inline-flex items-center">
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only peer"
        {...props}
      />
      <div
        className={`
          ${sizeClasses[size]}
          rounded border-2 transition-colors
          flex items-center justify-center
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${error ? 'border-red-500' : 'border-gray-300'}
          peer-checked:bg-blue-600 peer-checked:border-blue-600
          peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2
          ${indeterminate ? 'bg-blue-600 border-blue-600' : ''}
        `}
      >
        {(checked || indeterminate) && (
          indeterminate ? (
            <Minus className={`${iconSizes[size]} text-white`} strokeWidth={3} />
          ) : (
            <Check className={`${iconSizes[size]} text-white`} strokeWidth={3} />
          )
        )}
      </div>
    </div>
  )

  if (!label && !description) {
    return <div className={className}>{checkbox}</div>
  }

  return (
    <label className={`flex gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      {checkbox}
      <div className="flex-1">
        {label && (
          <span className={`block font-medium text-gray-900 ${labelSizes[size]}`}>
            {label}
          </span>
        )}
        {description && (
          <span className="block text-sm text-gray-500 mt-0.5">
            {description}
          </span>
        )}
        {error && (
          <span className="block text-sm text-red-600 mt-0.5">
            {error}
          </span>
        )}
      </div>
    </label>
  )
})

Checkbox.displayName = 'Checkbox'

// ============================================
// CHECKBOX GROUP
// ============================================

const CheckboxGroupContext = createContext(null)

/**
 * Checkbox group for multiple selections
 */
export function CheckboxGroup({
  value = [],
  onChange,
  name,
  children,
  orientation = 'vertical',
  className = ''
}) {
  const handleCheckboxChange = (itemValue, checked) => {
    if (checked) {
      onChange?.([...value, itemValue])
    } else {
      onChange?.(value.filter((v) => v !== itemValue))
    }
  }

  const isChecked = (itemValue) => value.includes(itemValue)

  return (
    <CheckboxGroupContext.Provider value={{ name, onChange: handleCheckboxChange, isChecked }}>
      <div
        className={`
          ${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3'}
          ${className}
        `}
        role="group"
      >
        {children}
      </div>
    </CheckboxGroupContext.Provider>
  )
}

/**
 * Checkbox item for use within CheckboxGroup
 */
export function CheckboxGroupItem({
  value,
  label,
  description,
  disabled = false,
  ...props
}) {
  const context = useContext(CheckboxGroupContext)

  if (!context) {
    throw new Error('CheckboxGroupItem must be used within CheckboxGroup')
  }

  const { name, onChange, isChecked } = context

  return (
    <Checkbox
      name={name}
      checked={isChecked(value)}
      onChange={(checked) => onChange(value, checked)}
      disabled={disabled}
      label={label}
      description={description}
      {...props}
    />
  )
}

// ============================================
// BASE RADIO
// ============================================

/**
 * Base radio button component
 */
export const Radio = forwardRef(({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  error,
  className = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5'
  }

  const labelSizes = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  }

  const handleChange = (e) => {
    if (!disabled) {
      onChange?.(e.target.value, e)
    }
  }

  const radio = (
    <div className="relative inline-flex items-center">
      <input
        ref={ref}
        type="radio"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only peer"
        {...props}
      />
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full border-2 transition-colors
          flex items-center justify-center
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${error ? 'border-red-500' : 'border-gray-300'}
          peer-checked:border-blue-600
          peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2
        `}
      >
        {checked && (
          <div className={`${dotSizes[size]} rounded-full bg-blue-600`} />
        )}
      </div>
    </div>
  )

  if (!label && !description) {
    return <div className={className}>{radio}</div>
  }

  return (
    <label className={`flex gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      {radio}
      <div className="flex-1">
        {label && (
          <span className={`block font-medium text-gray-900 ${labelSizes[size]}`}>
            {label}
          </span>
        )}
        {description && (
          <span className="block text-sm text-gray-500 mt-0.5">
            {description}
          </span>
        )}
        {error && (
          <span className="block text-sm text-red-600 mt-0.5">
            {error}
          </span>
        )}
      </div>
    </label>
  )
})

Radio.displayName = 'Radio'

// ============================================
// RADIO GROUP
// ============================================

const RadioGroupContext = createContext(null)

/**
 * Radio group for single selection
 */
export function RadioGroup({
  value,
  onChange,
  name,
  children,
  orientation = 'vertical',
  className = ''
}) {
  return (
    <RadioGroupContext.Provider value={{ name, value, onChange }}>
      <div
        className={`
          ${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3'}
          ${className}
        `}
        role="radiogroup"
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

/**
 * Radio item for use within RadioGroup
 */
export function RadioGroupItem({
  value,
  label,
  description,
  disabled = false,
  ...props
}) {
  const context = useContext(RadioGroupContext)

  if (!context) {
    throw new Error('RadioGroupItem must be used within RadioGroup')
  }

  const { name, value: groupValue, onChange } = context

  return (
    <Radio
      name={name}
      value={value}
      checked={groupValue === value}
      onChange={() => onChange?.(value)}
      disabled={disabled}
      label={label}
      description={description}
      {...props}
    />
  )
}

// ============================================
// SWITCH / TOGGLE
// ============================================

/**
 * Toggle switch component
 */
export const Switch = forwardRef(({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  labelPosition = 'right',
  className = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: { track: 'h-5 w-9', thumb: 'h-4 w-4', translate: 'translate-x-4' },
    md: { track: 'h-6 w-11', thumb: 'h-5 w-5', translate: 'translate-x-5' },
    lg: { track: 'h-7 w-14', thumb: 'h-6 w-6', translate: 'translate-x-7' }
  }

  const labelSizes = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  }

  const config = sizeClasses[size]

  const handleChange = () => {
    if (!disabled) {
      onChange?.(!checked)
    }
  }

  const toggle = (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={handleChange}
      disabled={disabled}
      className={`
        ${config.track}
        relative inline-flex items-center rounded-full transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${checked ? 'bg-blue-600' : 'bg-gray-200'}
      `}
      {...props}
    >
      <span
        className={`
          ${config.thumb}
          inline-block rounded-full bg-white shadow transform transition-transform
          ${checked ? config.translate : 'translate-x-0.5'}
        `}
      />
    </button>
  )

  if (!label && !description) {
    return <div className={className}>{toggle}</div>
  }

  return (
    <div className={`flex gap-3 ${labelPosition === 'left' ? 'flex-row-reverse justify-end' : ''} ${className}`}>
      {toggle}
      <div className="flex-1">
        {label && (
          <span
            className={`block font-medium text-gray-900 ${labelSizes[size]} ${disabled ? '' : 'cursor-pointer'}`}
            onClick={handleChange}
          >
            {label}
          </span>
        )}
        {description && (
          <span className="block text-sm text-gray-500 mt-0.5">
            {description}
          </span>
        )}
      </div>
    </div>
  )
})

Switch.displayName = 'Switch'

// ============================================
// CHECKBOX CARD
// ============================================

/**
 * Card-style checkbox
 */
export function CheckboxCard({
  checked,
  onChange,
  disabled = false,
  title,
  description,
  icon: Icon,
  className = ''
}) {
  return (
    <label
      className={`
        relative flex items-start p-4 rounded-lg border-2 transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${checked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
        ${className}
      `}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange?.(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <div className="flex items-start gap-3 flex-1">
        {Icon && (
          <div className={`flex-shrink-0 ${checked ? 'text-blue-600' : 'text-gray-400'}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div className="flex-1">
          <p className={`font-medium ${checked ? 'text-blue-900' : 'text-gray-900'}`}>
            {title}
          </p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
      <div
        className={`
          h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0
          ${checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}
        `}
      >
        {checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
      </div>
    </label>
  )
}

// ============================================
// RADIO CARD
// ============================================

/**
 * Card-style radio button
 */
export function RadioCard({
  checked,
  onChange,
  disabled = false,
  name,
  value,
  title,
  description,
  icon: Icon,
  className = ''
}) {
  return (
    <label
      className={`
        relative flex items-start p-4 rounded-lg border-2 transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${checked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
        ${className}
      `}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => !disabled && onChange?.(value)}
        disabled={disabled}
        className="sr-only"
      />
      <div className="flex items-start gap-3 flex-1">
        {Icon && (
          <div className={`flex-shrink-0 ${checked ? 'text-blue-600' : 'text-gray-400'}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div className="flex-1">
          <p className={`font-medium ${checked ? 'text-blue-900' : 'text-gray-900'}`}>
            {title}
          </p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
      <div
        className={`
          h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
          ${checked ? 'border-blue-600' : 'border-gray-300'}
        `}
      >
        {checked && <div className="h-2 w-2 rounded-full bg-blue-600" />}
      </div>
    </label>
  )
}

// ============================================
// RADIO CARD GROUP
// ============================================

/**
 * Group of radio cards
 */
export function RadioCardGroup({
  value,
  onChange,
  options,
  name,
  columns = 1,
  className = ''
}) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={`grid gap-4 ${columnClasses[columns]} ${className}`}>
      {options.map((option) => (
        <RadioCard
          key={option.value}
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={onChange}
          disabled={option.disabled}
          title={option.title || option.label}
          description={option.description}
          icon={option.icon}
        />
      ))}
    </div>
  )
}

// ============================================
// CHECKBOX FIELD
// ============================================

/**
 * Checkbox with form field wrapper
 */
export function CheckboxField({
  label,
  error,
  helpText,
  required,
  className = '',
  ...checkboxProps
}) {
  return (
    <div className={className}>
      <Checkbox {...checkboxProps} label={label} error={error} />
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500 ml-8">{helpText}</p>
      )}
    </div>
  )
}

// ============================================
// RADIO FIELD
// ============================================

/**
 * Radio group with form field wrapper
 */
export function RadioField({
  label,
  error,
  helpText,
  required,
  options,
  value,
  onChange,
  name,
  orientation = 'vertical',
  className = ''
}) {
  return (
    <fieldset className={className}>
      {label && (
        <legend className="text-sm font-medium text-gray-900 mb-3">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </legend>
      )}
      <RadioGroup
        value={value}
        onChange={onChange}
        name={name}
        orientation={orientation}
      >
        {options.map((option) => (
          <RadioGroupItem
            key={option.value}
            value={option.value}
            label={option.label}
            description={option.description}
            disabled={option.disabled}
          />
        ))}
      </RadioGroup>
      {helpText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </fieldset>
  )
}

export default {
  Checkbox,
  CheckboxGroup,
  CheckboxGroupItem,
  Radio,
  RadioGroup,
  RadioGroupItem,
  Switch,
  CheckboxCard,
  RadioCard,
  RadioCardGroup,
  CheckboxField,
  RadioField
}
