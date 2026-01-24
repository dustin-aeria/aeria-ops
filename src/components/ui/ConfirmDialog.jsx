/**
 * Confirmation Dialog Component
 * Reusable confirmation dialogs for destructive actions
 *
 * @location src/components/ui/ConfirmDialog.jsx
 */

import React, { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  AlertTriangle,
  Trash2,
  Archive,
  XCircle,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Loader2
} from 'lucide-react'

// ============================================
// DIALOG VARIANTS
// ============================================

const DIALOG_VARIANTS = {
  danger: {
    icon: AlertTriangle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
  },
  warning: {
    icon: AlertCircle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
  },
  success: {
    icon: CheckCircle,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    confirmButton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
  }
}

// ============================================
// CONFIRM DIALOG COMPONENT
// ============================================

/**
 * Confirmation dialog
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  icon: CustomIcon = null,
  isLoading = false,
  requireConfirmation = false,
  confirmationText = ''
}) {
  const [inputValue, setInputValue] = useState('')
  const variantConfig = DIALOG_VARIANTS[variant] || DIALOG_VARIANTS.danger
  const Icon = CustomIcon || variantConfig.icon

  const canConfirm = !requireConfirmation || inputValue === confirmationText

  const handleConfirm = async () => {
    if (!canConfirm) return
    await onConfirm()
    setInputValue('')
  }

  const handleClose = () => {
    if (isLoading) return
    setInputValue('')
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${variantConfig.iconBg}`}
                  >
                    <Icon className={`h-6 w-6 ${variantConfig.iconColor}`} />
                  </div>

                  <div className="flex-1">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{message}</p>
                    </div>

                    {requireConfirmation && confirmationText && (
                      <div className="mt-4">
                        <label className="block text-sm text-gray-700 mb-1">
                          Type <span className="font-medium">{confirmationText}</span> to confirm
                        </label>
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder={confirmationText}
                          disabled={isLoading}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    {cancelLabel}
                  </button>
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantConfig.confirmButton}`}
                    onClick={handleConfirm}
                    disabled={!canConfirm || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Processing...
                      </>
                    ) : (
                      confirmLabel
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

// ============================================
// SPECIALIZED CONFIRM DIALOGS
// ============================================

/**
 * Delete confirmation dialog
 */
export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
  isLoading = false,
  requireConfirmation = false
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Delete ${itemType}?`}
      message={
        itemName
          ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
          : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`
      }
      confirmLabel="Delete"
      variant="danger"
      icon={Trash2}
      isLoading={isLoading}
      requireConfirmation={requireConfirmation}
      confirmationText={itemName}
    />
  )
}

/**
 * Archive confirmation dialog
 */
export function ArchiveConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
  isLoading = false
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Archive ${itemType}?`}
      message={
        itemName
          ? `Are you sure you want to archive "${itemName}"? You can restore it later from the archives.`
          : `Are you sure you want to archive this ${itemType}? You can restore it later from the archives.`
      }
      confirmLabel="Archive"
      variant="warning"
      icon={Archive}
      isLoading={isLoading}
    />
  )
}

/**
 * Cancel confirmation dialog
 */
export function CancelConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'operation',
  isLoading = false
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Cancel ${itemType}?`}
      message={
        itemName
          ? `Are you sure you want to cancel "${itemName}"? Any unsaved changes will be lost.`
          : `Are you sure you want to cancel this ${itemType}? Any unsaved changes will be lost.`
      }
      confirmLabel="Yes, Cancel"
      cancelLabel="Keep Editing"
      variant="warning"
      icon={XCircle}
      isLoading={isLoading}
    />
  )
}

/**
 * Discard changes confirmation dialog
 */
export function DiscardChangesDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Discard changes?"
      message="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
      confirmLabel="Discard"
      cancelLabel="Keep Editing"
      variant="warning"
      isLoading={isLoading}
    />
  )
}

/**
 * Submit for approval dialog
 */
export function SubmitForApprovalDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isLoading = false
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Submit for approval?"
      message={
        itemName
          ? `Submit "${itemName}" for review? You won't be able to edit it while it's pending approval.`
          : "Submit this for review? You won't be able to edit it while it's pending approval."
      }
      confirmLabel="Submit"
      variant="info"
      isLoading={isLoading}
    />
  )
}

/**
 * Complete action dialog
 */
export function CompleteActionDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'task',
  isLoading = false
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Mark as complete?`}
      message={
        itemName
          ? `Mark "${itemName}" as complete? This action may trigger notifications and workflow updates.`
          : `Mark this ${itemType} as complete? This action may trigger notifications and workflow updates.`
      }
      confirmLabel="Mark Complete"
      variant="success"
      icon={CheckCircle}
      isLoading={isLoading}
    />
  )
}

// ============================================
// CONFIRM DIALOG HOOK
// ============================================

/**
 * Hook for managing confirm dialog state
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger'
  })

  const openDialog = (dialogConfig) => {
    setConfig(dialogConfig)
    setIsOpen(true)
  }

  const closeDialog = () => {
    if (!isLoading) {
      setIsOpen(false)
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await config.onConfirm()
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDelete = (itemName, itemType, onConfirm) => {
    openDialog({
      title: `Delete ${itemType}?`,
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      onConfirm,
      variant: 'danger'
    })
  }

  const confirmArchive = (itemName, itemType, onConfirm) => {
    openDialog({
      title: `Archive ${itemType}?`,
      message: `Are you sure you want to archive "${itemName}"?`,
      onConfirm,
      variant: 'warning'
    })
  }

  const confirmAction = (title, message, onConfirm, variant = 'info') => {
    openDialog({
      title,
      message,
      onConfirm,
      variant
    })
  }

  return {
    isOpen,
    isLoading,
    config,
    openDialog,
    closeDialog,
    handleConfirm,
    confirmDelete,
    confirmArchive,
    confirmAction,
    DialogComponent: (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={config.title}
        message={config.message}
        variant={config.variant}
        isLoading={isLoading}
        confirmLabel={config.confirmLabel}
        cancelLabel={config.cancelLabel}
      />
    )
  }
}

// ============================================
// ALERT DIALOG (NON-BLOCKING)
// ============================================

/**
 * Alert dialog (informational, single button)
 */
export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  buttonLabel = 'OK',
  variant = 'info'
}) {
  const variantConfig = DIALOG_VARIANTS[variant] || DIALOG_VARIANTS.info
  const Icon = variantConfig.icon

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-lg bg-white p-6 text-center align-middle shadow-xl transition-all">
                <div
                  className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${variantConfig.iconBg} mb-4`}
                >
                  <Icon className={`h-6 w-6 ${variantConfig.iconColor}`} />
                </div>

                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {title}
                </Dialog.Title>

                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantConfig.confirmButton}`}
                    onClick={onClose}
                  >
                    {buttonLabel}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default {
  ConfirmDialog,
  DeleteConfirmDialog,
  ArchiveConfirmDialog,
  CancelConfirmDialog,
  DiscardChangesDialog,
  SubmitForApprovalDialog,
  CompleteActionDialog,
  AlertDialog,
  useConfirmDialog
}
