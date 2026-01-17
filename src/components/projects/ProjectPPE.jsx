import { useState, useEffect } from 'react'
import { 
  HardHat, 
  Plus,
  Trash2,
  Eye,
  Ear,
  Hand,
  Footprints,
  Shirt,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Info,
  Thermometer,
  Sun,
  Glasses,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

// Common PPE items with categories - these appear as quick-select checkboxes
const commonPPEItems = [
  // Head Protection
  { id: 'hard_hat', category: 'head', item: 'Hard Hat', specification: 'CSA Z94.1 Type 1 or 2', required: false },
  { id: 'bump_cap', category: 'head', item: 'Bump Cap', specification: 'For minor impact hazards', required: false },
  { id: 'sun_hat', category: 'head', item: 'Sun Hat / Wide Brim', specification: 'UV protection', required: false },
  { id: 'winter_hat', category: 'head', item: 'Winter Hat / Toque', specification: 'Cold weather protection', required: false },
  
  // Eye & Face Protection
  { id: 'safety_glasses', category: 'eye', item: 'Safety Glasses', specification: 'ANSI Z87.1 / CSA Z94.3', required: false },
  { id: 'tinted_glasses', category: 'eye', item: 'Tinted Safety Glasses', specification: 'ANSI Z87.1 with UV protection', required: false },
  { id: 'safety_goggles', category: 'eye', item: 'Safety Goggles', specification: 'Splash/dust protection', required: false },
  { id: 'face_shield', category: 'eye', item: 'Face Shield', specification: 'Full face protection', required: false },
  
  // Hearing Protection  
  { id: 'ear_plugs', category: 'hearing', item: 'Ear Plugs', specification: 'NRR 25dB minimum', required: false },
  { id: 'ear_muffs', category: 'hearing', item: 'Ear Muffs', specification: 'NRR 25dB minimum', required: false },
  
  // Hand Protection
  { id: 'work_gloves', category: 'hand', item: 'Work Gloves', specification: 'General purpose', required: false },
  { id: 'leather_gloves', category: 'hand', item: 'Leather Gloves', specification: 'Cut/abrasion resistant', required: false },
  { id: 'insulated_gloves', category: 'hand', item: 'Insulated Gloves', specification: 'Cold weather protection', required: false },
  { id: 'nitrile_gloves', category: 'hand', item: 'Nitrile Gloves', specification: 'Chemical/fluid protection', required: false },
  
  // Foot Protection
  { id: 'safety_boots', category: 'foot', item: 'Safety Boots', specification: 'CSA Grade 1, green triangle', required: true },
  { id: 'rubber_boots', category: 'foot', item: 'Rubber Boots', specification: 'Waterproof with safety toe', required: false },
  { id: 'winter_boots', category: 'foot', item: 'Insulated Winter Boots', specification: 'CSA approved, -40°C rated', required: false },
  
  // Body Protection
  { id: 'hi_vis_vest', category: 'body', item: 'High-Visibility Vest', specification: 'CSA Z96-15 Class 2', required: true },
  { id: 'hi_vis_jacket', category: 'body', item: 'Hi-Vis Jacket', specification: 'CSA Z96-15 Class 2/3', required: false },
  { id: 'rain_gear', category: 'body', item: 'Rain Gear', specification: 'Waterproof jacket/pants', required: false },
  { id: 'winter_jacket', category: 'body', item: 'Winter Jacket', specification: 'Insulated, hi-vis if required', required: false },
  { id: 'coveralls', category: 'body', item: 'Coveralls', specification: 'FR rated if required', required: false },
  { id: 'fr_clothing', category: 'body', item: 'FR Clothing', specification: 'NFPA 2112 / CSA Z462', required: false },
  
  // Respiratory Protection
  { id: 'dust_mask', category: 'respiratory', item: 'Dust Mask', specification: 'N95 minimum', required: false },
  { id: 'respirator', category: 'respiratory', item: 'Half-Face Respirator', specification: 'With appropriate cartridges', required: false },
  
  // Fall Protection
  { id: 'harness', category: 'fall', item: 'Fall Arrest Harness', specification: 'CSA Z259.10', required: false },
  { id: 'lanyard', category: 'fall', item: 'Shock-Absorbing Lanyard', specification: 'CSA Z259.11', required: false },
  
  // Sun & Weather Protection
  { id: 'sunscreen', category: 'other', item: 'Sunscreen', specification: 'SPF 30+ minimum', required: false },
  { id: 'bug_spray', category: 'other', item: 'Insect Repellent', specification: 'DEET or equivalent', required: false },
  { id: 'cooling_towel', category: 'other', item: 'Cooling Towel/Vest', specification: 'Heat stress prevention', required: false },
  { id: 'hand_warmers', category: 'other', item: 'Hand/Toe Warmers', specification: 'Cold weather operations', required: false },
]

const ppeCategories = [
  { value: 'head', label: 'Head Protection', icon: HardHat, color: 'bg-blue-100 text-blue-700' },
  { value: 'eye', label: 'Eye & Face Protection', icon: Eye, color: 'bg-purple-100 text-purple-700' },
  { value: 'hearing', label: 'Hearing Protection', icon: Ear, color: 'bg-orange-100 text-orange-700' },
  { value: 'hand', label: 'Hand Protection', icon: Hand, color: 'bg-green-100 text-green-700' },
  { value: 'foot', label: 'Foot Protection', icon: Footprints, color: 'bg-amber-100 text-amber-700' },
  { value: 'body', label: 'Body Protection', icon: Shirt, color: 'bg-cyan-100 text-cyan-700' },
  { value: 'respiratory', label: 'Respiratory Protection', icon: Shield, color: 'bg-red-100 text-red-700' },
  { value: 'fall', label: 'Fall Protection', icon: AlertTriangle, color: 'bg-rose-100 text-rose-700' },
  { value: 'other', label: 'Other / Weather', icon: Sun, color: 'bg-gray-100 text-gray-700' }
]

export default function ProjectPPE({ project, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState({
    head: true,
    eye: true,
    hearing: true,
    hand: true,
    foot: true,
    body: true,
    respiratory: false,
    fall: false,
    other: true
  })
  const [newItem, setNewItem] = useState({
    category: 'other',
    item: '',
    specification: '',
    required: false,
    notes: ''
  })

  // Initialize PPE or migrate from old structure
  useEffect(() => {
    // If no PPE at all, initialize with defaults
    if (!project.ppe) {
      const defaultSelected = commonPPEItems
        .filter(item => item.required)
        .map(item => item.id)
      
      onUpdate({
        ppe: {
          selectedItems: defaultSelected,
          customItems: [],
          siteSpecific: '',
          clientRequirements: '',
          inspectionNotes: ''
        }
      })
      return
    }
    
    // If old structure exists (has 'items' array but no 'selectedItems'), migrate it
    if (project.ppe.items && !project.ppe.selectedItems) {
      // Migrate old items to new structure
      const migratedCustomItems = project.ppe.items.map((item, index) => ({
        id: `migrated_${index}`,
        category: item.category || 'other',
        item: item.item || item.name || '',
        specification: item.specification || '',
        required: item.required || false,
        notes: item.notes || ''
      }))
      
      onUpdate({
        ppe: {
          selectedItems: ['hi_vis_vest', 'safety_boots'], // Default required items
          customItems: migratedCustomItems,
          siteSpecific: project.ppe.siteSpecific || '',
          clientRequirements: project.ppe.clientRequirements || '',
          inspectionNotes: project.ppe.inspectionNotes || ''
        }
      })
      return
    }
    
    // Ensure selectedItems exists even if ppe exists
    if (!project.ppe.selectedItems) {
      onUpdate({
        ppe: {
          ...project.ppe,
          selectedItems: ['hi_vis_vest', 'safety_boots'],
          customItems: project.ppe.customItems || []
        }
      })
    }
  }, [project.ppe?.selectedItems])

  const ppe = project.ppe || { selectedItems: [], customItems: [], requirements: {} }
  
  // Don't render until PPE is initialized
  if (!ppe.selectedItems) {
    return (
      <div className="card text-center py-12">
        <div className="w-8 h-8 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading PPE data...</p>
      </div>
    )
  }

  const updatePPE = (updates) => {
    onUpdate({
      ppe: {
        ...ppe,
        ...updates
      }
    })
  }

  // Toggle a common PPE item
  const toggleItem = (itemId) => {
    const currentSelected = ppe.selectedItems || []
    const isSelected = currentSelected.includes(itemId)
    
    if (isSelected) {
      updatePPE({
        selectedItems: currentSelected.filter(id => id !== itemId)
      })
    } else {
      updatePPE({
        selectedItems: [...currentSelected, itemId]
      })
    }
  }

  // Check if item is selected
  const isItemSelected = (itemId) => {
    return (ppe.selectedItems || []).includes(itemId)
  }

  // Toggle required status for selected item
  const toggleRequired = (itemId) => {
    const requirements = ppe.requirements || {}
    updatePPE({
      requirements: {
        ...requirements,
        [itemId]: !requirements[itemId]
      }
    })
  }

  // Check if item is marked as required
  const isItemRequired = (itemId) => {
    // Check custom requirements first, then fall back to default
    if (ppe.requirements && ppe.requirements[itemId] !== undefined) {
      return ppe.requirements[itemId]
    }
    const item = commonPPEItems.find(i => i.id === itemId)
    return item?.required || false
  }

  // Add custom item
  const addCustomItem = () => {
    if (!newItem.item.trim()) return
    
    updatePPE({
      customItems: [...(ppe.customItems || []), { ...newItem, id: `custom_${Date.now()}` }]
    })
    
    setNewItem({
      category: 'other',
      item: '',
      specification: '',
      required: false,
      notes: ''
    })
    setShowAddForm(false)
  }

  // Remove custom item
  const removeCustomItem = (itemId) => {
    updatePPE({
      customItems: (ppe.customItems || []).filter(item => item.id !== itemId)
    })
  }

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // Get items by category
  const getItemsByCategory = (category) => {
    return commonPPEItems.filter(item => item.category === category)
  }

  // Get category info
  const getCategoryInfo = (categoryValue) => {
    return ppeCategories.find(c => c.value === categoryValue)
  }

  // Count selected items in category
  const getSelectedCount = (category) => {
    const categoryItems = getItemsByCategory(category)
    return categoryItems.filter(item => isItemSelected(item.id)).length
  }

  // Get all selected items for summary
  const getAllSelectedItems = () => {
    const selected = []
    
    // Common items
    commonPPEItems.forEach(item => {
      if (isItemSelected(item.id)) {
        selected.push({
          ...item,
          required: isItemRequired(item.id)
        })
      }
    })
    
    // Custom items
    (ppe.customItems || []).forEach(item => {
      selected.push(item)
    })
    
    return selected
  }

  const selectedItems = getAllSelectedItems()
  const requiredCount = selectedItems.filter(i => i.required).length

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <HardHat className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Personal Protective Equipment</h2>
            <p className="text-sm text-gray-500">Select required PPE for this operation</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{selectedItems.length}</p>
            <p className="text-xs text-gray-500">items selected ({requiredCount} required)</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ppeCategories.slice(0, 4).map(cat => {
            const count = getSelectedCount(cat.value)
            const Icon = cat.icon
            return (
              <div key={cat.value} className={`p-3 rounded-lg ${cat.color}`}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{cat.label.split(' ')[0]}</span>
                </div>
                <p className="text-lg font-bold mt-1">{count} selected</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* PPE Selection by Category */}
      <div className="space-y-4">
        {ppeCategories.map(category => {
          const items = getItemsByCategory(category.value)
          const selectedCount = getSelectedCount(category.value)
          const Icon = category.icon
          const isExpanded = expandedCategories[category.value]
          
          return (
            <div key={category.value} className="card">
              <button
                onClick={() => toggleCategory(category.value)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{category.label}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedCount} of {items.length} selected
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="mt-4 grid gap-2">
                  {items.map(item => {
                    const selected = isItemSelected(item.id)
                    const required = isItemRequired(item.id)
                    
                    return (
                      <div 
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                          selected 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <label className="flex items-center gap-3 flex-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleItem(item.id)}
                            className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <div>
                            <p className={`font-medium ${selected ? 'text-gray-900' : 'text-gray-700'}`}>
                              {item.item}
                            </p>
                            <p className="text-xs text-gray-500">{item.specification}</p>
                          </div>
                        </label>
                        
                        {selected && (
                          <button
                            onClick={() => toggleRequired(item.id)}
                            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                              required
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {required ? 'Required' : 'Optional'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Custom Items */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Custom PPE Items</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Custom Item
          </button>
        </div>

        {showAddForm && (
          <div className="p-4 bg-gray-50 rounded-lg mb-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="input"
                >
                  {ppeCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Item Name *</label>
                <input
                  type="text"
                  value={newItem.item}
                  onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                  className="input"
                  placeholder="e.g., Welding Hood"
                />
              </div>
            </div>
            <div>
              <label className="label">Specification</label>
              <input
                type="text"
                value={newItem.specification}
                onChange={(e) => setNewItem({ ...newItem, specification: e.target.value })}
                className="input"
                placeholder="e.g., ANSI Z87.1 compliant"
              />
            </div>
            <div>
              <label className="label">Notes</label>
              <input
                type="text"
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                className="input"
                placeholder="Any additional notes"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newItem.required}
                  onChange={(e) => setNewItem({ ...newItem, required: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Required for this operation</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={addCustomItem}
                  className="btn-primary"
                  disabled={!newItem.item.trim()}
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        )}

        {(ppe.customItems || []).length > 0 ? (
          <div className="space-y-2">
            {(ppe.customItems || []).map(item => {
              const category = getCategoryInfo(item.category)
              return (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {category && <category.icon className="w-4 h-4 text-gray-400" />}
                    <div>
                      <p className="font-medium text-gray-900">{item.item}</p>
                      <p className="text-xs text-gray-500">{item.specification}</p>
                    </div>
                    {item.required && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeCustomItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        ) : !showAddForm && (
          <p className="text-sm text-gray-500 text-center py-4">
            No custom PPE items added. Use the common items above or add custom items for specialized equipment.
          </p>
        )}
      </div>

      {/* Site-Specific Notes */}
      <div className="card">
        <h3 className="font-medium text-gray-900 mb-4">Additional Notes</h3>
        <div className="space-y-4">
          <div>
            <label className="label">Site-Specific Requirements</label>
            <textarea
              value={ppe.siteSpecific || ''}
              onChange={(e) => updatePPE({ siteSpecific: e.target.value })}
              className="input min-h-[80px]"
              placeholder="Any site-specific PPE requirements (e.g., client mandates, environmental conditions)"
            />
          </div>
          <div>
            <label className="label">Client Requirements</label>
            <textarea
              value={ppe.clientRequirements || ''}
              onChange={(e) => updatePPE({ clientRequirements: e.target.value })}
              className="input min-h-[80px]"
              placeholder="Client-specific PPE requirements or standards"
            />
          </div>
          <div>
            <label className="label">Inspection Notes</label>
            <textarea
              value={ppe.inspectionNotes || ''}
              onChange={(e) => updatePPE({ inspectionNotes: e.target.value })}
              className="input min-h-[80px]"
              placeholder="PPE inspection requirements and schedule"
            />
          </div>
        </div>
      </div>

      {/* Summary Card */}
      {selectedItems.length > 0 && (
        <div className="card bg-green-50 border-green-200">
          <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            PPE Summary for This Operation
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-green-800 mb-2">Required PPE ({requiredCount})</h4>
              <ul className="space-y-1">
                {selectedItems.filter(i => i.required).map(item => (
                  <li key={item.id} className="text-sm text-green-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    {item.item}
                  </li>
                ))}
                {requiredCount === 0 && (
                  <li className="text-sm text-green-600 italic">No items marked as required</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-800 mb-2">Recommended PPE ({selectedItems.length - requiredCount})</h4>
              <ul className="space-y-1">
                {selectedItems.filter(i => !i.required).map(item => (
                  <li key={item.id} className="text-sm text-green-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    {item.item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
