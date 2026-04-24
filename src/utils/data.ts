import { Country } from "@/types/payment-types";
import { Destination } from "@/types/product";

export const HERO_SLIDE_KEYS = [
  "slide1",
  "slide2",
  "slide3",
  "slide4",
  "slide5",
] as const;

export const HERO_SLIDE_IMAGES = [
  "/homepage/banner1.webp",
  "/homepage/banner2.webp",
  "/homepage/banner3.webp",
  "/homepage/banner4.webp",
  "/homepage/banner5.webp",
];

export const ratingOptions = [
  { label: " 5 estrellas", value: "5" },
  { label: "+4 estrellas", value: "4" },
  { label: "+3 estrellas", value: "3" },
  { label: "+2 estrellas", value: "2" },
  { label: "+1 estrellas", value: "1" },
  { label: "Sin calificación", value: "0" },
];

export const ratingOptionsTranslations = {
  es: ratingOptions,
  en: [
    { label: " 5 stars", value: "5" },
    { label: "+4 stars", value: "4" },
    { label: "+3 stars", value: "3" },
    { label: "+2 stars", value: "2" },
    { label: "+1 stars", value: "1" },
    { label: "No rating", value: "0" },
  ],
};

export const productTypes = [
  { description: "Viajes", name: "tours", id: 1 },
  /* { description: "Alquiler", name: "rental", id: 2 }, */
];

export const productTypesTranslations = {
  es: productTypes,
  en: [
    { description: "Trips", name: "tours", id: 1 },
    /* { description: "Rental", name: "rental", id: 2 }, */
  ],
};

export const countriesCurrency = [
  {
    countryName: "El Salvador",
    countryCode: "SV",
    currencyCode: "USD",
    currencyName: "Dólar estadounidense",
    symbol: "$",
  },
  {
    countryName: "España",
    countryCode: "ES",
    currencyCode: "EUR",
    currencyName: "Euro",
    symbol: "€",
  },
  {
    countryName: "Argentina",
    countryCode: "AR",
    currencyCode: "ARS",
    currencyName: "Peso argentino",
    symbol: "$",
  },
  {
    countryName: "Bolivia",
    countryCode: "BO",
    currencyCode: "BOB",
    currencyName: "Boliviano",
    symbol: "Bs",
  },
  {
    countryName: "Brasil",
    countryCode: "BR",
    currencyCode: "BRL",
    currencyName: "Real brasileño",
    symbol: "R$",
  },
  {
    countryName: "Canadá",
    countryCode: "CA",
    currencyCode: "CAD",
    currencyName: "Dólar canadiense",
    symbol: "$",
  },
  {
    countryName: "Chile",
    countryCode: "CL",
    currencyCode: "CLP",
    currencyName: "Peso chileno",
    symbol: "$",
  },
  {
    countryName: "Colombia",
    countryCode: "CO",
    currencyCode: "COP",
    currencyName: "Peso colombiano",
    symbol: "$",
  },
  {
    countryName: "Costa Rica",
    countryCode: "CR",
    currencyCode: "CRC",
    currencyName: "Colón costarricense",
    symbol: "₡",
  },
  {
    countryName: "Guatemala",
    countryCode: "GT",
    currencyCode: "GTQ",
    currencyName: "Quetzal",
    symbol: "Q",
  },
  {
    countryName: "Honduras",
    countryCode: "HN",
    currencyCode: "HNL",
    currencyName: "Lempira",
    symbol: "L",
  },
  {
    countryName: "México",
    countryCode: "MX",
    currencyCode: "MXN",
    currencyName: "Peso mexicano",
    symbol: "$",
  },
  {
    countryName: "Nicaragua",
    countryCode: "NI",
    currencyCode: "NIO",
    currencyName: "Córdoba nicaragüense",
    symbol: "C$",
  },
  {
    countryName: "Panamá",
    countryCode: "PA",
    currencyCode: "PAB",
    currencyName: "Balboa panameño",
    symbol: "B/.",
  },
  {
    countryName: "Paraguay",
    countryCode: "PY",
    currencyCode: "PYG",
    currencyName: "Guaraní paraguayo",
    symbol: "₲",
  },
  {
    countryName: "Perú",
    countryCode: "PE",
    currencyCode: "PEN",
    currencyName: "Sol peruano",
    symbol: "S/",
  },
  {
    countryName: "Uruguay",
    countryCode: "UY",
    currencyCode: "UYU",
    currencyName: "Peso uruguayo",
    symbol: "$",
  },
  {
    countryName: "Venezuela",
    countryCode: "VE",
    currencyCode: "VES",
    currencyName: "Bolívar venezolano",
    symbol: "Bs",
  },
  {
    countryName: "Reino Unido",
    countryCode: "GB",
    currencyCode: "GBP",
    currencyName: "Libra esterlina",
    symbol: "£",
  },
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
  /*  {
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
  }, */
];

