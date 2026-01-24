import React, { useState, createContext, useContext, useCallback } from 'react';
import { cn } from '../../lib/utils';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  FileText,
  FileCode,
  Image,
  Film,
  Music,
  Archive,
  MoreHorizontal,
  Plus,
  Trash2,
  Edit,
  Copy,
  Check,
  GripVertical,
} from 'lucide-react';

/**
 * Batch 117: TreeView Component
 *
 * Hierarchical tree view components.
 *
 * Exports:
 * - TreeView: Main tree view container
 * - TreeNode: Individual tree node
 * - TreeNodeContent: Node content wrapper
 * - TreeNodeIcon: Node icon
 * - TreeNodeLabel: Node label
 * - TreeNodeActions: Node action buttons
 * - FileTree: File explorer tree
 * - MenuTree: Menu/navigation tree
 * - CheckboxTree: Tree with checkboxes
 */

// ============================================================================
// TREE VIEW CONTEXT
// ============================================================================
const TreeViewContext = createContext({
  expandedNodes: [],
  selectedNodes: [],
  checkedNodes: [],
  onExpand: () => {},
  onSelect: () => {},
  onCheck: () => {},
  multiSelect: false,
  checkable: false,
  showLines: false,
  draggable: false,
});

export const useTreeView = () => useContext(TreeViewContext);

// ============================================================================
// TREE VIEW - Main tree view container
// ============================================================================
export function TreeView({
  children,
  data,
  defaultExpanded = [],
  defaultSelected = [],
  defaultChecked = [],
  expandedNodes: controlledExpanded,
  selectedNodes: controlledSelected,
  checkedNodes: controlledChecked,
  onExpand,
  onSelect,
  onCheck,
  multiSelect = false,
  checkable = false,
  showLines = false,
  draggable = false,
  onDrop,
  className,
  ...props
}) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [internalSelected, setInternalSelected] = useState(defaultSelected);
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  const expandedNodes = controlledExpanded ?? internalExpanded;
  const selectedNodes = controlledSelected ?? internalSelected;
  const checkedNodes = controlledChecked ?? internalChecked;

  const handleExpand = useCallback((nodeId) => {
    const newExpanded = expandedNodes.includes(nodeId)
      ? expandedNodes.filter((id) => id !== nodeId)
      : [...expandedNodes, nodeId];

    if (onExpand) {
      onExpand(nodeId, newExpanded);
    } else {
      setInternalExpanded(newExpanded);
    }
  }, [expandedNodes, onExpand]);

  const handleSelect = useCallback((nodeId) => {
    let newSelected;
    if (multiSelect) {
      newSelected = selectedNodes.includes(nodeId)
        ? selectedNodes.filter((id) => id !== nodeId)
        : [...selectedNodes, nodeId];
    } else {
      newSelected = selectedNodes.includes(nodeId) ? [] : [nodeId];
    }

    if (onSelect) {
      onSelect(nodeId, newSelected);
    } else {
      setInternalSelected(newSelected);
    }
  }, [selectedNodes, multiSelect, onSelect]);

  const handleCheck = useCallback((nodeId, checked) => {
    const newChecked = checked
      ? [...checkedNodes, nodeId]
      : checkedNodes.filter((id) => id !== nodeId);

    if (onCheck) {
      onCheck(nodeId, checked, newChecked);
    } else {
      setInternalChecked(newChecked);
    }
  }, [checkedNodes, onCheck]);

  const renderNode = (node, level = 0) => {
    const isExpanded = expandedNodes.includes(node.id);
    const isSelected = selectedNodes.includes(node.id);
    const isChecked = checkedNodes.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <TreeNode
        key={node.id}
        id={node.id}
        label={node.label}
        icon={node.icon}
        isExpanded={isExpanded}
        isSelected={isSelected}
        isChecked={isChecked}
        hasChildren={hasChildren}
        level={level}
        disabled={node.disabled}
        data={node}
      >
        {hasChildren && isExpanded && (
          <div className="pl-4">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </TreeNode>
    );
  };

  return (
    <TreeViewContext.Provider
      value={{
        expandedNodes,
        selectedNodes,
        checkedNodes,
        onExpand: handleExpand,
        onSelect: handleSelect,
        onCheck: handleCheck,
        multiSelect,
        checkable,
        showLines,
        draggable,
        onDrop,
      }}
    >
      <div
        className={cn('text-sm', className)}
        role="tree"
        {...props}
      >
        {data ? data.map((node) => renderNode(node)) : children}
      </div>
    </TreeViewContext.Provider>
  );
}

