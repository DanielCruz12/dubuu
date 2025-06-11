import { Country } from "@/types/payment-types";
import { Destination } from "@/types/product";

export const ratingOptions = [
  { label: " 5 estrellas", value: "5" },
  { label: "+4 estrellas", value: "4" },
  { label: "+3 estrellas", value: "3" },
  { label: "+2 estrellas", value: "2" },
  { label: "+1 estrellas", value: "1" },
  { label: "Sin calificación", value: "0" },
];

export const productTypes = [
  { description: "Viajes", name: "tours", id: 1 },
  { description: "Alquiler", name: "rental", id: 2 },
];

export const countries: Country[] = [
  {
    id: "SV",
    nombre: "El Salvador",
    orden: 1,
    regiones: [
      { id: "SV-AH", nombre: "Ahuachapan", codigoPostal: "2101" },
      { id: "SV-CA", nombre: "Cabanas", codigoPostal: "1201" },
      { id: "SV-CH", nombre: "Chalatenango", codigoPostal: "1301" },
      { id: "SV-CU", nombre: "Cuscatlan", codigoPostal: "1401" },
      { id: "SV-LI", nombre: "La Libertad", codigoPostal: "1501" },
      { id: "SV-MO", nombre: "Morazan", codigoPostal: "3201" },
      { id: "SV-PA", nombre: "La Paz", codigoPostal: "1601" },
      { id: "SV-SA", nombre: "Santa Ana", codigoPostal: "2201" },
      { id: "SV-SM", nombre: "San Miguel", codigoPostal: "3301" },
      { id: "SV-SO", nombre: "Sonsonate", codigoPostal: "2301" },
      { id: "SV-SS", nombre: "San Salvador", codigoPostal: "1101" },
      { id: "SV-SV", nombre: "San Vicente", codigoPostal: "1701" },
      { id: "SV-UN", nombre: "La Union", codigoPostal: "3101" },
      { id: "SV-US", nombre: "Usulutan", codigoPostal: "3401" },
    ],
  },
  {
    id: "GT",
    nombre: "Guatemala",
    orden: 2,
    regiones: [
      { id: "GT-AV", nombre: "Alta Verapaz", codigoPostal: null },
      { id: "GT-BV", nombre: "Baja Verapaz", codigoPostal: null },
      { id: "GT-CM", nombre: "Chimaltenango", codigoPostal: null },
      { id: "GT-CQ", nombre: "Chiquimula", codigoPostal: null },
      { id: "GT-ES", nombre: "Escuintla", codigoPostal: null },
      { id: "GT-GU", nombre: "Guatemala", codigoPostal: null },
      { id: "GT-HU", nombre: "Huehuetenango", codigoPostal: null },
      { id: "GT-IZ", nombre: "Izabal", codigoPostal: null },
      { id: "GT-JA", nombre: "Jalapa", codigoPostal: null },
      { id: "GT-JU", nombre: "Jutiapa", codigoPostal: null },
      { id: "GT-PE", nombre: "Peten", codigoPostal: null },
      { id: "GT-PR", nombre: "El Progreso", codigoPostal: null },
      { id: "GT-QC", nombre: "Quiche", codigoPostal: null },
      { id: "GT-QZ", nombre: "Quetzaltenango", codigoPostal: null },
      { id: "GT-RE", nombre: "Retalhuleu", codigoPostal: null },
      { id: "GT-SA", nombre: "Sacatepequez", codigoPostal: null },
      { id: "GT-SM", nombre: "San Marcos", codigoPostal: null },
      { id: "GT-SO", nombre: "Solola", codigoPostal: null },
      { id: "GT-SR", nombre: "Santa Rosa", codigoPostal: null },
      { id: "GT-SU", nombre: "Suchitepequez", codigoPostal: null },
      { id: "GT-TO", nombre: "Totonicapan", codigoPostal: null },
      { id: "GT-ZA", nombre: "Zacapa", codigoPostal: null },
    ],
  },
];

