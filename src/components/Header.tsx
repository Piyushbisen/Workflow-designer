import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Workflow, Sun, Moon, Layout, BarChart3 } from 'lucide-react';

interface HeaderProps {
  currentView: 'designer' | 'dashboard';
  setCurrentView: (view: 'designer' | 'dashboard') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-white/20 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <Workflow className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Workflow Designer Pro
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Professional workflow creation & task management
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('designer')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                currentView === 'designer'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span className="text-sm font-medium">Designer</span>
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                currentView === 'dashboard'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;