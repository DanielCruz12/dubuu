"use client";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="flex justify-between items-end mb-3 md:mb-6">
      <div>
        <motion.h1
          className="text-xl md:text-3xl font-bold mb-1 md:mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Nuestro viaje, a tu manera
        </motion.h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Descubra los tesoros del mundo
        </p>
      </div>
    </section>
  );
}