export const statusColors = {
  confirmado: "bg-green-50 text-green-700 border-green-200",
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  completado: "bg-blue-50 text-blue-700 border-blue-200",
  cancelado: "bg-red-50 text-red-700 border-red-200",
};

export const statusText = {
  confirmado: "Confirmado",
  pendiente: "Pendiente",
  completado: "Completado",
  cancelado: "Cancelado",
};

export const destinations: Destination[] = [
  {
    id: "1",
    name: "El Salvador",
    country: "El Salvador",
    image: "/elsalvador.jpg",
    tours: 156,
    activities: 248,
    category: "Ciudad",
    duration: "5-7 días",
    rating: 4.8,
    priceRange: 13,
  },
  {
    id: "2",
    name: "Guatemala",
    country: "Guatemala",
    image: "/homepage/2.jpg",
    tours: 143,
    activities: 200,
    category: "Ciudad",
    duration: "4-7 días",
    rating: 4.9,
    priceRange: 14.99,
  },
  {
    id: "3",
    name: "Honduras",
    country: "Honduras",
    image: "/homepage/5.jpg",
    tours: 132,
    activities: 220,
    category: "Ciudad",
    duration: "3-5 días",
    rating: 4.7,
    priceRange: 20.99,
  },
  {
    id: "4",
    name: "Nicaragua",
    country: "Nicaragua",
    image: "/homepage/3.jpg",
    tours: 128,
    activities: 180,
    category: "Playa",
    duration: "2-4 días",
    rating: 4.6,
    priceRange: 30.99,
  },
];

export const tours = [
  {
    title: "El Salvador",
    duration: "1 día",
    description: "Explora Surf City, cascadas escondidas y pueblos coloniales",
    price: "$50 p/p",
    image: "/homepage/4.jpg", // Playa de El Salvador
  },
  {
    title: "Guatemala",
    duration: "1 día",
    description: "Viaje cultural por Antigua, Atitlán y Tikal",
    price: "$45",
    image: "/homepage/6.jpg", // Antigua Guatemala
  },
  {
    title: "Honduras",
    duration: "2 días",
    description: "Descubre Roatán, Copán y su biodiversidad",
    price: "$100",
    image: "/homepage/3.jpg", // Roatán, Honduras
  },
];

export const mockTours = [
  {
    id: "e9cbb500-8c57-4225-a3de-5673423b438c",
    name: "Exploración Volcán de Santa Ana",
    description:
      "Ascenso guiado al majestuoso volcán Ilamatepec, disfrutando vistas panorámicas y un merecido descanso en aguas termales al finalizar.",
    price: 20.99,
    departure_point: "Multiplaza, San Salvador",
    address: "Volcán de Santa Ana, Cerro Verde",
    country: "El Salvador",
  },
  {
    id: "f7a2b3c4-5d6e-7f8g-9h0i-1j2k3l4m5n6o",
    name: "Ruta de las Flores",
    description:
      "Recorrido por los pintorescos pueblos de la Ruta de las Flores, con visitas a cascadas y degustación de gastronomía local.",
    price: 35.5,
    departure_point: "Centro Comercial Galerías, San Salvador",
    address: "Ruta de las Flores, Sonsonate",
    country: "El Salvador",
  },
  {
    id: "7p8q9r0s-1t2u-3v4w-5x6y-7z8a9b0c1d2e",
    name: "Playa El Tunco",
    description:
      "Día de playa en El Tunco, con clases de surf para principiantes y tiempo libre para disfrutar del mar y la gastronomía local.",
    price: 25.0,
    departure_point: "Metrocentro, San Salvador",
    address: "Playa El Tunco, La Libertad",
    country: "El Salvador",
  },
  {
    id: "3f4g5h6i-7j8k-9l0m-1n2o-3p4q5r6s7t8u",
    name: "Suchitoto Colonial",
    description:
      "Visita a la ciudad colonial de Suchitoto, con recorrido por sus calles empedradas, iglesias y talleres artesanales.",
    price: 18.75,
    departure_point: "Plaza Mundo, Soyapango",
    address: "Suchitoto, Cuscatlán",
    country: "El Salvador",
  },
];
