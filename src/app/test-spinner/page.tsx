"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingTriangle } from "@/components/ui/loading-triangle";

export default function TestSpinnerPage() {
  const [showSpinner, setShowSpinner] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold mb-8">Loading Triangle Test Page</h1>

        <motion.button
          onClick={() => setShowSpinner(!showSpinner)}
          className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showSpinner ? "Hide Spinner" : "Show Spinner"}
        </motion.button>

        <div className="mt-12">
          <AnimatePresence>
            {showSpinner && <LoadingTriangle size="md" color="white" />}
          </AnimatePresence>
          <p className="mt-4 text-gray-400">
            {showSpinner ? "Spinner is visible" : "Spinner is hidden"}
          </p>
        </div>
      </div>
    </div>
  );
}
