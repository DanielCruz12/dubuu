import { Country } from "@/types/payment-types";

export const blogData = [
  {
    id: 1,
    title: "The Art of Minimalist Design in Modern Web Development",
    excerpt:
      "Discover how minimalist design principles can create powerful and effective user experiences in modern web applications.",
    content:
      "Minimalist design is more than just a visual style—it's a comprehensive approach to creating intuitive and effective user experiences. In this comprehensive guide, we'll explore how the principles of minimalist design can be applied to modern web development to create interfaces that are both beautiful and functional...",
    author: "Jane Cooper",
    authorImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    category: "Design",
    readingTime: "6 min read",
    date: "2023-05-15",
    imageUrl:
      "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&h=800&fit=crop",
    featured: true,
  },
  {
    id: 2,
    title: "Building Scalable Architecture for Modern Applications",
    excerpt:
      "Learn the essential principles and patterns for creating robust, scalable application architectures that stand the test of time.",
    content:
      "In today's rapidly evolving tech landscape, building scalable applications is more crucial than ever. This comprehensive guide explores the fundamental principles and modern patterns that enable you to create robust, maintainable, and scalable application architectures...",
    author: "Alex Morgan",
    authorImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    category: "Architecture",
    readingTime: "8 min read",
    date: "2023-05-20",
    imageUrl:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=800&fit=crop",
    featured: true,
  },
  {
    id: 3,
    title: "The Future of AI in Web Development",
    excerpt:
      "Explore how artificial intelligence is revolutionizing web development and what it means for the future of our industry.",
    content:
      "Artificial Intelligence is no longer just a buzzword—it's transforming how we approach web development. From automated testing to AI-powered design systems, discover the exciting ways AI is shaping the future of web development...",
    author: "Sarah Chen",
    authorImage:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
    category: "Technology",
    readingTime: "5 min read",
    date: "2023-05-25",
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop",
  },
];

export const ratingOptions = [
  { label: " 5 estrellas", value: "5" },
  { label: "+4 estrellas", value: "4" },
  { label: "+3 estrellas", value: "3" },
  { label: "+2 estrellas", value: "2" },
  { label: "+1 estrellas", value: "1" },
];

