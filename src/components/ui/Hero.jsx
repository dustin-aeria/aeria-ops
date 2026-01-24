import React from 'react';
import { cn } from '../../lib/utils';
import { ArrowRight, Play, ChevronRight } from 'lucide-react';

/**
 * Batch 99: Hero/Header Component
 *
 * Hero section and page header components.
 *
 * Exports:
 * - Hero: Basic hero section
 * - HeroSplit: Hero with image/content split
 * - HeroCentered: Centered hero content
 * - HeroWithImage: Hero with background image
 * - HeroWithVideo: Hero with video background
 * - HeroGradient: Hero with gradient background
 * - PageHeader: Standard page header
 * - PageHeaderWithBreadcrumb: Page header with breadcrumbs
 * - PageHeaderWithActions: Page header with action buttons
 * - SectionHeader: Section title and description
 * - FeatureHeader: Feature/product header
 */

// ============================================================================
// HERO - Basic hero section
// ============================================================================
export function Hero({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  badge,
  align = 'center',
  size = 'md',
  className,
  children,
  ...props
}) {
  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  const sizeClasses = {
    sm: {
      container: 'py-12 md:py-16',
      title: 'text-3xl md:text-4xl',
      subtitle: 'text-lg md:text-xl',
      description: 'text-base max-w-xl',
    },
    md: {
      container: 'py-16 md:py-24',
      title: 'text-4xl md:text-5xl',
      subtitle: 'text-xl md:text-2xl',
      description: 'text-lg max-w-2xl',
    },
    lg: {
      container: 'py-24 md:py-32',
      title: 'text-5xl md:text-6xl',
      subtitle: 'text-2xl md:text-3xl',
      description: 'text-xl max-w-3xl',
    },
  };

  return (
    <section
      className={cn(
        'px-4 sm:px-6 lg:px-8',
        sizeClasses[size].container,
        className
      )}
      {...props}
    >
      <div className={cn('flex flex-col', alignClasses[align])}>
        {badge && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 mb-4">
            {badge}
          </span>
        )}

        {subtitle && (
          <p className={cn(
            'font-semibold text-blue-600 dark:text-blue-400 mb-2',
            sizeClasses[size].subtitle
          )}>
            {subtitle}
          </p>
        )}

        <h1 className={cn(
          'font-bold text-gray-900 dark:text-white tracking-tight',
          sizeClasses[size].title
        )}>
          {title}
        </h1>

        {description && (
          <p className={cn(
            'mt-6 text-gray-600 dark:text-gray-400',
            sizeClasses[size].description,
            align === 'center' && 'mx-auto'
          )}>
            {description}
          </p>
        )}

        {(primaryAction || secondaryAction) && (
          <div className={cn(
            'mt-8 flex flex-wrap gap-4',
            align === 'center' && 'justify-center'
          )}>
            {primaryAction}
            {secondaryAction}
          </div>
        )}

        {children}
      </div>
    </section>
  );
}

// ============================================================================
// HERO SPLIT - Hero with image/content split
// ============================================================================
export function HeroSplit({
  title,
  description,
  primaryAction,
  secondaryAction,
  image,
  imageAlt = '',
  imagePosition = 'right',
  badge,
  features,
  className,
  ...props
}) {
  return (
    <section
      className={cn('py-16 md:py-24 px-4 sm:px-6 lg:px-8', className)}
      {...props}
    >
      <div className={cn(
        'max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center',
        imagePosition === 'left' && 'md:grid-flow-col-dense'
      )}>
        <div className={imagePosition === 'left' ? 'md:col-start-2' : ''}>
          {badge && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 mb-4">
              {badge}
            </span>
          )}

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h1>

          {description && (
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}

          {features && (
            <ul className="mt-6 space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <ChevronRight className="w-5 h-5 text-blue-500" />
                  {feature}
                </li>
              ))}
            </ul>
          )}

          {(primaryAction || secondaryAction) && (
            <div className="mt-8 flex flex-wrap gap-4">
              {primaryAction}
              {secondaryAction}
            </div>
          )}
        </div>

        <div className={imagePosition === 'left' ? 'md:col-start-1' : ''}>
          <img
            src={image}
            alt={imageAlt}
            className="rounded-xl shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HERO CENTERED - Centered hero content
