import React, { useState, useRef, forwardRef, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Plus, Minus, ChevronUp, ChevronDown } from 'lucide-react';

/**
 * Batch 112: NumberInput Component
 *
 * Numeric input components with controls.
 *
 * Exports:
 * - NumberInput: Basic number input with steppers
 * - NumberInputWithButtons: Number input with +/- buttons
 * - NumberInputCompact: Compact number stepper
 * - CurrencyInput: Currency formatted input
 * - PercentageInput: Percentage input
 * - QuantityInput: Quantity selector
 * - PriceInput: Price input with currency
 * - PhoneInput: Phone number input
 * - PinInput: PIN code input
 */

// ============================================================================
// NUMBER INPUT - Basic number input with steppers
// ============================================================================
export const NumberInput = forwardRef(function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  precision,
  placeholder = '0',
  size = 'md',
  variant = 'default',
  disabled = false,
  readOnly = false,
  showStepper = true,
  allowNegative = true,
  allowDecimal = true,
  className,
  ...props
}, ref) {
  const inputRef = useRef(null);
  const combinedRef = ref || inputRef;

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
    filled: 'bg-gray-100 dark:bg-gray-800 border-0 focus-within:ring-2 focus-within:ring-blue-500',
    underlined: 'bg-transparent border-0 border-b-2 border-gray-200 dark:border-gray-700 rounded-none focus-within:border-blue-500',
  };

  const clampValue = useCallback((val) => {
    let result = val;
    if (min !== undefined && result < min) result = min;
    if (max !== undefined && result > max) result = max;
    if (precision !== undefined) {
      result = Number(result.toFixed(precision));
    }
    return result;
  }, [min, max, precision]);

  const handleChange = (e) => {
    const inputValue = e.target.value;

    // Allow empty input
    if (inputValue === '' || inputValue === '-') {
      onChange?.(inputValue);
      return;
    }

    // Validate input
    let regex = allowNegative ? /^-?/ : /^/;
    regex = allowDecimal
      ? new RegExp(regex.source + '\\d*\\.?\\d*$')
      : new RegExp(regex.source + '\\d*$');

    if (regex.test(inputValue)) {
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue)) {
        onChange?.(clampValue(numValue));
      } else {
        onChange?.(inputValue);
      }
    }
  };

  const handleStep = (direction) => {
    const currentValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    const newValue = direction === 'up' ? currentValue + step : currentValue - step;
    onChange?.(clampValue(newValue));
    combinedRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleStep('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleStep('down');
    }
  };

  const handleBlur = () => {
    if (typeof value === 'string' && value !== '' && value !== '-') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onChange?.(clampValue(numValue));
      }
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-center rounded-lg overflow-hidden',
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <input
        ref={combinedRef}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={cn(
          'flex-1 w-full bg-transparent border-0 outline-none text-center',
          showStepper ? 'px-8' : 'px-3',
          disabled && 'cursor-not-allowed'
        )}
        {...props}
      />

      {showStepper && !readOnly && !disabled && (
        <>
          <button
            type="button"
            onClick={() => handleStep('down')}
            disabled={min !== undefined && value <= min}
            className="absolute left-0 top-0 bottom-0 px-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleStep('up')}
            disabled={max !== undefined && value >= max}
            className="absolute right-0 top-0 bottom-0 px-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
});

