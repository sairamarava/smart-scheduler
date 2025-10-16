import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Import react-pdf components dynamically to avoid issues with React 19
let Document, Page, pdfjs;
try {
  // Try to import react-pdf
  const reactPdf = require("react-pdf");
  Document = reactPdf.Document;
  Page = reactPdf.Page;
  pdfjs = reactPdf.pdfjs;

  // Set up PDF.js worker
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
} catch (error) {
  console.error("Error loading react-pdf:", error);
}

const PDFViewer = ({ documentId }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    if (!documentId) return;

    // Get the access token from localStorage and build URL using API_BASE
    const token = localStorage.getItem("accessToken");

    (async () => {
      const { API_BASE } = await import("../utils/api");
      const base = API_BASE || "";
      const url = `${base}/api/documents/${documentId}/download?token=${token}`;
      setPdfUrl(url);
    })();

    // Reset error state when document ID changes
    setError(null);
    setLoading(true);
  }, [documentId]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error("Error loading PDF:", error);
    setError("Failed to load PDF document");
    setLoading(false);
  };

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) => {
      const newPage = prevPageNumber + offset;
      return newPage > 0 && newPage <= numPages ? newPage : prevPageNumber;
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale((prevScale) => Math.min(prevScale + 0.2, 3));
  const zoomOut = () => setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  const resetZoom = () => setScale(1);

  // Handle case where react-pdf module couldn't be loaded
  if (!Document || !Page || !pdfjs) {
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
          PDF Viewer Unavailable
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto text-center">
          The PDF viewer component couldn't be loaded. This may be due to
          compatibility issues with your current React version.
        </p>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Download PDF Instead
        </a>
      </div>
    );
  }

  // Handle error loading specific PDF
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
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-gray-100 p-3 flex items-center justify-between rounded-t-lg border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className={`p-1.5 rounded-full ${
              pageNumber <= 1
                ? "text-gray-400"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>

          <div className="text-sm font-medium">
            {pageNumber} / {numPages || "--"}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className={`p-1.5 rounded-full ${
              !numPages || pageNumber >= numPages
                ? "text-gray-400"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className={`p-1.5 rounded-full ${
              scale <= 0.5 ? "text-gray-400" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={resetZoom}
            className="p-1.5 rounded-full text-gray-700 hover:bg-gray-200"
          >
            <span className="text-xs font-medium">
              {Math.round(scale * 100)}%
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={zoomIn}
            disabled={scale >= 3}
            className={`p-1.5 rounded-full ${
              scale >= 3 ? "text-gray-400" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="flex-1 overflow-auto bg-gray-200 flex justify-center py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-lg"
            />
          </Document>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
