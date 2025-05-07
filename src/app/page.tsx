"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { carRentals, properties, tours } from "@/utils/data";
import UpTop from "@/components/up-top";
import Link from "next/link";

export default function Home() {
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
                src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop"
                alt="Luxury travel"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
            <div className="absolute inset-0 bg-black/30"></div>
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
              <div className="aspect-[3/3] relative">
                <Image
                  src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop"
                  alt="Luxury experience"
                  fill
                  className="object-cover rounded-2xl"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-[#add8e6] p-8 max-w-xs rounded-xl">
                <p className="text-sm font-light leading-relaxed">
                  Dubuu transformó nuestra idea de lo que un viaje de lujo puede
                  ser. Cada detalle fue perfecto
                </p>
                <p className="text-sm font-bold mt-4">— Daniel Dubón</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section className="py-24 md:py-32 bg-black text-white">
        <div className="md:px-20 px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
              TOURS <span className="font-bold">PRIVADOS</span>
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
                <div className="relative h-[400px] w-full overflow-hidden">
                  <Image
                    src={tour.image || "/placeholder.svg"}
                    alt={tour.title}
                    fill
                    className="object-cover transition-transform duration-700 rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-500"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="text-sm font-light mb-2">{tour.duration}</div>
                  <h3 className="text-2xl font-light mb-2">
                    {tour.title.toUpperCase()}
                  </h3>
                  <p className="text-gray-300 mb-4">{tour.description}</p>
                  <p className="font-bold">{tour.price}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="inline-block">
              <Button variant={"secondary"} className="px-8 py-2 rounded">
                Ver todos los tours
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-24 md:py-32">
        <div className="md:px-20 px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
              PROPIEDADES <span className="font-bold">EXCLUSIVAS</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Residencias de lujo en las ubicaciones más codiciadas del mundo
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {properties.map((property, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="relative h-[350px] overflow-hidden mb-6">
                  <Image
                    src={property.image || "/placeholder.svg"}
                    alt={property.title}
                    fill
                    className="object-cover transition-transform duration-700 rounded-xl"
                  />
                  <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs tracking-wider rounded">
                    {property.location}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{property.title}</h3>
                <p className="text-gray-600 mb-3">{property.description}</p>
                <p className="font-bold">{property.price}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="inline-block">
              <Button variant={"default"} className="px-8 py-2 rounded">
                Ver todas propiedades
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Car Rentals Section */}
      <section className="py-24 md:py-32 bg-black text-white">
        <div className="md:px-20 px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
              ALQUILER DE <span className="font-bold">VEHÍCULOS</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Vehículos de lujo para complementar tu experiencia de viaje
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {carRentals.map((car, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="relative h-[350px] overflow-hidden mb-6">
                  <Image
                    src={car.image || "/placeholder.svg"}
                    alt={car.model}
                    fill
                    className="object-cover transition-transform duration-700  rounded-xl"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">{car.model}</h3>
                <p className="text-gray-600 mb-3">{car.description}</p>
                <p className="font-bold">{car.price}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="inline-block">
              <Button variant={"default"} className="px-8 py-2 rounded">
                Ver todos los vehículos
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
