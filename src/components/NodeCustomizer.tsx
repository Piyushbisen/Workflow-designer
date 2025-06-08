import React from 'react';
import { useWorkflow } from '../contexts/WorkflowContext';
import { Trash2, Palette, Type, Move } from 'lucide-react';

const NodeCustomizer: React.FC = () => {
  const { nodes, selectedNodeId, updateNodeData, deleteNode } = useWorkflow();
  
  const selectedNode = nodes.find(node => node.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Palette className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Select a node to customize its appearance
        </p>
      </div>
    );
  }

  const colors = [
    '#ffffff', '#f1f5f9', '#e2e8f0', '#cbd5e1',
    '#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a',
    '#10b981', '#059669', '#047857', '#065f46',
    '#f59e0b', '#d97706', '#b45309', '#92400e',
    '#ef4444', '#dc2626', '#b91c1c', '#991b1b',
    '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6',
  ];

   const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32];
  const fontWeights = [
    { value: 'normal', label: 'Normal' },
    { value: 'medium', label: 'Medium' },
    { value: 'semibold', label: 'Semibold' },
    { value: 'bold', label: 'Bold' },
  ];

  const handleColorChange = (property: string, color: string) => {
    updateNodeData(selectedNode.id, { [property]: color });
  };

  const handleSizeChange = (property: string, value: number) => {
    updateNodeData(selectedNode.id, { [property]: Math.max(50, value) });
  };

  const handleLabelChange = (label: string) => {
    updateNodeData(selectedNode.id, { label });
  };

  const handleFontChange = (property: string, value: string | number) => {
    updateNodeData(selectedNode.id, { [property]: value });
  };
  
  const ColorPicker: React.FC<{ label: string; value: string; property: string }> = ({ label, value, property }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
        <Type className="w-4 h-4" />
        <span>{label}</span>
      </label>
      <div className="grid grid-cols-8 gap-1">
        {colors.map(color => (
          <button
            key={color}
            onClick={() => handleColorChange(property, color)}
            className={`w-6 h-6 rounded border-2 transition-all duration-200 hover:scale-110 ${
              value === color ? 'border-blue-500 shadow-md' : 'border-gray-300 dark:border-gray-600'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Editing: {selectedNode.data.label || selectedNode.type}
        </h3>
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
          title="Delete node"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Text Content */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
          <Type className="w-4 h-4" />
          <span>Text Content</span>
        </label>
       <textarea
          value={selectedNode.data.label || ''}
          onChange={(e) => handleLabelChange(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()} // ⛔ prevents node deletion
          placeholder="Enter text (use Enter for new lines)"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm resize-none"
          rows={3}
        />

      </div>

       {/* Typography */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
          <Type className="w-4 h-4" />
          <span>Typography</span>
        </label>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">Font Size</label>
            <select
              value={selectedNode.data.fontSize || 14}
              onChange={(e) => handleFontChange('fontSize', parseInt(e.target.value))}
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {fontSizes.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">Font Weight</label>
            <select
              value={selectedNode.data.fontWeight || 'medium'}
              onChange={(e) => handleFontChange('fontWeight', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {fontWeights.map(weight => (
                <option key={weight.value} value={weight.value}>{weight.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Size Controls */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
          <Move className="w-4 h-4" />
          <span>Size</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">Width</label>
            <input
              type="number"
              value={selectedNode.data.width || 150}
              onChange={(e) => handleSizeChange('width', parseInt(e.target.value))}
               onKeyDown={(e) => e.stopPropagation()} 
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">Height</label>
            <input
              type="number"
              value={selectedNode.data.height || 80}
              onChange={(e) => handleSizeChange('height', parseInt(e.target.value))}
               onKeyDown={(e) => e.stopPropagation()} 
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              
            />
          </div>
        </div>
      </div>

      {/* Colors */}
      <ColorPicker 
        label="Background" 
        value={selectedNode.data.backgroundColor || '#ffffff'} 
        property="backgroundColor" 
      />
      
      <ColorPicker 
        label="Border" 
        value={selectedNode.data.borderColor || '#64748b'} 
        property="borderColor" 
      />
      
      <ColorPicker 
        label="Text" 
        value={selectedNode.data.textColor || '#1e293b'} 
        property="textColor" 
      />

      {/* Border Width */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Border Width
        </label>
        <input
          type="range"
          min="0"
          max="8"
          value={selectedNode.data.borderWidth || 2}
          onChange={(e) => handleSizeChange('borderWidth', parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {selectedNode.data.borderWidth || 2}px
        </div>
      </div>
    </div>
  );
};

export default NodeCustomizer;