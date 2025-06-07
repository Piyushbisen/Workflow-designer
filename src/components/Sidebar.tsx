import React, { useState } from 'react';
import { useWorkflow } from '../contexts/WorkflowContext';
import { 
  Square, 
  Circle, 
  Diamond, 
  Triangle, 
  Hexagon, 
  FileText,
  Trash2,
  Download,
  Upload,
  Palette,
  Move,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import NodeCustomizer from './NodeCustomizer';
import ExportPanel from './ExportPanel';
import AIAssistPanel from './AIAssistPanel';

const Sidebar: React.FC = () => {
  const { addNode, deleteNode, selectedNodeId, clearWorkflow, loadWorkflow } = useWorkflow();
  const [expandedSections, setExpandedSections] = useState({
    shapes: true,
    customize: true,
    export: true,
    ai: true
  });

  const shapes = [
    { type: 'rectangle', icon: Square, label: 'Process', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { type: 'circle', icon: Circle, label: 'Start/End', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { type: 'diamond', icon: Diamond, label: 'Decision', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    { type: 'triangle', icon: Triangle, label: 'Warning', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
    { type: 'hexagon', icon: Hexagon, label: 'Preparation', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { type: 'textNote', icon: FileText, label: 'Text Note', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
  ];

  const handleAddShape = (type: string) => {
    const position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
    };
    addNode(type, position);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          loadWorkflow(data);
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionHeader: React.FC<{ title: string; section: keyof typeof expandedSections; icon: React.ReactNode }> = ({ title, section, icon }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-3 text-left font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
    >
      <div className="flex items-center space-x-2">
        {icon}
        <span>{title}</span>
      </div>
      {expandedSections[section] ? (
        <ChevronDown className="w-4 h-4" />
      ) : (
        <ChevronRight className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <div className="w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 shadow-lg flex flex-col">
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Design Tools</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Create professional workflows
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Shapes Section */}
        <div className="bg-white/60 dark:bg-gray-700/60 rounded-xl p-1 backdrop-blur-sm">
          <SectionHeader 
            title="Shapes & Elements" 
            section="shapes" 
            icon={<Square className="w-4 h-4" />} 
          />
          {expandedSections.shapes && (
            <div className="p-3 pt-1">
              <div className="grid grid-cols-2 gap-2">
                {shapes.map(({ type, icon: Icon, label, color, bg }) => (
                  <button
                    key={type}
                    onClick={() => handleAddShape(type)}
                    className={`flex flex-col items-center p-3 rounded-lg ${bg} hover:scale-105 transition-all duration-200 group border border-gray-200/50 dark:border-gray-600/50`}
                  >
                    <Icon className={`w-6 h-6 ${color} group-hover:scale-110 transition-transform duration-200`} />
                    <span className="text-xs mt-1 text-gray-700 dark:text-gray-300 font-medium">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={clearWorkflow}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200 text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear</span>
                </button>
                
                <label className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors duration-200 text-sm font-medium cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Node Customizer */}
        <div className="bg-white/60 dark:bg-gray-700/60 rounded-xl p-1 backdrop-blur-sm">
          <SectionHeader 
            title="Customize" 
            section="customize" 
            icon={<Palette className="w-4 h-4" />} 
          />
          {expandedSections.customize && (
            <div className="p-3 pt-1">
              <NodeCustomizer />
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="bg-white/60 dark:bg-gray-700/60 rounded-xl p-1 backdrop-blur-sm">
          <SectionHeader 
            title="Export & Download" 
            section="export" 
            icon={<Download className="w-4 h-4" />} 
          />
          {expandedSections.export && (
            <div className="p-3 pt-1">
              <ExportPanel />
            </div>
          )}
        </div>

        {/* AI Assist */}
        <div className="bg-white/60 dark:bg-gray-700/60 rounded-xl p-1 backdrop-blur-sm">
          <SectionHeader 
            title="AI Assistant" 
            section="ai" 
            icon={<Move className="w-4 h-4" />} 
          />
          {expandedSections.ai && (
            <div className="p-3 pt-1">
              <AIAssistPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;