export const statusColors = {
  confirmado: "bg-green-50 text-green-700 border-green-200",
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  completado: "bg-primary text-primary-foreground border-primary/30",
  cancelado: "bg-red-50 text-red-700 border-red-200",
};

export const statusText = {
  confirmado: "Confirmado",
  pendiente: "Pendiente",
  completado: "Completado",
  cancelado: "Cancelado",
};

export const statusTextTranslations = {
  es: statusText,
  en: {
    confirmado: "Confirmed",
    pendiente: "Pending",
    completado: "Completed",
    cancelado: "Cancelled",
  },
};

export const destinations: Destination[] = [
  {
    id: "1",
    name: "El Salvador",
    country: "El Salvador",
    image: "/elsalvador.webp",
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
    image: "/homepage/7.webp",
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
    image: "/homepage/banner5.webp",
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
    image: "/homepage/3.webp",
    tours: 128,
    activities: 180,
    category: "Playa",
    duration: "2-4 días",
    rating: 4.6,
    priceRange: 30.99,
  },
];

export const destinationsTranslations = {
  es: destinations,
  en: [
    {
      id: "1",
      name: "El Salvador",
      country: "El Salvador",
      image: "/elsalvador.webp",
      tours: 156,
      activities: 248,
      category: "City",
      duration: "5-7 days",
      rating: 4.8,
      priceRange: 13,
    },
    {
      id: "2",
      name: "Guatemala",
      country: "Guatemala",
      image: "/homepage/7.webp",
      tours: 143,
      activities: 200,
      category: "City",
      duration: "4-7 days",
      rating: 4.9,
      priceRange: 14.99,
    },
    {
      id: "3",
      name: "Honduras",
      country: "Honduras",
      image: "/homepage/banner5.webp",
      tours: 132,
      activities: 220,
      category: "City",
      duration: "3-5 days",
      rating: 4.7,
      priceRange: 20.99,
    },
    {
      id: "4",
      name: "Nicaragua",
      country: "Nicaragua",
      image: "/homepage/3.webp",
      tours: 128,
      activities: 180,
      category: "Beach",
      duration: "2-4 days",
      rating: 4.6,
      priceRange: 30.99,
    },
  ],
};

export const tours = [
  {
    title: "El Salvador",
    duration: "1 día",
    description: "Explora Surf City, cascadas escondidas y pueblos coloniales",
    price: 50,
    image: "/homepage/4.webp", // Playa de El Salvador
  },
  {
    title: "Guatemala",
    duration: "1 día",
    description: "Viaje cultural por Antigua, Atitlán y Tikal",
    price: 45,
    image: "/homepage/6.webp", // Antigua Guatemala
  },
  {
    title: "Honduras",
    duration: "2 días",
    description: "Descubre Roatán, Copán y su biodiversidad",
    price: 100,
    image: "/homepage/3.webp", // Roatán, Honduras
  },
];

export const toursTranslations = {
  es: tours,
  en: [
    {
      title: "El Salvador",
      duration: "1 day",
      description: "Explore Surf City, hidden waterfalls, and colonial towns",
      price: 50,
      image: "/homepage/4.webp",
    },
    {
      title: "Guatemala",
      duration: "1 day",
      description: "Cultural trip through Antigua, Atitlán, and Tikal",
      price: 45,
      image: "/homepage/6.webp",
    },
    {
      title: "Honduras",
      duration: "2 days",
      description: "Discover Roatán, Copán, and its biodiversity",
      price: 100,
      image: "/homepage/3.webp",
    },
  ],
};
