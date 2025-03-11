"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="flex justify-between items-end mb-3 md:mb-6">
      <div>
        <motion.h1
          className="text-xl md:text-4xl font-bold mb-1 md:mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Link href={"/dashboard"}>Your Journey,</Link>
          <Link href={"/sign-in"}>Your Way</Link>
          
        </motion.h1>
        <p className="text-base md:text-xl text-gray-600 dark:text-gray-400">
          Discover the Worlds Treasures with Dans tour
        </p>
      </div>
    </section>
  );
}
