export enum Category {
    TOURS = "Tours",
    HOTELS = "Hotels",
    TICKETS = "Tickets",
    RENTAL = "Rental",
    DAY_PASS = "Day pass",
  }
  
  export type FilterOptions = {
    category: Category | null;
    duration: number | null;
    rating: number | null;
    price: string | null;
  };
  