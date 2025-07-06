"use client";
import { ArrowUp } from "lucide-react";
import React, { useEffect, useState } from "react";

const UpTop = () => {
  const [showBtn, setShowBtn] = useState("hidden");

  useEffect(() => {
    function scrollFunction() {
      if (
        document.body.scrollTop > 20 ||
        document.documentElement.scrollTop > 20
      ) {
        setShowBtn("flex");
      } else {
        setShowBtn("hidden");
      }
    }

    window.addEventListener("scroll", scrollFunction);
    return () => {
      window.removeEventListener("scroll", scrollFunction);
    };
  }, []);

  function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  return (
    <button
      onClick={topFunction}
      className={`
        ${showBtn}
        fixed bottom-5 left-1/2 transform -translate-x-1/2
        items-center justify-center
        w-12 h-12 rounded-full
        backdrop-blur-md bg-gradient-to-tr from-black/30 to-gray-800/30
        text-white shadow-lg hover:scale-110 transition-all duration-300
        z-50
      `}
      title="Go to top"
    >
      <ArrowUp size={20} />
    </button>
  );
};

export default UpTop;
