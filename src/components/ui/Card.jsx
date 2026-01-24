/**
 * Card Component
 * Versatile card containers for content display
 *
 * @location src/components/ui/Card.jsx
 */

import React from 'react'
import { ChevronRight, MoreVertical, ExternalLink } from 'lucide-react'

// ============================================
// BASE CARD
// ============================================

/**
 * Base card component
 */
export function Card({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'sm',
  rounded = 'lg',
  border = true,
  hoverable = false,
  clickable = false,
  onClick,
  className = ''
}) {
  const variantClasses = {
    default: 'bg-white',
    muted: 'bg-gray-50',
    primary: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200'
  }

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl'
  }

  const Component = clickable || onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={`
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${roundedClasses[rounded]}
        ${border ? 'border border-gray-200' : ''}
        ${hoverable ? 'transition-shadow hover:shadow-md' : ''}
        ${clickable || onClick ? 'cursor-pointer text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  )
}

// ============================================
// CARD PARTS
// ============================================

/**
 * Card header
 */
export function CardHeader({
  children,
  title,
  subtitle,
  action,
  icon: Icon,
  className = ''
}) {
  if (children) {
    return (
      <div className={`px-4 py-3 border-b border-gray-200 ${className}`}>
        {children}
      </div>
    )
  }

  return (
    <div className={`px-4 py-3 border-b border-gray-200 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

/**
 * Card body
 */
export function CardBody({ children, className = '' }) {
  return <div className={`p-4 ${className}`}>{children}</div>
}

/**
 * Card footer
 */
export function CardFooter({
  children,
  className = '',
  align = 'right'
}) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  }

  return (
    <div className={`px-4 py-3 border-t border-gray-200 flex items-center gap-3 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  )
}

// ============================================
// CONTENT CARD
// ============================================

/**
 * Card with structured content
 */
export function ContentCard({
  title,
  subtitle,
  description,
  image,
  imageAlt,
  imagePosition = 'top',
  footer,
  className = ''
}) {
  const isHorizontal = imagePosition === 'left' || imagePosition === 'right'

  return (
    <Card className={`overflow-hidden ${isHorizontal ? 'flex' : ''} ${className}`}>
      {image && (imagePosition === 'top' || imagePosition === 'left') && (
        <div className={isHorizontal ? 'w-1/3 flex-shrink-0' : ''}>
          <img
            src={image}
            alt={imageAlt || title}
            className={`w-full h-48 object-cover ${isHorizontal ? 'h-full' : ''}`}
          />
        </div>
      )}
      <div className={`flex-1 ${isHorizontal ? '' : ''}`}>
        <CardBody>
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {description && <p className="text-gray-600 mt-2">{description}</p>}
        </CardBody>
        {footer && <CardFooter align="between">{footer}</CardFooter>}
      </div>
      {image && imagePosition === 'right' && (
        <div className="w-1/3 flex-shrink-0">
          <img
            src={image}
            alt={imageAlt || title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </Card>
  )
}

// ============================================
// STATS CARD
// ============================================

/**
 * Card for displaying statistics
 */
export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'bg-blue-100 text-blue-600',
  footer,
  className = ''
}) {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-500'
  }

  return (
    <Card className={className}>
      <CardBody>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className={`mt-1 text-sm ${changeColors[changeType]}`}>
                {change}
              </p>
            )}
          </div>
          {Icon && (
            <div className={`p-3 rounded-lg ${iconColor}`}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
        {footer && <div className="mt-4 pt-4 border-t border-gray-200">{footer}</div>}
      </CardBody>
    </Card>
  )
}

// ============================================
// ACTION CARD
// ============================================

/**
 * Card with primary action
 */
export function ActionCard({
  title,
  description,
  icon: Icon,
  action,
  actionLabel = 'View',
  onClick,
  className = ''
}) {
  return (
    <Card
      hoverable
      clickable
      onClick={onClick}
      className={`group ${className}`}
    >
      <CardBody>
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </CardBody>
    </Card>
  )
}

// ============================================
// LINK CARD
// ============================================

/**
 * Card that links to external resource
 */
export function LinkCard({
  title,
  description,
  href,
  icon: Icon,
  external = false,
  className = ''
}) {
  const Component = external ? 'a' : 'a'
  const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <Card
      hoverable
      className={`group ${className}`}
      padding="none"
    >
      <Component
        href={href}
        {...linkProps}
        className="block p-4"
      >
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
              <Icon className="h-5 w-5 text-gray-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {title}
              </h3>
              {external && <ExternalLink className="h-4 w-4 text-gray-400" />}
            </div>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
      </Component>
    </Card>
  )
}

// ============================================
// PROFILE CARD
// ============================================

/**
 * Card for user profiles
 */
export function ProfileCard({
  name,
  title,
  avatar,
  coverImage,
  stats,
  actions,
  className = ''
}) {
  return (
    <Card className={`overflow-hidden ${className}`} padding="none">
      {coverImage && (
        <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600">
          <img src={coverImage} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      {!coverImage && (
        <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600" />
      )}
      <div className="px-4 pb-4">
        <div className="-mt-12 flex justify-center">
          <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
            {avatar ? (
              <img src={avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white text-2xl font-bold">
                {name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 text-center">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          {title && <p className="text-sm text-gray-500">{title}</p>}
        </div>
        {stats && (
          <div className="mt-4 flex justify-center gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
        {actions && (
          <div className="mt-4 flex justify-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </Card>
  )
}

// ============================================
// FEATURE CARD
// ============================================

/**
 * Card for feature highlights
 */
export function FeatureCard({
  title,
  description,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
  className = ''
}) {
  return (
    <Card className={className}>
      <CardBody>
        {Icon && (
          <div className={`inline-flex p-3 rounded-lg ${iconBgColor} mb-4`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-2 text-gray-600">{description}</p>
        )}
      </CardBody>
    </Card>
  )
}

// ============================================
// PRICING CARD
// ============================================

/**
 * Card for pricing plans
 */
export function PricingCard({
  name,
  price,
  period = '/month',
  description,
  features = [],
  cta,
  ctaLabel = 'Get Started',
  popular = false,
  className = ''
}) {
  return (
    <Card
      className={`relative ${popular ? 'border-blue-500 border-2' : ''} ${className}`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
          Most Popular
        </div>
      )}
      <CardBody className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-500">{period}</span>
        </div>
        <ul className="mt-6 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        {cta ? (
          <div className="mt-6">{cta}</div>
        ) : (
          <button
            className={`mt-6 w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              popular
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            {ctaLabel}
          </button>
        )}
      </CardBody>
    </Card>
  )
}

