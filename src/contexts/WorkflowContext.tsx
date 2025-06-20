import React, { createContext, useContext, useState, useCallback } from 'react';
import { Node, Edge, addEdge, Connection, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';

interface WorkflowAction {
  type: 'ADD_NODE' | 'DELETE_NODE' | 'UPDATE_NODE' | 'ADD_EDGE' | 'DELETE_EDGE' | 'CLEAR_WORKFLOW' | 'LOAD_WORKFLOW';
  payload: any;
  timestamp: number;
}

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
  selectedNodes: Node[];
  copySelectedNodes: () => void;
  pasteNodes: () => void;
  duplicateSelectedNodes: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  history: WorkflowAction[];
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
    fontSize: 14,
    fontWeight: 'medium',
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
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const [history, setHistory] = useState<WorkflowAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const selectedNodes = nodes.filter(node => node.selected);
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const addToHistory = useCallback((action: WorkflowAction) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(action);
      return newHistory.slice(-50); // Keep last 50 actions
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

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
      // Preserve the exact source and target handles from the connection
      const edge = {
        ...connection,
        id: `edge-${Date.now()}`,
        type: 'smoothstep',
        animated: true,
        sourceHandle: connection.sourceHandle, // Keep exact source handle
        targetHandle: connection.targetHandle, // Keep exact target handle
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
      
      setEdges(eds => {
        const newEdges = addEdge(edge, eds);
        addToHistory({
          type: 'ADD_EDGE',
          payload: edge,
          timestamp: Date.now()
        });
        return newEdges;
      });
    },
    [addToHistory]
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
    
    addToHistory({
      type: 'ADD_NODE',
      payload: newNode,
      timestamp: Date.now()
    });
  }, [nodeCounter, addToHistory]);

  const deleteNode = useCallback((nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    const edgesToDelete = edges.filter(edge => edge.source === nodeId || edge.target === nodeId);
    
    setNodes(nds => nds.filter(node => node.id !== nodeId));
    setEdges(eds => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }

    addToHistory({
      type: 'DELETE_NODE',
      payload: { node: nodeToDelete, edges: edgesToDelete },
      timestamp: Date.now()
    });
  }, [selectedNodeId, nodes, edges, addToHistory]);

  const deleteEdge = useCallback((edgeId: string) => {
    const edgeToDelete = edges.find(e => e.id === edgeId);
    setEdges(eds => eds.filter(edge => edge.id !== edgeId));
    
    addToHistory({
      type: 'DELETE_EDGE',
      payload: edgeToDelete,
      timestamp: Date.now()
    });
  }, [edges, addToHistory]);

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    const oldNode = nodes.find(n => n.id === nodeId);
    
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

    addToHistory({
      type: 'UPDATE_NODE',
      payload: { oldNode, newData: data },
      timestamp: Date.now()
    });
  }, [nodes, addToHistory]);

  const clearWorkflow = useCallback(() => {
    const oldState = { nodes, edges };
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setNodeCounter(1);
    
    addToHistory({
      type: 'CLEAR_WORKFLOW',
      payload: oldState,
      timestamp: Date.now()
    });
  }, [nodes, edges, addToHistory]);

  const loadWorkflow = useCallback((data: { nodes: Node[]; edges: Edge[] }) => {
    const oldState = { nodes, edges };
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
    
    addToHistory({
      type: 'LOAD_WORKFLOW',
      payload: { oldState, newState: data },
      timestamp: Date.now()
    });
  }, [nodes, edges, addToHistory]);

  const copySelectedNodes = useCallback(() => {
    setCopiedNodes(selectedNodes);
  }, [selectedNodes]);

  const pasteNodes = useCallback(() => {
    if (copiedNodes.length === 0) return;

    const newNodes = copiedNodes.map(node => ({
      ...node,
      id: `${node.type}-${nodeCounter + copiedNodes.indexOf(node)}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      selected: false,
    }));

    setNodes(nds => [...nds, ...newNodes]);
    setNodeCounter(prev => prev + copiedNodes.length);
  }, [copiedNodes, nodeCounter]);

  const duplicateSelectedNodes = useCallback(() => {
    if (selectedNodes.length === 0) return;

    const newNodes = selectedNodes.map(node => ({
      ...node,
      id: `${node.type}-${nodeCounter + selectedNodes.indexOf(node)}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      selected: false,
    }));

    setNodes(nds => [...nds, ...newNodes]);
    setNodeCounter(prev => prev + selectedNodes.length);
  }, [selectedNodes, nodeCounter]);

  const undo = useCallback(() => {
    if (!canUndo) return;
    
    const action = history[historyIndex];
    
    switch (action.type) {
      case 'ADD_NODE':
        setNodes(nds => nds.filter(n => n.id !== action.payload.id));
        break;
      case 'DELETE_NODE':
        setNodes(nds => [...nds, action.payload.node]);
        setEdges(eds => [...eds, ...action.payload.edges]);
        break;
      case 'ADD_EDGE':
        setEdges(eds => eds.filter(e => e.id !== action.payload.id));
        break;
      case 'DELETE_EDGE':
        setEdges(eds => [...eds, action.payload]);
        break;
      case 'CLEAR_WORKFLOW':
        setNodes(action.payload.nodes);
        setEdges(action.payload.edges);
        break;
      case 'LOAD_WORKFLOW':
        setNodes(action.payload.oldState.nodes);
        setEdges(action.payload.oldState.edges);
        break;
    }
    
    setHistoryIndex(prev => prev - 1);
  }, [canUndo, history, historyIndex]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    
    const action = history[historyIndex + 1];
    
    switch (action.type) {
      case 'ADD_NODE':
        setNodes(nds => [...nds, action.payload]);
        break;
      case 'DELETE_NODE':
        setNodes(nds => nds.filter(n => n.id !== action.payload.node.id));
        setEdges(eds => eds.filter(e => !action.payload.edges.some((edge: Edge) => edge.id === e.id)));
        break;
      case 'ADD_EDGE':
        setEdges(eds => [...eds, action.payload]);
        break;
      case 'DELETE_EDGE':
        setEdges(eds => eds.filter(e => e.id !== action.payload.id));
        break;
      case 'CLEAR_WORKFLOW':
        setNodes([]);
        setEdges([]);
        break;
      case 'LOAD_WORKFLOW':
        setNodes(action.payload.newState.nodes);
        setEdges(action.payload.newState.edges);
        break;
    }
    
    setHistoryIndex(prev => prev + 1);
  }, [canRedo, history, historyIndex]);

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
      setSelectedNodeId,
      selectedNodes,
      copySelectedNodes,
      pasteNodes,
      duplicateSelectedNodes,
      undo,
      redo,
      canUndo,
      canRedo,
      history
    }}>
      {children}
    </WorkflowContext.Provider>
  );
};