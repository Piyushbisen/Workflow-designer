import React, { useState } from 'react';
import { useWorkflow } from '../contexts/WorkflowContext';
import { Sparkles, ArrowRight, Lightbulb, Wand2 } from 'lucide-react';

const AIAssistPanel: React.FC = () => {
  const { nodes, addNode, clearWorkflow } = useWorkflow();
  const [prompt, setPrompt] = useState('');

  const autoArrangeNodes = () => {
    // Simple auto-arrange algorithm - arrange nodes in a grid
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const spacing = { x: 200, y: 120 };
    
    nodes.forEach((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const newPosition = {
        x: col * spacing.x + 100,
        y: row * spacing.y + 100
      };
      // Note: This would need to be connected to the updateNodeData function
      // For now, it's a placeholder for the auto-arrange functionality
    });
  };

  const generateWorkflowFromPrompt = () => {
    if (!prompt.trim()) return;

    clearWorkflow();
    
    // Simple workflow generation based on common patterns
    const lowerPrompt = prompt.toLowerCase();
    let workflow: Array<{ type: string; label: string; position: { x: number; y: number } }> = [];

    if (lowerPrompt.includes('approval') || lowerPrompt.includes('review')) {
      workflow = [
        { type: 'circle', label: 'Start', position: { x: 100, y: 100 } },
        { type: 'rectangle', label: 'Submit Request', position: { x: 300, y: 100 } },
        { type: 'diamond', label: 'Manager Approval?', position: { x: 500, y: 100 } },
        { type: 'rectangle', label: 'Process Request', position: { x: 700, y: 50 } },
        { type: 'rectangle', label: 'Send Rejection', position: { x: 700, y: 150 } },
        { type: 'circle', label: 'End', position: { x: 900, y: 100 } }
      ];
    } else if (lowerPrompt.includes('login') || lowerPrompt.includes('authentication')) {
      workflow = [
        { type: 'circle', label: 'Start', position: { x: 100, y: 100 } },
        { type: 'rectangle', label: 'Enter Credentials', position: { x: 300, y: 100 } },
        { type: 'diamond', label: 'Valid Credentials?', position: { x: 500, y: 100 } },
        { type: 'rectangle', label: 'Access Granted', position: { x: 700, y: 50 } },
        { type: 'rectangle', label: 'Show Error', position: { x: 700, y: 150 } },
        { type: 'circle', label: 'End', position: { x: 900, y: 100 } }
      ];
    } else if (lowerPrompt.includes('order') || lowerPrompt.includes('purchase')) {
      workflow = [
        { type: 'circle', label: 'Start', position: { x: 100, y: 100 } },
        { type: 'rectangle', label: 'Browse Products', position: { x: 300, y: 100 } },
        { type: 'rectangle', label: 'Add to Cart', position: { x: 500, y: 100 } },
        { type: 'rectangle', label: 'Checkout', position: { x: 700, y: 100 } },
        { type: 'diamond', label: 'Payment Success?', position: { x: 900, y: 100 } },
        { type: 'rectangle', label: 'Order Confirmed', position: { x: 1100, y: 50 } },
        { type: 'rectangle', label: 'Payment Failed', position: { x: 1100, y: 150 } }
      ];
    } else {
      // Generic workflow
      workflow = [
        { type: 'circle', label: 'Start', position: { x: 100, y: 100 } },
        { type: 'rectangle', label: 'Process', position: { x: 300, y: 100 } },
        { type: 'diamond', label: 'Decision', position: { x: 500, y: 100 } },
        { type: 'circle', label: 'End', position: { x: 700, y: 100 } }
      ];
    }

    // Add nodes to the workflow
    workflow.forEach((item, index) => {
      setTimeout(() => {
        addNode(item.type, item.position);
      }, index * 200); // Stagger the creation for visual effect
    });

    setPrompt('');
  };

  const quickActions = [
    {
      label: 'Simple Process',
      description: 'Start → Process → End',
      onClick: () => {
        clearWorkflow();
        setTimeout(() => addNode('circle', { x: 100, y: 100 }), 0);
        setTimeout(() => addNode('rectangle', { x: 300, y: 100 }), 200);
        setTimeout(() => addNode('circle', { x: 500, y: 100 }), 400);
      }
    },
    {
      label: 'Decision Flow',
      description: 'Start → Decision → Outcomes',
      onClick: () => {
        clearWorkflow();
        setTimeout(() => addNode('circle', { x: 100, y: 100 }), 0);
        setTimeout(() => addNode('diamond', { x: 300, y: 100 }), 200);
        setTimeout(() => addNode('rectangle', { x: 500, y: 50 }), 400);
        setTimeout(() => addNode('rectangle', { x: 500, y: 150 }), 600);
      }
    }
  ];

  return (
    <div className="space-y-4">
      {/* AI Workflow Generator */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            AI Workflow Generator
          </span>
        </div>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your workflow (e.g., 'user login process', 'order approval workflow', 'content review system')"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm resize-none"
          rows={3}
        />
        
        <button
          onClick={generateWorkflowFromPrompt}
          disabled={!prompt.trim()}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wand2 className="w-4 h-4" />
          <span>Generate Workflow</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quick Templates
          </span>
        </div>
        
        <div className="space-y-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="w-full p-3 text-left rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                    {action.label}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {action.description}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Auto Arrange */}
      {nodes.length > 1 && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={autoArrangeNodes}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto Arrange</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAssistPanel;