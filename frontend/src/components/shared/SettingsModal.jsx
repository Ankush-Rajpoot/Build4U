import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, toggleTheme, isLight, isDark } = useTheme();
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-dark-surface rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-dark-text">
              Settings
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-secondary transition-colors"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-dark-text-secondary" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-dark-text mb-3">
                  Theme Preference
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => isLight ? null : toggleTheme()}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                      isLight
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-text-secondary'
                    }`}
                  >
                    <div className="flex items-center">
                      <Sun className="h-5 w-5 text-yellow-500 mr-3" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-dark-text">
                          Light Mode
                        </div>
                        <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
                          Clean and bright interface
                        </div>
                      </div>
                    </div>
                    {isLight && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => isDark ? null : toggleTheme()}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                      isDark
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-text-secondary'
                    }`}
                  >
                    <div className="flex items-center">
                      <Moon className="h-5 w-5 text-purple-500 mr-3" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-dark-text">
                          Dark Mode
                        </div>
                        <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
                          Easy on the eyes, professional look
                        </div>
                      </div>
                    </div>
                    {isDark && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-dark-border pt-4">
                <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
                  Your theme preference will be saved and applied across all sessions.
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end p-6 border-t border-gray-200 dark:border-dark-border">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-dark-primary dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default SettingsModal;
