import React, { forwardRef, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
import { RadioGroup as HeadlessRadioGroup } from '@headlessui/react';
import { Check, Circle } from 'lucide-react';

/**
 * Batch 107: RadioGroup Component
 *
 * Radio button group components.
 *
 * Exports:
 * - RadioGroup: Container for radio options
 * - RadioGroupItem: Individual radio option
 * - RadioCard: Card-style radio option
 * - RadioButton: Button-style radio option
 * - RadioTile: Tile-style radio option
 * - RadioList: List-style radio group
 * - RadioSegment: Segmented control style
 * - ColorRadio: Color picker radio
 * - ImageRadio: Image selection radio
 */

// ============================================================================
// RADIO GROUP - Container for radio options
// ============================================================================
export function RadioGroup({
  value,
  onChange,
  children,
  label,
  description,
  orientation = 'vertical',
  disabled = false,
  className,
  ...props
}) {
  return (
    <HeadlessRadioGroup
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={cn('w-full', className)}
      {...props}
    >
      {label && (
        <HeadlessRadioGroup.Label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          {label}
        </HeadlessRadioGroup.Label>
      )}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {description}
        </p>
      )}
      <div
        className={cn(
          orientation === 'vertical' ? 'space-y-2' : 'flex flex-wrap gap-3'
        )}
      >
        {children}
      </div>
    </HeadlessRadioGroup>
  );
}

