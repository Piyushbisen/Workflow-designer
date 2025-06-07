import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useWorkflow } from '../../contexts/WorkflowContext';

const CustomTriangleNode: React.FC<NodeProps> = ({ id, data, selected }) => {
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

  const handleResize = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = data.width || 120;
    const startHeight = data.height || 100;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('right')) newWidth = Math.max(60, startWidth + deltaX);
      if (direction.includes('left')) newWidth = Math.max(60, startWidth - deltaX);
      if (direction.includes('bottom')) newHeight = Math.max(40, startHeight + deltaY);
      if (direction.includes('top')) newHeight = Math.max(40, startHeight - deltaY);

      updateNodeData(id, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const width = data.width || 120;
  const height = data.height || 100;

  return (
    <div
      className={`relative group ${selected ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}
      style={{
        width: width,
        height: height,
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top}
        className="w-3 h-3 bg-red-500 border-2 border-white shadow-md"
        style={{ top: '-6px', left: '50%', transform: 'translateX(-50%)' }}
      />
      <Handle 
        type="target" 
        position={Position.Left}
        className="w-3 h-3 bg-red-500 border-2 border-white shadow-md"
        style={{ left: '25%', top: '75%' }}
      />
      
      <svg
        width={width}
        height={height}
        className="cursor-pointer transition-all duration-200 hover:drop-shadow-lg"
        onDoubleClick={handleDoubleClick}
      >
        <polygon
          points={`${width/2},10 10,${height-10} ${width-10},${height-10}`}
          fill={data.backgroundColor || '#ef4444'}
          stroke={data.borderColor || '#dc2626'}
          strokeWidth={data.borderWidth || 2}
          className="drop-shadow-lg"
        />
        
        <foreignObject
          x={width * 0.2}
          y={height * 0.4}
          width={width * 0.6}
          height={height * 0.4}
        >
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className="w-full h-full resize-none border-none outline-none bg-transparent text-center font-medium leading-tight"
              style={{ 
                color: data.textColor || '#ffffff',
                fontSize: '12px'
              }}
              placeholder="Enter text (Ctrl+Enter to save)"
            />
          ) : (
            <div
              className="text-center font-medium leading-tight break-words whitespace-pre-wrap w-full h-full flex items-center justify-center"
              style={{ 
                color: data.textColor || '#ffffff',
                fontSize: '12px'
              }}
            >
              {data.label || 'Warning'}
            </div>
          )}
        </foreignObject>
      </svg>

      {/* Resize Handles */}
      {selected && (
        <>
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-pink-500 border border-white rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onMouseDown={(e) => handleResize(e, 'bottom-right')}
          />
          <div
            className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 border border-white rounded-full cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onMouseDown={(e) => handleResize(e, 'top-right')}
          />
          <div
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-500 border border-white rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onMouseDown={(e) => handleResize(e, 'bottom-left')}
          />
          <div
            className="absolute -top-1 -left-1 w-3 h-3 bg-pink-500 border border-white rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onMouseDown={(e) => handleResize(e, 'top-left')}
          />
        </>
      )}
      
      <Handle 
        type="source" 
        position={Position.Bottom}
        className="w-3 h-3 bg-red-500 border-2 border-white shadow-md"
        style={{ bottom: '-6px', left: '50%', transform: 'translateX(-50%)' }}
      />
      <Handle 
        type="source" 
        position={Position.Right}
        className="w-3 h-3 bg-red-500 border-2 border-white shadow-md"
        style={{ right: '25%', top: '75%' }}
      />
    </div>
  );
};

export default CustomTriangleNode;