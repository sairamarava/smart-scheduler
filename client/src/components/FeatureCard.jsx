import { motion } from "framer-motion";

const FeatureCard = ({ title, description, icon, color, delay }) => {
  const colorClasses = {
    blue: {
      bg: "from-white via-white to-blue-50/50",
      iconBg: "from-blue-100 to-blue-200",
      iconColor: "text-blue-600",
      border: "border-blue-50",
      gradient: "from-blue-600/5 to-purple-600/5",
    },
    purple: {
      bg: "from-white via-white to-purple-50/50",
      iconBg: "from-purple-100 to-purple-200",
      iconColor: "text-purple-600",
      border: "border-purple-50",
      gradient: "from-purple-600/5 to-pink-600/5",
    },
    green: {
      bg: "from-white via-white to-green-50/50",
      iconBg: "from-green-100 to-green-200",
      iconColor: "text-green-600",
      border: "border-green-50",
      gradient: "from-green-600/5 to-teal-600/5",
    },
    amber: {
      bg: "from-white via-white to-amber-50/50",
      iconBg: "from-amber-100 to-amber-200",
      iconColor: "text-amber-600",
      border: "border-amber-50",
      gradient: "from-amber-600/5 to-orange-600/5",
    },
  };

  const classes = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{
        y: -8,
        transition: { duration: 0.2 },
      }}
      className={`group bg-gradient-to-b ${classes.bg} p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border ${classes.border} backdrop-blur-sm relative overflow-hidden`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${classes.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      ></div>
      <motion.div
        className={`w-14 h-14 bg-gradient-to-br ${classes.iconBg} rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-md transition-all duration-300`}
        whileHover={{ rotate: color === "purple" || color === "amber" ? -5 : 5 }}
      >
        <svg
          className={`w-7 h-7 ${classes.iconColor} transform group-hover:scale-110 transition-transform duration-300`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icon}
        </svg>
      </motion.div>
      <h3 className="text-xl font-semibold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
        {title}
      </h3>
      <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
        {description}
      </p>
    </motion.div>
  );
};

export default FeatureCard;