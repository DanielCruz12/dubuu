"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMobile } from "@/hooks/use-mobile";

// Dynamically import the Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import("@/components/map"), {
  loading: () => <MapSkeleton />,
  ssr: false,
});

interface Location {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  lat: number;
  lng: number;
  type: string;
  amenities: string[];
}

export default function AirbnbMap() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const isMobile = useMobile();

  useEffect(() => {
    // Simulating fetching locations data
    const mockLocations: Location[] = [
      {
        id: "1",
        title: "Modern Apartment with Ocean View",
        description: "Stunning apartment with panoramic ocean views",
        price: 120,
        rating: 4.92,
        reviewCount: 128,
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
        ],
        lat: 40.712776,
        lng: -74.005974,
        type: "Apartment",
        amenities: ["Wifi", "Kitchen", "Washer", "Air conditioning"],
      },
      {
        id: "2",
        title: "Cozy Cabin in the Woods",
        description: "Peaceful retreat surrounded by nature",
        price: 95,
        rating: 4.85,
        reviewCount: 76,
        images: [
          "https://images.unsplash.com/photo-1542718610-a1d656d1884c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
          "https://images.unsplash.com/photo-1595521624992-9a873a607e01?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
        ],
        lat: 40.722776,
        lng: -74.015974,
        type: "Cabin",
        amenities: ["Fireplace", "Hot tub", "Mountain view", "BBQ grill"],
      },
      {
        id: "3",
        title: "Downtown Loft with City Views",
        description: "Stylish loft in the heart of downtown",
        price: 150,
        rating: 4.78,
        reviewCount: 94,
        images: [
          "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
          "https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
          "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
        ],
        lat: 40.702776,
        lng: -74.025974,
        type: "Loft",
        amenities: ["Gym", "Doorman", "Elevator", "City view"],
      },
      {
        id: "4",
        title: "Beachfront Villa with Private Pool",
        description: "Luxury villa steps away from the beach",
        price: 280,
        rating: 4.96,
        reviewCount: 152,
        images: [
          "https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
          "https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
          "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
        ],
        lat: 40.732776,
        lng: -73.995974,
        type: "Villa",
        amenities: ["Pool", "Beach access", "Beachfront", "Chef's kitchen"],
      },
      {
        id: "5",
        title: "Historic Townhouse in Old Town",
        description: "Charming townhouse with original features",
        price: 135,
        rating: 4.82,
        reviewCount: 108,
        images: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
        ],
        lat: 40.742776,
        lng: -74.035974,
        type: "Townhouse",
        amenities: ["Fireplace", "Garden", "Historic", "Walk to shops"],
      },
    ];

    setLocations(mockLocations);
  }, []);

  const handleMarkerClick = (locationId: string) => {
    setSelectedLocation(locationId);

    // Find the element and scroll to it
    const element = document.getElementById(`listing-${locationId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const [showListings, setShowListings] = useState(true);

  return (
    <div className="w-full h-full ">
      <div
        className={`grid ${isMobile ? "grid-rows-[1fr_auto]" : "grid-cols-[1fr_400px]"} h-[calc(85vh)]`}
      >
        {/* Map Section */}
        <div className="relative w-full h-full min-h-[100px]">
          <Map
            locations={locations}
            selectedLocation={selectedLocation}
            onMarkerClick={handleMarkerClick}
          />

          {/* Mobile Toggle Button */}
          {isMobile && (
            <Button
              onClick={() => setShowListings(!showListings)}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 shadow-lg  hover:bg-primary/90 px-6 py-3 rounded-full font-medium"
            >
              {showListings ? "View Map" : `Show ${locations.length} places`}
            </Button>
          )}
        </div>

        {/* Listings Section */}
        <div
          className={`${isMobile ? (showListings ? "h-[60vh]" : "h-0") : "w-[400px] h-full"} 
          overflow-y-auto p-6  transition-all duration-300 ease-in-out
          ${isMobile && !showListings ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Places to stay</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {locations.length} homes in this area
              </p>
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowListings(false)}
                className="rounded-full"
              >
                <ChevronDown className="h-5 w-5" />
                <span className="sr-only">Close listings</span>
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                isSelected={selectedLocation === location.id}
                onClick={() => {
                  setSelectedLocation(location.id);
                  if (isMobile) setShowListings(false);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationCard({
  location,
  isSelected,
  onClick,
}: {
  location: Location;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === location.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? location.images.length - 1 : prev - 1
    );
  };

  return (
    <Card
      id={`listing-${location.id}`}
      className={`overflow-hidden transition-all hover:shadow-md cursor-pointer ${isSelected ? " border-primary shadow-md" : ""}`}
      onClick={onClick}
    >
      <div className="relative aspect-[4/3]">
        {/* Image Carousel */}
        <div className="relative w-full h-full">
          {location.images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-300 ${
                index === currentImageIndex
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <Image
                src={image || "/logo.png"}
                alt={`${location.title} - Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}

          {/* Carousel Navigation */}
          {location.images.length > 1 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 dark:bg-black z-10 w-8 h-8 sm:w-10 sm:h-10"
                onClick={prevImage}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="sr-only">Previous image</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 dark:bg-black z-10 w-8 h-8 sm:w-10 sm:h-10"
                onClick={nextImage}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="sr-only">Next image</span>
              </Button>

              {/* Dots indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {location.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <Badge className="absolute top-2 left-2 bg-black/70 text-white hover:bg-black/80 z-10">
          {location.type}
        </Badge>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 rounded-full bg-white/90 dark:bg-black hover:text-rose-500 transition-colors z-10"
        >
          <Star className="w-4 h-4" />
          <span className="sr-only">Save to favorites</span>
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium line-clamp-1">{location.title}</h3>
          <div className="flex items-center gap-1 text-sm font-medium">
            <Star className="w-3 h-3 fill-current" />
            <span>{location.rating}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
          {location.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-2">
          {location.amenities.slice(0, 3).map((amenity, index) => (
            <span key={index} className="text-xs text-muted-foreground">
              {amenity}
              {index < Math.min(location.amenities.length, 3) - 1 ? " · " : ""}
            </span>
          ))}
          {location.amenities.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{location.amenities.length - 3} more
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="font-semibold">
            ${location.price}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              night
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {location.reviewCount} reviews
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MapSkeleton() {
  return (
    <div className="w-full h-full bg-muted/30 flex items-center justify-center">
      <div className="text-center">
        <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px] mx-auto" />
          <Skeleton className="h-4 w-[160px] mx-auto" />
        </div>
      </div>
    </div>
  );
}