// ============================================
// TESTIMONIAL CARD
// ============================================

/**
 * Card for testimonials/reviews
 */
export function TestimonialCard({
  quote,
  author,
  role,
  avatar,
  rating,
  className = ''
}) {
  return (
    <Card className={className}>
      <CardBody>
        {rating && (
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}
        <blockquote className="text-gray-600 italic">"{quote}"</blockquote>
        <div className="mt-4 flex items-center gap-3">
          {avatar && (
            <img
              src={avatar}
              alt={author}
              className="h-10 w-10 rounded-full object-cover"
            />
          )}
          <div>
            <p className="font-medium text-gray-900">{author}</p>
            {role && <p className="text-sm text-gray-500">{role}</p>}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

// ============================================
// CARD WITH MENU
// ============================================

/**
 * Card with dropdown menu
 */
export function CardWithMenu({
  children,
  title,
  menuItems = [],
  onMenuItemClick,
  className = ''
}) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <Card className={className}>
      <CardHeader
        title={title}
        action={
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onMenuItemClick?.(item)
                      setMenuOpen(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                      item.danger ? 'text-red-600' : 'text-gray-700'
                    }`}
                  >
                    {item.icon && <item.icon className="inline h-4 w-4 mr-2" />}
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />
      <CardBody>{children}</CardBody>
    </Card>
  )
}

// ============================================
// HORIZONTAL CARD
// ============================================

/**
 * Horizontal layout card
 */
export function HorizontalCard({
  image,
  imageAlt,
  title,
  subtitle,
  description,
  meta,
  action,
  className = ''
}) {
  return (
    <Card className={`overflow-hidden ${className}`} padding="none">
      <div className="flex">
        {image && (
          <div className="flex-shrink-0 w-48">
            <img
              src={image}
              alt={imageAlt || title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {subtitle && (
                  <p className="text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
              {meta && <span className="text-sm text-gray-500">{meta}</span>}
            </div>
            {description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{description}</p>
            )}
          </div>
          {action && <div className="mt-4">{action}</div>}
        </div>
      </div>
    </Card>
  )
}

// ============================================
// CARD GRID
// ============================================

/**
 * Grid layout for cards
 */
export function CardGrid({
  children,
  columns = 3,
  gap = 'md',
  className = ''
}) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
  }

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  )
}

export default {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  ContentCard,
  StatsCard,
  ActionCard,
  LinkCard,
  ProfileCard,
  FeatureCard,
  PricingCard,
  TestimonialCard,
  CardWithMenu,
  HorizontalCard,
  CardGrid
}
