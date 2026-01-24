import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';
import { Check, ChevronRight, GripVertical, MoreHorizontal, X } from 'lucide-react';

/**
 * Batch 89: List Component
 *
 * Flexible list components for displaying collections of items.
 *
 * Exports:
 * - List: Basic list container
 * - ListItem: Basic list item
 * - OrderedList: Numbered list
 * - UnorderedList: Bulleted list
 * - DescriptionList: Definition list (dt/dd)
 * - ActionList: List items with actions
 * - NavigationList: Clickable navigation items
 * - CheckList: List with checkboxes
 * - SelectableList: Single/multi select list
 * - DraggableList: Reorderable list
 * - VirtualList: Virtualized list for large datasets
 */

// ============================================================================
// LIST CONTEXT
// ============================================================================
const ListContext = createContext({});

function useListContext() {
  return useContext(ListContext);
}

// ============================================================================
// LIST - Basic list container
// ============================================================================
export function List({
  children,
  variant = 'default',
  size = 'md',
  divided = false,
  hoverable = false,
  className,
  ...props
}) {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-900',
    bordered: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg',
    card: 'bg-white dark:bg-gray-800 shadow rounded-lg',
    ghost: '',
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <ListContext.Provider value={{ size, divided, hoverable }}>
      <ul
        role="list"
        className={cn(
          variantClasses[variant],
          sizeClasses[size],
          divided && '[&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-gray-100 dark:[&>*:not(:last-child)]:border-gray-800',
          className
        )}
        {...props}
      >
        {children}
      </ul>
    </ListContext.Provider>
  );
}

// ============================================================================
// LIST ITEM - Basic list item
// ============================================================================
export function ListItem({
  children,
  icon: Icon,
  avatar,
  secondary,
  trailing,
  active = false,
  disabled = false,
  onClick,
  className,
  ...props
}) {
  const { size, hoverable } = useListContext();

  const paddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-5 py-4',
  };

  const isClickable = onClick && !disabled;

  return (
    <li
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
        'flex items-center gap-3',
        paddingClasses[size || 'md'],
        isClickable && 'cursor-pointer',
        (hoverable || isClickable) && 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        active && 'bg-blue-50 dark:bg-blue-900/20',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {avatar && (
        <div className="flex-shrink-0">
          {avatar}
        </div>
      )}

      {Icon && !avatar && (
        <Icon className="w-5 h-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
      )}

      <div className="flex-1 min-w-0">
        <div className="text-gray-900 dark:text-white truncate">
          {children}
        </div>
        {secondary && (
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {secondary}
          </div>
        )}
      </div>

      {trailing && (
        <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
          {trailing}
        </div>
      )}
    </li>
  );
}

// ============================================================================
// ORDERED LIST - Numbered list
// ============================================================================
export function OrderedList({
  children,
  start = 1,
  type = 'decimal',
  spacing = 'normal',
  className,
  ...props
}) {
  const typeClasses = {
    decimal: 'list-decimal',
    'lower-alpha': 'list-[lower-alpha]',
    'upper-alpha': 'list-[upper-alpha]',
    'lower-roman': 'list-[lower-roman]',
    'upper-roman': 'list-[upper-roman]',
  };

  const spacingClasses = {
    tight: 'space-y-1',
    normal: 'space-y-2',
    loose: 'space-y-4',
  };

  return (
    <ol
      start={start}
      className={cn(
        'list-inside',
        typeClasses[type],
        spacingClasses[spacing],
        'text-gray-700 dark:text-gray-300',
        className
      )}
      {...props}
    >
      {children}
    </ol>
  );
}

// ============================================================================
// UNORDERED LIST - Bulleted list
// ============================================================================
export function UnorderedList({
  children,
  marker = 'disc',
  spacing = 'normal',
  className,
  ...props
}) {
  const markerClasses = {
    disc: 'list-disc',
    circle: 'list-circle',
    square: 'list-[square]',
    dash: 'list-["-_"]',
    check: 'list-none',
    none: 'list-none',
  };

  const spacingClasses = {
    tight: 'space-y-1',
    normal: 'space-y-2',
    loose: 'space-y-4',
  };

  return (
    <ul
      className={cn(
        marker !== 'check' && marker !== 'none' && 'list-inside',
        markerClasses[marker],
        spacingClasses[spacing],
        'text-gray-700 dark:text-gray-300',
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (marker === 'check' && React.isValidElement(child)) {
          return (
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{child.props.children}</span>
            </li>
          );
        }
        return child;
      })}
    </ul>
  );
}

