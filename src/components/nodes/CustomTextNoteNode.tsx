import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { FileText } from 'lucide-react';

const CustomTextNoteNode: React.FC<NodeProps> = ({ id, data, selected }) => {
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
    const startWidth = data.width || 200;
    const startHeight = data.height || 100;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('right')) newWidth = Math.max(100, startWidth + deltaX);
      if (direction.includes('left')) newWidth = Math.max(100, startWidth - deltaX);
      if (direction.includes('bottom')) newHeight = Math.max(60, startHeight + deltaY);
      if (direction.includes('top')) newHeight = Math.max(60, startHeight - deltaY);

      updateNodeData(id, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`relative group ${selected ? 'ring-2 ring-yellow-500 ring-offset-2' : ''}`}
      style={{
        width: data.width || 200,
        height: data.height || 100,
      }}
    >
      {/* Connection Handles with specific IDs for exact positioning */}
      <Handle 
        type="target" 
        position={Position.Top}
        id="top"
        className="w-3 h-3 bg-yellow-500 border-2 border-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ top: '-6px', left: '50%', transform: 'translateX(-50%)' }}
      />
      <Handle 
        type="target" 
        position={Position.Left}
        id="left"
        className="w-3 h-3 bg-yellow-500 border-2 border-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: '-6px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle 
        type="target" 
        position={Position.Right}
        id="right"
        className="w-3 h-3 bg-yellow-500 border-2 border-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle 
        type="target" 
        position={Position.Bottom}
        id="bottom"
        className="w-3 h-3 bg-yellow-500 border-2 border-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ bottom: '-6px', left: '50%', transform: 'translateX(-50%)' }}
      />
      
      <div
        className="w-full h-full rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl p-3 relative overflow-hidden"
        style={{
          backgroundColor: data.backgroundColor || '#fef3c7',
          borderColor: data.borderColor || '#f59e0b',
          borderWidth: `${data.borderWidth || 2}px`,
          borderStyle: 'dashed',
        }}
        onDoubleClick={handleDoubleClick}
      >
        {/* Note icon */}
        <div className="absolute top-2 right-2 opacity-20">
          <FileText className="w-5 h-5" style={{ color: data.textColor || '#92400e' }} />
        </div>

        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="w-full h-full resize-none border-none outline-none bg-transparent font-medium leading-relaxed"
            style={{ 
              color: data.textColor || '#92400e',
              fontSize: '13px'
            }}
            placeholder="Enter your notes here... (Ctrl+Enter to save)"
          />
        ) : (
          <div
            className="w-full h-full font-medium leading-relaxed break-words whitespace-pre-wrap overflow-auto"
            style={{ 
              color: data.textColor || '#92400e',
              fontSize: '13px'
            }}
          >
            {data.label || 'Add your notes here...'}
          </div>
        )}
      </div>

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
      
      {/* Source Handles with specific IDs */}
      <Handle 
        type="source" 
        position={Position.Top}
        id="top"
        className="w-3 h-3 bg-yellow-500 border-2 border-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ top: '-6px', left: '50%', transform: 'translateX(-50%)' }}
      />
      <Handle 
        type="source" 
        position={Position.Left}
        id="left"
        className="w-3 h-3 bg-yellow-500 border-2 border-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: '-6px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle 
        type="source" 
        position={Position.Right}
        id="right"
        className="w-3 h-3 bg-yellow-500 border-2 border-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom}
        id="bottom"
        className="w-3 h-3 bg-yellow-500 border-2 border-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ bottom: '-6px', left: '50%', transform: 'translateX(-50%)' }}
      />
    </div>
  );
};

export default CustomTextNoteNode;