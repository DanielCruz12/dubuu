"use client";

import { useState } from "react";
import {
  CalendarIcon,
  MapPin,
  Users,
  Clock,
  Calendar,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ImageCollage from "@/components/image-collage";
import Head from "next/head";
import { notFound, useParams } from "next/navigation";
import { useGetProductQuery } from "@/redux/slices/product/product-slice";
import ImageCollageSkeleton from "@/components/skeletons/image-collage-skeleton";
import ReviewSection from "@/components/sections/reviews-section";

export default function ProductBooking() {
  const { id } = useParams();
  const {
    data: product,
    isLoading,
    isError,
  } = useGetProductQuery(id as string);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("12:00");
  console.log(selectedTime);
  const [addons, setAddons] = useState<string[]>([]);
  const [tickets, setTickets] = useState({ adult1: 1, adult2: 1 });
  const calculateTotal = () => {
    const ticketPrice = (tickets.adult1 + tickets.adult2) * 42.5;
    const addonPrice = addons.includes("service1")
      ? 32.0
      : 0 + (addons.includes("service2") ? 24.0 : 0);
    return ticketPrice + addonPrice;
  };

  if (isLoading) return <ImageCollageSkeleton />;
  if (isError || !product) return notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Head>{product.name}</Head>
      <div className="flex items-center gap-2 mb-2 text-sm">
        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">4.96</span>
        <span className="text-muted-foreground">
          {product?.total_reviews === 0
            ? "(No reviews)"
            : product?.total_reviews === 1
              ? `(1 review)`
              : `(${product?.total_reviews} review)`}
        </span>
      </div>
      <h1 className="text-xl md:text-3xl font-semibold">{product?.name}</h1>
      <ImageCollage banner={product.banner} images={product?.images} />

      {/* Main content grid with sticky booking form */}
      <div className="grid lg:grid-cols-3 gap-6 relative">
        {/* Tour Details Section */}
        <div className="lg:col-span-2 space-y-6 md:pr-6 px-2">
          <div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{product?.departure_point}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg shadow dark:shadow-gray-800/10">
              <div className="flex items-center gap-2 rounded-lg">
                <Calendar className="w-5 h-5 text-primary rounded-xl" />
                <div>
                  <div className="text-xs sm:text-sm md:text-base font-medium">
                    Duration
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
                    5-7 days
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-xs sm:text-sm md:text-base font-medium">
                    Group Size
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
                    06 people
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-xs sm:text-sm md:text-base font-medium">
                    Tour Type
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
                    Daily Tour
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-xs sm:text-sm md:text-base font-medium">
                    Language
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
                    English
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Accordion
            type="multiple"
            defaultValue={["overview"]}
            className="space-y-4"
          >
            <AccordionItem value="overview">
              <AccordionTrigger className="text-base md:text-xl font-semibold">
                Overview
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 font-normal text-xs sm:text-sm md:text-base text-muted-foreground">
                  <p>{product?.description}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="highlight">
              <AccordionTrigger className="text-base md:text-xl font-semibold">
                Highlight
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 font-normal text-xs sm:text-sm md:text-base text-muted-foreground">
                  <p>{product?.description}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Reviews Section */}
        </div>

        {/* Booking Form - Sticky */}
        <div className="px-3">
          <div className="sticky top-6 pt-3 bg-background dark:bg-background rounded-lg border dark:border-muted shadow-sm dark:shadow-gray-800/10">
            <h2 className="text-xl font-semibold mb-4 px-4">Booking Form</h2>
            <div className="space-y-6 px-4">
              <div className="space-y-2">
                <Label>From:</Label>
                <div className="flex items-center gap-2 border dark:border-muted rounded-md p-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="outline-none bg-transparent flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 px-4 mt-4">
              <Label>Time:</Label>
              <RadioGroup defaultValue="12:00" onValueChange={setSelectedTime}>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="12:00" id="12:00" />
                    <Label htmlFor="12:00">12:00</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="17:00" id="17:00" />
                    <Label htmlFor="17:00">17:00</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4 px-4 mt-4">
              <Label>Tickets:</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Adult (18+ years)</span>
                  <div className="flex items-center gap-2">
                    <span>$42.50</span>
                    <Select
                      value={tickets.adult1.toString()}
                      onValueChange={(value) =>
                        setTickets({
                          ...tickets,
                          adult1: Number.parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Adult (18+ years)</span>
                  <div className="flex items-center gap-2">
                    <span>$42.50</span>
                    <Select
                      value={tickets.adult2.toString()}
                      onValueChange={(value) =>
                        setTickets({
                          ...tickets,
                          adult2: Number.parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 px-4 mt-4">
              <Label>Add Extra:</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={addons.includes("service1")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAddons([...addons, "service1"]);
                        } else {
                          setAddons(addons.filter((a) => a !== "service1"));
                        }
                      }}
                    />
                    <span>Add service per Booking</span>
                  </div>
                  <span>$32.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={addons.includes("service2")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAddons([...addons, "service2"]);
                        } else {
                          setAddons(addons.filter((a) => a !== "service2"));
                        }
                      }}
                    />
                    <span>Add service per Personal</span>
                  </div>
                  <span>$24.00</span>
                </div>
              </div>
            </div>

            <div className="pt-4 px-4 mt-4 border-t dark:border-muted">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              <Button className="w-full bg-black text-white hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700">
                Book Now
              </Button>
            </div>
            <div className="mt-6 mb-6 text-center">
              <button className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 mx-auto">
                <Users className="w-4 h-4" />
                Need some help?
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <ReviewSection productId={id as string} />
      </div>
    </div>
  );
}