// ============================================================================
export function HeroCentered({
  title,
  description,
  primaryAction,
  secondaryAction,
  announcement,
  announcementLink,
  className,
  ...props
}) {
  return (
    <section
      className={cn('py-24 md:py-32 px-4 sm:px-6 lg:px-8', className)}
      {...props}
    >
      <div className="max-w-4xl mx-auto text-center">
        {announcement && (
          <a
            href={announcementLink}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 mb-6"
          >
            {announcement}
            <ArrowRight className="w-4 h-4" />
          </a>
        )}

        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
          {title}
        </h1>

        {description && (
          <p className="mt-6 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {description}
          </p>
        )}

        {(primaryAction || secondaryAction) && (
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            {primaryAction}
            {secondaryAction}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// HERO WITH IMAGE - Hero with background image
// ============================================================================
export function HeroWithImage({
  title,
  description,
  primaryAction,
  secondaryAction,
  backgroundImage,
  overlay = true,
  overlayOpacity = 60,
  align = 'center',
  minHeight = '80vh',
  className,
  ...props
}) {
  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <section
      className={cn('relative px-4 sm:px-6 lg:px-8', className)}
      style={{ minHeight }}
      {...props}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {overlay && (
        <div
          className="absolute inset-0 bg-gray-900"
          style={{ opacity: overlayOpacity / 100 }}
        />
      )}

      <div className={cn(
        'relative z-10 h-full flex flex-col justify-center py-24',
        alignClasses[align]
      )}>
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            {title}
          </h1>

          {description && (
            <p className={cn(
              'mt-6 text-xl text-gray-200 max-w-2xl',
              align === 'center' && 'mx-auto'
            )}>
              {description}
            </p>
          )}

          {(primaryAction || secondaryAction) && (
            <div className={cn(
              'mt-10 flex flex-wrap gap-4',
              align === 'center' && 'justify-center'
            )}>
              {primaryAction}
              {secondaryAction}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HERO WITH VIDEO - Hero with video background
// ============================================================================
export function HeroWithVideo({
  title,
  description,
  primaryAction,
  secondaryAction,
  videoSrc,
  videoPoster,
  overlay = true,
  overlayOpacity = 50,
  className,
  ...props
}) {
  return (
    <section
      className={cn('relative min-h-[80vh] flex items-center px-4 sm:px-6 lg:px-8', className)}
      {...props}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={videoPoster}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {overlay && (
        <div
          className="absolute inset-0 bg-gray-900"
          style={{ opacity: overlayOpacity / 100 }}
        />
      )}

      <div className="relative z-10 max-w-4xl mx-auto text-center py-24">
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
          {title}
        </h1>

        {description && (
          <p className="mt-6 text-xl text-gray-200 max-w-2xl mx-auto">
            {description}
          </p>
        )}

        {(primaryAction || secondaryAction) && (
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            {primaryAction}
            {secondaryAction}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// HERO GRADIENT - Hero with gradient background
// ============================================================================
export function HeroGradient({
  title,
  description,
  primaryAction,
  secondaryAction,
  gradient = 'blue-purple',
  className,
  ...props
}) {
  const gradientClasses = {
    'blue-purple': 'from-blue-600 via-purple-600 to-pink-500',
    'green-blue': 'from-green-500 via-teal-500 to-blue-500',
    'orange-red': 'from-orange-500 via-red-500 to-pink-500',
    'purple-pink': 'from-purple-600 via-pink-500 to-red-500',
    dark: 'from-gray-900 via-gray-800 to-gray-900',
  };

  return (
    <section
      className={cn(
        'py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r',
        gradientClasses[gradient],
        className
      )}
      {...props}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
          {title}
        </h1>

        {description && (
          <p className="mt-6 text-xl text-white/80 max-w-2xl mx-auto">
            {description}
          </p>
        )}

        {(primaryAction || secondaryAction) && (
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            {primaryAction}
            {secondaryAction}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// PAGE HEADER - Standard page header
// ============================================================================
export function PageHeader({
  title,
  description,
  icon: Icon,
  className,
  children,
  ...props
}) {
  return (
    <div className={cn('mb-8', className)} {...props}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ============================================================================
// PAGE HEADER WITH BREADCRUMB - Page header with breadcrumbs
// ============================================================================
export function PageHeaderWithBreadcrumb({
  title,
  description,
  breadcrumbs = [],
  className,
  children,
  ...props
}) {
  return (
    <div className={cn('mb-8', className)} {...props}>
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm mb-4">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-gray-900 dark:text-white font-medium">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>

      {description && (
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}

      {children}
    </div>
  );
}

// ============================================================================
// PAGE HEADER WITH ACTIONS - Page header with action buttons
// ============================================================================
export function PageHeaderWithActions({
  title,
  description,
  actions,
  icon: Icon,
  tabs,
  className,
  ...props
}) {
  return (
    <div className={cn('mb-8', className)} {...props}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      {tabs && (
        <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
          {tabs}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SECTION HEADER - Section title and description
// ============================================================================
export function SectionHeader({
  title,
  subtitle,
  description,
  align = 'left',
  action,
  className,
  ...props
}) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={cn('mb-8', alignClasses[align], className)} {...props}>
      {subtitle && (
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
          {subtitle}
        </p>
      )}

      <div className={cn(
        'flex items-center gap-4',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end'
      )}>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        {action && !description && <div>{action}</div>}
      </div>

      {description && (
        <p className={cn(
          'mt-4 text-lg text-gray-600 dark:text-gray-400',
          align === 'center' && 'max-w-2xl mx-auto'
        )}>
          {description}
        </p>
      )}

      {action && description && (
        <div className={cn('mt-4', align === 'center' && 'flex justify-center')}>
          {action}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FEATURE HEADER - Feature/product header
// ============================================================================
export function FeatureHeader({
  title,
  description,
  icon: Icon,
  iconColor = 'blue',
  badge,
  action,
  className,
  ...props
}) {
  const iconColorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400',
  };

  return (
    <div className={cn('text-center mb-12', className)} {...props}>
      {Icon && (
        <div
          className={cn(
            'w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center',
            iconColorClasses[iconColor]
          )}
        >
          <Icon className="w-8 h-8" />
        </div>
      )}

      {badge && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 mb-4">
          {badge}
        </span>
      )}

      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}

export default Hero;
