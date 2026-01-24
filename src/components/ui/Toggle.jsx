import React, { forwardRef, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
import { Switch } from '@headlessui/react';
import { Check, X, Sun, Moon, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';

/**
 * Batch 106: Toggle/Switch Component
 *
 * Toggle switches and related components.
 *
 * Exports:
 * - Toggle: Basic toggle switch
 * - ToggleWithLabel: Toggle with label text
 * - ToggleGroup: Group of toggles
 * - ToggleCard: Toggle in a card format
 * - IconToggle: Toggle with icons
 * - ThemeToggle: Dark/light mode toggle
 * - SettingsToggle: Settings-style toggle row
 * - FeatureToggle: Feature flag toggle
 */

// ============================================================================
// TOGGLE - Basic toggle switch
// ============================================================================
export const Toggle = forwardRef(function Toggle({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  color = 'blue',
  className,
  ...props
}, ref) {
  const sizeClasses = {
    sm: { switch: 'h-5 w-9', thumb: 'h-4 w-4', translate: 'translate-x-4' },
    md: { switch: 'h-6 w-11', thumb: 'h-5 w-5', translate: 'translate-x-5' },
    lg: { switch: 'h-7 w-14', thumb: 'h-6 w-6', translate: 'translate-x-7' },
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
    gray: 'bg-gray-600',
  };

  const sizes = sizeClasses[size];

  return (
    <Switch
      ref={ref}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        sizes.switch,
        checked ? colorClasses[color] : 'bg-gray-200 dark:bg-gray-700',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      <span className="sr-only">Toggle</span>
      <span
        className={cn(
          'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
          sizes.thumb,
          checked ? sizes.translate : 'translate-x-0'
        )}
      />
    </Switch>
  );
});

// ============================================================================
// TOGGLE WITH LABEL - Toggle with label text
// ============================================================================
export function ToggleWithLabel({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  color = 'blue',
  labelPosition = 'right',
  className,
  ...props
}) {
  return (
    <Switch.Group>
      <div
        className={cn(
          'flex items-center gap-3',
          labelPosition === 'left' && 'flex-row-reverse',
          className
        )}
        {...props}
      >
        <Toggle
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          size={size}
          color={color}
        />
        <div className={labelPosition === 'left' ? 'text-right' : ''}>
          <Switch.Label
            className={cn(
              'text-sm font-medium text-gray-900 dark:text-white cursor-pointer',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
          </Switch.Label>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>
    </Switch.Group>
  );
}

// ============================================================================
// TOGGLE GROUP CONTEXT
// ============================================================================
const ToggleGroupContext = createContext({});

// ============================================================================
// TOGGLE GROUP - Group of toggles
// ============================================================================
export function ToggleGroup({
  children,
  values = {},
  onChange,
  disabled = false,
  className,
  ...props
}) {
  const handleChange = (key, value) => {
    onChange?.({ ...values, [key]: value });
  };

  return (
    <ToggleGroupContext.Provider value={{ values, onChange: handleChange, disabled }}>
      <div className={cn('space-y-4', className)} {...props}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

// ============================================================================
// TOGGLE GROUP ITEM
// ============================================================================
export function ToggleGroupItem({
  name,
  label,
  description,
  disabled: itemDisabled = false,
  ...props
}) {
  const { values, onChange, disabled: groupDisabled } = useContext(ToggleGroupContext);
  const isDisabled = itemDisabled || groupDisabled;

  return (
    <ToggleWithLabel
      checked={values[name] || false}
      onChange={(value) => onChange(name, value)}
      label={label}
      description={description}
      disabled={isDisabled}
      {...props}
    />
  );
}

// ============================================================================
// TOGGLE CARD - Toggle in a card format
// ============================================================================
export function ToggleCard({
  checked,
  onChange,
  title,
  description,
  icon: Icon,
  disabled = false,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'relative flex items-start p-4 rounded-lg border transition-colors',
        checked
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
        disabled && 'opacity-50',
        className
      )}
      {...props}
    >
      {Icon && (
        <div className={cn(
          'flex-shrink-0 p-2 rounded-lg mr-4',
          checked
            ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        )}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      <Toggle
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="ml-4"
      />
    </div>
  );
}

// ============================================================================
// ICON TOGGLE - Toggle with icons
// ============================================================================
export function IconToggle({
  checked,
  onChange,
  onIcon: OnIcon = Check,
  offIcon: OffIcon = X,
  disabled = false,
  size = 'md',
  color = 'blue',
  className,
  ...props
}) {
  const sizeClasses = {
    sm: { switch: 'h-6 w-12', thumb: 'h-5 w-5', translate: 'translate-x-6', icon: 'w-3 h-3' },
    md: { switch: 'h-7 w-14', thumb: 'h-6 w-6', translate: 'translate-x-7', icon: 'w-4 h-4' },
    lg: { switch: 'h-8 w-16', thumb: 'h-7 w-7', translate: 'translate-x-8', icon: 'w-5 h-5' },
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600',
  };

  const sizes = sizeClasses[size];

  return (
    <Switch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        sizes.switch,
        checked ? colorClasses[color] : 'bg-gray-200 dark:bg-gray-700',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      <span className="sr-only">Toggle</span>
      <span
        className={cn(
          'pointer-events-none inline-flex items-center justify-center rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
          sizes.thumb,
          checked ? sizes.translate : 'translate-x-0'
        )}
      >
        {checked ? (
          <OnIcon className={cn(sizes.icon, 'text-blue-600')} />
        ) : (
          <OffIcon className={cn(sizes.icon, 'text-gray-400')} />
        )}
      </span>
    </Switch>
  );
}

// ============================================================================
// THEME TOGGLE - Dark/light mode toggle
// ============================================================================
export function ThemeToggle({
  isDark,
  onChange,
  size = 'md',
  className,
  ...props
}) {
  return (
    <IconToggle
      checked={isDark}
      onChange={onChange}
      onIcon={Moon}
      offIcon={Sun}
      size={size}
      color="purple"
      className={className}
      {...props}
    />
  );
}

// ============================================================================
// SETTINGS TOGGLE - Settings-style toggle row
// ============================================================================
export function SettingsToggle({
  checked,
  onChange,
  title,
  description,
  icon: Icon,
  disabled = false,
  danger = false,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-4',
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={cn(
            'p-2 rounded-lg',
            danger
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h4 className={cn(
            'text-sm font-medium',
            danger
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-900 dark:text-white'
          )}>
            {title}
          </h4>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      <Toggle
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        color={danger ? 'red' : 'blue'}
      />
    </div>
  );
}

// ============================================================================
// FEATURE TOGGLE - Feature flag toggle
// ============================================================================
export function FeatureToggle({
  checked,
  onChange,
  name,
  description,
  badge,
  disabled = false,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
        disabled && 'opacity-50',
        className
      )}
      {...props}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {name}
          </h4>
          {badge && (
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full',
              badge === 'new' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
              badge === 'beta' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
              badge === 'experimental' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
              badge === 'deprecated' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            )}>
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <Toggle
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="ml-4"
      />
    </div>
  );
}

// ============================================================================
// STATUS TOGGLE - Toggle with status indicator
// ============================================================================
export function StatusToggle({
  checked,
  onChange,
  label,
  onLabel = 'On',
  offLabel = 'Off',
  disabled = false,
  size = 'md',
  className,
  ...props
}) {
  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      {label && (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </span>
      )}
      <Toggle
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        size={size}
      />
      <span className={cn(
        'text-sm font-medium',
        checked
          ? 'text-green-600 dark:text-green-400'
          : 'text-gray-500 dark:text-gray-400'
      )}>
        {checked ? onLabel : offLabel}
      </span>
    </div>
  );
}

// ============================================================================
// WIFI TOGGLE - WiFi on/off toggle
// ============================================================================
export function WifiToggle({
  checked,
  onChange,
  disabled = false,
  showLabel = true,
  className,
  ...props
}) {
  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      <IconToggle
        checked={checked}
        onChange={onChange}
        onIcon={Wifi}
        offIcon={WifiOff}
        disabled={disabled}
        color="green"
      />
      {showLabel && (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {checked ? 'Connected' : 'Disconnected'}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// SOUND TOGGLE - Sound on/off toggle
// ============================================================================
export function SoundToggle({
  checked,
  onChange,
  disabled = false,
  showLabel = true,
  className,
  ...props
}) {
  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      <IconToggle
        checked={checked}
        onChange={onChange}
        onIcon={Volume2}
        offIcon={VolumeX}
        disabled={disabled}
        color="blue"
      />
      {showLabel && (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {checked ? 'Sound on' : 'Sound off'}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// TOGGLE BUTTON - Button style toggle
// ============================================================================
export function ToggleButton({
  pressed,
  onChange,
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  className,
  ...props
}) {
  const variantClasses = {
    default: pressed
      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
    primary: pressed
      ? 'bg-blue-600 text-white'
      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    outline: pressed
      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
      : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      onClick={() => onChange?.(!pressed)}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================================================
// TOGGLE BUTTON GROUP - Group of toggle buttons
// ============================================================================
export function ToggleButtonGroup({
  children,
  value,
  onChange,
  multiple = false,
  className,
  ...props
}) {
  const handleChange = (itemValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(itemValue)
        ? currentValues.filter(v => v !== itemValue)
        : [...currentValues, itemValue];
      onChange?.(newValues);
    } else {
      onChange?.(value === itemValue ? null : itemValue);
    }
  };

  return (
    <div
      className={cn('inline-flex rounded-md shadow-sm', className)}
      role="group"
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;
        const itemValue = child.props.value;
        const isPressed = multiple
          ? (Array.isArray(value) && value.includes(itemValue))
          : value === itemValue;

        return React.cloneElement(child, {
          pressed: isPressed,
          onChange: () => handleChange(itemValue),
          className: cn(
            child.props.className,
            !isFirst && '-ml-px',
            isFirst && 'rounded-r-none',
            isLast && 'rounded-l-none',
            !isFirst && !isLast && 'rounded-none'
          ),
        });
      })}
    </div>
  );
}

export default Toggle;
