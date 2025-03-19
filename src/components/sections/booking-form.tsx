"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarIcon, Users } from "lucide-react";
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

interface BookingFormProps {
  productName: string;
}

export default function BookingForm({ productName }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("12:00");
  console.log(selectedTime);
  const [addons, setAddons] = useState<string[]>([]);
  const [tickets, setTickets] = useState({ adult1: 1, adult2: 1 });
  const formRef = useRef<HTMLDivElement>(null);

  // Ensure the sticky positioning works correctly
  useEffect(() => {
    const handleScroll = () => {
      if (formRef.current) {
        const rect = formRef.current.getBoundingClientRect();
        const isSticky = rect.top <= 16;

        if (isSticky) {
          formRef.current.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
        } else {
          formRef.current.style.boxShadow = "";
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const calculateTotal = () => {
    const ticketPrice = (tickets.adult1 + tickets.adult2) * 42.5;
    const addonPrice = addons.includes("service1")
      ? 32.0
      : 0 + (addons.includes("service2") ? 24.0 : 0);
    return ticketPrice + addonPrice;
  };

  return (
    <div
      ref={formRef}
      style={{
        position: "sticky",
      }}
      className="bg-background dark:bg-background rounded-lg border dark:border-muted shadow-md"
    >
      <div className="p-5">
        <h2 className="text-base  font-semibold mb-4">Book - {productName}</h2>

        <div className="space-y-5">
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

          <div className="space-y-2">
            <Label>Time:</Label>
            <RadioGroup defaultValue="12:00" onValueChange={setSelectedTime}>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="12:00" id="time-12:00" />
                  <Label htmlFor="time-12:00">12:00</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="17:00" id="time-17:00" />
                  <Label htmlFor="time-17:00">17:00</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Tickets:</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Adult (18+ years)</span>
                <div className="flex items-center gap-2">
                  <span>$42.50</span>
                  <Select
                    value={tickets.adult2.toString()}
                    onValueChange={(value) =>
                      setTickets({ ...tickets, adult2: Number.parseInt(value) })
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

          <div className="space-y-3">
            <Label>Add Extra:</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="service1"
                    checked={addons.includes("service1")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setAddons([...addons, "service1"]);
                      } else {
                        setAddons(addons.filter((a) => a !== "service1"));
                      }
                    }}
                  />
                  <Label htmlFor="service1">Add service per Booking</Label>
                </div>
                <span>$32.00</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="service2"
                    checked={addons.includes("service2")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setAddons([...addons, "service2"]);
                      } else {
                        setAddons(addons.filter((a) => a !== "service2"));
                      }
                    }}
                  />
                  <Label htmlFor="service2">Add service per Personal</Label>
                </div>
                <span>$24.00</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t dark:border-muted">
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

          <div className="text-center">
            <button className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 mx-auto">
              <Users className="w-4 h-4" />
              Need some help?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
