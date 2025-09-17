import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Dashboard = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-lg w-full"
      >
        <div className="flex justify-end mb-4">
          <div className="flex items-center space-x-2">
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
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome, {user?.name || "User"}!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          This is your dashboard. You can manage your schedule, view stats, and
          more features coming soon!
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
