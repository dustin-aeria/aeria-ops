import { useAuth } from '../contexts/AuthContext'
import { User, Building, Shield, Bell } from 'lucide-react'

export default function Settings() {
  const { userProfile } = useAuth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Settings sections */}
      <div className="grid gap-6">
        {/* Profile */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-aeria-sky rounded-lg">
              <User className="w-5 h-5 text-aeria-navy" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
              <p className="text-sm text-gray-500">Your personal information</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input 
                  type="text" 
                  className="input" 
                  defaultValue={userProfile?.firstName || ''} 
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input 
                  type="text" 
                  className="input" 
                  defaultValue={userProfile?.lastName || ''} 
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input 
                type="email" 
                className="input bg-gray-50" 
                value={userProfile?.email || ''} 
                disabled 
              />
              <p className="text-xs text-gray-500 mt-1">Contact administrator to change email</p>
            </div>
          </div>
        </div>

        {/* Company (placeholder) */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-aeria-sky rounded-lg">
              <Building className="w-5 h-5 text-aeria-navy" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Company</h2>
              <p className="text-sm text-gray-500">Organization settings</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            Company settings will be available to administrators.
          </p>
        </div>

        {/* Notifications (placeholder) */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-aeria-sky rounded-lg">
              <Bell className="w-5 h-5 text-aeria-navy" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500">Email and alert preferences</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            Notification settings coming soon.
          </p>
        </div>

        {/* Security (placeholder) */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-aeria-sky rounded-lg">
              <Shield className="w-5 h-5 text-aeria-navy" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              <p className="text-sm text-gray-500">Password and authentication</p>
            </div>
          </div>
          <button className="btn-secondary">
            Change Password
          </button>
        </div>
      </div>
    </div>
  )
}
