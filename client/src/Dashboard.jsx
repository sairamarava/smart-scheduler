import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// Import our toggleable PDF viewer component
import ToggleablePDFViewer from "./components/ToggleablePDFViewer";

// Document category icon components
const PDFIcon = () => (
  <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="w-6 h-6 text-red-500"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  </div>
);

const SubjectIcon = () => (
  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="w-6 h-6 text-blue-500"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  </div>
);

const CollegeIcon = () => (
  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="w-6 h-6 text-green-500"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2l10 6.5v7L12 22 2 15.5v-7L12 2z"></path>
      <polyline points="12 22 12 15 2 9.5"></polyline>
      <polyline points="22 9.5 12 15 12 22"></polyline>
      <line x1="2" y1="9.5" x2="12" y2="2"></line>
      <line x1="12" y1="2" x2="22" y2="9.5"></line>
    </svg>
  </div>
);

const RecentIcon = () => (
  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="w-6 h-6 text-purple-500"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  </div>
);

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activeView, setActiveView] = useState("all");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    college: "",
    document: null,
  });
  const [subjects, setSubjects] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [starredDocuments, setStarredDocuments] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success"); // success, error, info
  const [sortOption, setSortOption] = useState("createdAt-desc"); // Default: newest first
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsPerPage] = useState(12); // How many documents to show per page

  useEffect(() => {
    fetchDocuments();
    // Load starred documents from localStorage
    const storedStarred = localStorage.getItem("starredDocuments");
    if (storedStarred) {
      setStarredDocuments(JSON.parse(storedStarred));
    }
  }, []);

  // Handle click outside of dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close sort dropdown if clicking outside
      if (showSortDropdown && !e.target.closest(".sort-dropdown")) {
        setShowSortDropdown(false);
      }

      // Close profile dropdown if clicking outside
      if (showProfileDropdown && !e.target.closest(".profile-dropdown")) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSortDropdown, showProfileDropdown]);

  // Show notification toast
  const showToast = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const fetchDocuments = async (query = "", subject = "", college = "") => {
    try {
      let url = "/api/documents?";
      if (query) url += `search=${encodeURIComponent(query)}&`;
      if (subject) url += `subject=${encodeURIComponent(subject)}&`;
      if (college) url += `college=${encodeURIComponent(college)}&`;

      const token = localStorage.getItem("accessToken");
      const { apiFetch } = await import("./utils/api");

      // apiFetch will route through VITE_API_URL when set and throw structured errors
      const data = await apiFetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDocuments(data.documents);
      // Apply sorting before setting searchResults
      setSearchResults(sortDocuments(data.documents, sortOption));

      // Extract unique subjects and colleges for filters
      const allSubjects = [
        ...new Set(data.documents.map((doc) => doc.subject).filter(Boolean)),
      ].sort();

      const allColleges = [
        ...new Set(data.documents.map((doc) => doc.college).filter(Boolean)),
      ].sort();

      setSubjects(allSubjects);
      setColleges(allColleges);
    } catch (error) {
      // apiFetch throws { status, body } for non-2xx; surface useful messages
      if (error && error.body) {
        console.error("Error fetching documents (body):", error.body);
      } else {
        console.error("Error fetching documents:", error);
      }
      showToast("Failed to load documents", "error");
    }
  };

  // Handle starring/favoriting documents
  const handleToggleStar = (e, docId) => {
    e.stopPropagation();

    setStarredDocuments((prevStarred) => {
      let newStarred;

      if (prevStarred.includes(docId)) {
        // Remove from starred
        newStarred = prevStarred.filter((id) => id !== docId);
        showToast("Removed from favorites");
      } else {
        // Add to starred
        newStarred = [...prevStarred, docId];
        showToast("Added to favorites");
      }

      // Save to localStorage
      localStorage.setItem("starredDocuments", JSON.stringify(newStarred));
      return newStarred;
    });
  };

  // Handle document deletion
  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      const token = localStorage.getItem("accessToken");
      const { apiFetch } = await import("./utils/api");
      await apiFetch(`/api/documents/${documentToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove document from list
      setDocuments((prevDocs) =>
        prevDocs.filter((doc) => doc._id !== documentToDelete._id)
      );

      // Close confirmation modal
      setShowDeleteConfirmation(false);
      setDocumentToDelete(null);

      // If the deleted document was selected, clear selection
      if (selectedDocument && selectedDocument._id === documentToDelete._id) {
        setSelectedDocument(null);
      }

      // Show success message
      showToast("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      showToast(error.message || "Failed to delete document", "error");
    }
  };

  // Handle sharing document
  const handleShareDocument = (e, doc) => {
    e.stopPropagation();

    // Generate a share link (in a real app, you'd use a proper sharing API)
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/view/${doc._id}`;

    setShareLink(shareUrl);
    setShowShareModal(true);
  };

  // Copy share link to clipboard
  const copyShareLink = () => {
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        showToast("Link copied to clipboard");
      })
      .catch(() => {
        showToast("Failed to copy link", "error");
      });
  };

  // Preview document
  const handlePreviewDocument = (e, doc) => {
    e.stopPropagation();
    setSelectedDocument(doc);
    setShowPreviewModal(true);
  };

  const handleLogout = async () => {
    try {
      const { apiFetch } = await import("./utils/api");
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // ignore logout errors
    }
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, document: e.target.files[0] });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!formData.document || formData.document.type !== "application/pdf") {
      setUploadError("Please select a PDF file");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("subject", formData.subject);
      data.append("college", formData.college);
      data.append("document", formData.document);

      const token = localStorage.getItem("accessToken");
      const { apiFetch } = await import("./utils/api");
      await apiFetch("/api/documents/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      // Reset form and fetch updated documents
      setFormData({ name: "", subject: "", college: "", document: null });
      if (document.getElementById("document-upload")) {
        document.getElementById("document-upload").value = "";
      }

      // Close modal and refresh documents
      closeUploadModal();
      fetchDocuments();

      // Show success notification (could be implemented with a toast)
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDocuments(searchQuery, selectedSubject, selectedCollege);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedSubject("");
    setSelectedCollege("");
    setActiveView("all");
    fetchDocuments();
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const handleDownload = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");

      // Create download animation using motion
      const doc = documents.find((d) => d._id === id);
      if (doc) {
        // Here you could add animation or notification logic
        console.log(`Downloading: ${doc.name}`);
      }

      // Use API_BASE in case VITE_API_URL is set (ensures we hit backend, not the SPA)
      const { API_BASE } = await import("./utils/api");
      const downloadUrl = `${
        API_BASE || ""
      }/api/documents/${id}/download?token=${token}`;
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  // Document view mode toggle
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Upload modal control
  const openUploadModal = () => {
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
  };

  // Sort documents based on sort option
  const sortDocuments = (docs, option) => {
    const sortedDocs = [...docs];

    switch (option) {
      case "name-asc":
        return sortedDocs.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sortedDocs.sort((a, b) => b.name.localeCompare(a.name));
      case "subject-asc":
        return sortedDocs.sort((a, b) => a.subject.localeCompare(b.subject));
      case "subject-desc":
        return sortedDocs.sort((a, b) => b.subject.localeCompare(a.subject));
      case "college-asc":
        return sortedDocs.sort((a, b) => a.college.localeCompare(b.college));
      case "college-desc":
        return sortedDocs.sort((a, b) => b.college.localeCompare(a.college));
      case "createdAt-desc":
        return sortedDocs.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "createdAt-asc":
        return sortedDocs.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      default:
        return sortedDocs;
    }
  };

  // Handle sorting change
  const handleSortChange = (option) => {
    setSortOption(option);
    setShowSortDropdown(false);
    setSearchResults(sortDocuments(searchResults, option));
    setCurrentPage(1); // Reset to first page when changing sort
  };

  // Pagination logic
  const indexOfLastDocument = currentPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = searchResults.slice(
    indexOfFirstDocument,
    indexOfLastDocument
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(searchResults.length / documentsPerPage);

  // Document selection handling
  const handleDocumentClick = (doc) => {
    setSelectedDocument(doc);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen flex flex-col bg-white overflow-hidden"
    >
      {/* Premium Header/Navbar */}
      <motion.header
        className="relative z-30"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
      >
        <div className="bg-white backdrop-blur-md bg-opacity-90 border-b border-gray-100 shadow-sm">
          {/* Main navbar content */}
          <div className="max-w-[2000px] mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Left section - Logo and menu toggle */}
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  onClick={toggleSidebar}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-blue-50 text-blue-600"
                  aria-label="Toggle sidebar"
                >
                  {showSidebar ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </motion.button>

                <motion.div
                  className="flex items-center"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {/* Logo */}
                  <div className="flex items-center">
                    <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                      Smart Scheduler
                    </h1>
                    <div className="hidden lg:block ml-2">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-xs text-white px-2 py-1 rounded-full font-medium">
                        beta
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Center section - Search Bar */}
              <motion.div
                className="hidden md:block flex-1 max-w-2xl mx-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
              >
                <form onSubmit={handleSearch} className="relative group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents..."
                    className="w-full h-11 px-12 rounded-full bg-gray-50 border border-gray-200 group-hover:border-blue-300 focus:border-blue-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:ring-offset-1"
                  />
                  <div className="absolute left-3 top-2.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  <div className="absolute right-4 top-2 flex space-x-1">
                    {searchQuery && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-gray-400 hover:text-gray-600 p-1.5"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.button>
                    )}

                    <div className="h-7 border-r border-gray-300"></div>

                    <div className="bg-white text-gray-400 text-xs px-2 flex items-center rounded hover:bg-gray-50">
                      <span>Filters</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </form>
              </motion.div>

              {/* Right section - Actions and Profile */}
              <div className="flex items-center space-x-1 md:space-x-3">
                {/* User profile dropdown */}
                <div className="relative profile-dropdown">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center cursor-pointer"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  >
                    <div className="hidden md:block mr-3 text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {user?.name || "User"}
                      </p>
                    </div>
                    <div className="flex items-center relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-yellow-100 border-2 border-white shadow-sm">
                        {user?.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={`${user?.name || "User"}'s profile`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";
                            }}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-medium text-lg">
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 text-gray-500 ml-1 transition-transform duration-200 ${
                          showProfileDropdown ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </motion.div>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {showProfileDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">
                            Signed in as
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {user?.email || "user@example.com"}
                          </p>
                        </div>

                        <div className="py-1">
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-3 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Profile Settings
                          </button>

                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-3 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            Account Settings
                          </button>

                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-3 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Help &amp; Support
                          </button>
                        </div>

                        <div className="py-1 border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Logout button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.95, rotate: -10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  onClick={handleLogout}
                  className="flex items-center justify-center w-10 h-10 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Mobile search */}
          <motion.div
            className="md:hidden px-4 pb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-full h-11 px-11 py-3 rounded-full bg-gray-50 border border-gray-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <div className="absolute left-3.5 top-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {searchQuery && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-3 text-gray-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.button>
              )}
            </form>
          </motion.div>
        </div>

        {/* Subtle glow effect at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-50"></div>
      </motion.header>

      {/* Main Layout - Sidebar and Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                delay: 0.1,
              }}
              className="w-72 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col overflow-hidden"
            >
              <motion.div
                className="p-5 flex-1 overflow-y-auto custom-scrollbar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Main Navigation */}
                <nav>
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Files
                      </h2>
                      <span className="text-xs font-medium text-gray-400">
                        {documents.length}
                      </span>
                    </div>

                    <ul className="space-y-1.5">
                      <li>
                        <motion.button
                          onClick={() => {
                            setActiveView("all");
                            setCurrentPage(1);
                          }}
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.97 }}
                          className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeView === "all"
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                              : "text-gray-700 hover:bg-blue-50"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                              activeView === "all"
                                ? "bg-blue-400 bg-opacity-30"
                                : "bg-blue-100"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-5 w-5 ${
                                activeView === "all"
                                  ? "text-white"
                                  : "text-blue-600"
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <span className="ml-3">All Documents</span>
                          <span
                            className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                              activeView === "all"
                                ? "bg-white bg-opacity-30 text-white"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {documents.length}
                          </span>
                        </motion.button>
                      </li>

                      <li>
                        <motion.button
                          onClick={() => {
                            setActiveView("recent");
                            fetchDocuments();
                            setCurrentPage(1);
                          }}
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.97 }}
                          className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeView === "recent"
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                              : "text-gray-700 hover:bg-blue-50"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                              activeView === "recent"
                                ? "bg-blue-400 bg-opacity-30"
                                : "bg-purple-100"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-5 w-5 ${
                                activeView === "recent"
                                  ? "text-white"
                                  : "text-purple-600"
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <span className="ml-3">Recent</span>
                        </motion.button>
                      </li>

                      <li>
                        <motion.button
                          onClick={() => {
                            setActiveView("starred");
                            // Filter documents to show only starred ones
                            const starredDocs = documents.filter((doc) =>
                              starredDocuments.includes(doc._id)
                            );
                            setSearchResults(starredDocs);
                            setCurrentPage(1);
                          }}
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.97 }}
                          className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeView === "starred"
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                              : "text-gray-700 hover:bg-blue-50"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                              activeView === "starred"
                                ? "bg-blue-400 bg-opacity-30"
                                : "bg-yellow-100"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-5 w-5 ${
                                activeView === "starred"
                                  ? "text-white"
                                  : "text-yellow-600"
                              }`}
                              fill={
                                activeView === "starred"
                                  ? "currentColor"
                                  : "none"
                              }
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                          </div>
                          <span className="ml-3">Starred</span>
                          <span
                            className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                              activeView === "starred"
                                ? "bg-white bg-opacity-30 text-white"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {starredDocuments.length}
                          </span>
                        </motion.button>
                      </li>
                    </ul>
                  </div>

                  {/* Subject Categories with enhanced styling */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Subjects
                      </h2>
                      <motion.button
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </motion.button>
                    </div>

                    <ul className="space-y-1.5">
                      {subjects.length === 0 ? (
                        <motion.li
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center py-6 text-center"
                        >
                          <div className="w-12 h-12 mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-500">
                            No subjects found
                          </span>
                          <p className="text-xs text-gray-400 mt-1">
                            Upload documents to create subjects
                          </p>
                        </motion.li>
                      ) : (
                        subjects.map((subject, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <motion.button
                              onClick={() => {
                                setSelectedSubject(subject);
                                setActiveView("subject");
                                fetchDocuments("", subject, "");
                                setCurrentPage(1);
                              }}
                              whileHover={{ x: 3 }}
                              whileTap={{ scale: 0.97 }}
                              className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                activeView === "subject" &&
                                selectedSubject === subject
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                                  : "text-gray-700 hover:bg-blue-50"
                              }`}
                            >
                              <div
                                className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                                  activeView === "subject" &&
                                  selectedSubject === subject
                                    ? "bg-blue-400 bg-opacity-30"
                                    : "bg-blue-100"
                                }`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`h-5 w-5 ${
                                    activeView === "subject" &&
                                    selectedSubject === subject
                                      ? "text-white"
                                      : "text-blue-600"
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                  />
                                </svg>
                              </div>
                              <span className="ml-3 truncate">{subject}</span>

                              <span className="ml-auto">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`h-4 w-4 ${
                                    activeView === "subject" &&
                                    selectedSubject === subject
                                      ? "text-white"
                                      : "text-gray-400"
                                  }`}
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
                              </span>
                            </motion.button>
                          </motion.li>
                        ))
                      )}
                    </ul>
                  </div>

                  {/* College Categories with enhanced styling */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Colleges
                      </h2>
                      <motion.button
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </motion.button>
                    </div>

                    <ul className="space-y-1.5">
                      {colleges.length === 0 ? (
                        <motion.li
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center py-6 text-center"
                        >
                          <div className="w-12 h-12 mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-500">
                            No colleges found
                          </span>
                          <p className="text-xs text-gray-400 mt-1">
                            Upload documents to create colleges
                          </p>
                        </motion.li>
                      ) : (
                        colleges.map((college, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <motion.button
                              onClick={() => {
                                setSelectedCollege(college);
                                setActiveView("college");
                                fetchDocuments("", "", college);
                                setCurrentPage(1);
                              }}
                              whileHover={{ x: 3 }}
                              whileTap={{ scale: 0.97 }}
                              className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                activeView === "college" &&
                                selectedCollege === college
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                                  : "text-gray-700 hover:bg-blue-50"
                              }`}
                            >
                              <div
                                className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                                  activeView === "college" &&
                                  selectedCollege === college
                                    ? "bg-blue-400 bg-opacity-30"
                                    : "bg-green-100"
                                }`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`h-5 w-5 ${
                                    activeView === "college" &&
                                    selectedCollege === college
                                      ? "text-white"
                                      : "text-green-600"
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                                  />
                                </svg>
                              </div>
                              <span className="ml-3 truncate">{college}</span>

                              <span className="ml-auto">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`h-4 w-4 ${
                                    activeView === "college" &&
                                    selectedCollege === college
                                      ? "text-white"
                                      : "text-gray-400"
                                  }`}
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
                              </span>
                            </motion.button>
                          </motion.li>
                        ))
                      )}
                    </ul>
                  </div>
                </nav>
              </motion.div>

              {/* Storage indicator */}
              <div className="p-5 border-t border-gray-200">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">
                      Storage
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      {documents.length * 2.5 < 1000
                        ? `${(documents.length * 2.5).toFixed(1)} MB`
                        : `${((documents.length * 2.5) / 1000).toFixed(
                            1
                          )} GB`}{" "}
                      / 15 GB
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(
                          ((documents.length * 2.5) / 15000) * 100,
                          100
                        )}%`,
                      }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                {/* Storage usage info only */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Main Content */}
        <motion.div
          layout
          className="flex-1 overflow-y-auto bg-gray-50 pt-6 px-6 pb-10"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Professional Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md mb-8 overflow-hidden"
          >
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="mb-4 md:mb-0 md:mr-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    The Smarter Way to Share Study Materials
                  </h2>
                  <p className="text-gray-600 max-w-2xl">
                    Securely upload and share your lecture notes, assignments,
                    and study resources with your classmates. Collaborate
                    efficiently and get better grades together.
                  </p>
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.03,
                    boxShadow:
                      "0 15px 25px -5px rgba(59, 130, 246, 0.4), 0 8px 10px -6px rgba(79, 70, 229, 0.3)",
                    background:
                      "linear-gradient(135deg, rgba(99, 179, 237, 1) 0%, rgba(79, 70, 229, 1) 100%)",
                  }}
                  whileTap={{
                    scale: 0.97,
                    boxShadow:
                      "0 5px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -4px rgba(79, 70, 229, 0.2)",
                  }}
                  initial={{
                    boxShadow:
                      "0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -4px rgba(59, 130, 246, 0.1)",
                  }}
                  animate={{
                    boxShadow: [
                      "0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -4px rgba(59, 130, 246, 0.1)",
                      "0 12px 20px -3px rgba(59, 130, 246, 0.3), 0 6px 8px -4px rgba(79, 70, 229, 0.2)",
                      "0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -4px rgba(59, 130, 246, 0.1)",
                    ],
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    },
                  }}
                  onClick={openUploadModal}
                  className="group relative flex items-center px-7 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl overflow-hidden transition-all duration-300"
                  style={{
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                  }}
                >
                  {/* Glossy overlay */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -inset-x-5 -top-20 h-32 w-auto transform rotate-12 bg-white opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                    <div className="absolute -inset-x-5 top-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-transparent opacity-10 group-hover:opacity-15 transition-opacity duration-500"></div>
                  </div>

                  {/* Icon with glow effect */}
                  <div className="relative mr-2.5 flex items-center justify-center">
                    <div className="absolute -inset-1 bg-white rounded-full blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="relative h-5 w-5 group-hover:scale-110 transition-transform duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  </div>

                  {/* Text with subtle animation */}
                  <span className="relative font-semibold tracking-wide group-hover:tracking-wider transition-all duration-300">
                    Upload Documents
                  </span>

                  {/* Trailing indicator */}
                  <div className="relative ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
                  </div>
                </motion.button>
              </div>

              {/* Popular Tags Section */}
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-500 mb-3">
                  Popular categories
                </p>
                <div className="flex flex-wrap gap-2">
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-sm font-medium cursor-pointer transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    Lecture Notes
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex items-center px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-full text-sm font-medium cursor-pointer transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Assignments
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex items-center px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded-full text-sm font-medium cursor-pointer transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    Study Guides
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex items-center px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-full text-sm font-medium cursor-pointer transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Exam Prep
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex items-center px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-full text-sm font-medium cursor-pointer transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    Discussion Materials
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex items-center px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium cursor-pointer transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                      />
                    </svg>
                    Research Papers
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Header based on current view with enhanced styling */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeView === "all" && "All Documents"}
                  {activeView === "recent" && "Recent Documents"}
                  {activeView === "subject" && selectedSubject}
                  {activeView === "college" && selectedCollege}
                </h1>
                <div className="ml-3">
                  {(selectedSubject || selectedCollege || searchQuery) && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleClearFilters}
                      className="flex items-center justify-center h-7 px-3 bg-blue-50 rounded-full text-xs font-medium text-blue-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Clear filters
                    </motion.button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1.5">
                {documents.length === 0
                  ? "No documents found"
                  : `${documents.length} document${
                      documents.length === 1 ? "" : "s"
                    } available`}
              </p>
            </motion.div>

            {/* View toggles */}
            <motion.div
              className="flex items-center space-x-2 mt-4 md:mt-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
                {/* Grid view toggle */}
                <motion.button
                  whileHover={{ backgroundColor: "#f3f4f6" }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-md text-blue-600"
                  title="Grid view"
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
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </motion.button>

                {/* List view toggle */}
                <motion.button
                  whileHover={{ backgroundColor: "#f3f4f6" }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-md text-gray-400"
                  title="List view"
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
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </motion.button>
              </div>

              {/* Sort dropdown button */}
              <div className="relative sort-dropdown">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="h-10 px-3 flex items-center text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1.5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                    />
                  </svg>
                  {sortOption === "name-asc" && "Name (A-Z)"}
                  {sortOption === "name-desc" && "Name (Z-A)"}
                  {sortOption === "subject-asc" && "Subject (A-Z)"}
                  {sortOption === "subject-desc" && "Subject (Z-A)"}
                  {sortOption === "college-asc" && "College (A-Z)"}
                  {sortOption === "college-desc" && "College (Z-A)"}
                  {sortOption === "createdAt-desc" && "Date (Newest)"}
                  {sortOption === "createdAt-asc" && "Date (Oldest)"}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                      showSortDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.button>

                {/* Sort dropdown menu */}
                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100"
                    >
                      <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        Sort by
                      </h3>
                      <div className="py-1">
                        <button
                          onClick={() => handleSortChange("name-asc")}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center justify-between ${
                            sortOption === "name-asc"
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700"
                          }`}
                        >
                          <span>Name (A-Z)</span>
                          {sortOption === "name-asc" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleSortChange("name-desc")}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center justify-between ${
                            sortOption === "name-desc"
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700"
                          }`}
                        >
                          <span>Name (Z-A)</span>
                          {sortOption === "name-desc" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={() => handleSortChange("subject-asc")}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center justify-between ${
                            sortOption === "subject-asc"
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700"
                          }`}
                        >
                          <span>Subject (A-Z)</span>
                          {sortOption === "subject-asc" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleSortChange("subject-desc")}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center justify-between ${
                            sortOption === "subject-desc"
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700"
                          }`}
                        >
                          <span>Subject (Z-A)</span>
                          {sortOption === "subject-desc" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={() => handleSortChange("college-asc")}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center justify-between ${
                            sortOption === "college-asc"
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700"
                          }`}
                        >
                          <span>College (A-Z)</span>
                          {sortOption === "college-asc" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleSortChange("college-desc")}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center justify-between ${
                            sortOption === "college-desc"
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700"
                          }`}
                        >
                          <span>College (Z-A)</span>
                          {sortOption === "college-desc" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                          onClick={() => handleSortChange("createdAt-desc")}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center justify-between ${
                            sortOption === "createdAt-desc"
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700"
                          }`}
                        >
                          <span>Date (Newest first)</span>
                          {sortOption === "createdAt-desc" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleSortChange("createdAt-asc")}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center justify-between ${
                            sortOption === "createdAt-asc"
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700"
                          }`}
                        >
                          <span>Date (Oldest first)</span>
                          {sortOption === "createdAt-asc" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Document Grid View - Enhanced */}
          {documents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md p-10 text-center"
            >
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  className="w-24 h-24 mb-6 rounded-full bg-blue-50 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  No documents found
                </h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  Your document library is empty. Upload some documents to get
                  started with Smart Scheduler!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openUploadModal}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Upload Your First Document
                  </div>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                {currentDocuments.map((doc, index) => (
                  <motion.div
                    key={doc._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }}
                    whileHover={{
                      y: -5,
                      boxShadow:
                        "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)",
                    }}
                    className={`bg-white rounded-xl overflow-hidden cursor-pointer group transition-all duration-200
                      ${
                        selectedDocument?._id === doc._id
                          ? "ring-2 ring-blue-500 shadow-md"
                          : "shadow-sm hover:shadow-md border border-gray-100"
                      }`}
                    onClick={() => handleDocumentClick(doc)}
                  >
                    {/* Document preview header - gives visual interest */}
                    <div className="h-28 bg-gradient-to-r from-blue-500 to-indigo-600 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 opacity-20">
                        <svg
                          width="100%"
                          height="100%"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0,0 L100,0 L100,100 L0,100 Z"
                            fill="url(#grid)"
                          />
                        </svg>
                        <defs>
                          <pattern
                            id="grid"
                            width="10"
                            height="10"
                            patternUnits="userSpaceOnUse"
                          >
                            <path
                              d="M 10 0 L 0 0 0 10"
                              fill="none"
                              stroke="white"
                              strokeWidth="0.5"
                            />
                          </pattern>
                        </defs>
                      </div>

                      {/* PDF Icon */}
                      <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center z-10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M14 3v4a2 2 0 002 2h4"
                          />
                        </svg>
                      </div>

                      {/* Quick actions that appear on hover */}
                      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`w-7 h-7 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-sm ${
                            starredDocuments.includes(doc._id)
                              ? "text-yellow-500"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                          onClick={(e) => handleToggleStar(e, doc._id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill={
                              starredDocuments.includes(doc._id)
                                ? "currentColor"
                                : "none"
                            }
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-7 h-7 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-sm text-gray-600 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDocumentToDelete(doc);
                            setShowDeleteConfirmation(true);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </motion.button>
                      </div>
                    </div>

                    {/* Document details */}
                    <div className="p-5">
                      <h3
                        className="text-base font-semibold text-gray-900 truncate mb-1.5"
                        title={doc.name}
                      >
                        {doc.name}
                      </h3>

                      <div className="flex items-center text-xs text-gray-500 mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          {new Date(doc.createdAt).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2.5">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 text-blue-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500 mb-0.5">
                              Subject
                            </p>
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {doc.subject || "Not specified"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2.5">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500 mb-0.5">
                              College
                            </p>
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {doc.college || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action footer */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs text-gray-500">2.5 MB</span>

                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleShareDocument(e, doc)}
                          className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                          title="Share document"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                          </svg>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handlePreviewDocument(e, doc)}
                          className="p-1.5 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200"
                          title="Preview document"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(doc._id);
                          }}
                          className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                          title="Download document"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination control at bottom */}
              {searchResults.length > 0 && (
                <div className="mt-10 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Showing {indexOfFirstDocument + 1}-
                    {Math.min(indexOfLastDocument, searchResults.length)} of{" "}
                    {searchResults.length} results
                  </p>

                  <div className="flex space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        currentPage > 1 && paginate(currentPage - 1)
                      }
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? "bg-white border border-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
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

                    {/* Render pagination numbers with logic for many pages */}
                    {Array.from({ length: totalPages })
                      .slice(
                        Math.max(0, Math.min(currentPage - 3, totalPages - 5)),
                        Math.max(5, Math.min(currentPage + 2, totalPages))
                      )
                      .map((_, index) => {
                        const pageNumber =
                          Math.max(
                            1,
                            Math.min(currentPage - 2, totalPages - 4)
                          ) + index;
                        return (
                          <motion.button
                            key={pageNumber}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => paginate(pageNumber)}
                            className={`px-3 py-1 rounded-md ${
                              currentPage === pageNumber
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </motion.button>
                        );
                      })}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        currentPage < totalPages && paginate(currentPage + 1)
                      }
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? "bg-white border border-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
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
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Premium Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center py-5 px-6 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Upload New Document
                  </h2>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  onClick={closeUploadModal}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1">
                <form onSubmit={handleUpload} className="space-y-6">
                  {/* File Upload - Make it prominent */}
                  <div className="mb-6">
                    <div
                      className="flex flex-col justify-center items-center px-6 pt-8 pb-8 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer relative overflow-hidden"
                      onClick={() =>
                        document.getElementById("document-upload").click()
                      }
                    >
                      {formData.document ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center"
                        >
                          <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center mb-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-10 w-10 text-red-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M14 3v4a2 2 0 002 2h4"
                              />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {formData.document.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(formData.document.size / (1024 * 1024)).toFixed(
                              2
                            )}{" "}
                            MB
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({ ...formData, document: null });
                              document.getElementById("document-upload").value =
                                "";
                            }}
                            className="mt-4 text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Change file
                          </motion.button>
                        </motion.div>
                      ) : (
                        <motion.div
                          className="space-y-3 text-center py-4"
                          animate={{
                            y: [0, -5, 0],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                            repeatType: "loop",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mx-auto h-14 w-14 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <div>
                            <p className="text-base font-medium text-blue-700">
                              Click to upload your document
                            </p>
                            <p className="text-sm text-blue-500">
                              or drag and drop
                            </p>
                          </div>
                          <p className="text-xs text-blue-400">
                            PDF only (max. 10MB)
                          </p>
                        </motion.div>
                      )}

                      <input
                        id="document-upload"
                        name="document-upload"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        required
                        className="sr-only"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Document Name */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document Name*
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter document name"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject*
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter subject"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                        />
                      </div>
                    </div>

                    {/* College */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        College*
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="college"
                          value={formData.college}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter college name"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Error display with animation */}
                  <AnimatePresence>
                    {uploadError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="rounded-lg bg-red-50 p-4 border border-red-100"
                      >
                        <div className="flex">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-red-500 mr-3 mt-0.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div>
                            <h3 className="text-sm font-medium text-red-800">
                              Error uploading document
                            </h3>
                            <p className="mt-1 text-sm text-red-700">
                              {uploadError}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-xs text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    PDF files only, maximum size 10MB
                  </div>

                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={closeUploadModal}
                      className="px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </motion.button>

                    <motion.button
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUpload}
                      disabled={isUploading || !formData.document}
                      className={`px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md transition-all ${
                        isUploading || !formData.document
                          ? "opacity-70 cursor-not-allowed"
                          : "hover:shadow-lg"
                      }`}
                    >
                      {isUploading ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Uploading...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                          </svg>
                          Upload Document
                        </div>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Delete Document
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-gray-900">
                    "{documentToDelete?.name}"
                  </span>
                  ? This action cannot be undone.
                </p>

                <div className="flex items-center justify-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg"
                    onClick={() => {
                      setShowDeleteConfirmation(false);
                      setDocumentToDelete(null);
                    }}
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm"
                    onClick={handleDeleteDocument}
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-lg mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M14 3v4a2 2 0 002 2h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">
                      {selectedDocument.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedDocument.subject} • {selectedDocument.college}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(selectedDocument._id)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600"
                    title="Download"
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    onClick={() => setShowPreviewModal(false)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* PDF Preview */}
              <div className="flex-1 bg-gray-100 p-2 overflow-hidden">
                <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden">
                  {selectedDocument && (
                    <ToggleablePDFViewer documentId={selectedDocument._id} />
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Share Document
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    onClick={() => setShowShareModal(false)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Share link
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 p-3 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyShareLink}
                      className="flex items-center justify-center h-12 px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
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
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </motion.button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Anyone with this link can view the document
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Share with teammates
                  </h3>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-100 mr-3 overflow-hidden border border-white">
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-indigo-500 text-white font-medium text-sm">
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      </div>
                      <span className="text-sm text-gray-800">
                        {user?.email || "you@example.com"}
                      </span>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      Owner
                    </span>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const email = e.target.email.value;
                      if (!email) return;

                      // In a real app, this would send an API request
                      // For now we'll just show a toast notification
                      showToast(`Invitation sent to ${email}`, "success");
                      e.target.reset();
                    }}
                  >
                    <div className="relative mt-4">
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        className="w-full p-3 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="submit"
                        className="absolute right-1 top-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md"
                      >
                        Send
                      </button>
                    </div>
                  </form>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      <span>Share on Slack</span>
                    </button>
                    <button className="flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      <span>Share via Teams</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center ${
              notificationType === "success"
                ? "bg-green-500"
                : notificationType === "error"
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                notificationType === "success"
                  ? "bg-green-400"
                  : notificationType === "error"
                  ? "bg-red-400"
                  : "bg-blue-400"
              }`}
            >
              {notificationType === "success" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {notificationType === "error" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {notificationType === "info" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span className="ml-3 text-white font-medium">
              {notificationMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
