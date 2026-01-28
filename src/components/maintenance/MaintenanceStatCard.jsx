/**
 * MaintenanceStatCard.jsx
 * Stat card component for maintenance dashboard
 *
 * @location src/components/maintenance/MaintenanceStatCard.jsx
 */

import { Link } from 'react-router-dom'

const statusColors = {
  ok: 'bg-green-50 border-green-200 text-green-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  danger: 'bg-red-50 border-red-200 text-red-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
  neutral: 'bg-gray-50 border-gray-200 text-gray-700'
}

const iconBgColors = {
  ok: 'bg-green-100 text-green-600',
  warning: 'bg-amber-100 text-amber-600',
  danger: 'bg-red-100 text-red-600',
  info: 'bg-blue-100 text-blue-600',
  neutral: 'bg-gray-100 text-gray-600'
}

export default function MaintenanceStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  status = 'neutral',
  trend,
  trendLabel,
  href,
  onClick
}) {
  const colorClass = statusColors[status]
  const iconBgClass = iconBgColors[status]

  const Content = (
    <div className={`p-5 rounded-xl border ${colorClass} transition-all ${(href || onClick) ? 'hover:shadow-md cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                {trend > 0 ? '+' : ''}{trend}
              </span>
              {trendLabel && (
                <span className="text-xs text-gray-500">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${iconBgClass}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link to={href}>{Content}</Link>
  }

  if (onClick) {
    return <button onClick={onClick} className="w-full text-left">{Content}</button>
  }

  return Content
}
