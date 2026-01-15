import { useAuth } from '../contexts/AuthContext'
import { 
  FolderKanban, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle2,
  Plus,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'

// Placeholder stats - these will come from Firestore later
const stats = [
  { name: 'Active Projects', value: '0', icon: FolderKanban, color: 'bg-blue-500' },
  { name: 'Forms This Week', value: '0', icon: ClipboardList, color: 'bg-green-500' },
  { name: 'Expiring Certs', value: '0', icon: AlertTriangle, color: 'bg-amber-500' },
  { name: 'Completed Today', value: '0', icon: CheckCircle2, color: 'bg-emerald-500' },
]

export default function Dashboard() {
  const { userProfile } = useAuth()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting()}, {userProfile?.firstName || 'there'}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your operations.
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/projects" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Link>
        <Link to="/forms" className="btn-secondary inline-flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          Start Form
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity placeholder */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="text-center py-8 text-gray-500">
            <FolderKanban className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No projects yet</p>
            <Link to="/projects" className="text-sm text-aeria-blue hover:underline mt-1 inline-block">
              Create your first project
            </Link>
          </div>
        </div>

        {/* Recent Forms */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Forms</h2>
            <Link to="/forms" className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="text-center py-8 text-gray-500">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No forms completed</p>
            <Link to="/forms" className="text-sm text-aeria-blue hover:underline mt-1 inline-block">
              Start a form
            </Link>
          </div>
        </div>
      </div>

      {/* Certification alerts placeholder */}
      <div className="card border-amber-200 bg-amber-50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-900">Certification Tracking</h3>
            <p className="text-sm text-amber-700 mt-1">
              Certification expiry tracking will appear here once operators are added to the system.
            </p>
            <Link to="/operators" className="text-sm text-amber-800 font-medium hover:underline mt-2 inline-block">
              Add operators →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
