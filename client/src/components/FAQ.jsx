import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const FAQ = () => {
  const [openItem, setOpenItem] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "What makes FileFlow different from other file sharing services?",
      answer:
        "FileFlow stands out with its intuitive interface, military-grade encryption, and real-time collaboration features. Our platform is designed to seamlessly integrate with your workflow while maintaining the highest security standards.",
    },
    {
      id: 2,
      question: "How secure is my data with FileFlow?",
      answer:
        "We employ end-to-end encryption, secure socket layers (SSL), and regular security audits to ensure your data remains protected. Your files are encrypted both in transit and at rest, giving you complete peace of mind.",
    },
    {
      id: 3,
      question: "Can I access my files offline?",
      answer:
        "Yes! FileFlow offers a desktop application that allows you to sync files for offline access. Changes made offline will automatically sync once you're back online, ensuring seamless work continuity.",
    },
    {
      id: 4,
      question: "What are the storage limits?",
      answer:
        "Our plans offer flexible storage options starting from 100GB up to unlimited storage for enterprise users. You can easily upgrade or downgrade your plan as your needs change.",
    },
    {
      id: 5,
      question: "Do you offer team collaboration features?",
      answer:
        "Absolutely! FileFlow includes real-time collaboration tools, team folders, granular permissions, and activity tracking to make team collaboration efficient and secure.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <section className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
          variants={containerVariants}
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Have questions? We're here to help. If you can't find what you're
            looking for, feel free to contact our support team.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="space-y-4"
        >
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              variants={itemVariants}
              className="bg-white rounded-lg shadow-sm"
            >
              <button
                onClick={() => setOpenItem(openItem === faq.id ? null : faq.id)}
                className="w-full px-6 py-4 flex justify-between items-center focus:outline-none"
              >
                <span className="text-lg font-medium text-gray-900">
                  {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: openItem === faq.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-4"
                >
                  <svg
                    className="h-6 w-6 text-gray-500"
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
                </motion.span>
              </button>
              <AnimatePresence>
                {openItem === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;