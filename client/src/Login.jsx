import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("accessToken", data.accessToken);
      navigate("/landing");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 px-4"
    >
      <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fade-in">
        {/* Left: Form */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 p-10 flex flex-col justify-center"
        >
          <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            Login
          </h2>
          <p className="text-gray-500 mb-8 text-sm">
            If you are already a member, easily log in
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm text-gray-700 placeholder-gray-400"
                  aria-label="Email"
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm text-gray-700 placeholder-gray-400 pr-12"
                  aria-label="Password"
                />
                <button
                  type="button"
                  tabIndex={0}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 focus:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4.03-9-9 0-1.07.19-2.09.54-3.02M9.88 9.88a3 3 0 104.24 4.24"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 01-3 3m0-6a3 3 0 013 3m-3 3a3 3 0 01-3-3m3-3a3 3 0 013 3m-3 3a3 3 0 01-3-3"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 01-3 3m0-6a3 3 0 013 3m-3 3a3 3 0 01-3-3m3-3a3 3 0 013 3m-3 3a3 3 0 01-3-3"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-center text-sm font-medium"
              >
                {error}
              </motion.div>
            )}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:from-blue-700 hover:to-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-4 text-gray-400 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white shadow hover:bg-blue-50 transition-all font-semibold text-gray-700"
              aria-label="Login with Google"
              tabIndex={0}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
                alt="Google"
                className="w-5 h-5"
              />
              Login with Google
            </button>
            <div className="flex justify-between mt-4 text-xs text-gray-400">
              <button type="button" className="hover:underline" tabIndex={0}>
                Forgot my password
              </button>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
              <span>If you don't have an account, create</span>
              <button
                type="button"
                className="px-4 py-1 rounded-lg border border-gray-200 bg-white shadow hover:bg-blue-50 transition-all font-semibold text-blue-600"
                onClick={() => navigate("/register")}
                tabIndex={0}
              >
                Register
              </button>
            </div>
          </form>
        </motion.div>
        {/* Right: Illustration */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100"
        >
          <img
            src="/public/login.jpg"
            alt="Login Illustration"
            className="w-full max-w-xs rounded-2xl shadow-xl"
            style={{ objectFit: "cover" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;
