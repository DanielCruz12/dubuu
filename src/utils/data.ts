import { IProduct } from "@/types/product";

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

export const products: IProduct[] = [
  {
    id: "1",
    name: "California Sunset/Twilight Boat Cruise",
    description:
      "Experience the magic of California as you sail at sunset or under the stars. This 7-day, small-group boat cruise offers spectacular ocean views, unforgettable sunsets, and serene nature. Perfect for couples or small groups seeking an intimate and relaxing adventure.",
    price: 35.62,
    departure_point: "California",
    max_people: "Small group",
    duration: 7,
    images: ["/tour.jpg"],
    videos: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
    files: [],
    banner: "",
    product_category: { name: "Adventure" },
    target_audience: { name: "Enterprise" },
    average_rating: 4.5,
    total_reviews: 12,
    user_id: "1",
    is_approved: true,
  },
];

export const ratingOptions = [
  { label: "5 stars", value: "5" },
  { label: "+4 stars", value: "4" },
  { label: "+3 stars", value: "3" },
];

export const categoryOptions = [
  { label: "Tours", value: "tours" },
  { label: "Hotels", value: "hotels" },
  { label: "Rental", value: "rentals" },
];
