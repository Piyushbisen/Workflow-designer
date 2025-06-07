import React, { useState } from 'react';
import { useWorkflow } from '../contexts/WorkflowContext';
import { toPng, toJpeg, toSvg } from 'html2canvas';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { Download, Image, FileText, Code, Loader } from 'lucide-react';

const ExportPanel: React.FC = () => {
  const { nodes, edges } = useWorkflow();
  const [isExporting, setIsExporting] = useState(false);

  const exportToPNG = async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector('.react-flow__viewport');
      if (element) {
        const canvas = await html2canvas(element as HTMLElement, {
          backgroundColor: 'transparent',
          scale: 2,
          useCORS: true,
        });
        
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `workflow-${Date.now()}.png`);
          }
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJPEG = async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector('.react-flow__viewport');
      if (element) {
        const canvas = await html2canvas(element as HTMLElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
        });
        
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `workflow-${Date.now()}.jpg`);
          }
        }, 'image/jpeg', 0.9);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector('.react-flow__viewport');
      if (element) {
        const canvas = await html2canvas(element as HTMLElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`workflow-${Date.now()}.pdf`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    const data = {
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    saveAs(blob, `workflow-${Date.now()}.json`);
  };

  const exportOptions = [
    {
      label: 'PNG Image',
      description: 'High-quality with transparency',
      icon: Image,
      onClick: exportToPNG,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50'
    },
    {
      label: 'JPEG Image',
      description: 'Compressed with white background',
      icon: Image,
      onClick: exportToJPEG,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50'
    },
    {
      label: 'PDF Document',
      description: 'Professional document format',
      icon: FileText,
      onClick: exportToPDF,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50'
    },
    {
      label: 'JSON Data',
      description: 'Editable workflow data',
      icon: Code,
      onClick: exportToJSON,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50'
    }
  ];

  if (nodes.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Download className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Add some elements to enable export
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exportOptions.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.label}
            onClick={option.onClick}
            disabled={isExporting}
            className={`w-full p-3 rounded-lg ${option.bg} transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center space-x-3">
              {isExporting ? (
                <Loader className="w-5 h-5 animate-spin text-gray-500" />
              ) : (
                <Icon className={`w-5 h-5 ${option.color}`} />
              )}
              <div className="flex-1">
                <div className={`font-medium ${option.color}`}>
                  {option.label}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {option.description}
                </div>
              </div>
            </div>
          </button>
        );
      })}
      
      {isExporting && (
        <div className="text-center py-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Preparing export...
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPanel;