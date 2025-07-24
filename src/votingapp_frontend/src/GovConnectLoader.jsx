import React from "react";
import { motion } from "framer-motion";

export default function GovConnectLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        {/* Logo GovConnect - Animasi berputar */}
        <motion.img
          src="https://i.ibb.co/ksYm7DzL/logos.png"
          alt="GovConnect Logo"
          className="w-20 h-20 mx-auto"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />

        <h1 className="mt-6 text-3xl font-bold text-blue-800 font-poppins">
          GovConnect
        </h1>
        <p className="text-sm text-blue-600 mt-2">
          Preparing your dashboard securely...
        </p>
      </motion.div>
    </div>
  );
}
