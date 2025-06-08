import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useWorkflow } from '../../contexts/WorkflowContext';

const CustomCircleNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { updateNodeData } = useWorkflow();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label || '');
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
    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = data.width || 120;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      const delta = Math.max(deltaX, deltaY);
      const newSize = Math.max(50, startSize + delta);

      updateNodeData(id, { width: newSize, height: newSize });
    };

    const handleMouseUp = () => {
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
      }}
    >
      {/* Connection Handles with specific IDs for exact positioning */}
      <Handle 
        type="target" 
        position={Position.Top}
        id="top"
        className="w-3 h-3 bg-emerald-500 border-2 border-white shadow-md"
        style={{ left: '50%', transform: 'translateX(-50%)' }}
      />
      <Handle 
        type="target" 
        position={Position.Left}
        id="left"
        className="w-3 h-3 bg-emerald-500 border-2 border-white shadow-md"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle 
        type="target" 
        position={Position.Right}
        id="right"
        className="w-3 h-3 bg-emerald-500 border-2 border-white shadow-md"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle 
        type="target" 
        position={Position.Bottom}
        id="bottom"
        className="w-3 h-3 bg-emerald-500 border-2 border-white shadow-md"
        style={{ left: '50%', transform: 'translateX(-50%)' }}
      />
      
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
            className="w-full h-full resize-none border-none outline-none bg-transparent text-center leading-tight"
            style={{ 
              color: data.textColor || '#ffffff',
              fontSize: `${data.fontSize || 12}px`,
              fontWeight: data.fontWeight || 'medium'
            }}
            placeholder="Enter text (Ctrl+Enter to save)"
          />
        ) : (
          <div
            className="text-center leading-tight break-words whitespace-pre-wrap"
            style={{ 
              color: data.textColor || '#ffffff',
              fontSize: `${data.fontSize || 12}px`,
              fontWeight: data.fontWeight || 'medium'
            }}
          >
            {data.label || 'Start/End'}
          </div>
        )}
      </div>

      {/* Resize Handle */}
      {selected && (
        <div
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-pink-500 border border-white rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onMouseDown={handleResize}
        />
      )}
      
      {/* Source Handles with specific IDs */}
      <Handle 
        type="source" 
        position={Position.Top}
        id="top"
        className="w-3 h-3 bg-emerald-500 border-2 border-white shadow-md"
        style={{ left: '50%', transform: 'translateX(-50%)' }}
      />
      <Handle 
        type="source" 
        position={Position.Left}
        id="left"
        className="w-3 h-3 bg-emerald-500 border-2 border-white shadow-md"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle 
        type="source" 
        position={Position.Right}
        id="right"
        className="w-3 h-3 bg-emerald-500 border-2 border-white shadow-md"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom}
        id="bottom"
        className="w-3 h-3 bg-emerald-500 border-2 border-white shadow-md"
        style={{ left: '50%', transform: 'translateX(-50%)' }}
      />
    </div>
  );
};

export default CustomCircleNode;