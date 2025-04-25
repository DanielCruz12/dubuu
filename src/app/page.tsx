/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [cursorText, setCursorText] = useState("");
  const [cursorVariant, setCursorVariant] = useState("default");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const aboutRef = useRef(null);
  const destinationsRef = useRef(null);
  const servicesRef = useRef(null);
  const experiencesRef = useRef(null);
  const pricingRef = useRef(null);
  const contactRef = useRef(null);

  const destinations = [
    {
      name: "Santorini",
      description: "Villas exclusivas con vistas al mar Egeo",
      price: "$4,200",
      image:
        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2072&auto=format&fit=crop",
    },
    {
      name: "Maldivas",
      description: "Bungalows privados sobre aguas cristalinas",
      price: "$5,800",
      image:
        "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=2071&auto=format&fit=crop",
    },
    {
      name: "Kioto",
      description: "Experiencias culturales en ryokans tradicionales",
      price: "$3,900",
      image:
        "https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=2070&auto=format&fit=crop",
    },
  ];

  const experiences = [
    {
      title: "Crucero Privado",
      description:
        "Navegación exclusiva por las islas griegas con tripulación personal",
      price: "Desde $35,000",
      image:
        "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?q=80&w=2048&auto=format&fit=crop",
    },
    {
      title: "Safari Fotográfico",
      description:
        "Avistamiento de fauna salvaje con guías expertos y alojamiento de lujo",
      price: "Desde $12,500",
      image:
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068&auto=format&fit=crop",
    },
    {
      title: "Gastronomía Exclusiva",
      description:
        "Cenas privadas con chefs estrella Michelin en ubicaciones extraordinarias",
      price: "Desde $8,900",
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop",
    },
  ];

  const properties = [
    {
      title: "Villa Santorini",
      location: "Grecia",
      description:
        "Villa de lujo con piscina infinita y vistas panorámicas al mar Egeo",
      price: "$1,200/noche",
      image:
        "https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Penthouse Manhattan",
      location: "Nueva York",
      description:
        "Ático exclusivo con terraza privada y vistas al skyline de Manhattan",
      price: "$2,500/noche",
      image:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Villa Bali",
      location: "Indonesia",
      description:
        "Villa tropical con piscina privada rodeada de arrozales y selva",
      price: "$950/noche",
      image:
        "https://images.unsplash.com/photo-1582610116397-edb318620f90?q=80&w=2070&auto=format&fit=crop",
    },
  ];

  const carRentals = [
    {
      model: "Porsche 911 Carrera",
      description: "Deportivo icónico con rendimiento excepcional",
      price: "$450/día",
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop",
    },
    {
      model: "Range Rover Autobiography",
      description: "SUV de lujo con capacidades todoterreno y máximo confort",
      price: "$380/día",
      image:
        "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2071&auto=format&fit=crop",
    },
    {
      model: "Mercedes-Benz S-Class",
      description:
        "Sedán de lujo con tecnología de vanguardia y confort superior",
      price: "$320/día",
      image:
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2071&auto=format&fit=crop",
    },
  ];

  const tours = [
    {
      title: "Toscana Exclusiva",
      duration: "7 días",
      description:
        "Recorrido privado por viñedos, villas históricas y pueblos medievales",
      price: "$9,800",
      image:
        "https://images.unsplash.com/photo-1568822617270-2c1579f8dfe2?q=80&w=2080&auto=format&fit=crop",
    },
    {
      title: "Japón Imperial",
      duration: "10 días",
      description:
        "Experiencia cultural con acceso VIP a templos, jardines privados y ceremonias tradicionales",
      price: "$12,500",
      image:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Maravillas de Marruecos",
      duration: "8 días",
      description:
        "Viaje sensorial por ciudades imperiales, desierto y montañas del Atlas",
      price: "$8,900",
      image:
        "https://images.unsplash.com/photo-1548018560-c7196548e84d?q=80&w=2075&auto=format&fit=crop",
    },
  ];

  useEffect(() => {
    const handleMouseMove = (e: any) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

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

  const { scrollYProgress: destinationsScrollProgress } = useScroll({
    target: destinationsRef,
    offset: ["start end", "end start"],
  });

  const destinationsOpacity = useTransform(
    destinationsScrollProgress,
    [0.1, 0.3],
    [0, 1]
  );

  const destinationsY = useTransform(
    destinationsScrollProgress,
    [0.1, 0.3],
    [50, 0]
  );

  function enterButton() {
    setCursorText("Click");
    setCursorVariant("button");
  }

  function enterText(text: string) {
    setCursorText(text);
    setCursorVariant("text");
  }

  function leaveElement() {
    setCursorText("");
    setCursorVariant("default");
  }

  return (
    <div
      ref={containerRef}
      className="text-black selection:bg-[#add8e6] selection:text-black w-full overflow-x-hidden"
    >
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div style={{ opacity, scale, y }} className="h-full w-full">
            <motion.div className="h-full w-full">
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
              <div
                className="inline-block"
                onMouseEnter={enterButton}
                onMouseLeave={leaveElement}
              >
                <Button variant={"secondary"} className="px-8 py-2 rounded">
                  Descubrir
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-12 left-0 right-0 flex justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="flex flex-col items-center"
          >
            <span className="text-white text-xs tracking-widest mb-2">
              SCROLL
            </span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white animate-bounce"
            >
              <path
                d="M12 5V19"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 12L12 19L5 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="py-24 md:py-32" id="about">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div style={{ opacity: aboutOpacity, x: aboutX }}>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-8">
                DISEÑAMOS <span className="font-bold">EXPERIENCIAS</span> ÚNICAS
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                En TourFlow, entendemos que cada viajero es único. Por eso, cada
                experiencia que creamos está meticulosamente diseñada para
                superar expectativas y crear recuerdos inolvidables.
              </p>
              <p className="text-gray-600 mb-10 leading-relaxed">
                Nuestro equipo de expertos en viajes de lujo trabaja con los
                mejores proveedores del mundo para ofrecerte acceso exclusivo a
                destinos y experiencias extraordinarias.
              </p>
              <div
                className="inline-block"
                onMouseEnter={enterButton}
                onMouseLeave={leaveElement}
              >
                <Button variant={"default"} className="px-8 py-2 rounded">
                  Nuestra filosofía
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="aspect-[4/5] relative">
                <Image
                  src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop"
                  alt="Luxury experience"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-[#add8e6] p-8 max-w-xs">
                <p className="text-sm font-light leading-relaxed">
                  TourFlow transformó nuestra idea de lo que un viaje de lujo
                  puede ser. Cada detalle fue perfecto
                </p>
                <p className="text-sm font-bold mt-4">
                  — JAMES & ELIZABETH WILSON
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section
        ref={destinationsRef}
        className="py-24 md:py-32 bg-black text-white"
        id="destinations"
      >
        <div className="container mx-auto px-4 md:px-6 ">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-16"
            style={{ opacity: destinationsOpacity, y: destinationsY }}
          >
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
              DESTINOS <span className="font-bold">EXCLUSIVOS</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Descubre lugares extraordinarios seleccionados por nuestros
              expertos
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {destinations.map((destination, index) => (
              <motion.div
                key={index}
                className="relative group overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                onMouseEnter={() => enterText("Ver")}
                onMouseLeave={leaveElement}
              >
                <div className="relative h-[500px] w-full overflow-hidden">
                  <Image
                    src={destination.image || "/placeholder.svg"}
                    alt={destination.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-500"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl font-light mb-2">
                    {destination.name.toUpperCase()}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {destination.description}
                  </p>
                  <p className="font-bold">{destination.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="text-center mt-16">
          <div
            className="inline-block"
            onMouseEnter={enterButton}
            onMouseLeave={leaveElement}
          >
            <Button variant={"default"} className="px-8 py-2 rounded">
              Ver todos los destinos
            </Button>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
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
                onMouseEnter={() => enterText("Explorar")}
                onMouseLeave={leaveElement}
              >
                <div className="relative h-[400px] overflow-hidden mb-6">
                  <Image
                    src={property.image || "/placeholder.svg"}
                    alt={property.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs tracking-wider">
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
            <div
              className="inline-block"
              onMouseEnter={enterButton}
              onMouseLeave={leaveElement}
            >
              <Button variant={"outline"} className="px-8 py-2 rounded">
                Ver todas propiedades
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Car Rentals Section */}
      <section className="py-24 md:py-32 bg-[#f8f8f8]">
        <div className="container mx-auto px-4 md:px-6">
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
                onMouseEnter={() => enterText("Reservar")}
                onMouseLeave={leaveElement}
              >
                <div className="relative h-[300px] overflow-hidden mb-6">
                  <Image
                    src={car.image || "/placeholder.svg"}
                    alt={car.model}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">{car.model}</h3>
                <p className="text-gray-600 mb-3">{car.description}</p>
                <p className="font-bold">{car.price}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div
              className="inline-block"
              onMouseEnter={enterButton}
              onMouseLeave={leaveElement}
            >
              <Button variant={"default"} className="px-8 py-2 rounded">
                Ver todos los vehículos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section className="py-24 md:py-32 bg-black text-white">
        <div className="container mx-auto px-4 md:px-6">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {tours.map((tour, index) => (
              <motion.div
                key={index}
                className="relative group overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                onMouseEnter={() => enterText("Detalles")}
                onMouseLeave={leaveElement}
              >
                <div className="relative h-[500px] w-full overflow-hidden">
                  <Image
                    src={tour.image || "/placeholder.svg"}
                    alt={tour.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
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
            <div
              className="inline-block"
              onMouseEnter={enterButton}
              onMouseLeave={leaveElement}
            >
              <Button variant={"secondary"} className="px-8 py-2 rounded">
                Ver todos los tours
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-8">
                SERVICIOS <span className="font-bold">PREMIUM</span>
              </h2>
              <p className="text-gray-600 mb-10 leading-relaxed">
                Ofrecemos una gama completa de servicios diseñados para hacer de
                tu viaje una experiencia sin preocupaciones y llena de momentos
                extraordinarios.
              </p>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    01. CONCIERGE PERSONAL
                  </h3>
                  <p className="text-gray-600">
                    Asistencia 24/7 para cualquier necesidad durante tu viaje.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    02. TRANSPORTE PRIVADO
                  </h3>
                  <p className="text-gray-600">
                    Vehículos de lujo con chóferes profesionales en todos los
                    destinos.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    03. ACCESO EXCLUSIVO
                  </h3>
                  <p className="text-gray-600">
                    Entrada a eventos privados y lugares normalmente
                    inaccesibles.
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-1">
              <motion.div
                className="relative aspect-square"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop"
                  alt="Luxury service"
                  fill
                  className="object-cover"
                />
              </motion.div>
              <motion.div
                className="relative aspect-square"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"
                  alt="Luxury service"
                  fill
                  className="object-cover"
                />
              </motion.div>
              <motion.div
                className="relative aspect-square"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop"
                  alt="Luxury service"
                  fill
                  className="object-cover"
                />
              </motion.div>
              <motion.div
                className="relative aspect-square"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop"
                  alt="Luxury service"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Experiences Section */}
      <section
        ref={experiencesRef}
        className="py-24 md:py-32 bg-[#f8f8f8]"
        id="experiences"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
              EXPERIENCIAS <span className="font-bold">ÚNICAS</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Momentos extraordinarios diseñados para superar expectativas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {experiences.map((experience, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                onMouseEnter={() => enterText("Explorar")}
                onMouseLeave={leaveElement}
              >
                <div className="relative h-[400px] overflow-hidden mb-6">
                  <Image
                    src={experience.image || "/placeholder.svg"}
                    alt={experience.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">{experience.title}</h3>
                <p className="text-gray-600 mb-3">{experience.description}</p>
                <p className="font-bold">{experience.price}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div
              className="inline-block"
              onMouseEnter={enterButton}
              onMouseLeave={leaveElement}
            >
              <Button variant={"default"} className="px-8 py-2 rounded">
                Descubrir más
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-24 md:py-32 bg-black text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
              MEMBRESÍAS <span className="font-bold">EXCLUSIVAS</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Beneficios extraordinarios para viajeros extraordinarios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-800">
            <motion.div
              className="bg-black p-12 group hover:bg-[#add8e6] hover:text-black transition-colors duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              onMouseEnter={() => enterText("Silver")}
              onMouseLeave={leaveElement}
            >
              <h3 className="text-2xl font-light mb-4">SILVER</h3>
              <div className="text-4xl font-bold mb-6">
                $2,500
                <span className="text-base font-normal text-gray-400 group-hover:text-gray-700">
                  /año
                </span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="min-w-[24px]"
                  >
                    <path
                      d="M5 12L10 17L20 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Acceso a propiedades exclusivas</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="min-w-[24px]"
                  >
                    <path
                      d="M5 12L10 17L20 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Servicio de concierge 12/5</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="min-w-[24px]"
                  >
                    <path
                      d="M5 12L10 17L20 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>5% de descuento en experiencias</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-black p-12 group hover:bg-[#add8e6] hover:text-black transition-colors duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onMouseEnter={() => enterText("Gold")}
              onMouseLeave={leaveElement}
            >
              <div className="inline-block bg-[#add8e6] text-black px-3 py-1 text-xs mb-4">
                POPULAR
              </div>
              <h3 className="text-2xl font-light mb-4">GOLD</h3>
              <div className="text-4xl font-bold mb-6">
                $5,000
                <span className="text-base font-normal text-gray-400 group-hover:text-gray-700">
                  /año
                </span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="min-w-[24px]"
                  >
                    <path
                      d="M5 12L10 17L20 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Todos los beneficios Silver</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="min-w-[24px]"
                  >
                    <path
                      d="M5 12L10 17L20 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Servicio de concierge 24/7</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="min-w-[24px]"
                  >
                    <path
                      d="M5 12L10 17L20 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>10% de descuento en experiencias</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="min-w-[24px]"
                  >
                    <path
                      d="M5 12L10 17L20 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Acceso a eventos exclusivos</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-black p-12 group hover:bg-[#add8e6] hover:text-black transition-colors duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              onMouseEnter={() => enterText("Platinum")}
              onMouseLeave={leaveElement}
            >
              <h3 className="text-2xl font-light mb-4">PLATINUM</h3>
              <div className="text-4xl font-bold mb-6">
                $12,000
                <span className="text-base font-normal text-gray-400 group-hover:text-gray-700">
                  /año
                </span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="min-w-[24px]"
                  >
                    <path
                      d="M5 12L10 17L20 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Todos los beneficios Gold</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="min-w-[24px]"
                  >
                    <path
                      d="M5 12L10 17L20 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Concierge personal dedicado</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="min-w-[24px]"
                  >
                    <path
                      d="M5 12L10 17L20 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>20% de descuento en experiencias</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="min-w-[24px]"
                  >
                    <path
                      d="M5 12L10 17L20 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Acceso a propiedades ultra-exclusivas</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="text-center mt-16">
            <div
              className="inline-block"
              onMouseEnter={enterButton}
              onMouseLeave={leaveElement}
            >
              <Button variant={"secondary"} className="px-8 py-2 rounded">
                Comparar planes
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} className="py-24 md:py-32" id="contact">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-8">
                COMIENZA TU <span className="font-bold">VIAJE</span>
              </h2>
              <p className="text-gray-600 mb-10 leading-relaxed">
                Nuestros asesores de viaje están listos para diseñar tu próxima
                experiencia extraordinaria. Contáctanos para comenzar.
              </p>

              <form className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nombre
                  </label>
                  <Input
                    type="text"
                    id="name"
                    className="w-full py-2"
                    onMouseEnter={() => enterText("Escribe tu nombre")}
                    onMouseLeave={leaveElement}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <Input
                    type="email"
                    id="email"
                    className="w-full py-2"
                    onMouseEnter={() => enterText("Escribe tu email")}
                    onMouseLeave={leaveElement}
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mensaje
                  </label>
                  <Textarea
                    id="message"
                    rows={4}
                    className="w-full py-2"
                    onMouseEnter={() => enterText("Escribe tu mensaje")}
                    onMouseLeave={leaveElement}
                  ></Textarea>
                </div>
                <div
                  className="inline-block"
                  onMouseEnter={enterButton}
                  onMouseLeave={leaveElement}
                >
                  <Button variant={"default"} className="px-8 py-2 rounded">
                    Enviar
                  </Button>
                </div>
              </form>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="aspect-[4/5] relative">
                <Image
                  src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop"
                  alt="Contact"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-black text-white p-8 max-w-xs">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold mb-1">EMAIL</h3>
                    <p className="text-gray-400">info@tourflow.com</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-1">TELÉFONO</h3>
                    <p className="text-gray-400">+1 (800) 123-4567</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-1">DIRECCIÓN</h3>
                    <p className="text-gray-400">
                      123 Luxury Avenue, New York, NY 10001
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