// ============================================================================
// RADIO GROUP ITEM - Individual radio option
// ============================================================================
export function RadioGroupItem({
  value,
  label,
  description,
  disabled = false,
  className,
  ...props
}) {
  return (
    <HeadlessRadioGroup.Option
      value={value}
      disabled={disabled}
      className={({ active, checked }) =>
        cn(
          'relative flex items-start cursor-pointer focus:outline-none',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )
      }
      {...props}
    >
      {({ active, checked }) => (
        <>
          <div
            className={cn(
              'flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors mt-0.5',
              checked
                ? 'border-blue-600 bg-blue-600'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
              active && 'ring-2 ring-blue-500 ring-offset-2'
            )}
          >
            {checked && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>
          <div className="ml-3">
            <HeadlessRadioGroup.Label
              as="span"
              className={cn(
                'block text-sm font-medium',
                checked
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-900 dark:text-white'
              )}
            >
              {label}
            </HeadlessRadioGroup.Label>
            {description && (
              <HeadlessRadioGroup.Description
                as="span"
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                {description}
              </HeadlessRadioGroup.Description>
            )}
          </div>
        </>
      )}
    </HeadlessRadioGroup.Option>
  );
}

// ============================================================================
// RADIO CARD - Card-style radio option
// ============================================================================
export function RadioCard({
  value,
  title,
  description,
  icon: Icon,
  price,
  badge,
  disabled = false,
  className,
  ...props
}) {
  return (
    <HeadlessRadioGroup.Option
      value={value}
      disabled={disabled}
      className={({ active, checked }) =>
        cn(
          'relative flex cursor-pointer rounded-lg border p-4 transition-colors focus:outline-none',
          checked
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600',
          active && 'ring-2 ring-blue-500 ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )
      }
      {...props}
    >
      {({ checked }) => (
        <>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className={cn(
                    'p-2 rounded-lg',
                    checked
                      ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <HeadlessRadioGroup.Label
                    as="span"
                    className="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {title}
                  </HeadlessRadioGroup.Label>
                  {badge && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {badge}
                    </span>
                  )}
                </div>
              </div>
              {price && (
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {price}
                </span>
              )}
            </div>
            {description && (
              <HeadlessRadioGroup.Description
                as="p"
                className="mt-2 text-sm text-gray-500 dark:text-gray-400"
              >
                {description}
              </HeadlessRadioGroup.Description>
            )}
          </div>
          <div
            className={cn(
              'absolute top-4 right-4 flex items-center justify-center w-5 h-5 rounded-full',
              checked
                ? 'bg-blue-600 text-white'
                : 'border-2 border-gray-300 dark:border-gray-600'
            )}
          >
            {checked && <Check className="w-3 h-3" />}
          </div>
        </>
      )}
    </HeadlessRadioGroup.Option>
  );
}

// ============================================================================
// RADIO BUTTON - Button-style radio option
// ============================================================================
export function RadioButton({
  value,
  children,
  disabled = false,
  className,
  ...props
}) {
  return (
    <HeadlessRadioGroup.Option
      value={value}
      disabled={disabled}
      className={({ active, checked }) =>
        cn(
          'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border cursor-pointer transition-colors focus:outline-none',
          checked
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
          active && 'ring-2 ring-blue-500 ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )
      }
      {...props}
    >
      {children}
    </HeadlessRadioGroup.Option>
  );
}

// ============================================================================
// RADIO TILE - Tile-style radio option
// ============================================================================
export function RadioTile({
  value,
  icon: Icon,
  label,
  disabled = false,
  className,
  ...props
}) {
  return (
    <HeadlessRadioGroup.Option
      value={value}
      disabled={disabled}
      className={({ active, checked }) =>
        cn(
          'flex flex-col items-center justify-center p-4 rounded-lg border cursor-pointer transition-colors focus:outline-none min-w-[100px]',
          checked
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
          active && 'ring-2 ring-blue-500 ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )
      }
      {...props}
    >
      {({ checked }) => (
        <>
          {Icon && <Icon className="w-6 h-6 mb-2" />}
          <span className={cn(
            'text-sm font-medium',
            checked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
          )}>
            {label}
          </span>
        </>
      )}
    </HeadlessRadioGroup.Option>
  );
}

// ============================================================================
// RADIO LIST - List-style radio group
// ============================================================================
export function RadioList({
  value,
  onChange,
  options = [],
  label,
  disabled = false,
  className,
  ...props
}) {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      label={label}
      disabled={disabled}
      className={className}
      {...props}
    >
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden">
        {options.map((option) => (
          <HeadlessRadioGroup.Option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={({ active, checked }) =>
              cn(
                'relative flex items-center px-4 py-3 cursor-pointer focus:outline-none',
                checked
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50',
                option.disabled && 'opacity-50 cursor-not-allowed'
              )
            }
          >
            {({ checked }) => (
              <>
                <div
                  className={cn(
                    'flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors',
                    checked
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                >
                  {checked && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="ml-3 flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                  {option.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {option.description}
                    </p>
                  )}
                </div>
                {option.extra && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {option.extra}
                  </span>
                )}
              </>
            )}
          </HeadlessRadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
}

// ============================================================================
// RADIO SEGMENT - Segmented control style
// ============================================================================
export function RadioSegment({
  value,
  onChange,
  options = [],
  size = 'md',
  fullWidth = false,
  disabled = false,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <HeadlessRadioGroup
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={cn('inline-flex', fullWidth && 'w-full', className)}
      {...props}
    >
      <div className={cn(
        'inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1',
        fullWidth && 'w-full'
      )}>
        {options.map((option) => (
          <HeadlessRadioGroup.Option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={({ checked }) =>
              cn(
                'flex-1 flex items-center justify-center rounded-md font-medium cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                sizeClasses[size],
                checked
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
                option.disabled && 'opacity-50 cursor-not-allowed'
              )
            }
          >
            {option.icon && <option.icon className="w-4 h-4 mr-2" />}
            {option.label}
          </HeadlessRadioGroup.Option>
        ))}
      </div>
    </HeadlessRadioGroup>
  );
}

// ============================================================================
// COLOR RADIO - Color picker radio
// ============================================================================
export function ColorRadio({
  value,
  onChange,
  colors = [],
  label,
  size = 'md',
  disabled = false,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <HeadlessRadioGroup
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      {...props}
    >
      {label && (
        <HeadlessRadioGroup.Label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          {label}
        </HeadlessRadioGroup.Label>
      )}
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <HeadlessRadioGroup.Option
            key={color.value}
            value={color.value}
            className={({ active, checked }) =>
              cn(
                'rounded-full cursor-pointer transition-transform focus:outline-none',
                sizeClasses[size],
                checked && 'ring-2 ring-offset-2 ring-gray-400 scale-110',
                active && 'ring-2 ring-offset-2 ring-blue-500',
                disabled && 'opacity-50 cursor-not-allowed'
              )
            }
            style={{ backgroundColor: color.hex || color.value }}
            title={color.name || color.value}
          >
            {({ checked }) => (
              checked && (
                <div className="w-full h-full flex items-center justify-center">
                  <Check className={cn(
                    'w-4 h-4',
                    isLightColor(color.hex || color.value) ? 'text-gray-900' : 'text-white'
                  )} />
                </div>
              )
            )}
          </HeadlessRadioGroup.Option>
        ))}
      </div>
    </HeadlessRadioGroup>
  );
}

// Helper function to determine if a color is light
function isLightColor(hex) {
  if (!hex) return false;
  const color = hex.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

// ============================================================================
// IMAGE RADIO - Image selection radio
// ============================================================================
export function ImageRadio({
  value,
  onChange,
  images = [],
  label,
  columns = 3,
  disabled = false,
  className,
  ...props
}) {
  return (
    <HeadlessRadioGroup
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      {...props}
    >
      {label && (
        <HeadlessRadioGroup.Label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          {label}
        </HeadlessRadioGroup.Label>
      )}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {images.map((image) => (
          <HeadlessRadioGroup.Option
            key={image.value}
            value={image.value}
            className={({ active, checked }) =>
              cn(
                'relative rounded-lg overflow-hidden cursor-pointer transition-all focus:outline-none',
                checked
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : 'ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-gray-300 dark:hover:ring-gray-600',
                active && 'ring-2 ring-blue-500',
                disabled && 'opacity-50 cursor-not-allowed'
              )
            }
          >
            {({ checked }) => (
              <>
                <img
                  src={image.src}
                  alt={image.alt || image.label}
                  className="w-full h-24 object-cover"
                />
                {image.label && (
                  <div className="p-2 bg-white dark:bg-gray-800">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {image.label}
                    </span>
                  </div>
                )}
                {checked && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </>
            )}
          </HeadlessRadioGroup.Option>
        ))}
      </div>
    </HeadlessRadioGroup>
  );
}

// ============================================================================
// PLAN RADIO - Plan/pricing selection radio
// ============================================================================
export function PlanRadio({
  value,
  onChange,
  plans = [],
  label,
  disabled = false,
  className,
  ...props
}) {
  return (
    <HeadlessRadioGroup
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      {...props}
    >
      {label && (
        <HeadlessRadioGroup.Label className="block text-sm font-medium text-gray-900 dark:text-white mb-4">
          {label}
        </HeadlessRadioGroup.Label>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <HeadlessRadioGroup.Option
            key={plan.value}
            value={plan.value}
            disabled={plan.disabled}
            className={({ active, checked }) =>
              cn(
                'relative flex flex-col rounded-xl border-2 p-6 cursor-pointer transition-colors focus:outline-none',
                checked
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600',
                active && 'ring-2 ring-blue-500 ring-offset-2',
                plan.popular && 'ring-2 ring-blue-500',
                plan.disabled && 'opacity-50 cursor-not-allowed'
              )
            }
          >
            {({ checked }) => (
              <>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
                    Popular
                  </span>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {plan.description}
                  </p>
                  <p className="mt-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        /{plan.period}
                      </span>
                    )}
                  </p>
                  {plan.features && (
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div
                  className={cn(
                    'absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center',
                    checked
                      ? 'bg-blue-600'
                      : 'border-2 border-gray-300 dark:border-gray-600'
                  )}
                >
                  {checked && <Check className="w-3 h-3 text-white" />}
                </div>
              </>
            )}
          </HeadlessRadioGroup.Option>
        ))}
      </div>
    </HeadlessRadioGroup>
  );
}

// ============================================================================
// ICON RADIO - Icon selection radio
// ============================================================================
export function IconRadio({
  value,
  onChange,
  options = [],
  label,
  size = 'md',
  disabled = false,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <HeadlessRadioGroup
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      {...props}
    >
      {label && (
        <HeadlessRadioGroup.Label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          {label}
        </HeadlessRadioGroup.Label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <HeadlessRadioGroup.Option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={({ active, checked }) =>
              cn(
                'flex items-center justify-center rounded-lg cursor-pointer transition-colors focus:outline-none',
                sizeClasses[size],
                checked
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
                active && 'ring-2 ring-blue-500 ring-offset-2',
                option.disabled && 'opacity-50 cursor-not-allowed'
              )
            }
            title={option.label}
          >
            {option.icon && <option.icon className={iconSizes[size]} />}
          </HeadlessRadioGroup.Option>
        ))}
      </div>
    </HeadlessRadioGroup>
  );
}

export default RadioGroup;
