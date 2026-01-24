import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Batch 94: Skeleton Component
 *
 * Loading placeholder components for content loading states.
 *
 * Exports:
 * - Skeleton: Basic skeleton element
 * - SkeletonText: Text placeholder
 * - SkeletonAvatar: Avatar placeholder
 * - SkeletonButton: Button placeholder
 * - SkeletonInput: Input placeholder
 * - SkeletonCard: Card placeholder
 * - SkeletonTable: Table placeholder
 * - SkeletonList: List placeholder
 * - SkeletonArticle: Article/blog placeholder
 * - SkeletonProfile: Profile placeholder
 * - SkeletonDashboard: Dashboard placeholder
 * - SkeletonForm: Form placeholder
 */

// ============================================================================
// SKELETON - Basic skeleton element
// ============================================================================
export function Skeleton({
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse',
  className,
  style,
  ...props
}) {
  const variantClasses = {
    rectangular: 'rounded',
    rounded: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: width,
        height: height || (variant === 'text' ? '1em' : undefined),
        ...style,
      }}
      {...props}
    />
  );
}

// ============================================================================
// SKELETON TEXT - Text placeholder
// ============================================================================
export function SkeletonText({
  lines = 3,
  lastLineWidth = '60%',
  spacing = 'normal',
  animation = 'pulse',
  className,
  ...props
}) {
  const spacingClasses = {
    tight: 'space-y-1',
    normal: 'space-y-2',
    loose: 'space-y-3',
  };

  return (
    <div className={cn(spacingClasses[spacing], className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height="1em"
          animation={animation}
          style={{
            width: index === lines - 1 ? lastLineWidth : '100%',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// SKELETON AVATAR - Avatar placeholder
// ============================================================================
export function SkeletonAvatar({
  size = 'md',
  animation = 'pulse',
  className,
  ...props
}) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };

  return (
    <Skeleton
      variant="circular"
      animation={animation}
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  );
}

// ============================================================================
// SKELETON BUTTON - Button placeholder
// ============================================================================
export function SkeletonButton({
  size = 'md',
  fullWidth = false,
  animation = 'pulse',
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  };

  return (
    <Skeleton
      variant="rounded"
      animation={animation}
      className={cn(
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    />
  );
}

// ============================================================================
// SKELETON INPUT - Input placeholder
// ============================================================================
export function SkeletonInput({
  size = 'md',
  label = false,
  animation = 'pulse',
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {label && (
        <Skeleton
          variant="text"
          width="30%"
          height="0.875rem"
          animation={animation}
        />
      )}
      <Skeleton
        variant="rounded"
        animation={animation}
        className={cn('w-full', sizeClasses[size])}
      />
    </div>
  );
}

// ============================================================================
// SKELETON CARD - Card placeholder
// ============================================================================
export function SkeletonCard({
  hasImage = true,
  imageHeight = 200,
  lines = 3,
  hasActions = false,
  animation = 'pulse',
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
        className
      )}
      {...props}
    >
      {hasImage && (
        <Skeleton
          variant="rectangular"
          height={imageHeight}
          animation={animation}
          className="w-full rounded-none"
        />
      )}
      <div className="p-4 space-y-4">
        <Skeleton
          variant="text"
          width="80%"
          height="1.5rem"
          animation={animation}
        />
        <SkeletonText lines={lines} animation={animation} />
        {hasActions && (
          <div className="flex gap-2 pt-2">
            <SkeletonButton size="sm" animation={animation} />
            <SkeletonButton size="sm" animation={animation} />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SKELETON TABLE - Table placeholder
// ============================================================================
export function SkeletonTable({
  rows = 5,
  columns = 4,
  hasHeader = true,
  animation = 'pulse',
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
        className
      )}
      {...props}
    >
      <table className="w-full">
        {hasHeader && (
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <Skeleton
                    variant="text"
                    width="60%"
                    height="0.875rem"
                    animation={animation}
                  />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <Skeleton
                    variant="text"
                    width={colIndex === 0 ? '70%' : '50%'}
                    height="1rem"
                    animation={animation}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// SKELETON LIST - List placeholder
// ============================================================================
export function SkeletonList({
  items = 5,
  hasAvatar = true,
  hasSecondary = true,
  hasAction = false,
  animation = 'pulse',
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800',
        className
      )}
      {...props}
    >
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-4">
          {hasAvatar && (
            <SkeletonAvatar size="md" animation={animation} />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton
              variant="text"
              width="60%"
              height="1rem"
              animation={animation}
            />
            {hasSecondary && (
              <Skeleton
                variant="text"
                width="40%"
                height="0.875rem"
                animation={animation}
              />
            )}
          </div>
          {hasAction && (
            <Skeleton
              variant="rounded"
              width={32}
              height={32}
              animation={animation}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// SKELETON ARTICLE - Article/blog placeholder
// ============================================================================
export function SkeletonArticle({
  hasImage = true,
  hasMeta = true,
  paragraphs = 3,
  animation = 'pulse',
  className,
  ...props
}) {
  return (
    <article className={cn('space-y-6', className)} {...props}>
      {/* Title */}
      <div className="space-y-2">
        <Skeleton
          variant="text"
          width="90%"
          height="2rem"
          animation={animation}
        />
        <Skeleton
          variant="text"
          width="70%"
          height="2rem"
          animation={animation}
        />
      </div>

      {/* Meta */}
      {hasMeta && (
        <div className="flex items-center gap-4">
          <SkeletonAvatar size="sm" animation={animation} />
          <div className="space-y-1">
            <Skeleton
              variant="text"
              width={120}
              height="0.875rem"
              animation={animation}
            />
            <Skeleton
              variant="text"
              width={80}
              height="0.75rem"
              animation={animation}
            />
          </div>
        </div>
      )}

      {/* Featured Image */}
      {hasImage && (
        <Skeleton
          variant="rounded"
          height={300}
          animation={animation}
          className="w-full"
        />
      )}

      {/* Content */}
      <div className="space-y-4">
        {Array.from({ length: paragraphs }).map((_, index) => (
          <SkeletonText
            key={index}
            lines={4}
            lastLineWidth="80%"
            animation={animation}
          />
        ))}
      </div>
    </article>
  );
}

// ============================================================================
// SKELETON PROFILE - Profile placeholder
// ============================================================================
export function SkeletonProfile({
  hasCover = true,
  hasStats = true,
  hasBio = true,
  animation = 'pulse',
  className,
  ...props
}) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {/* Cover */}
      {hasCover && (
        <Skeleton
          variant="rounded"
          height={150}
          animation={animation}
          className="w-full"
        />
      )}

      {/* Avatar and Name */}
      <div className="flex items-end gap-4 -mt-12 px-4">
        <SkeletonAvatar size="2xl" animation={animation} className="ring-4 ring-white dark:ring-gray-900" />
        <div className="flex-1 pb-2 space-y-2">
          <Skeleton
            variant="text"
            width="40%"
            height="1.5rem"
            animation={animation}
          />
          <Skeleton
            variant="text"
            width="25%"
            height="1rem"
            animation={animation}
          />
        </div>
      </div>

      {/* Bio */}
      {hasBio && (
        <div className="px-4">
          <SkeletonText lines={2} lastLineWidth="70%" animation={animation} />
        </div>
      )}

      {/* Stats */}
      {hasStats && (
        <div className="flex gap-6 px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton
                variant="text"
                width={40}
                height="1.25rem"
                animation={animation}
              />
              <Skeleton
                variant="text"
                width={60}
                height="0.75rem"
                animation={animation}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SKELETON DASHBOARD - Dashboard placeholder
// ============================================================================
export function SkeletonDashboard({
  animation = 'pulse',
  className,
  ...props
}) {
  return (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2"
          >
            <Skeleton
              variant="text"
              width="60%"
              height="0.875rem"
              animation={animation}
            />
            <Skeleton
              variant="text"
              width="40%"
              height="2rem"
              animation={animation}
            />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <Skeleton
            variant="text"
            width="30%"
            height="1.25rem"
            animation={animation}
            className="mb-4"
          />
          <Skeleton
            variant="rounded"
            height={200}
            animation={animation}
            className="w-full"
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <Skeleton
            variant="text"
            width="30%"
            height="1.25rem"
            animation={animation}
            className="mb-4"
          />
          <Skeleton
            variant="rounded"
            height={200}
            animation={animation}
            className="w-full"
          />
        </div>
      </div>

      {/* Table */}
      <SkeletonTable rows={5} columns={5} animation={animation} />
    </div>
  );
}

// ============================================================================
// SKELETON FORM - Form placeholder
// ============================================================================
export function SkeletonForm({
  fields = 4,
  hasSubmit = true,
  columns = 1,
  animation = 'pulse',
  className,
  ...props
}) {
  return (
    <div className={cn('space-y-6', className)} {...props}>
      <div className={cn(
        'grid gap-4',
        columns === 2 && 'grid-cols-1 md:grid-cols-2'
      )}>
        {Array.from({ length: fields }).map((_, index) => (
          <SkeletonInput key={index} label animation={animation} />
        ))}
      </div>

      {hasSubmit && (
        <div className="flex gap-3 pt-4">
          <SkeletonButton size="md" animation={animation} />
          <SkeletonButton size="md" animation={animation} />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SKELETON IMAGE - Image placeholder
// ============================================================================
export function SkeletonImage({
  aspectRatio = '16/9',
  animation = 'pulse',
  className,
  ...props
}) {
  return (
    <Skeleton
      variant="rounded"
      animation={animation}
      className={cn('w-full', className)}
      style={{ aspectRatio }}
      {...props}
    />
  );
}

// ============================================================================
// SKELETON GRID - Grid of skeleton cards
// ============================================================================
export function SkeletonGrid({
  items = 6,
  columns = 3,
  gap = 'md',
  children,
  animation = 'pulse',
  className,
  ...props
}) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid',
        colClasses[columns],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {Array.from({ length: items }).map((_, index) => (
        children ? (
          <React.Fragment key={index}>{children}</React.Fragment>
        ) : (
          <SkeletonCard key={index} animation={animation} />
        )
      ))}
    </div>
  );
}

// ============================================================================
// SKELETON COMMENT - Comment placeholder
// ============================================================================
export function SkeletonComment({
  hasReplies = false,
  replyCount = 2,
  animation = 'pulse',
  className,
  ...props
}) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      <div className="flex gap-3">
        <SkeletonAvatar size="md" animation={animation} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton
              variant="text"
              width={120}
              height="1rem"
              animation={animation}
            />
            <Skeleton
              variant="text"
              width={60}
              height="0.75rem"
              animation={animation}
            />
          </div>
          <SkeletonText lines={2} lastLineWidth="80%" animation={animation} />
        </div>
      </div>

      {hasReplies && (
        <div className="ml-12 space-y-4">
          {Array.from({ length: replyCount }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <SkeletonAvatar size="sm" animation={animation} />
              <div className="flex-1 space-y-2">
                <Skeleton
                  variant="text"
                  width={100}
                  height="0.875rem"
                  animation={animation}
                />
                <SkeletonText lines={1} animation={animation} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Skeleton;
