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
  { label: " 5 stars", value: "5" },
  { label: "+4 stars", value: "4" },
  { label: "+3 stars", value: "3" },
  { label: "+2 stars", value: "2" },
  { label: "+1 stars", value: "1" },
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

export const bookings = [
  {
    id: "1",
    bookingNumber: "TUR-2023-0002",
    tourName: "Aventura en los Alpes Suizos",
    description:
      "Una experiencia inolvidable en los Alpes Suizos con actividades de montaña, visitas a pueblos pintorescos y degustación de gastronomía local.",
    tourImage:
      "https://images.unsplash.com/photo-1531210483974-4f8c1f33fd35?q=80&w=1000&auto=format&fit=crop",
    startDate: "2024-01-10",
    endDate: "2024-01-17",
    duration: "8 días, 7 noches",
    location: "Interlaken, Suiza",
    participants: 4,
    status: "pendiente",
    basePrice: 2800,
    taxes: 280,
    discount: 0,
    totalPrice: 3080,
    paidAmount: 1540,
    paymentMethod: "Transferencia bancaria",
    contactPhone: "+41 33 987 6543",
    contactEmail: "info@swissalps.com",
    rating: 5,
    reviews: 94,
    includes: [
      { type: "flight", description: "Vuelos ida y vuelta" },
      { type: "accommodation", description: "Chalet de montaña" },
      { type: "meals", description: "Media pensión" },
      { type: "transport", description: "Pases de tren panorámico" },
    ],
    itinerary: [
      "Llegada a Zúrich y traslado a Interlaken. Check-in en el chalet.",
      "Excursión a Jungfraujoch - Top of Europe, con vistas impresionantes.",
      "Visita a Grindelwald y experiencia de senderismo guiado.",
      "Día libre para esquiar o hacer snowboard (según temporada).",
      "Excursión al lago de Thun y visita a pueblos tradicionales.",
      "Visita a una fábrica de quesos y chocolates con degustación.",
      "Día libre para actividades opcionales o compras.",
      "Regreso a Zúrich y vuelo de vuelta.",
    ],
    paymentSchedule: [
      { description: "Reserva", amount: 1540, date: "10 Nov 2023", paid: true },
      {
        description: "Pago final",
        amount: 1540,
        date: "10 Dic 2023",
        paid: false,
      },
    ],
  },
  {
    id: "2",
    bookingNumber: "TUR-2023-0003",
    tourName: "Safari en el Serengeti",
    description:
      "Vive la experiencia única de un safari en el Parque Nacional del Serengeti, observando la vida salvaje en su hábitat natural.",
    tourImage:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1000&auto=format&fit=crop",
    startDate: "2023-09-05",
    endDate: "2023-09-12",
    duration: "8 días, 7 noches",
    location: "Serengeti, Tanzania",
    participants: 2,
    status: "completado",
    basePrice: 3500,
    taxes: 350,
    discount: 200,
    totalPrice: 3650,
    paidAmount: 3650,
    paymentMethod: "Tarjeta de crédito",
    contactPhone: "+255 765 432 109",
    contactEmail: "safari@serengeti.com",
    rating: 5,
    reviews: 76,
    includes: [
      { type: "flight", description: "Vuelos internacionales" },
      { type: "accommodation", description: "Lodges de lujo" },
      { type: "meals", description: "Pensión completa" },
      { type: "transport", description: "Vehículos 4x4 con guía" },
    ],
    itinerary: [
      "Llegada a Kilimanjaro y traslado al hotel en Arusha.",
      "Vuelo a Serengeti y primer safari por la tarde.",
      "Safari de día completo en Serengeti, buscando los 'Big Five'.",
      "Visita al cráter del Ngorongoro, un paraíso de vida salvaje.",
      "Safari en el lago Manyara, famoso por sus leones trepadores.",
      "Día libre en el lodge con safari opcional al amanecer.",
      "Último safari y traslado a Arusha.",
      "Vuelo de regreso a casa.",
    ],
  },
  {
    id: "3",
    bookingNumber: "TUR-2023-0004",
    tourName: "Crucero por las Islas Griegas",
    description:
      "Navega por el Mar Egeo visitando las islas más hermosas de Grecia, con paradas en Santorini, Mykonos y Creta.",
    tourImage:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1000&auto=format&fit=crop",
    startDate: "2023-07-20",
    endDate: "2023-07-27",
    duration: "8 días, 7 noches",
    location: "Atenas, Grecia",
    participants: 2,
    status: "cancelado",
    basePrice: 2200,
    taxes: 220,
    discount: 0,
    totalPrice: 2420,
    paidAmount: 605,
    paymentMethod: "PayPal",
    contactPhone: "+30 210 876 5432",
    contactEmail: "cruises@greekislands.com",
    rating: 4,
    reviews: 215,
    includes: [
      { type: "accommodation", description: "Camarote con balcón" },
      { type: "meals", description: "Todo incluido" },
      { type: "transport", description: "Traslados puerto" },
    ],
    itinerary: [
      "Embarque en Atenas (El Pireo) y noche a bordo.",
      "Día en Mykonos, con tiempo para explorar sus calles blancas.",
      "Visita a Kusadasi (Turquía) y las ruinas de Éfeso.",
      "Día en Patmos, con excursión opcional al Monasterio de San Juan.",
      "Día completo en Rodas, explorando su ciudad medieval.",
      "Visita a la espectacular Santorini.",
      "Día en Creta, con excursión opcional al Palacio de Knossos.",
      "Desembarque en Atenas y traslado al aeropuerto.",
    ],
  },
  {
    id: "4",
    bookingNumber: "TUR-2023-0005",
    tourName: "Ruta del Vino en La Rioja",
    description:
      "Recorre las mejores bodegas de La Rioja, con catas de vino, visitas a viñedos y experiencias gastronómicas.",
    tourImage:
      "https://images.unsplash.com/photo-1566903026052-36e4e1bd803a?q=80&w=1000&auto=format&fit=crop",
    startDate: "2024-03-15",
    endDate: "2024-03-19",
    duration: "5 días, 4 noches",
    location: "La Rioja, España",
    participants: 6,
    status: "confirmado",
    basePrice: 1500,
    taxes: 150,
    discount: 150,
    totalPrice: 1500,
    paidAmount: 750,
    paymentMethod: "Tarjeta de crédito",
    contactPhone: "+34 941 234 567",
    contactEmail: "info@rutavinorioja.com",
    rating: 4,
    reviews: 68,
    includes: [
      { type: "accommodation", description: "Hotel boutique" },
      { type: "meals", description: "Desayuno y cenas" },
      { type: "transport", description: "Minivan privada" },
    ],
    itinerary: [
      "Llegada a Logroño y check-in en el hotel. Cena de bienvenida con maridaje.",
      "Visita a tres bodegas tradicionales con cata de vinos reserva.",
      "Experiencia gastronómica y taller de cocina riojana.",
      "Ruta por los viñedos y pueblos medievales de La Rioja Alta.",
      "Visita a bodega de diseño y regreso.",
    ],
    paymentSchedule: [
      { description: "Reserva", amount: 750, date: "15 Ene 2024", paid: true },
      {
        description: "Pago final",
        amount: 750,
        date: "15 Feb 2024",
        paid: false,
      },
    ],
  },
  {
    id: "5",
    bookingNumber: "TUR-2023-0006",
    tourName: "Escapada a Bali",
    description:
      "Descubre la isla de los dioses con esta escapada que incluye playas, templos y la vibrante cultura balinesa.",
    tourImage:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop",
    startDate: "2024-02-10",
    endDate: "2024-02-18",
    duration: "9 días, 8 noches",
    location: "Bali, Indonesia",
    participants: 2,
    status: "confirmado",
    basePrice: 1800,
    taxes: 180,
    discount: 0,
    totalPrice: 1980,
    paidAmount: 1980,
    paymentMethod: "Tarjeta de crédito",
    contactPhone: "+62 361 123 456",
    contactEmail: "info@baliescapades.com",
    rating: 5,
    reviews: 142,
    includes: [
      { type: "flight", description: "Vuelos ida y vuelta" },
      { type: "accommodation", description: "Villa privada con piscina" },
      { type: "meals", description: "Desayuno diario" },
      { type: "transport", description: "Traslados y excursiones" },
    ],
    itinerary: [
      "Llegada a Denpasar y traslado a Ubud. Check-in en villa privada.",
      "Visita a los arrozales de Tegalalang y templo de Tirta Empul.",
      "Clase de cocina balinesa y visita al Bosque de los Monos.",
      "Excursión al templo de Uluwatu y espectáculo de danza Kecak.",
      "Día libre para explorar Ubud o actividades opcionales.",
      "Traslado a Seminyak y tarde libre en la playa.",
      "Excursión al templo de Tanah Lot y puesta de sol.",
      "Día libre para compras o relax en la playa.",
      "Traslado al aeropuerto para vuelo de regreso.",
    ],
    paymentSchedule: [
      {
        description: "Pago completo",
        amount: 1980,
        date: "10 Dic 2023",
        paid: true,
      },
    ],
  },
];

// Define the tour type
export interface Tour {
  id: string
  name: string
  user_id: string
  description: string
  price: string
  address: string
  country: string
  is_approved: boolean
  images: string[]
  files: string[]
  videos: string[]
  banner: string
  is_active: boolean
  average_rating: string
  total_reviews: number
  target_product_audience_id: string
  product_category_id: string
  product_type_id: string
  created_at: string
  updated_at: string
  product_category: {
    id: string
    name: string
  }
  target_audience: {
    id: string
    name: string
  }
  product_type: {
    id: string
    name: string
  }
  tour: {
    duration: number
  }
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
    files: ["https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"],
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
]

export const destinations = [
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

export const properties = [
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

export const carRentals = [
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

export const tours = [
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
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop",
  },
];

