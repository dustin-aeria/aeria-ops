// ============================================
// BRANDING SETTINGS COMPONENT
// Manage operator and client branding for PDF exports
// ============================================

import { useState, useEffect } from 'react'
import {
  Building,
  Image,
  Palette,
  Upload,
  Trash2,
  Save,
  Eye,
  Plus,
  X,
  Check,
  AlertCircle
} from 'lucide-react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../contexts/AuthContext'

// ============================================
// DEFAULT BRANDING CONFIGURATION
// ============================================
const DEFAULT_OPERATOR_BRANDING = {
  name: 'Aeria Solutions Ltd.',
  registration: 'Transport Canada Operator #930355',
  tagline: 'Professional RPAS Operations',
  website: 'www.aeriasolutions.ca',
  email: 'ops@aeriasolutions.ca',
  phone: '',
  address: '',
  logo: null,
  colors: {
    primary: '#1e3a5f',
    secondary: '#3b82f6',
    accent: '#10b981',
    light: '#e0f2fe'
  }
}

// ============================================
// COLOR PICKER COMPONENT
// ============================================
const ColorPicker = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded cursor-pointer border border-gray-300"
      />
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input text-xs mt-1"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

// ============================================
// LOGO UPLOAD COMPONENT
// ============================================
const LogoUpload = ({ logo, onUpload, onRemove, label = "Logo" }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 500KB for base64 storage)
    if (file.size > 500 * 1024) {
      setError('Image must be under 500KB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = (event) => {
        onUpload(event.target.result)
        setUploading(false)
      }
      reader.onerror = () => {
        setError('Failed to read file')
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Failed to upload logo')
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="label">{label}</label>
      
      {logo ? (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <img 
            src={logo} 
            alt="Logo preview" 
            className="h-16 w-auto max-w-[200px] object-contain"
          />
          <button
            onClick={onRemove}
            className="btn btn-secondary text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Remove
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-aeria-blue hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aeria-blue" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload logo</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 500KB</p>
              </>
            )}
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </label>
      )}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

