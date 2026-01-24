/**
 * FeedbackModal.jsx
 * Modal component for submitting user feedback
 *
 * @location src/components/FeedbackModal.jsx
 */

import { useState } from 'react'
import { X, Send, CheckCircle, AlertCircle, MessageSquare, Bug, Lightbulb, HelpCircle } from 'lucide-react'
import { submitFeedback } from '../lib/firestore'

const FEEDBACK_TYPES = [
  { id: 'general', label: 'General Feedback', icon: MessageSquare, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'bug', label: 'Bug Report', icon: Bug, color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'question', label: 'Question', icon: HelpCircle, color: 'bg-purple-50 text-purple-700 border-purple-200' }
]

export default function FeedbackModal({ isOpen, onClose, currentPage, userId, userEmail }) {
  const [feedbackType, setFeedbackType] = useState('general')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!message.trim()) {
      setError('Please enter your feedback')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await submitFeedback({
        type: feedbackType,
        message: message.trim(),
        page: currentPage,
        userId: userId || null,
        userEmail: userEmail || null,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`
      })

      setSubmitted(true)

      // Reset and close after delay
      setTimeout(() => {
        setMessage('')
        setFeedbackType('general')
        setSubmitted(false)
        onClose()
      }, 2000)
    } catch (err) {
      console.error('Error submitting feedback:', err)
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setMessage('')
      setFeedbackType('general')
      setError(null)
      setSubmitted(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Send Feedback
            </h3>
            <button
              onClick={handleClose}
              disabled={submitting}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            // Success State
            <div className="px-6 py-12 text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Thank you!</h4>
              <p className="text-gray-500">Your feedback has been submitted successfully.</p>
            </div>
          ) : (
            // Form
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                {/* Feedback Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Feedback
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {FEEDBACK_TYPES.map(type => {
                      const Icon = type.icon
                      const isSelected = feedbackType === type.id
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFeedbackType(type.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                            isSelected
                              ? type.color + ' border-current'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Feedback
                  </label>
                  <textarea
                    id="feedback-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      feedbackType === 'bug'
                        ? "Describe the bug you encountered. What happened? What did you expect to happen?"
                        : feedbackType === 'feature'
                        ? "Describe the feature you'd like to see. How would it help your workflow?"
                        : feedbackType === 'question'
                        ? "What question do you have? We'll get back to you."
                        : "Share your thoughts, suggestions, or comments..."
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-aeria-navy resize-none"
                  />
                </div>

                {/* Page Context (readonly) */}
                <div className="text-xs text-gray-400">
                  Submitting from: <span className="font-mono">{currentPage}</span>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-aeria-navy rounded-lg hover:bg-aeria-navy/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