// ============================================================================
// TREE NODE - Individual tree node
// ============================================================================
export function TreeNode({
  children,
  id,
  label,
  icon: CustomIcon,
  isExpanded: controlledExpanded,
  isSelected: controlledSelected,
  isChecked: controlledChecked,
  hasChildren = false,
  level = 0,
  disabled = false,
  actions,
  data,
  className,
  ...props
}) {
  const {
    expandedNodes,
    selectedNodes,
    checkedNodes,
    onExpand,
    onSelect,
    onCheck,
    checkable,
    showLines,
    draggable,
    onDrop,
  } = useTreeView();

  const isExpanded = controlledExpanded ?? expandedNodes.includes(id);
  const isSelected = controlledSelected ?? selectedNodes.includes(id);
  const isChecked = controlledChecked ?? checkedNodes.includes(id);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (hasChildren) {
      onExpand(id);
    }
  };

  const handleSelect = () => {
    if (!disabled) {
      onSelect(id);
    }
  };

  const handleCheck = (e) => {
    e.stopPropagation();
    if (!disabled) {
      onCheck(id, !isChecked);
    }
  };

  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, data }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
    onDrop?.(dragData, { id, data });
  };

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      className={cn('relative', className)}
      {...props}
    >
      {showLines && level > 0 && (
        <div
          className="absolute left-2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"
          style={{ left: `${(level - 1) * 16 + 8}px` }}
        />
      )}

      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer transition-colors',
          isSelected
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800',
          disabled && 'opacity-50 cursor-not-allowed',
          isDragOver && 'ring-2 ring-blue-500'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleSelect}
        draggable={draggable && !disabled}
        onDragStart={handleDragStart}
        onDragOver={draggable ? handleDragOver : undefined}
        onDragLeave={draggable ? handleDragLeave : undefined}
        onDrop={draggable ? handleDrop : undefined}
      >
        {draggable && (
          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
        )}

        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700',
            !hasChildren && 'invisible'
          )}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {checkable && (
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheck}
            disabled={disabled}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        <TreeNodeIcon
          icon={CustomIcon}
          isFolder={hasChildren}
          isExpanded={isExpanded}
          fileName={label}
        />

        <span className="flex-1 truncate">{label}</span>

        {actions && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}

// ============================================================================
// TREE NODE ICON - Node icon
// ============================================================================
export function TreeNodeIcon({
  icon: CustomIcon,
  isFolder = false,
  isExpanded = false,
  fileName,
  className,
}) {
  if (CustomIcon) {
    return <CustomIcon className={cn('w-4 h-4 flex-shrink-0', className)} />;
  }

  if (isFolder) {
    return isExpanded ? (
      <FolderOpen className={cn('w-4 h-4 flex-shrink-0 text-yellow-500', className)} />
    ) : (
      <Folder className={cn('w-4 h-4 flex-shrink-0 text-yellow-500', className)} />
    );
  }

  // Determine icon by file extension
  const ext = fileName?.split('.').pop()?.toLowerCase();
  const iconMap = {
    js: FileCode,
    jsx: FileCode,
    ts: FileCode,
    tsx: FileCode,
    json: FileCode,
    html: FileCode,
    css: FileCode,
    md: FileText,
    txt: FileText,
    pdf: FileText,
    doc: FileText,
    docx: FileText,
    png: Image,
    jpg: Image,
    jpeg: Image,
    gif: Image,
    svg: Image,
    mp4: Film,
    mov: Film,
    avi: Film,
    mp3: Music,
    wav: Music,
    zip: Archive,
    rar: Archive,
    tar: Archive,
  };

  const Icon = iconMap[ext] || File;
  return <Icon className={cn('w-4 h-4 flex-shrink-0 text-gray-400', className)} />;
}

// ============================================================================
// FILE TREE - File explorer tree
// ============================================================================
export function FileTree({
  files,
  selectedFile,
  onSelectFile,
  onContextMenu,
  showHidden = false,
  className,
  ...props
}) {
  const [expanded, setExpanded] = useState([]);

  const filteredFiles = showHidden
    ? files
    : files.filter((f) => !f.name?.startsWith('.'));

  const handleExpand = (nodeId, newExpanded) => {
    setExpanded(newExpanded);
  };

  const handleSelect = (nodeId) => {
    const findNode = (nodes) => {
      for (const node of nodes) {
        if (node.id === nodeId) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    const node = findNode(filteredFiles);
    if (node) {
      onSelectFile?.(node);
    }
  };

  const buildTree = (items) => {
    return items.map((item) => ({
      id: item.id || item.path || item.name,
      label: item.name,
      icon: item.icon,
      children: item.children ? buildTree(item.children) : undefined,
      ...item,
    }));
  };

  return (
    <TreeView
      data={buildTree(filteredFiles)}
      expandedNodes={expanded}
      selectedNodes={selectedFile ? [selectedFile.id || selectedFile.path] : []}
      onExpand={handleExpand}
      onSelect={handleSelect}
      className={className}
      {...props}
    />
  );
}

// ============================================================================
// MENU TREE - Menu/navigation tree
// ============================================================================
export function MenuTree({
  items,
  activeItem,
  onSelect,
  showIcons = true,
  className,
  ...props
}) {
  const [expanded, setExpanded] = useState(() => {
    // Auto-expand parent of active item
    const findParents = (nodes, targetId, parents = []) => {
      for (const node of nodes) {
        if (node.id === targetId) return parents;
        if (node.children) {
          const found = findParents(node.children, targetId, [...parents, node.id]);
          if (found) return found;
        }
      }
      return null;
    };
    return activeItem ? findParents(items, activeItem) || [] : [];
  });

  return (
    <TreeView
      data={items}
      expandedNodes={expanded}
      selectedNodes={activeItem ? [activeItem] : []}
      onExpand={(_, newExpanded) => setExpanded(newExpanded)}
      onSelect={(nodeId) => onSelect?.(nodeId)}
      className={className}
      {...props}
    />
  );
}

// ============================================================================
// CHECKBOX TREE - Tree with checkboxes
// ============================================================================
export function CheckboxTree({
  data,
  checkedNodes = [],
  onCheck,
  cascadeCheck = true,
  className,
  ...props
}) {
  const [checked, setChecked] = useState(checkedNodes);
  const [expanded, setExpanded] = useState([]);

  const getAllDescendants = (node) => {
    const descendants = [node.id];
    if (node.children) {
      node.children.forEach((child) => {
        descendants.push(...getAllDescendants(child));
      });
    }
    return descendants;
  };

  const findNode = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleCheck = (nodeId, isChecked, newChecked) => {
    if (cascadeCheck) {
      const node = findNode(data, nodeId);
      if (node) {
        const descendants = getAllDescendants(node);
        if (isChecked) {
          newChecked = [...new Set([...newChecked, ...descendants])];
        } else {
          newChecked = newChecked.filter((id) => !descendants.includes(id));
        }
      }
    }

    setChecked(newChecked);
    onCheck?.(nodeId, isChecked, newChecked);
  };

  return (
    <TreeView
      data={data}
      checkable
      checkedNodes={checked}
      expandedNodes={expanded}
      onExpand={(_, newExpanded) => setExpanded(newExpanded)}
      onCheck={handleCheck}
      className={className}
      {...props}
    />
  );
}

// ============================================================================
// TREE NODE ACTIONS - Node action buttons
// ============================================================================
export function TreeNodeActions({
  onAdd,
  onEdit,
  onDelete,
  onCopy,
  className,
  ...props
}) {
  return (
    <div
      className={cn('flex items-center gap-1', className)}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Add"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Copy"
        >
          <Copy className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// EXPANDABLE LIST - Simple expandable list
// ============================================================================
export function ExpandableList({
  items,
  renderItem,
  keyExtractor = (item, index) => item.id || index,
  className,
  ...props
}) {
  const [expanded, setExpanded] = useState([]);

  const toggleExpand = (key) => {
    setExpanded((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className={cn('space-y-1', className)} {...props}>
      {items.map((item, index) => {
        const key = keyExtractor(item, index);
        const isExpanded = expanded.includes(key);
        const hasChildren = item.children && item.children.length > 0;

        return (
          <div key={key}>
            <div
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => hasChildren && toggleExpand(key)}
            >
              {hasChildren && (
                <ChevronRight
                  className={cn(
                    'w-4 h-4 transition-transform',
                    isExpanded && 'rotate-90'
                  )}
                />
              )}
              {renderItem(item, index, isExpanded)}
            </div>
            {hasChildren && isExpanded && (
              <div className="ml-4 pl-2 border-l border-gray-200 dark:border-gray-700">
                <ExpandableList
                  items={item.children}
                  renderItem={renderItem}
                  keyExtractor={keyExtractor}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TreeView;
