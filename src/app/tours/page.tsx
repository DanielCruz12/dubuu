/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useGetProductsQuery } from "@/redux/slices/product/product-slice";
import Image from "next/image";
import Link from "next/link";

export default function Products() {
  const { data: products = [] } = useGetProductsQuery();
  
  return (
    <div className="mx-auto px-3 max-w-7xl min-h-screen pt-5">
      <h1 className="text-xl font-semibold mb-4">Our Travel Packages</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/tours/${product.id}`}
            className="group"
          >
            <div className=" rounded-lg shadow-md overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image
                  src={product.banner}
                  alt={product.name}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <p className="text-primary font-semibold">${product.price}</p>
                <p className="text-gray-400 mb-2">
                  {product.duration} {product.duration > 1 ? "days" : "day"}
                </p>
                <p className="text-gray-600 mb-4 text-wrap line-clamp-4">
                  {product.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
