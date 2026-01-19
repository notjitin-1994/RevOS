'use client'

import React, { useState } from 'react'
import { Keyboard, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ShortcutHelp {
  keys: string
  description: string
}

interface KeyboardShortcutsHelpProps {
  shortcuts: ShortcutHelp[]
  onClose: () => void
}

export function KeyboardShortcutsHelp({ shortcuts, onClose }: KeyboardShortcutsHelpProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-graphite-700 rounded-xl flex items-center justify-center">
                <Keyboard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h2>
                <p className="text-sm text-gray-500">Navigate faster with these shortcuts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close keyboard shortcuts"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Shortcuts List */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="grid gap-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.split('+').map((key, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="text-gray-400 mx-1">+</span>}
                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 shadow-sm">
                          {key}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-semibold">Esc</kbd> to close
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Button to open keyboard shortcuts help
 */
interface KeyboardShortcutButtonProps {
  onClick: () => void
  count?: number
}

export function KeyboardShortcutButton({ onClick, count = 8 }: KeyboardShortcutButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
      title="View keyboard shortcuts"
      aria-label="View keyboard shortcuts"
    >
      <Keyboard className="h-4 w-4" />
      <span className="hidden sm:inline text-sm font-medium">Shortcuts</span>
      <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-semibold">
        ?
      </kbd>
    </button>
  )
}

/**
 * Floating shortcut hint card
 */
interface ShortcutHintProps {
  shortcut: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function ShortcutHint({ shortcut, description, position = 'bottom' }: ShortcutHintProps) {
  return (
    <div className={`absolute ${position === 'bottom' ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg">
        <div className="flex items-center gap-2">
          <span>{description}</span>
          <kbd className="px-1.5 py-0.5 bg-gray-700 rounded font-semibold">{shortcut}</kbd>
        </div>
      </div>
    </div>
  )
}
