'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Camera, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfilePictureUploadModalProps {
  isOpen: boolean
  onClose: () => void
  currentPicture: string | null
  onUpload: (base64Image: string) => Promise<{ success: boolean; error?: string }>
}

export function ProfilePictureUploadModal({
  isOpen,
  onClose,
  currentPicture,
  onUpload,
}: ProfilePictureUploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPreview(null)
      setError(null)
      setSuccess(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.onerror = () => {
      setError('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!preview) {
      setError('Please select an image first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await onUpload(preview)

      if (result.success) {
        setSuccess(true)
        // Close modal after showing success
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setError(result.error || 'Failed to upload image')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading && !success) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-graphite-800 rounded-2xl border border-graphite-700 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-graphite-700">
            <h3 className="text-xl font-semibold text-brand">Update Profile Picture</h3>
            <button
              onClick={onClose}
              disabled={isLoading || success}
              className={cn(
                "p-2 rounded-lg hover:bg-graphite-700 transition-colors",
                (isLoading || success) && "opacity-50 cursor-not-allowed"
              )}
            >
              <X className="h-5 w-5 text-graphite-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current/Preview Image */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center border-2 border-brand/30 shadow-lg shadow-brand/20 overflow-hidden">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : currentPicture ? (
                    <img
                      src={currentPicture}
                      alt="Current"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera className="h-16 w-16 text-brand/50" />
                  )}
                </div>
                {!preview && !currentPicture && (
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-brand flex items-center justify-center shadow-lg">
                    <Camera className="h-4 w-4 text-graphite-900" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!preview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || success}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold",
                      "bg-brand text-graphite-900",
                      "hover:bg-brand/90",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "transition-all duration-200",
                      "shadow-lg shadow-brand/20"
                    )}
                  >
                    <Camera className="h-4 w-4" />
                    Choose Image
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleRemove}
                      disabled={isLoading || success}
                      className={cn(
                        "px-6 py-2.5 rounded-xl font-semibold",
                        "bg-graphite-700 text-white",
                        "hover:bg-graphite-600",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "transition-all duration-200"
                      )}
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={isLoading || success}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold",
                        "bg-brand text-graphite-900",
                        "hover:bg-brand/90",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "transition-all duration-200",
                        "shadow-lg shadow-brand/20"
                      )}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : success ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Upload
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-2 p-3 bg-status-error/10 border border-status-error/30 rounded-lg"
                >
                  <AlertCircle className="h-5 w-5 text-status-error shrink-0 mt-0.5" />
                  <p className="text-sm text-status-error flex-1">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-2 p-3 bg-status-success/10 border border-status-success/30 rounded-lg"
                >
                  <CheckCircle2 className="h-5 w-5 text-status-success shrink-0 mt-0.5" />
                  <p className="text-sm text-status-success flex-1">Profile picture updated successfully!</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info */}
            <div className="text-xs text-graphite-400 text-center">
              Accepted formats: JPG, PNG, GIF, WebP (max 5MB)
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
