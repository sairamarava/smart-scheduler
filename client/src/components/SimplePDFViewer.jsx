import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * A simple PDF viewer component that uses the browser's built-in PDF rendering capabilities
 * and provides a fallback for browsers that don't support it.
 */
const SimplePDFViewer = ({ documentId }) => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!documentId) {
      setError('No document ID provided');
      setLoading(false);
      return;
    }

    try {
      // Get the access token from localStorage
      const token = localStorage.getItem('accessToken');
      
      // Set the PDF URL including the token for authentication
      const url = `/api/documents/${documentId}/download?token=${token}`;
      setPdfUrl(url);
      setLoading(false);
    } catch (err) {
      console.error('Error setting up PDF viewer:', err);
      setError('Failed to set up PDF viewer');
      setLoading(false);
    }
  }, [documentId]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setLoading(false);
  };

  // Handle iframe error event
  const handleIframeError = () => {
    setError('Failed to load PDF in the viewer');
    setLoading(false);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Error Loading PDF
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto text-center">
          {error}
        </p>
        {pdfUrl && (
          <a 
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Download PDF Instead
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-gray-100 p-3 flex items-center justify-between rounded-t-lg border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">PDF Viewer</span>
        </div>
        
        {pdfUrl && (
          <a 
            href={pdfUrl}
            download
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Download
          </a>
        )}
      </div>
      
      {/* PDF Document */}
      <div className="flex-1 overflow-hidden bg-gray-200 flex justify-center">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            className="w-full h-full"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="PDF Viewer"
            sandbox="allow-same-origin allow-scripts"
          />
        )}
      </div>
    </div>
  );
};

export default SimplePDFViewer;