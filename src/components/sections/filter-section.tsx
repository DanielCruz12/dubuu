'use client'
import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DatePickerWithRange } from "../date-picker";
import { Star } from "lucide-react";
const FiltersContent = () => {

  const [priceRange, setPriceRange] = useState([50, 300]);
  const defaultAccordionValues = ["amenities"];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Fechas</h3>
        <DatePickerWithRange />
      </div>

      <Separator />

      <Accordion
        type="multiple"
        defaultValue={defaultAccordionValues}
        className="w-full"
      >
        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="py-2 text-sm font-medium">
            Precio por noche
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
              <Slider
                defaultValue={priceRange}
                max={500}
                step={10}
                onValueChange={setPriceRange}
                className="mt-6"
              />
              <div className="flex justify-between items-center mt-2">
                <div className="bg-background border rounded-md px-3 py-1">
                  <span className="text-sm font-medium">€{priceRange[0]}</span>
                </div>
                <div className="text-sm text-muted-foreground">hasta</div>
                <div className="bg-background border rounded-md px-3 py-1">
                  <span className="text-sm font-medium">€{priceRange[1]}</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="property-type" className="border-none">
          <AccordionTrigger className="py-2 text-sm font-medium">
            Tipo de alojamiento
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-48 pr-4">
              <div className="space-y-3">
                {[
                  "Hotel",
                  "Apartamento",
                  "Resort",
                  "Villa",
                  "Hostal",
                  "Casa de huéspedes",
                  "Bed & Breakfast",
                ].map((type, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${index}`}
                      defaultChecked={index === 1}
                    />
                    <Label htmlFor={`type-${index}`} className="text-sm">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="amenities" className="border-none">
          <AccordionTrigger className="py-2 text-sm font-medium">
            Servicios
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-48 pr-4">
              <div className="space-y-3">
                {[
                  "WiFi gratis",
                  "Desayuno incluido",
                  "Estacionamiento",
                  "Piscina",
                  "Aire acondicionado",
                  "Restaurante",
                  "Spa",
                  "Gimnasio",
                  "Admite mascotas",
                ].map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${index}`}
                      defaultChecked={index < 2}
                    />
                    <Label htmlFor={`amenity-${index}`} className="text-sm">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating" className="border-none">
          <AccordionTrigger className="py-2 text-sm font-medium">
            Calificación
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {[5, 4, 3, 2].map((stars, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`stars-${stars}`}
                    defaultChecked={stars === 4}
                  />
                  <Label
                    htmlFor={`stars-${stars}`}
                    className="flex items-center"
                  >
                    <div className="flex text-amber-400">
                      {Array(stars)
                        .fill(0)
                        .map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                    </div>
                    {stars < 5 && (
                      <span className="text-muted-foreground text-xs ml-1">
                        o más
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="location" className="border-none">
          <AccordionTrigger className="py-2 text-sm font-medium">
            Ubicación
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-48 pr-4">
              <div className="space-y-3">
                {[
                  "Centro de la ciudad",
                  "Playa",
                  "Cerca del aeropuerto",
                  "Suburbios",
                  "Cerca de Sagrada Familia",
                  "Cerca de La Rambla",
                  "Cerca de La Boquería",
                ].map((location, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${index}`}
                      defaultChecked={index === 0}
                    />
                    <Label htmlFor={`location-${index}`} className="text-sm">
                      {location}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FiltersContent;
