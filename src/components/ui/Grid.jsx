import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Batch 103: Grid/Layout Component
 *
 * Grid and layout utility components.
 *
 * Exports:
 * - Grid: Basic CSS grid
 * - GridItem: Grid child with span
 * - Flex: Flexbox container
 * - Stack: Vertical stack
 * - HStack: Horizontal stack
 * - Center: Center content
 * - Container: Max-width container
 * - Spacer: Flexible spacer
 * - Divider: Layout divider
 * - AspectRatio: Aspect ratio container
 * - Masonry: Masonry grid layout
 * - ResponsiveGrid: Auto-responsive grid
 */

// ============================================================================
// GRID - Basic CSS grid
// ============================================================================
export function Grid({
  children,
  columns = 1,
  rows,
  gap = 4,
  rowGap,
  columnGap,
  alignItems,
  justifyItems,
  placeItems,
  className,
  ...props
}) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
    auto: 'grid-cols-[repeat(auto-fill,minmax(250px,1fr))]',
  };

  const rowClasses = {
    1: 'grid-rows-1',
    2: 'grid-rows-2',
    3: 'grid-rows-3',
    4: 'grid-rows-4',
    6: 'grid-rows-6',
  };

  const gapClasses = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const justifyClasses = {
    start: 'justify-items-start',
    center: 'justify-items-center',
    end: 'justify-items-end',
    stretch: 'justify-items-stretch',
  };

  return (
    <div
      className={cn(
        'grid',
        typeof columns === 'number' || columns === 'auto' ? columnClasses[columns] : columns,
        rows && rowClasses[rows],
        gapClasses[gap],
        alignItems && alignClasses[alignItems],
        justifyItems && justifyClasses[justifyItems],
        placeItems && `place-items-${placeItems}`,
        className
      )}
      style={{
        rowGap: rowGap !== undefined ? `${rowGap * 4}px` : undefined,
        columnGap: columnGap !== undefined ? `${columnGap * 4}px` : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// GRID ITEM - Grid child with span
// ============================================================================
export function GridItem({
  children,
  colSpan,
  rowSpan,
  colStart,
  colEnd,
  rowStart,
  rowEnd,
  className,
  ...props
}) {
  const colSpanClasses = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    full: 'col-span-full',
  };

  const rowSpanClasses = {
    1: 'row-span-1',
    2: 'row-span-2',
    3: 'row-span-3',
    4: 'row-span-4',
    6: 'row-span-6',
    full: 'row-span-full',
  };

  return (
    <div
      className={cn(
        colSpan && colSpanClasses[colSpan],
        rowSpan && rowSpanClasses[rowSpan],
        colStart && `col-start-${colStart}`,
        colEnd && `col-end-${colEnd}`,
        rowStart && `row-start-${rowStart}`,
        rowEnd && `row-end-${rowEnd}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// FLEX - Flexbox container
// ============================================================================
export function Flex({
  children,
  direction = 'row',
  wrap = false,
  gap = 0,
  alignItems = 'stretch',
  justifyContent = 'start',
  inline = false,
  className,
  ...props
}) {
  const directionClasses = {
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    col: 'flex-col',
    column: 'flex-col',
    'col-reverse': 'flex-col-reverse',
    'column-reverse': 'flex-col-reverse',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const gapClasses = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12',
  };

  return (
    <div
      className={cn(
        inline ? 'inline-flex' : 'flex',
        directionClasses[direction],
        wrap && (wrap === true ? 'flex-wrap' : `flex-${wrap}`),
        gapClasses[gap],
        alignClasses[alignItems],
        justifyClasses[justifyContent],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// STACK - Vertical stack
// ============================================================================
export function Stack({
  children,
  gap = 4,
  align = 'stretch',
  justify = 'start',
  divider,
  className,
  ...props
}) {
  const items = React.Children.toArray(children);

  return (
    <Flex
      direction="col"
      gap={divider ? 0 : gap}
      alignItems={align}
      justifyContent={justify}
      className={className}
      {...props}
    >
      {divider
        ? items.map((child, index) => (
            <React.Fragment key={index}>
              {index > 0 && <div className="py-2">{divider}</div>}
              {child}
            </React.Fragment>
          ))
        : children}
    </Flex>
  );
}

// ============================================================================
// HSTACK - Horizontal stack
// ============================================================================
export function HStack({
  children,
  gap = 4,
  align = 'center',
  justify = 'start',
  wrap = false,
  divider,
  className,
  ...props
}) {
  const items = React.Children.toArray(children);

  return (
    <Flex
      direction="row"
      gap={divider ? 0 : gap}
      alignItems={align}
      justifyContent={justify}
      wrap={wrap}
      className={className}
      {...props}
    >
      {divider
        ? items.map((child, index) => (
            <React.Fragment key={index}>
              {index > 0 && <div className="px-2">{divider}</div>}
              {child}
            </React.Fragment>
          ))
        : children}
    </Flex>
  );
}

// ============================================================================
// CENTER - Center content
// ============================================================================
export function Center({
  children,
  inline = false,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        inline ? 'inline-flex' : 'flex',
        'items-center justify-center',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// CONTAINER - Max-width container
// ============================================================================
export function Container({
  children,
  size = 'lg',
  padding = true,
  center = true,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
    prose: 'max-w-prose',
  };

  return (
    <div
      className={cn(
        'w-full',
        sizeClasses[size],
        center && 'mx-auto',
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// SPACER - Flexible spacer
// ============================================================================
export function Spacer({
  size,
  axis = 'horizontal',
  className,
  ...props
}) {
  const sizeClasses = {
    xs: axis === 'horizontal' ? 'w-1' : 'h-1',
    sm: axis === 'horizontal' ? 'w-2' : 'h-2',
    md: axis === 'horizontal' ? 'w-4' : 'h-4',
    lg: axis === 'horizontal' ? 'w-8' : 'h-8',
    xl: axis === 'horizontal' ? 'w-16' : 'h-16',
  };

  if (size) {
    return (
      <div
        className={cn(sizeClasses[size], className)}
        {...props}
      />
    );
  }

  // Flexible spacer
  return (
    <div
      className={cn('flex-1', className)}
      {...props}
    />
  );
}

// ============================================================================
// ASPECT RATIO - Aspect ratio container
// ============================================================================
export function AspectRatio({
  children,
  ratio = '16/9',
  className,
  ...props
}) {
  const ratioValues = {
    '1/1': '1',
    '4/3': '4/3',
    '16/9': '16/9',
    '21/9': '21/9',
    '3/2': '3/2',
    '2/3': '2/3',
    square: '1',
    video: '16/9',
    portrait: '3/4',
    landscape: '4/3',
  };

  return (
    <div
      className={cn('relative', className)}
      style={{ aspectRatio: ratioValues[ratio] || ratio }}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// MASONRY - Masonry grid layout
// ============================================================================
export function Masonry({
  children,
  columns = 3,
  gap = 4,
  className,
  ...props
}) {
  const items = React.Children.toArray(children);

  const columnArrays = Array.from({ length: columns }, () => []);
  items.forEach((item, index) => {
    columnArrays[index % columns].push(item);
  });

  const gapClasses = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div
      className={cn('flex', gapClasses[gap], className)}
      {...props}
    >
      {columnArrays.map((column, colIndex) => (
        <div key={colIndex} className={cn('flex-1 flex flex-col', gapClasses[gap])}>
          {column}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// RESPONSIVE GRID - Auto-responsive grid
// ============================================================================
export function ResponsiveGrid({
  children,
  minChildWidth = 250,
  gap = 4,
  className,
  ...props
}) {
  const gapClasses = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div
      className={cn('grid', gapClasses[gap], className)}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minChildWidth}px, 1fr))`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// WRAP - Flex wrap container
// ============================================================================
export function Wrap({
  children,
  gap = 2,
  align = 'center',
  justify = 'start',
  className,
  ...props
}) {
  return (
    <Flex
      wrap
      gap={gap}
      alignItems={align}
      justifyContent={justify}
      className={className}
      {...props}
    >
      {children}
    </Flex>
  );
}

// ============================================================================
// SIMPLE GRID - Simple responsive grid
// ============================================================================
export function SimpleGrid({
  children,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 4,
  className,
  ...props
}) {
  const colClasses = [];

  if (typeof columns === 'number') {
    colClasses.push(`grid-cols-${columns}`);
  } else {
    if (columns.base) colClasses.push(`grid-cols-${columns.base}`);
    if (columns.sm) colClasses.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) colClasses.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) colClasses.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) colClasses.push(`xl:grid-cols-${columns.xl}`);
  }

  const gapClasses = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div
      className={cn('grid', ...colClasses, gapClasses[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// BOX - Basic box component
// ============================================================================
export function Box({
  children,
  as: Component = 'div',
  className,
  ...props
}) {
  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
}

// ============================================================================
// ABSOLUTE CENTER - Absolute positioned center
// ============================================================================
export function AbsoluteCenter({
  children,
  axis = 'both',
  className,
  ...props
}) {
  const axisClasses = {
    horizontal: 'left-1/2 -translate-x-1/2',
    vertical: 'top-1/2 -translate-y-1/2',
    both: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div
      className={cn('absolute', axisClasses[axis], className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// HIDE - Conditionally hide content
// ============================================================================
export function Hide({
  children,
  below,
  above,
  className,
  ...props
}) {
  const hideClasses = [];

  if (below) {
    const breakpoints = { sm: 'sm:block', md: 'md:block', lg: 'lg:block', xl: 'xl:block' };
    hideClasses.push('hidden', breakpoints[below]);
  }

  if (above) {
    const breakpoints = { sm: 'sm:hidden', md: 'md:hidden', lg: 'lg:hidden', xl: 'xl:hidden' };
    hideClasses.push(breakpoints[above]);
  }

  return (
    <div className={cn(...hideClasses, className)} {...props}>
      {children}
    </div>
  );
}

// ============================================================================
// SHOW - Conditionally show content
// ============================================================================
export function Show({
  children,
  below,
  above,
  className,
  ...props
}) {
  const showClasses = [];

  if (below) {
    const breakpoints = { sm: 'sm:hidden', md: 'md:hidden', lg: 'lg:hidden', xl: 'xl:hidden' };
    showClasses.push('block', breakpoints[below]);
  }

  if (above) {
    const breakpoints = { sm: 'hidden sm:block', md: 'hidden md:block', lg: 'hidden lg:block', xl: 'hidden xl:block' };
    showClasses.push(breakpoints[above]);
  }

  return (
    <div className={cn(...showClasses, className)} {...props}>
      {children}
    </div>
  );
}

export default Grid;
