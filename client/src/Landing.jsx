import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Landing = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const { apiFetch } = await import("./utils/api");
      try {
        const data = await apiFetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
      } catch (err) {
        // ignore; user will remain null
      }
    };
    fetchUser();
  }, []);

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
        className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-lg"
      >
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Smart Scheduler!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          You are now logged in. Explore features, manage your schedule, and
          enjoy a seamless experience.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:from-blue-700 hover:to-purple-700 transition-all"
          onClick={() => navigate("/dashboard", { state: { user } })}
        >
          Go to Dashboard
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Landing;
