import React, { useState, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { X, Check, Plus, AlertCircle, Clock, Star, User, Tag, Hash, Mail } from 'lucide-react';

/**
 * Batch 97: Chip/Tag Component
 *
 * Chip and tag components for displaying labels, filters, and selections.
 *
 * Exports:
 * - Chip: Basic chip component
 * - ChipGroup: Group of chips with selection
 * - Tag: Simple tag label
 * - TagInput: Input for adding tags
 * - FilterChip: Selectable filter chip
 * - StatusChip: Status indicator chip
 * - UserChip: User avatar chip
 * - ActionChip: Chip with action
 * - CategoryChip: Category label chip
 * - CountChip: Chip with count
 * - DeletableChip: Chip with delete button
 * - ChoiceChip: Single/multi choice chips
 */

// ============================================================================
// CHIP - Basic chip component
// ============================================================================
export const Chip = forwardRef(function Chip({
  children,
  variant = 'default',
  size = 'md',
  color = 'gray',
  icon: Icon,
  onDelete,
  onClick,
  selected = false,
  disabled = false,
  className,
  ...props
}, ref) {
  const variantClasses = {
    default: {
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      green: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
      red: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
      yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
      pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
      indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
    },
    outlined: {
      gray: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
      blue: 'border border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300',
      green: 'border border-green-300 text-green-700 dark:border-green-600 dark:text-green-300',
      red: 'border border-red-300 text-red-700 dark:border-red-600 dark:text-red-300',
      yellow: 'border border-yellow-300 text-yellow-700 dark:border-yellow-600 dark:text-yellow-300',
      purple: 'border border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300',
      pink: 'border border-pink-300 text-pink-700 dark:border-pink-600 dark:text-pink-300',
      indigo: 'border border-indigo-300 text-indigo-700 dark:border-indigo-600 dark:text-indigo-300',
    },
    solid: {
      gray: 'bg-gray-600 text-white',
      blue: 'bg-blue-600 text-white',
      green: 'bg-green-600 text-white',
      red: 'bg-red-600 text-white',
      yellow: 'bg-yellow-500 text-white',
      purple: 'bg-purple-600 text-white',
      pink: 'bg-pink-600 text-white',
      indigo: 'bg-indigo-600 text-white',
    },
  };

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const isClickable = onClick && !disabled;

  return (
    <span
      ref={ref}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(e);
        }
      }}
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantClasses[variant][color],
        sizeClasses[size],
        isClickable && 'cursor-pointer hover:opacity-80',
        selected && 'ring-2 ring-offset-2 ring-blue-500',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {Icon && <Icon className={iconSizeClasses[size]} />}
      {children}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={disabled}
          className={cn(
            'ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10',
            disabled && 'pointer-events-none'
          )}
        >
          <X className={iconSizeClasses[size]} />
        </button>
      )}
    </span>
  );
});

// ============================================================================
// CHIP GROUP - Group of chips with selection
// ============================================================================
export function ChipGroup({
  children,
  value,
  onChange,
  multiple = false,
  className,
  ...props
}) {
  const handleChipClick = (chipValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(chipValue)
        ? currentValues.filter((v) => v !== chipValue)
        : [...currentValues, chipValue];
      onChange?.(newValues);
    } else {
      onChange?.(value === chipValue ? null : chipValue);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)} {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const chipValue = child.props.value;
        const isSelected = multiple
          ? Array.isArray(value) && value.includes(chipValue)
          : value === chipValue;

        return React.cloneElement(child, {
          selected: isSelected,
          onClick: () => handleChipClick(chipValue),
        });
      })}
    </div>
  );
}

// ============================================================================
// TAG - Simple tag label
// ============================================================================
export function Tag({
  children,
  color = 'gray',
  size = 'sm',
  dot = false,
  icon: Icon,
  className,
  ...props
}) {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const dotColorClasses = {
    gray: 'bg-gray-400',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded font-medium',
        colorClasses[color],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColorClasses[color])} />
      )}
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

// ============================================================================
// TAG INPUT - Input for adding tags
// ============================================================================
export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add tag...',
  maxTags,
  allowDuplicates = false,
  delimiter = ',',
  disabled = false,
  size = 'md',
  className,
  ...props
}) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (maxTags && value.length >= maxTags) return;
    if (!allowDuplicates && value.includes(trimmed)) return;

    onChange?.([...value, trimmed]);
    setInputValue('');
  };

  const removeTag = (index) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === delimiter) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const tags = pastedText.split(delimiter).map((t) => t.trim()).filter(Boolean);
    const newTags = allowDuplicates
      ? tags
      : tags.filter((t) => !value.includes(t));

    if (maxTags) {
      const remaining = maxTags - value.length;
      onChange?.([...value, ...newTags.slice(0, remaining)]);
    } else {
      onChange?.([...value, ...newTags]);
    }
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 px-3 py-2',
        'bg-white dark:bg-gray-800',
        'border border-gray-300 dark:border-gray-600 rounded-lg',
        'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
        disabled && 'opacity-50 cursor-not-allowed',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {value.map((tag, index) => (
        <Chip
          key={index}
          size={size === 'lg' ? 'md' : 'sm'}
          onDelete={disabled ? undefined : () => removeTag(index)}
        >
          {tag}
        </Chip>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => addTag(inputValue)}
        placeholder={value.length === 0 ? placeholder : ''}
        disabled={disabled || (maxTags && value.length >= maxTags)}
        className="flex-1 min-w-[100px] bg-transparent outline-none placeholder:text-gray-400"
      />
    </div>
  );
}

