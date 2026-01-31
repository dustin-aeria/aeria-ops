import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Users,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  Phone,
  Mail,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  DollarSign
} from 'lucide-react'
import { getOperators, deleteOperator } from '../lib/firestore'
import { useOrganization } from '../hooks/useOrganization'
import OperatorModal from '../components/OperatorModal'
import { format, differenceInDays } from 'date-fns'
import { logger } from '../lib/logger'

const roleColors = {
  PIC: 'bg-blue-100 text-blue-700',
  VO: 'bg-green-100 text-green-700',
  'Safety Lead': 'bg-orange-100 text-orange-700',
  'Project Lead': 'bg-purple-100 text-purple-700',
  'First Aid': 'bg-red-100 text-red-700',
}

export default function Operators() {
  const { organizationId } = useOrganization()
  const [operators, setOperators] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingOperator, setEditingOperator] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [expandedOperator, setExpandedOperator] = useState(null)

  useEffect(() => {
    if (organizationId) {
      loadOperators()
    }
  }, [organizationId])

  const loadOperators = async () => {
    setLoading(true)
    try {
      const data = await getOperators(organizationId)
      setOperators(data)
    } catch (err) {
      logger.error('Error loading operators:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (operatorId, operatorName) => {
    if (!confirm(`Are you sure you want to delete ${operatorName}? This cannot be undone.`)) {
      return
    }
    
    try {
      await deleteOperator(operatorId)
      setOperators(prev => prev.filter(o => o.id !== operatorId))
    } catch (err) {
      logger.error('Error deleting operator:', err)
      alert('Failed to delete operator')
    }
    setMenuOpen(null)
  }

  const handleEdit = (operator) => {
    setEditingOperator(operator)
    setShowModal(true)
    setMenuOpen(null)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingOperator(null)
    loadOperators()
  }

  // Filter operators
  const filteredOperators = operators.filter(op => {
    const fullName = `${op.firstName} ${op.lastName}`.toLowerCase()
    const matchesSearch = 
      fullName.includes(searchQuery.toLowerCase()) ||
      op.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || op.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Get certification status
  const getCertStatus = (cert) => {
    if (!cert.expiryDate) return { status: 'valid', label: 'No Expiry', color: 'text-green-600' }
    
    const daysUntilExpiry = differenceInDays(new Date(cert.expiryDate), new Date())
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', label: 'Expired', color: 'text-red-600', icon: XCircle }
    } else if (daysUntilExpiry <= 90) {
      return { status: 'expiring', label: `${daysUntilExpiry} days`, color: 'text-amber-600', icon: AlertTriangle }
    } else {
      return { status: 'valid', label: 'Valid', color: 'text-green-600', icon: CheckCircle2 }
    }
  }

  // Check if operator has any cert issues
  const hasAnyCertIssues = (operator) => {
    if (!operator.certifications?.length) return false
    return operator.certifications.some(cert => {
      const status = getCertStatus(cert)
      return status.status === 'expired' || status.status === 'expiring'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operators</h1>
          <p className="text-gray-600 mt-1">Team members and certifications</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Operator
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <label htmlFor="operator-search" className="sr-only">Search operators</label>
          <input
            id="operator-search"
            type="search"
            placeholder="Search operators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <label htmlFor="operator-status-filter" className="sr-only">Filter by status</label>
        <select
          id="operator-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-full sm:w-40"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Operators list */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading operators...</p>
        </div>
      ) : filteredOperators.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          {operators.length === 0 ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No operators yet</h3>
              <p className="text-gray-500 mb-4">
                Add team members to assign them to projects and track certifications.
              </p>
              <button 
                onClick={() => setShowModal(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Operator
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No matching operators</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOperators.map((operator) => (
            <div key={operator.id} className="card">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-aeria-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-lg">
                    {operator.firstName?.[0]}{operator.lastName?.[0]}
                  </span>
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {operator.firstName} {operator.lastName}
                    </h3>
                    {operator.status === 'inactive' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                        Inactive
                      </span>
                    )}
                    {hasAnyCertIssues(operator) && (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  
                  {/* Contact info */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-2">
                    {operator.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {operator.email}
                      </span>
                    )}
                    {operator.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {operator.phone}
                      </span>
                    )}
                    {operator.hourlyRate > 0 && (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <DollarSign className="w-3.5 h-3.5" />
                        ${operator.hourlyRate}/hr
                      </span>
                    )}
                  </div>

                  {/* Roles */}
                  {operator.roles?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {operator.roles.map((role, idx) => (
                        <span 
                          key={idx}
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${roleColors[role] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Expand certifications */}
                  {operator.certifications?.length > 0 && (
                    <button
                      onClick={() => setExpandedOperator(expandedOperator === operator.id ? null : operator.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="View certifications"
                    >
                      <Award className="w-4 h-4" />
                      {expandedOperator === operator.id ? (
                        <ChevronUp className="w-3 h-3 absolute -mt-1 -mr-1" />
                      ) : (
                        <ChevronDown className="w-3 h-3 absolute -mt-1 -mr-1" />
                      )}
                    </button>
                  )}
                  
                  {/* More menu */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === operator.id ? null : operator.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {menuOpen === operator.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpen(null)}
                        />
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={() => handleEdit(operator)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(operator.id, `${operator.firstName} ${operator.lastName}`)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Expanded certifications */}
              {expandedOperator === operator.id && operator.certifications?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Certifications
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {operator.certifications.map((cert, idx) => {
                      const certStatus = getCertStatus(cert)
                      const StatusIcon = certStatus.icon
                      
                      return (
                        <div 
                          key={idx}
                          className={`p-3 rounded-lg border ${
                            certStatus.status === 'expired' ? 'bg-red-50 border-red-200' :
                            certStatus.status === 'expiring' ? 'bg-amber-50 border-amber-200' :
                            'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{cert.type}</p>
                              <p className="text-xs text-gray-500">{cert.issuingBody}</p>
                              {cert.certificateNumber && (
                                <p className="text-xs text-gray-400 font-mono mt-1">#{cert.certificateNumber}</p>
                              )}
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-medium ${certStatus.color}`}>
                              {StatusIcon && <StatusIcon className="w-3.5 h-3.5" />}
                              {certStatus.label}
                            </div>
                          </div>
                          {cert.expiryDate && (
                            <p className="text-xs text-gray-500 mt-2">
                              Expires: {format(new Date(cert.expiryDate), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Operator Modal */}
      <OperatorModal 
        isOpen={showModal} 
        onClose={handleModalClose}
        operator={editingOperator}
      />
    </div>
  )
}
