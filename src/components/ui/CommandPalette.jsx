import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
import {
  Search,
  Command,
  ArrowRight,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Hash,
  File,
  Settings,
  User,
  Home,
  Folder,
  FileText,
  Code,
  Terminal,
  Loader2,
} from 'lucide-react';

/**
 * Batch 114: CommandPalette Component
 *
 * Command palette (Cmd+K style) components.
 *
 * Exports:
 * - CommandPalette: Full command palette
 * - CommandPaletteProvider: Provider for keyboard shortcut
 * - useCommandPalette: Hook to control palette
 * - CommandGroup: Group of commands
 * - CommandItem: Individual command item
 * - CommandInput: Search input
 * - CommandList: Scrollable command list
 * - CommandEmpty: Empty state
 * - CommandLoading: Loading state
 * - QuickActions: Quick action palette
 */

// ============================================================================
// COMMAND PALETTE CONTEXT
// ============================================================================
const CommandPaletteContext = createContext({
  isOpen: false,
  setIsOpen: () => {},
  search: '',
  setSearch: () => {},
});

export const useCommandPalette = () => useContext(CommandPaletteContext);

// ============================================================================
// COMMAND PALETTE PROVIDER
// ============================================================================
export function CommandPaletteProvider({
  children,
  shortcut = 'k',
  modifier = 'meta', // 'meta' for Cmd, 'ctrl' for Ctrl
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isModifierPressed =
        modifier === 'meta' ? e.metaKey : modifier === 'ctrl' ? e.ctrlKey : e.metaKey || e.ctrlKey;

      if (isModifierPressed && e.key.toLowerCase() === shortcut) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, modifier, isOpen]);

  // Reset search when closing
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  return (
    <CommandPaletteContext.Provider value={{ isOpen, setIsOpen, search, setSearch }}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

// ============================================================================
// COMMAND INPUT - Search input
// ============================================================================
export function CommandInput({
  value,
  onChange,
  placeholder = 'Type a command or search...',
  autoFocus = true,
  className,
  ...props
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <div className={cn('flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-700', className)}>
      <Search className="w-5 h-5 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="flex-1 py-4 bg-transparent border-0 outline-none text-gray-900 dark:text-white placeholder-gray-400"
        {...props}
      />
      <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
        ESC
      </kbd>
    </div>
  );
}

// ============================================================================
// COMMAND LIST - Scrollable command list
// ============================================================================
export function CommandList({
  children,
  className,
  ...props
}) {
  return (
    <div
      className={cn('max-h-80 overflow-y-auto py-2', className)}
      role="listbox"
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// COMMAND GROUP - Group of commands
// ============================================================================
export function CommandGroup({
  children,
  heading,
  className,
  ...props
}) {
  return (
    <div className={cn('py-1', className)} role="group" {...props}>
      {heading && (
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

// ============================================================================
// COMMAND ITEM - Individual command item
// ============================================================================
export function CommandItem({
  children,
  icon: Icon,
  shortcut,
  onSelect,
  disabled = false,
  active = false,
  className,
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      role="option"
      aria-selected={active}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors',
        active
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <kbd className="text-xs text-gray-400 dark:text-gray-500">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}

// ============================================================================
// COMMAND SEPARATOR
// ============================================================================
export function CommandSeparator({ className, ...props }) {
  return (
    <div
      className={cn('h-px bg-gray-200 dark:bg-gray-700 my-2', className)}
      role="separator"
      {...props}
    />
  );
}

// ============================================================================
// COMMAND EMPTY - Empty state
// ============================================================================
export function CommandEmpty({
  children = 'No results found.',
  className,
  ...props
}) {
  return (
    <div
      className={cn('py-8 text-center text-sm text-gray-500 dark:text-gray-400', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// COMMAND LOADING - Loading state
// ============================================================================
export function CommandLoading({
  children = 'Loading...',
  className,
  ...props
}) {
  return (
    <div
      className={cn('flex items-center justify-center gap-2 py-8 text-sm text-gray-500 dark:text-gray-400', className)}
      {...props}
    >
      <Loader2 className="w-4 h-4 animate-spin" />
      {children}
    </div>
  );
}

// ============================================================================
// COMMAND PALETTE - Full command palette
// ============================================================================
export function CommandPalette({
  isOpen: controlledIsOpen,
  onOpenChange,
  commands = [],
  onSelect,
  placeholder = 'Type a command or search...',
  loading = false,
  footer = true,
  className,
  ...props
}) {
  const context = useCommandPalette();
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : context.isOpen;
  const setIsOpen = onOpenChange || context.setIsOpen;

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);

  // Filter commands based on search
  const filteredCommands = commands.filter((cmd) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      cmd.label?.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some((k) => k.toLowerCase().includes(searchLower))
    );
  });

  // Group commands
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    const group = cmd.group || 'Actions';
    if (!acc[group]) acc[group] = [];
    acc[group].push(cmd);
    return acc;
  }, {});

  // Flatten for keyboard navigation
  const flatCommands = Object.values(groupedCommands).flat();

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < flatCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : flatCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (flatCommands[selectedIndex]) {
            handleSelect(flatCommands[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, flatCommands]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector('[aria-selected="true"]');
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleSelect = (command) => {
    command.onSelect?.();
    onSelect?.(command);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  let currentIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div
        className={cn(
          'fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden',
          className
        )}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        <CommandInput
          value={search}
          onChange={setSearch}
          placeholder={placeholder}
        />

        <CommandList ref={listRef}>
          {loading ? (
            <CommandLoading />
          ) : flatCommands.length === 0 ? (
            <CommandEmpty>
              No results found for "{search}"
            </CommandEmpty>
          ) : (
            Object.entries(groupedCommands).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((cmd) => {
                  const index = currentIndex++;
                  return (
                    <CommandItem
                      key={cmd.id || cmd.label}
                      icon={cmd.icon}
                      shortcut={cmd.shortcut}
                      active={selectedIndex === index}
                      disabled={cmd.disabled}
                      onSelect={() => handleSelect(cmd)}
                    >
                      {cmd.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))
          )}
        </CommandList>

        {footer && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                <ArrowDown className="w-3 h-3" />
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3" />
                Select
              </span>
              <span className="flex items-center gap-1">
                <span className="text-[10px]">ESC</span>
                Close
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ============================================================================
// QUICK ACTIONS - Quick action palette
// ============================================================================
export function QuickActions({
  isOpen,
  onOpenChange,
  actions = [],
  onSelect,
  title = 'Quick Actions',
  className,
  ...props
}) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => onOpenChange?.(false)}
      />

      <div
        className={cn(
          'fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden',
          className
        )}
        {...props}
      >
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>

        <div className="p-2 grid grid-cols-3 gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                action.onSelect?.();
                onSelect?.(action);
                onOpenChange?.(false);
              }}
              disabled={action.disabled}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg text-center transition-colors',
                action.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {action.icon && (
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  action.color || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                )}>
                  <action.icon className="w-5 h-5" />
                </div>
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// SPOTLIGHT SEARCH - Spotlight-style search
// ============================================================================
export function SpotlightSearch({
  isOpen,
  onOpenChange,
  onSearch,
  results = [],
  loading = false,
  placeholder = 'Spotlight Search',
  className,
  ...props
}) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (search) {
      onSearch?.(search);
    }
  }, [search, onSearch]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          results[selectedIndex].onSelect?.();
          onOpenChange?.(false);
        }
        break;
      case 'Escape':
        onOpenChange?.(false);
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => onOpenChange?.(false)}
      />

      <div
        className={cn(
          'fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden',
          className
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <div className="flex items-center gap-4 px-6 py-5">
          <Search className="w-6 h-6 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            autoFocus
            className="flex-1 text-xl bg-transparent border-0 outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          {loading && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
        </div>

        {(results.length > 0 || loading) && (
          <div className="border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="max-h-96 overflow-y-auto py-2">
              {results.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    result.onSelect?.();
                    onOpenChange?.(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-4 px-6 py-3 text-left transition-colors',
                    selectedIndex === index
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                  )}
                >
                  {result.icon && (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <result.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {result.title}
                    </p>
                    {result.subtitle && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                  {result.type && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {result.type}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Command className="w-3 h-3" />K to toggle
            </span>
            <span className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              <ArrowDown className="w-3 h-3" />
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" />
              to select
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// FILE SEARCH - File-specific search palette
// ============================================================================
export function FileSearch({
  isOpen,
  onOpenChange,
  files = [],
  onSelect,
  recentFiles = [],
  placeholder = 'Search files...',
  className,
  ...props
}) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredFiles = search
    ? files.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.path?.toLowerCase().includes(search.toLowerCase())
      )
    : recentFiles;

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const getFileIcon = (file) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return Code;
      case 'md':
        return FileText;
      case 'json':
        return File;
      default:
        return File;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => onOpenChange?.(false)}
      />

      <div
        className={cn(
          'fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden',
          className
        )}
        {...props}
      >
        <CommandInput
          value={search}
          onChange={setSearch}
          placeholder={placeholder}
        />

        <div className="max-h-80 overflow-y-auto py-2">
          {filteredFiles.length === 0 ? (
            <CommandEmpty>
              {search ? `No files found for "${search}"` : 'No recent files'}
            </CommandEmpty>
          ) : (
            <>
              {!search && recentFiles.length > 0 && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Recent Files
                </div>
              )}
              {filteredFiles.map((file, index) => {
                const FileIcon = getFileIcon(file);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      onSelect?.(file);
                      onOpenChange?.(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors',
                      selectedIndex === index
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <FileIcon className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      {file.path && (
                        <p className="text-xs text-gray-500 truncate">
                          {file.path}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
          <span>Press Enter to open</span>
          <span>ESC to close</span>
        </div>
      </div>
    </>
  );
}

export default CommandPalette;
