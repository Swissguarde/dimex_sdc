"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-white via-teal-100 to-teal-200 text-white p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-gray-300 bg-opacity-20 rounded-sm animate-spin"></div>
      <div className="absolute bottom-20 right-20 w-32 h-20 bg-gray-400 bg-opacity-20 animate-spin"></div>
      <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-gray-500 bg-opacity-20 rounded-full animate-ping"></div>
      <div className="absolute bottom-10 left-1/3 w-16 h-16 bg-gray-600 bg-opacity-20 rounded-full animate-pulse"></div>
      <div className="absolute top-1/4 right-1/5 w-28 h-28 bg-gray-700 bg-opacity-20 rounded-full animate-bounce "></div>
      {/* Hero Section */}
      <motion.h1
        className="text-5xl font-extrabold text-center mb-6 text-teal-800"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        BEAM & FRAME ANALYSIS
      </motion.h1>
      <motion.p
        className="text-lg text-center mb-8 text-teal-800 max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Easily calculate slope deflection for structural analysis with precision
        and ease. Get accurate results in just a few clicks!
      </motion.p>{" "}
      {/* Buttons */}
      <motion.div
        className="flex space-x-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <Link href="/beams">
          <motion.button
            className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            BEAMS
          </motion.button>
        </Link>

        {/* <Link href="/frames">
          <motion.button
            className="px-6 py-3 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-900 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            FRAMES
          </motion.button>
        </Link> */}
      </motion.div>
    </main>
  );
}
