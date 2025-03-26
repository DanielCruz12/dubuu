/* eslint-disable @next/next/no-img-element */
"use client";

import type React from "react";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic email validation
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.warning("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Thank you for subscribing!");
      setEmail("");
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b dark:from-gray-800 dark:to-black">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-black opacity-40 z-10"></div>
        <img
          src="/tour.jpg"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </div>

      <div className="relative mx-auto container px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Stay Updated with Our Newsletter
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg leading-8 text-gray-800 dark:text-gray-200"
          >
            Get the latest news and updates delivered straight to your inbox.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mx-auto mt-10 max-w-md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-0 flex-auto bg-white/60 dark:bg-white/20"
                aria-label="Email address"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 shadow-lg hover:shadow-primary/20 hover:shadow-xl"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Subscribe
              </Button>
            </div>
          </form>

          <div className="mt-8 flex items-center justify-center gap-x-6">
            <div className="h-px w-10 md:w-16 bg-black/40"></div>
            <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
              No spam. Just the good stuff.
            </p>
            <div className="h-px w-10 md:w-16 bg-black/40"></div>
          </div>

          <p className="mt-6 text-xs text-center text-gray-800 dark:text-gray-300">
            By subscribing, you agree to our{" "}
            <a
              href="/privacy"
              className="underline hover:text-gray-400 transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