// ============================================================================
// NUMBER INPUT WITH BUTTONS - Number input with +/- buttons
// ============================================================================
export function NumberInputWithButtons({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  size = 'md',
  disabled = false,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: { button: 'w-8 h-8', input: 'w-12 h-8 text-sm' },
    md: { button: 'w-10 h-10', input: 'w-16 h-10 text-sm' },
    lg: { button: 'w-12 h-12', input: 'w-20 h-12 text-base' },
  };

  const handleStep = (direction) => {
    const currentValue = typeof value === 'number' ? value : 0;
    let newValue = direction === 'up' ? currentValue + step : currentValue - step;
    if (min !== undefined && newValue < min) newValue = min;
    if (max !== undefined && newValue > max) newValue = max;
    onChange?.(newValue);
  };

  return (
    <div className={cn('flex flex-col gap-1', className)} {...props}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleStep('down')}
          disabled={disabled || (min !== undefined && value <= min)}
          className={cn(
            'flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
            sizeClasses[size].button
          )}
        >
          <Minus className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={value}
          onChange={(e) => {
            const num = parseInt(e.target.value, 10);
            if (!isNaN(num)) onChange?.(num);
          }}
          disabled={disabled}
          className={cn(
            'text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none',
            sizeClasses[size].input,
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />

        <button
          type="button"
          onClick={() => handleStep('up')}
          disabled={disabled || (max !== undefined && value >= max)}
          className={cn(
            'flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
            sizeClasses[size].button
          )}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// NUMBER INPUT COMPACT - Compact number stepper
// ============================================================================
export function NumberInputCompact({
  value,
  onChange,
  min,
  max,
  step = 1,
  size = 'md',
  disabled = false,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'w-16 h-8 text-sm',
    md: 'w-20 h-10 text-sm',
    lg: 'w-24 h-12 text-base',
  };

  const handleStep = (direction) => {
    const currentValue = typeof value === 'number' ? value : 0;
    let newValue = direction === 'up' ? currentValue + step : currentValue - step;
    if (min !== undefined && newValue < min) newValue = min;
    if (max !== undefined && newValue > max) newValue = max;
    onChange?.(newValue);
  };

  return (
    <div
      className={cn(
        'relative flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
        sizeClasses[size],
        disabled && 'opacity-50',
        className
      )}
      {...props}
    >
      <span className="flex-1 text-center font-medium text-gray-900 dark:text-white">
        {value}
      </span>

      <div className="absolute right-0 top-0 bottom-0 flex flex-col border-l border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => handleStep('up')}
          disabled={disabled || (max !== undefined && value >= max)}
          className="flex-1 px-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => handleStep('down')}
          disabled={disabled || (min !== undefined && value <= min)}
          className="flex-1 px-1 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// CURRENCY INPUT - Currency formatted input
// ============================================================================
export function CurrencyInput({
  value,
  onChange,
  currency = 'USD',
  locale = 'en-US',
  min,
  max,
  placeholder = '0.00',
  size = 'md',
  disabled = false,
  className,
  ...props
}) {
  const [displayValue, setDisplayValue] = useState(
    value ? formatCurrency(value, currency, locale) : ''
  );

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  };

  function formatCurrency(val, curr, loc) {
    return new Intl.NumberFormat(loc, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  }

  const handleChange = (e) => {
    const inputValue = e.target.value.replace(/[^0-9.]/g, '');
    setDisplayValue(inputValue);

    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      let clampedValue = numValue;
      if (min !== undefined && clampedValue < min) clampedValue = min;
      if (max !== undefined && clampedValue > max) clampedValue = max;
      onChange?.(clampedValue);
    }
  };

  const handleBlur = () => {
    if (displayValue) {
      const numValue = parseFloat(displayValue);
      if (!isNaN(numValue)) {
        setDisplayValue(formatCurrency(numValue, currency, locale));
      }
    }
  };

  const handleFocus = () => {
    if (value) {
      setDisplayValue(value.toString());
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
        sizeClasses[size],
        disabled && 'opacity-50',
        className
      )}
      {...props}
    >
      <span className="pl-3 text-gray-500 dark:text-gray-400">
        {currencySymbols[currency] || currency}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 w-full px-2 bg-transparent border-0 outline-none text-right"
      />
    </div>
  );
}

// ============================================================================
// PERCENTAGE INPUT - Percentage input
// ============================================================================
export function PercentageInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  precision = 0,
  size = 'md',
  disabled = false,
  showSlider = false,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  const handleChange = (e) => {
    const inputValue = e.target.value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(inputValue);

    if (!isNaN(numValue)) {
      let clampedValue = numValue;
      if (clampedValue < min) clampedValue = min;
      if (clampedValue > max) clampedValue = max;
      onChange?.(Number(clampedValue.toFixed(precision)));
    } else if (inputValue === '') {
      onChange?.(0);
    }
  };

  return (
    <div className={cn('space-y-2', className)} {...props}>
      <div
        className={cn(
          'relative flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
          sizeClasses[size],
          disabled && 'opacity-50'
        )}
      >
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="flex-1 w-full px-3 bg-transparent border-0 outline-none text-right"
        />
        <span className="pr-3 text-gray-500 dark:text-gray-400">%</span>
      </div>

      {showSlider && (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange?.(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      )}
    </div>
  );
}

// ============================================================================
// QUANTITY INPUT - Quantity selector
// ============================================================================
export function QuantityInput({
  value,
  onChange,
  min = 0,
  max,
  label,
  size = 'md',
  disabled = false,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: { container: 'h-8', button: 'w-8', text: 'text-sm' },
    md: { container: 'h-10', button: 'w-10', text: 'text-base' },
    lg: { container: 'h-12', button: 'w-12', text: 'text-lg' },
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange?.(value - 1);
    }
  };

  const handleIncrement = () => {
    if (max === undefined || value < max) {
      onChange?.(value + 1);
    }
  };

  return (
    <div className={cn('flex flex-col gap-1', className)} {...props}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div
        className={cn(
          'inline-flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
          sizeClasses[size].container,
          disabled && 'opacity-50'
        )}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={cn(
            'flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
            sizeClasses[size].button,
            sizeClasses[size].container
          )}
        >
          <Minus className="w-4 h-4" />
        </button>

        <span
          className={cn(
            'flex-1 min-w-[3rem] text-center font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-900',
            sizeClasses[size].text
          )}
        >
          {value}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && value >= max)}
          className={cn(
            'flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
            sizeClasses[size].button,
            sizeClasses[size].container
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// PRICE INPUT - Price input with currency
// ============================================================================
export function PriceInput({
  value,
  onChange,
  currencies = ['USD', 'EUR', 'GBP'],
  selectedCurrency = 'USD',
  onCurrencyChange,
  placeholder = '0.00',
  size = 'md',
  disabled = false,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  return (
    <div
      className={cn(
        'flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden',
        sizeClasses[size],
        disabled && 'opacity-50',
        className
      )}
      {...props}
    >
      <select
        value={selectedCurrency}
        onChange={(e) => onCurrencyChange?.(e.target.value)}
        disabled={disabled}
        className="h-full px-2 bg-gray-50 dark:bg-gray-700 border-0 border-r border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none"
      >
        {currencies.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          const inputValue = e.target.value.replace(/[^0-9.]/g, '');
          const numValue = parseFloat(inputValue);
          if (!isNaN(numValue) || inputValue === '') {
            onChange?.(inputValue === '' ? '' : numValue);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 w-full px-3 bg-transparent border-0 outline-none text-right"
      />
    </div>
  );
}

// ============================================================================
// PHONE INPUT - Phone number input
// ============================================================================
export function PhoneInput({
  value,
  onChange,
  countryCodes = [
    { code: '+1', country: 'US' },
    { code: '+44', country: 'UK' },
    { code: '+91', country: 'IN' },
    { code: '+81', country: 'JP' },
    { code: '+86', country: 'CN' },
  ],
  selectedCountry = '+1',
  onCountryChange,
  placeholder = '(555) 123-4567',
  size = 'md',
  disabled = false,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  const formatPhoneNumber = (input) => {
    const digits = input.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange?.(formatted);
  };

  return (
    <div
      className={cn(
        'flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden',
        sizeClasses[size],
        disabled && 'opacity-50',
        className
      )}
      {...props}
    >
      <select
        value={selectedCountry}
        onChange={(e) => onCountryChange?.(e.target.value)}
        disabled={disabled}
        className="h-full px-2 bg-gray-50 dark:bg-gray-700 border-0 border-r border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none"
      >
        {countryCodes.map((item) => (
          <option key={item.code} value={item.code}>
            {item.code} {item.country}
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 w-full px-3 bg-transparent border-0 outline-none"
      />
    </div>
  );
}

// ============================================================================
// PIN INPUT - PIN code input
// ============================================================================
export function PinInput({
  length = 4,
  value = '',
  onChange,
  onComplete,
  mask = false,
  size = 'md',
  disabled = false,
  autoFocus = false,
  className,
  ...props
}) {
  const inputRefs = useRef([]);

  const sizeClasses = {
    sm: 'w-8 h-10 text-lg',
    md: 'w-10 h-12 text-xl',
    lg: 'w-12 h-14 text-2xl',
  };

  const handleChange = (index, digit) => {
    if (!/^\d*$/.test(digit)) return;

    const newValue = value.split('');
    newValue[index] = digit;
    const result = newValue.join('').slice(0, length);
    onChange?.(result);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (result.length === length) {
      onComplete?.(result);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange?.(pastedData);

    if (pastedData.length === length) {
      onComplete?.(pastedData);
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  return (
    <div className={cn('flex gap-2', className)} {...props}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type={mask ? 'password' : 'text'}
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          className={cn(
            'text-center font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none',
            sizeClasses[size],
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      ))}
    </div>
  );
}

export default NumberInput;
