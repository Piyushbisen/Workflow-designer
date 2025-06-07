import React, { createContext, useContext, useState, useCallback } from 'react';
import { Node, Edge, addEdge, Connection, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';

interface WorkflowContextType {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  clearWorkflow: () => void;
  loadWorkflow: (data: { nodes: Node[]; edges: Edge[] }) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
};

const getDefaultNodeData = (type: string) => {
  const baseData = {
    borderWidth: 2,
    textColor: '#ffffff',
  };

  switch (type) {
    case 'rectangle':
      return {
        ...baseData,
        width: 180,
        height: 80,
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        label: 'Process'
      };
    case 'circle':
      return {
        ...baseData,
        width: 120,
        height: 120,
        backgroundColor: '#10b981',
        borderColor: '#047857',
        label: 'Start/End'
      };
    case 'diamond':
      return {
        ...baseData,
        width: 140,
        height: 100,
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        label: 'Decision'
      };
    case 'triangle':
      return {
        ...baseData,
        width: 120,
        height: 100,
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        label: 'Warning'
      };
    case 'hexagon':
      return {
        ...baseData,
        width: 140,
        height: 120,
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        label: 'Preparation'
      };
    case 'textNote':
      return {
        ...baseData,
        width: 200,
        height: 100,
        backgroundColor: '#fef3c7',
        borderColor: '#f59e0b',
        textColor: '#92400e',
        label: 'Add your notes here...'
      };
    default:
      return {
        ...baseData,
        width: 150,
        height: 80,
        backgroundColor: '#64748b',
        borderColor: '#475569',
        label: 'Node'
      };
  }
};

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeCounter, setNodeCounter] = useState(1);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes(nds => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges(eds => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = {
        ...connection,
        id: `edge-${Date.now()}`,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: 'arrowclosed',
          width: 20,
          height: 20,
          color: '#64748b',
        },
        style: { 
          stroke: '#64748b', 
          strokeWidth: 2,
        }
      };
      setEdges(eds => addEdge(edge, eds));
    },
    []
  );

  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    const nodeData = getDefaultNodeData(type);
    const newNode: Node = {
      id: `${type}-${nodeCounter}`,
      type,
      position,
      data: nodeData,
      style: {
        width: nodeData.width,
        height: nodeData.height,
      }
    };

    setNodes(nds => [...nds, newNode]);
    setNodeCounter(prev => prev + 1);
  }, [nodeCounter]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(nds => nds.filter(node => node.id !== nodeId));
    setEdges(eds => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges(eds => eds.filter(edge => edge.id !== edgeId));
  }, []);

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes(nds => 
      nds.map(node => 
        node.id === nodeId 
          ? { 
              ...node, 
              data: { ...node.data, ...data },
              style: {
                ...node.style,
                width: data.width || node.style?.width,
                height: data.height || node.style?.height,
              }
            } 
          : node
      )
    );
  }, []);

  const clearWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setNodeCounter(1);
  }, []);

  const loadWorkflow = useCallback((data: { nodes: Node[]; edges: Edge[] }) => {
    setNodes(data.nodes);
    setEdges(data.edges);
    const maxCounter = Math.max(
      ...data.nodes.map(node => {
        const match = node.id.match(/-(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      }),
      0
    );
    setNodeCounter(maxCounter + 1);
  }, []);

  return (
    <WorkflowContext.Provider value={{
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      addNode,
      deleteNode,
      deleteEdge,
      updateNodeData,
      clearWorkflow,
      loadWorkflow,
      selectedNodeId,
      setSelectedNodeId
    }}>
      {children}
    </WorkflowContext.Provider>
  );
};