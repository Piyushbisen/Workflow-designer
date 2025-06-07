import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { useWorkflow } from '../../contexts/WorkflowContext';

const CustomCircleNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { updateNodeData } = useWorkflow();
  const { setNodes } = useReactFlow();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label || '');
  const [resizing, setResizing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(data.label || '');
  };

  const handleSubmit = () => {
    updateNodeData(id, { label: editValue });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(data.label || '');
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  const handleBlur = () => {
    handleSubmit();
  };

  const handleResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = data.width || 120;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const delta = Math.max(deltaX, deltaY);
      const newSize = Math.max(50, startSize + delta);

      // Update node dimensions via context
      updateNodeData(id, { width: newSize, height: newSize });

      // Also directly set size in React Flow node state to ensure render
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  width: newSize,
                  height: newSize,
                },
              }
            : node
        )
      );
    };

    const handleMouseUp = () => {
      setResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const size = data.width || 120;

  return (
    <div
      className={`relative group ${selected ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
      style={{
        width: size,
        height: size,
        pointerEvents: resizing ? 'none' : 'auto',
      }}
      onMouseDown={(e) => {
        if (resizing) e.stopPropagation(); // prevent drag during resize
      }}
    >
      {/* Target Handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-500 border-2 border-white shadow-md" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-emerald-500 border-2 border-white shadow-md" />

      {/* Circular Node UI */}
      <div
        className="w-full h-full rounded-full shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl flex items-center justify-center p-3"
        style={{
          backgroundColor: data.backgroundColor || '#10b981',
          borderColor: data.borderColor || '#047857',
          borderWidth: `${data.borderWidth || 2}px`,
          borderStyle: 'solid',
        }}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="w-full h-full resize-none border-none outline-none bg-transparent text-center font-medium leading-tight"
            style={{ color: data.textColor || '#ffffff', fontSize: '12px' }}
            placeholder="Enter text (Ctrl+Enter to save)"
          />
        ) : (
          <div
            className="text-center font-medium leading-tight break-words whitespace-pre-wrap"
            style={{ color: data.textColor || '#ffffff', fontSize: '12px' }}
          >
            {data.label || 'Start/End'}
          </div>
        )}
      </div>

      {/* Resize Handle */}
      {selected && (
        <div
          className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-pink-500 border border-white rounded-full cursor-nwse-resize z-10"
          onMouseDown={handleResize}
          style={{ pointerEvents: 'auto' }}
        />
      )}

      {/* Source Handles */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500 border-2 border-white shadow-md" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-emerald-500 border-2 border-white shadow-md" />
    </div>
  );
};

export default CustomCircleNode;
