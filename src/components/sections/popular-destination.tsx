import Image from "next/image";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface Destination {
  id: string;
  name: string;
  image: string;
  tours: number;
  activities: number;
  category: string;
  duration: string;
  country: string;
  rating: number;
  priceRange: number;
}

const destinations: Destination[] = [
  {
    id: "1",
    name: "Paris",
    country: "France",
    image: "/paris.jpeg",
    tours: 156,
    activities: 248,
    category: "City",
    duration: "5-7 days",
    rating: 4.8,
    priceRange: 13,
  },
  {
    id: "2",
    name: "Tokyo",
    country: "Japan",
    image: "/tokyo.jpg",
    tours: 143,
    activities: 200,
    category: "City",
    duration: "4-7 days",
    rating: 4.9,
    priceRange: 14.99,
  },
  {
    id: "3",
    name: "Rome",
    country: "Italy",
    image: "/roma.jpg",
    tours: 132,
    activities: 220,
    category: "City",
    duration: "3-5 days",
    rating: 4.7,
    priceRange: 200,
  },
  {
    id: "4",
    name: "El Salvador",
    country: "El Salvador",
    image: "/elsalvador.jpg",
    tours: 128,
    activities: 180,
    category: "Beach",
    duration: "2-4 days",
    rating: 4.6,
    priceRange: 3000,
  },
];

export default function PopularDestinations() {
  return (
    <section className="py-12">
      <div className="space-y-3">
        <h2 className="text-xl md:text-3xl font-bold">Popular Destinations</h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Favorite destinations based on customer reviews
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {destinations.map((destination) => (
            <Link
              href={`/tours/${destination.country.trim()}`}
              key={destination.id}
              className="rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative h-20 md:h-24">
                <Image
                  src={destination.image}
                  alt={destination.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <h3 className="text-2xl font-semibold mr-2">
                      {destination.name}
                    </h3>
                    <p className="text-muted-foreground text-sm md:text-base ml-2">
                      ${destination.priceRange}
                    </p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-muted-foreground mt-2">
                  {destination.tours} Tours, {destination.activities} Activities
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