export const productTypes = [
  { description: "Viajes", name: "tours", id: 1 },
  { description: "Propiedades", name: "properties", id: 2 },
  { description: "Alquileres", name: "rental", id: 3 },
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

// Define the tour type
export interface Tour {
  id: string;
  name: string;
  user_id: string;
  description: string;
  price: string;
  address: string;
  country: string;
  is_approved: boolean;
  images: string[];
  files: string[];
  videos: string[];
  banner: string;
  is_active: boolean;
  average_rating: string;
  total_reviews: number;
  target_product_audience_id: string;
  product_category_id: string;
  product_type_id: string;
  created_at: string;
  updated_at: string;
  product_category: {
    id: string;
    name: string;
  };
  target_audience: {
    id: string;
    name: string;
  };
  product_type: {
    id: string;
    name: string;
  };
  tour: {
    duration: number;
  };
}

// Sample data with more countries
export const sampleTours: Tour[] = [
  {
    id: "e9cbb500-8c57-4225-a3de-5673423b438c",
    name: "Exploración Volcán de Santa Ana",
    user_id: "user_2veqnkB4eeA75VaFcmN9YgQlX6H",
    description:
      "Ascenso guiado al majestuoso volcán Ilamatepec, disfrutando vistas panorámicas y un merecido descanso en aguas termales al finalizar.",
    price: "20.99",
    address: "Volcán de Santa Ana, Cerro Verde",
    country: "El Salvador",
    is_approved: true,
    images: [
      "https://picsum.photos/id/1015/1000/600.jpg",
      "https://picsum.photos/id/1011/1000/600.jpg",
      "https://picsum.photos/id/1016/1000/600.jpg",
      "https://picsum.photos/id/1020/1000/500.jpg",
    ],
    files: [
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    ],
    videos: ["https://samplelib.com/lib/preview/mp4/sample-5s.mp4"],
    banner: "https://picsum.photos/id/1035/1000/600.jpg",
    is_active: true,
    average_rating: "4.00",
    total_reviews: 1,
    target_product_audience_id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
    product_category_id: "a040faa5-5987-4011-b549-3ea0ffbaf862",
    product_type_id: "c732fe6e-324d-40bb-a629-9cc0e26c0253",
    created_at: "2025-04-14T23:03:48.832Z",
    updated_at: "2025-04-14T23:03:48.832Z",
    product_category: {
      id: "a040faa5-5987-4011-b549-3ea0ffbaf862",
      name: "Aventura",
    },
    target_audience: {
      id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
      name: "familiar",
    },
    product_type: {
      id: "c732fe6e-324d-40bb-a629-9cc0e26c0253",
      name: "tours",
    },
    tour: {
      duration: 1,
    },
  },
  {
    id: "f8dbb600-9c57-4225-b3de-6783423b439d",
    name: "Tour por la Ciudad Colonial",
    user_id: "user_3veqnkB4eeA75VaFcmN9YgQlX6H",
    description:
      "Recorrido por las calles históricas de la ciudad colonial, visitando monumentos y edificios emblemáticos.",
    price: "15.99",
    address: "Centro Histórico",
    country: "Guatemala",
    is_approved: true,
    images: [
      "https://picsum.photos/id/1025/1000/600.jpg",
      "https://picsum.photos/id/1026/1000/600.jpg",
      "https://picsum.photos/id/1027/1000/600.jpg",
    ],
    files: [],
    videos: [],
    banner: "https://picsum.photos/id/1036/1000/600.jpg",
    is_active: true,
    average_rating: "4.50",
    total_reviews: 2,
    target_product_audience_id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
    product_category_id: "a040faa5-5987-4011-b549-3ea0ffbaf862",
    product_type_id: "c732fe6e-324d-40bb-a629-9cc0e26c0253",
    created_at: "2025-04-14T23:03:48.832Z",
    updated_at: "2025-04-14T23:03:48.832Z",
    product_category: {
      id: "a040faa5-5987-4011-b549-3ea0ffbaf862",
      name: "Cultural",
    },
    target_audience: {
      id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
      name: "familiar",
    },
    product_type: {
      id: "c732fe6e-324d-40bb-a629-9cc0e26c0253",
      name: "tours",
    },
    tour: {
      duration: 3,
    },
  },
  {
    id: "g7ebb700-7d57-4225-c3de-7893423b440e",
    name: "Aventura en Cenotes",
    user_id: "user_4veqnkB4eeA75VaFcmN9YgQlX6H",
    description:
      "Explora los misteriosos cenotes de la península de Yucatán, nadando en aguas cristalinas y descubriendo formaciones subterráneas.",
    price: "35.99",
    address: "Riviera Maya",
    country: "México",
    is_approved: true,
    images: [
      "https://picsum.photos/id/1035/1000/600.jpg",
      "https://picsum.photos/id/1036/1000/600.jpg",
      "https://picsum.photos/id/1037/1000/600.jpg",
    ],
    files: [],
    videos: [],
    banner: "https://picsum.photos/id/1037/1000/600.jpg",
    is_active: true,
    average_rating: "4.80",
    total_reviews: 5,
    target_product_audience_id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
    product_category_id: "a040faa5-5987-4011-b549-3ea0ffbaf862",
    product_type_id: "c732fe6e-324d-40bb-a629-9cc0e26c0253",
    created_at: "2025-04-14T23:03:48.832Z",
    updated_at: "2025-04-14T23:03:48.832Z",
    product_category: {
      id: "a040faa5-5987-4011-b549-3ea0ffbaf862",
      name: "Aventura",
    },
    target_audience: {
      id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
      name: "familiar",
    },
    product_type: {
      id: "c732fe6e-324d-40bb-a629-9cc0e26c0253",
      name: "tours",
    },
    tour: {
      duration: 2,
    },
  },
  {
    id: "h8fcc800-8e57-4225-d3de-8903423b441f",
    name: "Templos de Kioto",
    user_id: "user_5veqnkB4eeA75VaFcmN9YgQlX6H",
    description:
      "Visita los templos más importantes de Kioto, incluyendo Kinkaku-ji (Pabellón Dorado) y Fushimi Inari con sus miles de torii rojos.",
    price: "45.99",
    address: "Kioto",
    country: "Japón",
    is_approved: true,
    images: [
      "https://picsum.photos/id/1040/1000/600.jpg",
      "https://picsum.photos/id/1041/1000/600.jpg",
      "https://picsum.photos/id/1042/1000/600.jpg",
    ],
    files: [],
    videos: [],
    banner: "https://picsum.photos/id/1040/1000/600.jpg",
    is_active: true,
    average_rating: "4.90",
    total_reviews: 8,
    target_product_audience_id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
    product_category_id: "a040faa5-5987-4011-b549-3ea0ffbaf862",
    product_type_id: "c732fe6e-324d-40bb-a629-9cc0e26c0253",
    created_at: "2025-04-14T23:03:48.832Z",
    updated_at: "2025-04-14T23:03:48.832Z",
    product_category: {
      id: "a040faa5-5987-4011-b549-3ea0ffbaf862",
      name: "Cultural",
    },
    target_audience: {
      id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
      name: "familiar",
    },
    product_type: {
      id: "c732fe6e-324d-40bb-a629-9cc0e26c0253",
      name: "tours",
    },
    tour: {
      duration: 2,
    },
  },
  {
    id: "i9gdd900-9f57-4225-e3de-9913423b442g",
    name: "Monte Fuji y Hakone",
    user_id: "user_6veqnkB4eeA75VaFcmN9YgQlX6H",
    description:
      "Excursión de un día para admirar el majestuoso Monte Fuji y relajarse en las aguas termales de Hakone.",
    price: "55.99",
    address: "Tokio",
    country: "Japón",
    is_approved: true,
    images: [
      "https://picsum.photos/id/1043/1000/600.jpg",
      "https://picsum.photos/id/1044/1000/600.jpg",
      "https://picsum.photos/id/1045/1000/600.jpg",
    ],
    files: [],
    videos: [],
    banner: "https://picsum.photos/id/1043/1000/600.jpg",
    is_active: true,
    average_rating: "4.70",
    total_reviews: 6,
    target_product_audience_id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
    product_category_id: "a040faa5-5987-4011-b549-3ea0ffbaf862",
    product_type_id: "c732fe6e-324d-40bb-a629-9cc0e26c0253",
    created_at: "2025-04-14T23:03:48.832Z",
    updated_at: "2025-04-14T23:03:48.832Z",
    product_category: {
      id: "a040faa5-5987-4011-b549-3ea0ffbaf862",
      name: "Naturaleza",
    },
    target_audience: {
      id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
      name: "familiar",
    },
    product_type: {
      id: "c732fe6e-324d-40bb-a629-9cc0e26c0253",
      name: "tours",
    },
    tour: {
      duration: 1,
    },
  },
];
export const tours = [
  {
    title: "El Salvador",
    duration: "5 días",
    description: "Explora Surf City, cascadas escondidas y pueblos coloniales",
    price: "$1,800",
    image:
      "https://firebasestorage.googleapis.com/v0/b/i-strategies-db.firebasestorage.app/o/destinations%2Felsalvador.jpeg?alt=media&token=8415f70e-2ada-43b6-a53f-94b13f14c48d", // Playa de El Salvador
  },
  {
    title: "Guatemala",
    duration: "7 días",
    description: "Viaje cultural por Antigua, Atitlán y Tikal",
    price: "$2,500",
    image:
      "https://firebasestorage.googleapis.com/v0/b/i-strategies-db.firebasestorage.app/o/destinations%2Fguatemala.jpg?alt=media&token=e59470b5-e2e7-4ab1-a209-a2b738d7cec9", // Antigua Guatemala
  },
  {
    title: "Honduras",
    duration: "6 días",
    description: "Descubre Roatán, Copán y su biodiversidad",
    price: "$2,200",
    image:
      "https://firebasestorage.googleapis.com/v0/b/i-strategies-db.firebasestorage.app/o/destinations%2Fhonduras.jpg?alt=media&token=6fd08f65-5eee-496f-a25c-e47e3e172abf", // Roatán, Honduras
  },
];

export const properties = [
  {
    title: "Villa Surf City",
    location: "El Salvador",
    description: "Casa moderna frente al mar en El Tunco, ideal para surfistas",
    price: "$850/noche",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2070&q=80", // Casa de playa moderna
  },
  {
    title: "Cabaña Lago Coatepeque",
    location: "El Salvador",
    description: "Cabaña privada con muelle y vista al volcán de Santa Ana",
    price: "$600/noche",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2070&q=80", // Cabaña tropical junto a lago
  },
  {
    title: "Eco Lodge Nicaragua",
    location: "Nicaragua",
    description: "Refugio ecológico rodeado de naturaleza y tranquilidad",
    price: "$500/noche",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2070&q=80", // Cabaña en entorno tropical
  },
];



export const carRentals = [
  {
    model: "Toyota RAV4",
    description: "SUV confiable y cómodo para rutas largas y caminos rurales",
    price: "$95/día",
    image:
      "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=2070&q=80", // Toyota RAV4
  },
  {
    model: "Mazda 3 Sedán",
    description: "Diseño elegante y excelente eficiencia de combustible",
    price: "$80/día",
    image:
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=2070&q=80", // Mazda sedán
  },
  {
    model: "Kia Sportage",
    description: "Versátil, cómodo y ideal para viajes en familia",
    price: "$90/día",
    image:
      "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=2070&q=80",
  }
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
