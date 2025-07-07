"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { tours } from "@/utils/data";
import UpTop from "@/components/up-top";
import Link from "next/link";
import { Star } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency-converter";

export default function Home() {
  const { convert, symbol } = useCurrency();

  const containerRef = useRef(null);
  const aboutRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 2]);
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 2]);
  const y = useTransform(scrollYProgress, [0, 0.15], [0, -200]);

  const { scrollYProgress: aboutScrollProgress } = useScroll({
    target: aboutRef,
    offset: ["start end", "end start"],
  });

  const aboutOpacity = useTransform(aboutScrollProgress, [0.1, 0.3], [0, 1]);
  const aboutX = useTransform(aboutScrollProgress, [0.1, 0.3], [-50, 0]);

  return (
    <div ref={containerRef} className="w-full overflow-x-hidden">
      <UpTop />

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div style={{ opacity, scale, y }} className="h-full w-full">
            <motion.div className="h-full w-full relative">
              <Image
                src="/homepage/1.jpg"
                alt="Luxury travel"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
            {/* Gradiente suave desde abajo hacia arriba */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            {/* Gradiente adicional para mejor legibilidad del texto */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40"></div>
          </motion.div>
        </div>

        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <div className="px-4 md:px-6">
            <motion.div
              className="max-w-4xl mx-auto text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-none mb-6">
                VIAJES <span className="font-bold">EXTRAORDINARIOS</span>
              </h1>
              <p className="text-xl md:text-2xl font-light tracking-wide mb-6 max-w-xl mx-auto">
                Experiencias de lujo diseñadas para los viajeros más exigentes
              </p>
              <div className="inline-block">
                <Link
                  href="/home"
                  className={
                    buttonVariants({ variant: "secondary" }) +
                    " px-8 py-2 rounded"
                  }
                >
                  Descubrir
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="py-24 md:py-32" id="about">
        <div className="md:px-20 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div style={{ opacity: aboutOpacity, x: aboutX }}>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-8">
                DISEÑAMOS <span className="font-bold">EXPERIENCIAS</span> ÚNICAS
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                En Dubuu, entendemos que cada viajero es único. Por eso, cada
                experiencia que creamos está meticulosamente diseñada para
                superar expectativas y crear recuerdos inolvidables.
              </p>
              <p className="text-gray-600 mb-10 leading-relaxed">
                Nuestro equipo de expertos en viajes de lujo trabaja con los
                mejores proveedores del mundo para ofrecerte acceso exclusivo a
                destinos y experiencias extraordinarias.
              </p>
              <div className="inline-block">
                <Link
                  href={"/home"}
                  className={
                    buttonVariants({ variant: "default" }) +
                    " px-8 py-2 rounded"
                  }
                >
                  Ver experiencias
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="aspect-[3/3] relative overflow-hidden rounded-2xl">
                <Image
                  src="/tour1.jpg"
                  alt="Luxury experience"
                  fill
                  className="object-cover"
                />
                {/* Gradiente sutil para mejorar el contraste */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20"></div>
              </div>
              <motion.div
                className="absolute -bottom-8 -left-8 bg-white p-6 max-w-sm rounded-2xl shadow-xl border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  Una experiencia transformadora. Dubuu nos mostró la verdadera
                  esencia de Guatemala con un nivel de servicio excepcional.
                </p>
                <p className="text-sm font-bold mt-4">— Daniel Dubón</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section className="py-24 md:py-32 ">
        <div className="md:px-20 px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
              Viajes <span className="font-bold">privados</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Experiencias guiadas con acceso exclusivo y atención personalizada
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tours.map((tour, index) => (
              <motion.div
                key={index}
                className="relative group overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="relative h-[400px] w-full overflow-hidden rounded-xl">
                  <Image
                    src={tour.image || "/logo.svg"}
                    alt={tour.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradiente base desde abajo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  {/* Gradiente adicional en hover para efecto más dramático */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {/* Gradiente radial sutil desde el centro */}
                  <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="text-sm font-light mb-2 text-gray-300">
                    {tour.duration}
                  </div>
                  <h3 className="text-2xl font-light mb-2 text-white">
                    {tour.title.toUpperCase()}
                  </h3>
                  <p className="text-gray-200 mb-4 opacity-90">
                    {tour.description}
                  </p>
                  <p className="font-bold text-white">
                    {symbol}
                    {convert(Number(tour.price))}{" "}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="inline-block">
              <Link
                href={"/home"}
                className={
                  buttonVariants({ variant: "default" }) + " px-8 py-2 rounded"
                }
              >
                Ver todos los viajes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
