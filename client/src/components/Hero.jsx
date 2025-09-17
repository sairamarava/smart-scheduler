import { motion } from "framer-motion";

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="block"
            >
              Streamline Your File Management
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-blue-600 inline-block bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent"
            >
              in the Cloud
            </motion.span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Experience seamless file organization, secure sharing, and
            real-time collaboration. Your digital workspace, reimagined.
          </motion.p>
          <motion.div variants={itemVariants} className="relative group">
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition duration-500"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 0.5 }}
            />
            <motion.a
              href="/signup"
              className="relative inline-flex items-center bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl text-lg font-medium transition-all duration-300 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/30"
              whileHover={{
                scale: 1.02,
                y: -2,
              }}
              whileTap={{
                scale: 0.98,
                y: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
            >
              <motion.span
                initial={{ opacity: 1 }}
                whileHover={{ opacity: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                Get Started Free
              </motion.span>
              <motion.svg
                className="ml-2 -mr-1 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }}
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </motion.svg>
            </motion.a>
          </motion.div>
          <motion.div variants={itemVariants} className="mt-8 text-gray-500">
            No credit card required • Free 14-day trial
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;