// ============================================
// MAIN BRANDING SETTINGS COMPONENT
// ============================================
export default function BrandingSettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('operator')
  
  // Branding state
  const [operatorBranding, setOperatorBranding] = useState(DEFAULT_OPERATOR_BRANDING)
  const [clientBrandings, setClientBrandings] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)

  // Load branding from Firestore
  useEffect(() => {
    const loadBranding = async () => {
      if (!user?.organizationId) {
        setLoading(false)
        return
      }

      try {
        const brandingDoc = await getDoc(doc(db, 'organizations', user.organizationId, 'settings', 'branding'))
        
        if (brandingDoc.exists()) {
          const data = brandingDoc.data()
          if (data.operator) {
            setOperatorBranding({ ...DEFAULT_OPERATOR_BRANDING, ...data.operator })
          }
          if (data.clients) {
            setClientBrandings(data.clients)
          }
        }
      } catch (err) {
        console.error('Failed to load branding:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBranding()
  }, [user])

  // Save branding to Firestore
  const saveBranding = async () => {
    if (!user?.organizationId) return

    setSaving(true)
    setSaved(false)

    try {
      await setDoc(
        doc(db, 'organizations', user.organizationId, 'settings', 'branding'),
        {
          operator: operatorBranding,
          clients: clientBrandings,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid
        },
        { merge: true }
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Failed to save branding:', err)
    } finally {
      setSaving(false)
    }
  }

  // Update operator branding
  const updateOperator = (field, value) => {
    setOperatorBranding(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateOperatorColor = (colorKey, value) => {
    setOperatorBranding(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }))
  }

  // Client branding management
  const addClientBranding = () => {
    const newClient = {
      id: `client_${Date.now()}`,
      name: 'New Client',
      logo: null,
      colors: null // Will inherit operator colors
    }
    setClientBrandings(prev => [...prev, newClient])
    setSelectedClient(newClient.id)
  }

  const updateClientBranding = (clientId, field, value) => {
    setClientBrandings(prev => prev.map(c => 
      c.id === clientId ? { ...c, [field]: value } : c
    ))
  }

  const removeClientBranding = (clientId) => {
    setClientBrandings(prev => prev.filter(c => c.id !== clientId))
    if (selectedClient === clientId) {
      setSelectedClient(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aeria-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-aeria-sky rounded-lg">
            <Palette className="w-5 h-5 text-aeria-navy" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Branding Settings</h2>
            <p className="text-sm text-gray-500">Customize PDF exports with your branding</p>
          </div>
        </div>
        
        <button
          onClick={saveBranding}
          disabled={saving}
          className="btn btn-primary flex items-center gap-2"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('operator')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'operator'
              ? 'border-aeria-blue text-aeria-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Building className="w-4 h-4 inline mr-2" />
          Operator Branding
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'clients'
              ? 'border-aeria-blue text-aeria-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Image className="w-4 h-4 inline mr-2" />
          Client Branding
        </button>
      </div>

      {/* Operator Branding Tab */}
      {activeTab === 'operator' && (
        <div className="space-y-6">
          {/* Company Information */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Company Information</h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Company Name</label>
                <input
                  type="text"
                  value={operatorBranding.name}
                  onChange={(e) => updateOperator('name', e.target.value)}
                  className="input"
                  placeholder="Your Company Name"
                />
              </div>
              
              <div>
                <label className="label">Registration Number</label>
                <input
                  type="text"
                  value={operatorBranding.registration}
                  onChange={(e) => updateOperator('registration', e.target.value)}
                  className="input"
                  placeholder="Transport Canada Operator #"
                />
              </div>
              
              <div>
                <label className="label">Tagline</label>
                <input
                  type="text"
                  value={operatorBranding.tagline}
                  onChange={(e) => updateOperator('tagline', e.target.value)}
                  className="input"
                  placeholder="Professional RPAS Operations"
                />
              </div>
              
              <div>
                <label className="label">Website</label>
                <input
                  type="text"
                  value={operatorBranding.website}
                  onChange={(e) => updateOperator('website', e.target.value)}
                  className="input"
                  placeholder="www.example.com"
                />
              </div>
              
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={operatorBranding.email}
                  onChange={(e) => updateOperator('email', e.target.value)}
                  className="input"
                  placeholder="ops@example.com"
                />
              </div>
              
              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  value={operatorBranding.phone}
                  onChange={(e) => updateOperator('phone', e.target.value)}
                  className="input"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="label">Address</label>
              <textarea
                value={operatorBranding.address}
                onChange={(e) => updateOperator('address', e.target.value)}
                className="input min-h-[60px]"
                placeholder="Street Address, City, Province, Postal Code"
              />
            </div>
          </div>

          {/* Logo */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Company Logo</h3>
            <LogoUpload
              logo={operatorBranding.logo}
              onUpload={(logo) => updateOperator('logo', logo)}
              onRemove={() => updateOperator('logo', null)}
              label="Upload your company logo"
            />
            <p className="text-xs text-gray-500 mt-2">
              Recommended: Transparent PNG, landscape orientation, minimum 300px wide
            </p>
          </div>

          {/* Brand Colors */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Brand Colors</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <ColorPicker
                label="Primary Color"
                value={operatorBranding.colors.primary}
                onChange={(v) => updateOperatorColor('primary', v)}
              />
              <ColorPicker
                label="Secondary Color"
                value={operatorBranding.colors.secondary}
                onChange={(v) => updateOperatorColor('secondary', v)}
              />
              <ColorPicker
                label="Accent Color"
                value={operatorBranding.colors.accent}
                onChange={(v) => updateOperatorColor('accent', v)}
              />
              <ColorPicker
                label="Light Background"
                value={operatorBranding.colors.light}
                onChange={(v) => updateOperatorColor('light', v)}
              />
            </div>
            
            {/* Color Preview */}
            <div className="mt-4 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Preview</p>
              <div className="flex gap-2">
                <div 
                  className="w-20 h-10 rounded flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: operatorBranding.colors.primary }}
                >
                  Primary
                </div>
                <div 
                  className="w-20 h-10 rounded flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: operatorBranding.colors.secondary }}
                >
                  Secondary
                </div>
                <div 
                  className="w-20 h-10 rounded flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: operatorBranding.colors.accent }}
                >
                  Accent
                </div>
                <div 
                  className="w-20 h-10 rounded flex items-center justify-center text-xs border"
                  style={{ backgroundColor: operatorBranding.colors.light }}
                >
                  Light
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Branding Tab */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Client Branding</h3>
                <p className="text-sm text-gray-500">Add client logos for co-branded exports</p>
              </div>
              <button
                onClick={addClientBranding}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Client
              </button>
            </div>

            {clientBrandings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No client branding configured</p>
                <p className="text-sm">Add a client to include their logo on exports</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientBrandings.map(client => (
                  <div 
                    key={client.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      selectedClient === client.id
                        ? 'border-aeria-blue bg-aeria-sky/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={client.name}
                        onChange={(e) => updateClientBranding(client.id, 'name', e.target.value)}
                        className="input font-medium"
                        placeholder="Client Name"
                      />
                      <button
                        onClick={() => removeClientBranding(client.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <LogoUpload
                      logo={client.logo}
                      onUpload={(logo) => updateClientBranding(client.id, 'logo', logo)}
                      onRemove={() => updateClientBranding(client.id, 'logo', null)}
                      label="Client Logo"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usage Instructions */}
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">How Client Branding Works</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Client logos appear alongside your operator branding on PDFs</li>
                  <li>• Select a client when creating a project to enable co-branding</li>
                  <li>• Client branding is optional - your operator branding always appears</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// HOOK TO GET BRANDING
// ============================================
export function useBranding() {
  const { user } = useAuth()
  const [branding, setBranding] = useState({
    operator: DEFAULT_OPERATOR_BRANDING,
    clients: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBranding = async () => {
      if (!user?.organizationId) {
        setLoading(false)
        return
      }

      try {
        const brandingDoc = await getDoc(doc(db, 'organizations', user.organizationId, 'settings', 'branding'))
        
        if (brandingDoc.exists()) {
          const data = brandingDoc.data()
          setBranding({
            operator: { ...DEFAULT_OPERATOR_BRANDING, ...data.operator },
            clients: data.clients || []
          })
        }
      } catch (err) {
        console.error('Failed to load branding:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBranding()
  }, [user])

  const getClientBranding = (clientId) => {
    return branding.clients.find(c => c.id === clientId) || null
  }

  return {
    branding,
    loading,
    getClientBranding
  }
}
