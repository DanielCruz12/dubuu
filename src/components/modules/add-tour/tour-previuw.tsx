/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Clock,
  Edit,
  Users,
  Tag,
  List,
  Globe,
  CheckCircle,
  Sparkles,
  Package,
  ShieldCheck,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { amenitiesOptions } from "./constants";
import { countries } from "@/utils/data";

interface TourPreviewProps {
  onEdit: () => void;
  tourData?: any; // Idealmente deberíamos definir un tipo específico para los datos del tour
}

export function TourPreview({ onEdit, tourData = [] }: TourPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-medium line-clamp-2">{tourData.name}</CardTitle>
          <CardDescription>
            {tourData.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 rounded-md">
                <MapPin className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium">{tourData.departure_point}</p>
                  <p className="text-sm text-gray-500">Punto de partida</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-md">
                <Globe className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium">{tourData.address}</p>
                  <p className="text-sm text-gray-500">
                    {countries.find((c) => c.nombre === tourData.country)
                      ?.nombre || tourData.country}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-md">
                <Tag className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium">${tourData.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Precio por persona</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 rounded-md">
                <Clock className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium">{tourData.duration} día(s)</p>
                  <p className="text-sm text-gray-500">Duración</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-md">
                <Users className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium">
                    Máximo {tourData.max_people} personas
                  </p>
                  <p className="text-sm text-gray-500">Capacidad</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-md">
                <Calendar className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {tourData.available_dates.length} fechas disponibles
                  </p>
                  <p className="text-sm text-gray-500">
                    Próxima: {format(tourData.available_dates[0], "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              Destacados
            </h3>
            <p className="text-sm">{tourData.highlight}</p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Incluido
            </h3>
            <p className="text-sm">{tourData.included}</p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2 flex items-center">
              <List className="h-4 w-4 mr-2" />
              Itinerario
            </h3>
            <ul className="space-y-2">
              {tourData.itinerary.map((item: string, index: number) => (
                <li key={index} className="text-sm flex items-start">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-xs mr-2 mt-0.5">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Comodidades
            </h3>
            <div className="flex flex-wrap gap-2">
              {tourData.amenities.map((amenityId: string) => {
                const amenity = amenitiesOptions.find(
                  (a) => a.id === amenityId
                );
                return amenity ? (
                  <span
                    key={amenity.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {amenity.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            variant="outline"
            className="border-gray-200 dark:border-gray-800"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar tour
          </Button>
        </CardFooter>

        {/* Security badge */}
        <div className="flex justify-center pb-4">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Información segura
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
