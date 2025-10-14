import { useState } from 'react';
import { motion } from 'framer-motion';
import PDFViewer from './PDFViewer';
import SimplePDFViewer from './SimplePDFViewer';

/**
 * A component that allows switching between different PDF viewer implementations
 */
const ToggleablePDFViewer = ({ documentId }) => {
  const [viewerType, setViewerType] = useState('simple'); // 'react-pdf' or 'simple'
  
  return (
    <div className="flex flex-col h-full">
      {/* Viewer selector */}
      <div className="bg-gray-100 px-3 py-2 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">PDF Viewer: </span>
          <select 
            value={viewerType}
            onChange={(e) => setViewerType(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1"
          >
            <option value="simple">Simple (Browser-based)</option>
            <option value="react-pdf">Advanced (react-pdf)</option>
          </select>
        </div>
        
        <div className="text-xs text-gray-500">
          {viewerType === 'simple' ? 'Uses browser PDF capabilities' : 'Enhanced features'}
        </div>
      </div>
      
      {/* PDF Document */}
      <div className="flex-1 overflow-hidden">
        {viewerType === 'react-pdf' ? (
          <PDFViewer documentId={documentId} />
        ) : (
          <SimplePDFViewer documentId={documentId} />
        )}
      </div>
    </div>
  );
};

export default ToggleablePDFViewer;