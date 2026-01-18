import { useState, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Shield,
  Users,
  Calendar,
  PieChart,
  Activity,
  Target,
  AlertOctagon
} from 'lucide-react'

// Form analytics dashboard component
export default function FormAnalytics({ forms = [], formTemplates = {} }) {
  const [timeRange, setTimeRange] = useState('30') // days
  
  // Calculate analytics
  const analytics = useMemo(() => {
    const now = new Date()
    const rangeStart = new Date(now.getTime() - (parseInt(timeRange) * 24 * 60 * 60 * 1000))
    
    // Filter forms by time range
    const recentForms = forms.filter(f => {
      const created = new Date(f.createdAt)
      return created >= rangeStart
    })
    
    // Previous period for comparison
    const previousStart = new Date(rangeStart.getTime() - (parseInt(timeRange) * 24 * 60 * 60 * 1000))
    const previousForms = forms.filter(f => {
      const created = new Date(f.createdAt)
      return created >= previousStart && created < rangeStart
    })
    
    // Basic counts
    const totalForms = recentForms.length
    const completedForms = recentForms.filter(f => f.status === 'completed').length
    const draftForms = recentForms.filter(f => f.status !== 'completed').length
    const completionRate = totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0
    
    // Previous period comparison
    const previousTotal = previousForms.length
    const previousCompleted = previousForms.filter(f => f.status === 'completed').length
    const previousCompletionRate = previousTotal > 0 ? Math.round((previousCompleted / previousTotal) * 100) : 0
    
    // Form type distribution
    const byType = {}
    recentForms.forEach(f => {
      const type = f.templateId || 'unknown'
      if (!byType[type]) {
        byType[type] = { count: 0, completed: 0, template: formTemplates[type] }
      }
      byType[type].count++
      if (f.status === 'completed') byType[type].completed++
    })
    
    // Category distribution
    const byCategory = {}
    recentForms.forEach(f => {
      const template = formTemplates[f.templateId]
      const category = template?.category || 'other'
      if (!byCategory[category]) {
        byCategory[category] = { count: 0, completed: 0 }
      }
      byCategory[category].count++
      if (f.status === 'completed') byCategory[category].completed++
    })
    
    // Hazard frequency (from FLHAs and FHAs)
    const hazardCounts = {}
    recentForms.forEach(f => {
      if (f.templateId === 'flha' || f.templateId === 'formal_hazard_assessment') {
        const hazards = f.data?.hazards || []
        if (Array.isArray(hazards)) {
          hazards.forEach(h => {
            const cat = h.hazard_category || 'unknown'
            hazardCounts[cat] = (hazardCounts[cat] || 0) + 1
          })
        }
      }
    })
    
    // Top hazards sorted
    const topHazards = Object.entries(hazardCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    
    // Incident counts
    const incidents = recentForms.filter(f => f.templateId === 'incident_report').length
    const nearMisses = recentForms.filter(f => f.templateId === 'near_miss').length
    const previousIncidents = previousForms.filter(f => f.templateId === 'incident_report').length
    
    // Average completion time (forms completed same day vs later)
    let sameDayCompletions = 0
    recentForms.filter(f => f.status === 'completed' && f.completedAt).forEach(f => {
      const created = new Date(f.createdAt).toDateString()
      const completed = new Date(f.completedAt).toDateString()
      if (created === completed) sameDayCompletions++
    })
    const sameDayRate = completedForms > 0 ? Math.round((sameDayCompletions / completedForms) * 100) : 0
    
    // Forms per day average
    const daysInRange = parseInt(timeRange)
    const formsPerDay = daysInRange > 0 ? (totalForms / daysInRange).toFixed(1) : 0
    
    return {
      totalForms,
      completedForms,
      draftForms,
      completionRate,
      previousTotal,
      previousCompletionRate,
      byType,
      byCategory,
      topHazards,
      incidents,
      nearMisses,
      previousIncidents,
      sameDayRate,
      formsPerDay,
      trend: totalForms > previousTotal ? 'up' : totalForms < previousTotal ? 'down' : 'flat'
    }
  }, [forms, formTemplates, timeRange])
  
  // Category labels
  const categoryLabels = {
    pre_operation: 'Pre-Operation',
    daily_field: 'Daily/Field',
    incident: 'Incident',
    tracking: 'Tracking/Admin'
  }
  
  // Hazard category labels
  const hazardLabels = {
    environmental: 'Environmental',
    overhead: 'Overhead',
    access_egress: 'Access/Egress',
    ergonomic: 'Ergonomic',
    personal_limitations: 'Personal',
    equipment: 'Equipment',
    vehicle: 'Vehicle',
    chemical: 'Chemical',
    airspace: 'Airspace',
    rf_interference: 'RF/Signal',
    flyaway: 'Loss of Control',
    battery_thermal: 'Battery',
    public_interaction: 'Public',
    manned_aircraft: 'Manned Aircraft',
    obstacle_collision: 'Obstacles',
    vlos_limitations: 'VLOS',
    payload: 'Payload',
    ground_crew: 'Ground Crew'
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-aeria-blue" />
            Forms Analytics
          </h2>
          <p className="text-sm text-gray-500">Track form completion and identify trends</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input w-auto"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Forms */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            {analytics.trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : analytics.trend === 'down' ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : null}
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.totalForms}</p>
          <p className="text-sm text-gray-500">Total Forms</p>
          <p className="text-xs text-gray-400 mt-1">
            {analytics.previousTotal} previous period
          </p>
        </div>
        
        {/* Completion Rate */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            {analytics.completionRate > analytics.previousCompletionRate ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : analytics.completionRate < analytics.previousCompletionRate ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : null}
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.completionRate}%</p>
          <p className="text-sm text-gray-500">Completion Rate</p>
          <p className="text-xs text-gray-400 mt-1">
            {analytics.previousCompletionRate}% previous period
          </p>
        </div>
        
        {/* Incidents */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg ${analytics.incidents > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
              <AlertOctagon className={`w-5 h-5 ${analytics.incidents > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
            {analytics.incidents < analytics.previousIncidents ? (
              <TrendingDown className="w-4 h-4 text-green-500" />
            ) : analytics.incidents > analytics.previousIncidents ? (
              <TrendingUp className="w-4 h-4 text-red-500" />
            ) : null}
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.incidents}</p>
          <p className="text-sm text-gray-500">Incidents</p>
          <p className="text-xs text-gray-400 mt-1">
            {analytics.nearMisses} near misses
          </p>
        </div>
        
        {/* Same Day Completion */}
        <div className="card">
          <div className="p-2 bg-purple-100 rounded-lg w-fit">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.sameDayRate}%</p>
          <p className="text-sm text-gray-500">Same-Day Completion</p>
          <p className="text-xs text-gray-400 mt-1">
            {analytics.formsPerDay} forms/day avg
          </p>
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Forms by Category */}
        <div className="card">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-gray-400" />
            Forms by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.byCategory).map(([cat, data]) => {
              const percentage = analytics.totalForms > 0 
                ? Math.round((data.count / analytics.totalForms) * 100) 
                : 0
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{categoryLabels[cat] || cat}</span>
                    <span className="text-gray-900 font-medium">{data.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-aeria-blue rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {Object.keys(analytics.byCategory).length === 0 && (
              <p className="text-sm text-gray-500 italic">No forms in selected period</p>
            )}
          </div>
        </div>
        
        {/* Top Hazards */}
        <div className="card">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Top Identified Hazards
          </h3>
          <div className="space-y-3">
            {analytics.topHazards.map(([hazard, count], idx) => {
              const maxCount = analytics.topHazards[0]?.[1] || 1
              const percentage = Math.round((count / maxCount) * 100)
              return (
                <div key={hazard}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{hazardLabels[hazard] || hazard}</span>
                    <span className="text-gray-900 font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-orange-500' : 'bg-amber-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {analytics.topHazards.length === 0 && (
              <p className="text-sm text-gray-500 italic">No hazards recorded in selected period</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Form Types Table */}
      <div className="card">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-400" />
          Form Type Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-gray-600">Form Type</th>
                <th className="text-center py-2 font-medium text-gray-600">Total</th>
                <th className="text-center py-2 font-medium text-gray-600">Completed</th>
                <th className="text-center py-2 font-medium text-gray-600">Draft</th>
                <th className="text-right py-2 font-medium text-gray-600">Rate</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(analytics.byType).map(([type, data]) => {
                const rate = data.count > 0 ? Math.round((data.completed / data.count) * 100) : 0
                return (
                  <tr key={type} className="border-b last:border-0">
                    <td className="py-2 text-gray-900">
                      {data.template?.shortName || data.template?.name || type}
                    </td>
                    <td className="py-2 text-center text-gray-600">{data.count}</td>
                    <td className="py-2 text-center text-green-600">{data.completed}</td>
                    <td className="py-2 text-center text-amber-600">{data.count - data.completed}</td>
                    <td className="py-2 text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        rate >= 80 ? 'bg-green-100 text-green-700' :
                        rate >= 50 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {rate}%
                      </span>
                    </td>
                  </tr>
                )
              })}
              {Object.keys(analytics.byType).length === 0 && (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500 italic">
                    No forms in selected period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Quick Insights */}
      {(analytics.totalForms > 0 || analytics.incidents > 0) && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-aeria-blue" />
            Quick Insights
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {analytics.completionRate < 80 && (
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>
                  Completion rate is below 80%. Consider following up on {analytics.draftForms} draft forms.
                </span>
              </li>
            )}
            {analytics.incidents > analytics.previousIncidents && (
              <li className="flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span>
                  Incidents increased from {analytics.previousIncidents} to {analytics.incidents}. Review recent incident reports.
                </span>
              </li>
            )}
            {analytics.topHazards.length > 0 && (
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>
                  Most common hazard: <strong>{hazardLabels[analytics.topHazards[0][0]] || analytics.topHazards[0][0]}</strong> ({analytics.topHazards[0][1]} occurrences). 
                  Consider additional controls.
                </span>
              </li>
            )}
            {analytics.sameDayRate >= 90 && (
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>
                  Excellent! {analytics.sameDayRate}% of forms are completed same-day.
                </span>
              </li>
            )}
            {analytics.completionRate >= 95 && (
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>
                  Outstanding completion rate of {analytics.completionRate}%!
                </span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
