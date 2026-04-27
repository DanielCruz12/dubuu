"use client";
import { ArrowUp } from "lucide-react";
import React, { useEffect, useState } from "react";

const UpTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function scrollFunction() {
      const scrolled =
        document.body.scrollTop > 20 || document.documentElement.scrollTop > 20;
      setVisible(scrolled);
    }

    window.addEventListener("scroll", scrollFunction);
    scrollFunction(); // estado inicial
    return () => window.removeEventListener("scroll", scrollFunction);
  }, []);

  function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  // No renderizar el botón cuando está oculto: evita el warning
  // "Skipping auto-scroll behavior due to position: fixed" al hacer clic en el logo/navegar
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={topFunction}
      tabIndex={-1}
      className="fixed bottom-[8.25rem] left-1/2 z-[990] flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-tr from-black/30 to-gray-800/30 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 md:bottom-6"
      title="Go to top"
    >
      <ArrowUp size={20} />
    </button>
  );
};

export default UpTop;
