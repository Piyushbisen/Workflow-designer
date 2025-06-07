import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  useReactFlow,
  Panel,
  NodeTypes
} from 'reactflow';
import { useWorkflow } from '../contexts/WorkflowContext';
import CustomRectangleNode from './nodes/CustomRectangleNode';
import CustomCircleNode from './nodes/CustomCircleNode';
import CustomDiamondNode from './nodes/CustomDiamondNode';
import CustomTriangleNode from './nodes/CustomTriangleNode';
import CustomHexagonNode from './nodes/CustomHexagonNode';
import CustomTextNoteNode from './nodes/CustomTextNoteNode';
import { Info } from 'lucide-react';

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
    setSelectedNodeId
  } = useWorkflow();

  const { fitView } = useReactFlow();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Delete selected nodes
        const selectedNodes = nodes.filter(node => node.selected);
        const selectedEdges = edges.filter(edge => edge.selected);
        
        selectedNodes.forEach(node => deleteNode(node.id));
        selectedEdges.forEach(edge => deleteEdge(edge.id));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, deleteNode, deleteEdge]);

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
        fitView
        attributionPosition="bottom-left"
        className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900"
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

        <Panel position="top-right" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg p-4 m-4 border border-gray-200/50 dark:border-gray-700/50 shadow-lg max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                Quick Tips
              </h3>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Double-click nodes to edit text (use Enter for new lines)</li>
                <li>• Drag corner handles to resize nodes</li>
                <li>• Drag from any edge to auto-connect nodes</li>
                <li>• Select and press Delete to remove items</li>
                <li>• Use the sidebar to customize and export</li>
              </ul>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default Canvas;