// ============================================================================
// DESCRIPTION LIST - Definition list (dt/dd)
// ============================================================================
export function DescriptionList({
  items,
  layout = 'stacked',
  striped = false,
  className,
  ...props
}) {
  return (
    <dl
      className={cn(
        layout === 'horizontal' && 'grid grid-cols-[auto_1fr] gap-x-4 gap-y-2',
        className
      )}
      {...props}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            layout === 'stacked' && 'py-3',
            layout === 'horizontal' && 'contents',
            striped && index % 2 === 0 && 'bg-gray-50 dark:bg-gray-800/50'
          )}
        >
          <dt
            className={cn(
              'font-medium text-gray-900 dark:text-white',
              layout === 'stacked' && 'text-sm',
              layout === 'horizontal' && 'py-2'
            )}
          >
            {item.term}
          </dt>
          <dd
            className={cn(
              'text-gray-500 dark:text-gray-400',
              layout === 'stacked' && 'mt-1',
              layout === 'horizontal' && 'py-2'
            )}
          >
            {item.description}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ============================================================================
// ACTION LIST - List items with actions
// ============================================================================
export function ActionList({
  items,
  onAction,
  divided = true,
  className,
  ...props
}) {
  return (
    <List variant="bordered" divided={divided} className={className} {...props}>
      {items.map((item, index) => (
        <ListItem
          key={index}
          icon={item.icon}
          secondary={item.description}
          onClick={() => !item.disabled && onAction?.(item)}
          disabled={item.disabled}
          trailing={
            item.actions ? (
              <div className="flex items-center gap-1">
                {item.actions.map((action, actionIndex) => (
                  <button
                    key={actionIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick?.();
                    }}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title={action.label}
                  >
                    {action.icon && <action.icon className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            ) : item.trailing
          }
        >
          {item.label}
        </ListItem>
      ))}
    </List>
  );
}

// ============================================================================
// NAVIGATION LIST - Clickable navigation items
// ============================================================================
export function NavigationList({
  items,
  activeItem,
  onNavigate,
  showChevron = true,
  className,
  ...props
}) {
  return (
    <List variant="ghost" divided={false} className={className} {...props}>
      {items.map((item, index) => (
        <ListItem
          key={index}
          icon={item.icon}
          secondary={item.description}
          active={activeItem === item.id || activeItem === item.href}
          disabled={item.disabled}
          onClick={() => !item.disabled && onNavigate?.(item)}
          trailing={
            item.badge ? (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded-full">
                {item.badge}
              </span>
            ) : showChevron ? (
              <ChevronRight className="w-4 h-4" />
            ) : null
          }
        >
          {item.label}
        </ListItem>
      ))}
    </List>
  );
}

// ============================================================================
// CHECK LIST - List with checkboxes
// ============================================================================
export function CheckList({
  items,
  checkedItems = [],
  onChange,
  strikethrough = true,
  className,
  ...props
}) {
  const toggleItem = (item) => {
    const isChecked = checkedItems.includes(item.id);
    const newChecked = isChecked
      ? checkedItems.filter((id) => id !== item.id)
      : [...checkedItems, item.id];
    onChange?.(newChecked, item);
  };

  return (
    <List variant="ghost" className={className} {...props}>
      {items.map((item) => {
        const isChecked = checkedItems.includes(item.id);
        return (
          <li
            key={item.id}
            className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 px-2 rounded"
            onClick={() => toggleItem(item)}
          >
            <div
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                isChecked
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300 dark:border-gray-600'
              )}
            >
              {isChecked && <Check className="w-3 h-3 text-white" />}
            </div>
            <span
              className={cn(
                'text-gray-900 dark:text-white',
                strikethrough && isChecked && 'line-through text-gray-400 dark:text-gray-500'
              )}
            >
              {item.label}
            </span>
          </li>
        );
      })}
    </List>
  );
}

// ============================================================================
// SELECTABLE LIST - Single/multi select list
// ============================================================================
export function SelectableList({
  items,
  selectedItems = [],
  onChange,
  multiple = false,
  className,
  ...props
}) {
  const toggleItem = (item) => {
    if (multiple) {
      const isSelected = selectedItems.includes(item.id);
      const newSelected = isSelected
        ? selectedItems.filter((id) => id !== item.id)
        : [...selectedItems, item.id];
      onChange?.(newSelected, item);
    } else {
      onChange?.([item.id], item);
    }
  };

  return (
    <List variant="bordered" className={className} {...props}>
      {items.map((item) => {
        const isSelected = selectedItems.includes(item.id);
        return (
          <ListItem
            key={item.id}
            icon={item.icon}
            secondary={item.description}
            active={isSelected}
            disabled={item.disabled}
            onClick={() => !item.disabled && toggleItem(item)}
            trailing={
              isSelected && (
                <Check className="w-5 h-5 text-blue-500" />
              )
            }
          >
            {item.label}
          </ListItem>
        );
      })}
    </List>
  );
}

// ============================================================================
// DRAGGABLE LIST - Reorderable list
// ============================================================================
export function DraggableList({
  items,
  onReorder,
  renderItem,
  keyExtractor = (item) => item.id,
  className,
  ...props
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newItems = [...items];
      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(dropIndex, 0, removed);
      onReorder?.(newItems);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <List variant="bordered" className={className} {...props}>
      {items.map((item, index) => (
        <li
          key={keyExtractor(item)}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={cn(
            'flex items-center gap-3 px-4 py-3 cursor-move',
            'hover:bg-gray-50 dark:hover:bg-gray-800/50',
            draggedIndex === index && 'opacity-50',
            dragOverIndex === index && 'border-t-2 border-blue-500'
          )}
        >
          <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex-1">
            {renderItem ? renderItem(item, index) : item.label}
          </div>
        </li>
      ))}
    </List>
  );
}

// ============================================================================
// REMOVABLE LIST - List with remove buttons
// ============================================================================
export function RemovableList({
  items,
  onRemove,
  confirmRemove = false,
  className,
  ...props
}) {
  const [confirmingId, setConfirmingId] = useState(null);

  const handleRemove = (item) => {
    if (confirmRemove && confirmingId !== item.id) {
      setConfirmingId(item.id);
      setTimeout(() => setConfirmingId(null), 3000);
    } else {
      onRemove?.(item);
      setConfirmingId(null);
    }
  };

  return (
    <List variant="bordered" divided className={className} {...props}>
      {items.map((item) => (
        <ListItem
          key={item.id}
          icon={item.icon}
          avatar={item.avatar}
          secondary={item.description}
          trailing={
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(item);
              }}
              className={cn(
                'p-1.5 rounded-full transition-colors',
                confirmingId === item.id
                  ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              )}
              title={confirmingId === item.id ? 'Click again to confirm' : 'Remove'}
            >
              <X className="w-4 h-4" />
            </button>
          }
        >
          {item.label}
        </ListItem>
      ))}
    </List>
  );
}

// ============================================================================
// MENU LIST - Dropdown menu style list
// ============================================================================
export function MenuList({
  items,
  onSelect,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 py-1',
        className
      )}
      {...props}
    >
      {items.map((item, index) => {
        if (item.type === 'divider') {
          return (
            <div
              key={index}
              className="h-px bg-gray-200 dark:bg-gray-700 my-1"
            />
          );
        }

        if (item.type === 'header') {
          return (
            <div
              key={index}
              className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
            >
              {item.label}
            </div>
          );
        }

        return (
          <button
            key={index}
            onClick={() => !item.disabled && onSelect?.(item)}
            disabled={item.disabled}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2 text-left',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              item.disabled && 'opacity-50 cursor-not-allowed',
              item.danger && 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
            )}
          >
            {item.icon && <item.icon className="w-4 h-4" />}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// VIRTUAL LIST ITEM - For use in virtualized lists
// ============================================================================
export function VirtualListItem({
  children,
  style,
  className,
  ...props
}) {
  return (
    <div
      style={style}
      className={cn('px-4 py-3', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default List;
