import { IProductBase } from "./product";

export interface IRentalProduct extends IProductBase<"rental"> {
    rental_type: string;
  }