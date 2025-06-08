import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  useReactFlow,
  Panel,
  NodeTypes,
  SelectionMode
} from 'reactflow';
import { useWorkflow } from '../contexts/WorkflowContext';
import CustomRectangleNode from './nodes/CustomRectangleNode';
import CustomCircleNode from './nodes/CustomCircleNode';
import CustomDiamondNode from './nodes/CustomDiamondNode';
import CustomTriangleNode from './nodes/CustomTriangleNode';
import CustomHexagonNode from './nodes/CustomHexagonNode';
import CustomTextNoteNode from './nodes/CustomTextNoteNode';
import { Info, Copy, Clipboard, Undo, Redo } from 'lucide-react';

const nodeTypes: NodeTypes = {
  rectangle: CustomRectangleNode,
  circle: CustomCircleNode,
  diamond: CustomDiamondNode,
  triangle: CustomTriangleNode,
  hexagon: CustomHexagonNode,
  textNote: CustomTextNoteNode,
};

const Canvas: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    deleteNode,
    deleteEdge,
    setSelectedNodeId,
    selectedNodes,
    copySelectedNodes,
    pasteNodes,
    duplicateSelectedNodes,
    undo,
    redo,
    canUndo,
    canRedo
  } = useWorkflow();

  const { fitView } = useReactFlow();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Delete selected nodes
        const selectedNodesList = nodes.filter(node => node.selected);
        const selectedEdgesList = edges.filter(edge => edge.selected);
        
        selectedNodesList.forEach(node => deleteNode(node.id));
        selectedEdgesList.forEach(edge => deleteEdge(edge.id));
      } else if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'c':
            event.preventDefault();
            copySelectedNodes();
            break;
          case 'v':
            event.preventDefault();
            pasteNodes();
            break;
          case 'd':
            event.preventDefault();
            duplicateSelectedNodes();
            break;
          case 'z':
            event.preventDefault();
            if (event.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            event.preventDefault();
            redo();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, deleteNode, deleteEdge, copySelectedNodes, pasteNodes, duplicateSelectedNodes, undo, redo]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const onSelectionChange = useCallback((params: any) => {
    if (params.nodes.length > 0) {
      setSelectedNodeId(params.nodes[0].id);
    } else {
      setSelectedNodeId(null);
    }
  }, [setSelectedNodeId]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Shift"
        fitView
        attributionPosition="bottom-left"
        className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900"
        // Force exact handle connections
        connectionLineType="smoothstep"
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        <Background 
          color="#64748b" 
          gap={20} 
          size={1}
          className="dark:opacity-30"
        />
        
        <Controls 
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-lg"
        />
        
        <MiniMap 
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-lg"
          nodeColor={(node) => {
            if (node.type === 'rectangle') return '#3b82f6';
            if (node.type === 'circle') return '#10b981';
            if (node.type === 'diamond') return '#f59e0b';
            if (node.type === 'triangle') return '#ef4444';
            if (node.type === 'hexagon') return '#8b5cf6';
            if (node.type === 'textNote') return '#6b7280';
            return '#64748b';
          }}
        />

        {/* Undo/Redo Panel */}
        <Panel position="top-left" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg p-2 m-4 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="flex space-x-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-2 rounded-md transition-colors ${
                canUndo 
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/70' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-2 rounded-md transition-colors ${
                canRedo 
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/70' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </Panel>

        {/* Selection Actions Panel */}
        {selectedNodes.length > 0 && (
          <Panel position="top-right" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg p-3 m-4 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedNodes.length} selected
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={copySelectedNodes}
                  className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
                  title="Copy (Ctrl+C)"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={duplicateSelectedNodes}
                  className="p-2 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/70 transition-colors"
                  title="Duplicate (Ctrl+D)"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Panel>
        )}

        <Panel position="bottom-right" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg p-4 m-4 border border-gray-200/50 dark:border-gray-700/50 shadow-lg max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                Quick Tips
              </h3>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Double-click nodes to edit text (Enter for new lines)</li>
                <li>• Drag corner handles to resize nodes</li>
                <li>• Drag from specific edge handles to connect</li>
                <li>• Shift+click for multi-selection</li>
                <li>• Ctrl+C/V to copy/paste, Ctrl+D to duplicate</li>
                <li>• Ctrl+Z to undo, Ctrl+Shift+Z to redo</li>
                <li>• Delete key to remove selected items</li>
              </ul>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default Canvas;