import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState("documents");
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

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async (query = "", subject = "", college = "") => {
    try {
      let url = "/api/documents?";
      if (query) url += `search=${encodeURIComponent(query)}&`;
      if (subject) url += `subject=${encodeURIComponent(subject)}&`;
      if (college) url += `college=${encodeURIComponent(college)}&`;

      const token = localStorage.getItem("accessToken");
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch documents");

      const data = await res.json();
      setDocuments(data.documents);
      setSearchResults(data.documents);

      // Extract unique subjects and colleges for filters
      const allSubjects = [
        ...new Set(data.documents.map((doc) => doc.subject)),
      ];
      const allColleges = [
        ...new Set(data.documents.map((doc) => doc.college)),
      ];
      setSubjects(allSubjects);
      setColleges(allColleges);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, document: e.target.files[0] });
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
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload document");
      }

      // Reset form and fetch updated documents
      setFormData({ name: "", subject: "", college: "", document: null });
      document.getElementById("document-upload").value = "";
      fetchDocuments();
      setActiveTab("documents");
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDocuments(searchQuery, selectedSubject, selectedCollege);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedSubject("");
    setSelectedCollege("");
    fetchDocuments();
  };

  const handleDownload = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      window.open(`/api/documents/${id}/download?token=${token}`, "_blank");
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-100 pb-10"
    >
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Smart Scheduler
          </h1>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-gray-700">
                Welcome, {user?.name || "User"}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow hover:from-blue-700 hover:to-purple-700 transition-all flex items-center"
              title="Logout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap mb-6 border-b">
          <button
            onClick={() => setActiveTab("documents")}
            className={`py-2 px-4 font-medium ${
              activeTab === "documents"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            Browse Documents
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`py-2 px-4 font-medium ${
              activeTab === "upload"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            Upload Document
          </button>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === "documents" && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Search and Filters */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <form
                  onSubmit={handleSearch}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                  {/* Search input */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search Documents
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, subject, or college..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>

                  {/* Subject filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Subject
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="">All Subjects</option>
                      {subjects.map((subject, index) => (
                        <option key={index} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* College filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by College
                    </label>
                    <select
                      value={selectedCollege}
                      onChange={(e) => setSelectedCollege(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="">All Colleges</option>
                      {colleges.map((college, index) => (
                        <option key={index} value={college}>
                          {college}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="md:col-span-4 flex items-center justify-end gap-4 mt-4">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Clear Filters
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>

              {/* Document List */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Available Documents
                </h2>

                {documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No documents found. Upload some documents to get started!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            College
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Uploaded By
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map((doc) => (
                          <tr key={doc._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {doc.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {doc.subject}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {doc.college}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {doc.uploadedBy?.name || "Unknown"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleDownload(doc._id)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-6">Upload a Document</h2>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Document Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter document name"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter subject"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>

                  {/* College */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      College
                    </label>
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter college name"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document (PDF only)
                    </label>
                    <input
                      type="file"
                      id="document-upload"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                </div>

                {uploadError && (
                  <div className="text-red-500 text-sm">{uploadError}</div>
                )}

                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    disabled={isUploading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow hover:from-blue-700 hover:to-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70"
                  >
                    {isUploading ? "Uploading..." : "Upload Document"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Dashboard;
