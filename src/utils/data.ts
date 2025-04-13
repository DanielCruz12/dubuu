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
  { description: "Alquiler", name: "rental", id: 3 },
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

export type Region = {
  id: string;
  nombre: string;
  codigoPostal: string | null;
};

export type Country = {
  id: string;
  nombre: string;
  orden: number;
  regiones: Region[];
};

export const getCountryById = (id: string): Country | undefined => {
  return countries.find((country) => country.id === id);
};

export const getRegionById = (
  countryId: string,
  regionId: string
): Region | undefined => {
  const country = getCountryById(countryId);
  if (!country) return undefined;
  return country.regiones.find((region) => region.id === regionId);
};