// ============================================================================
// FILTER CHIP - Selectable filter chip
// ============================================================================
export function FilterChip({
  children,
  selected = false,
  onClick,
  icon: Icon,
  count,
  disabled = false,
  className,
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
        'border transition-colors',
        selected
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {selected && <Check className="w-4 h-4" />}
      {!selected && Icon && <Icon className="w-4 h-4" />}
      {children}
      {count !== undefined && (
        <span
          className={cn(
            'px-1.5 py-0.5 text-xs rounded-full',
            selected
              ? 'bg-white/20'
              : 'bg-gray-100 dark:bg-gray-700'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// STATUS CHIP - Status indicator chip
// ============================================================================
export function StatusChip({
  status,
  label,
  size = 'sm',
  className,
  ...props
}) {
  const statusConfig = {
    active: { color: 'green', icon: Check, label: 'Active' },
    inactive: { color: 'gray', icon: null, label: 'Inactive' },
    pending: { color: 'yellow', icon: Clock, label: 'Pending' },
    error: { color: 'red', icon: AlertCircle, label: 'Error' },
    success: { color: 'green', icon: Check, label: 'Success' },
    warning: { color: 'yellow', icon: AlertCircle, label: 'Warning' },
    info: { color: 'blue', icon: null, label: 'Info' },
  };

  const config = statusConfig[status] || statusConfig.inactive;
  const displayLabel = label || config.label;

  return (
    <Chip
      color={config.color}
      icon={config.icon}
      size={size}
      className={className}
      {...props}
    >
      {displayLabel}
    </Chip>
  );
}

// ============================================================================
// USER CHIP - User avatar chip
// ============================================================================
export function UserChip({
  name,
  avatar,
  email,
  onRemove,
  size = 'md',
  className,
  ...props
}) {
  const sizeClasses = {
    sm: { container: 'text-xs pr-2', avatar: 'w-5 h-5' },
    md: { container: 'text-sm pr-2.5', avatar: 'w-6 h-6' },
    lg: { container: 'text-base pr-3', avatar: 'w-8 h-8' },
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full',
        'bg-gray-100 dark:bg-gray-800',
        sizeClasses[size].container,
        className
      )}
      {...props}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className={cn('rounded-full object-cover', sizeClasses[size].avatar)}
        />
      ) : (
        <span
          className={cn(
            'flex items-center justify-center rounded-full bg-blue-500 text-white font-medium',
            sizeClasses[size].avatar
          )}
        >
          {name?.[0]?.toUpperCase() || <User className="w-3 h-3" />}
        </span>
      )}
      <span className="font-medium text-gray-700 dark:text-gray-300">
        {name}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

// ============================================================================
// ACTION CHIP - Chip with action
// ============================================================================
export function ActionChip({
  children,
  icon: Icon = Plus,
  onClick,
  variant = 'outlined',
  disabled = false,
  className,
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
        'transition-colors',
        variant === 'outlined'
          ? 'border border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

// ============================================================================
// CATEGORY CHIP - Category label chip
// ============================================================================
export function CategoryChip({
  children,
  icon: Icon = Tag,
  href,
  onClick,
  className,
  ...props
}) {
  const Component = href ? 'a' : 'span';

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
        (href || onClick) && 'hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer',
        className
      )}
      {...props}
    >
      <Icon className="w-3 h-3" />
      {children}
    </Component>
  );
}

// ============================================================================
// COUNT CHIP - Chip with count
// ============================================================================
export function CountChip({
  children,
  count,
  max = 99,
  color = 'gray',
  className,
  ...props
}) {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <Chip color={color} className={className} {...props}>
      {children}
      <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-black/10 dark:bg-white/10">
        {displayCount}
      </span>
    </Chip>
  );
}

// ============================================================================
// HASHTAG CHIP - Hashtag style chip
// ============================================================================
export function HashtagChip({
  children,
  href,
  onClick,
  trending = false,
  className,
  ...props
}) {
  const Component = href ? 'a' : 'span';

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-0.5 text-sm',
        'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
        (href || onClick) && 'cursor-pointer',
        trending && 'font-semibold',
        className
      )}
      {...props}
    >
      <Hash className="w-4 h-4" />
      {children}
    </Component>
  );
}

// ============================================================================
// CHOICE CHIP - Single/multi choice chips
// ============================================================================
export function ChoiceChip({
  options,
  value,
  onChange,
  multiple = false,
  disabled = false,
  className,
  ...props
}) {
  const handleSelect = (optionValue) => {
    if (disabled) return;

    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      onChange?.(newValues);
    } else {
      onChange?.(value === optionValue ? null : optionValue);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)} {...props}>
      {options.map((option) => {
        const isSelected = multiple
          ? Array.isArray(value) && value.includes(option.value)
          : value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            disabled={disabled || option.disabled}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
              'border transition-all',
              isSelected
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500',
              (disabled || option.disabled) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSelected && <Check className="w-4 h-4" />}
            {option.icon && !isSelected && <option.icon className="w-4 h-4" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// EMAIL CHIP - Email address chip
// ============================================================================
export function EmailChip({
  email,
  onRemove,
  invalid = false,
  className,
  ...props
}) {
  return (
    <Chip
      color={invalid ? 'red' : 'blue'}
      variant="outlined"
      icon={Mail}
      onDelete={onRemove}
      className={className}
      {...props}
    >
      {email}
    </Chip>
  );
}

// ============================================================================
// RATING CHIP - Star rating chip
// ============================================================================
export function RatingChip({
  rating,
  maxRating = 5,
  count,
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded',
        'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
        'text-sm font-medium',
        className
      )}
      {...props}
    >
      <Star className="w-4 h-4 fill-current" />
      {rating.toFixed(1)}
      {count !== undefined && (
        <span className="text-yellow-600/70 dark:text-yellow-500/70">
          ({count})
        </span>
      )}
    </span>
  );
}

export default Chip;
