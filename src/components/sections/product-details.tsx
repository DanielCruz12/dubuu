"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { IProduct } from "@/types/product";
import { isProductType } from "@/utils";
import { TourDifficultyBadge } from "../difficulty-badge";
import { useLanguage } from "@/lib/i18n-context";

// Timeline item component for reusability
const TimelineItem = ({ content }: { content: string }) => (
  <li className="mb-3 ms-4">
    <div className="absolute w-3 h-3 bg-primary/20 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-primary/30"></div>
    <p className="font-normal text-sm text-muted-foreground">{content}</p>
  </li>
);

// Timeline list component
const TimelineList = ({ items }: { items?: string[] }) => {
  if (!items) return null;

  const filteredItems = items.filter((item) => item && item.trim() !== "");
  if (filteredItems.length === 0) return null;

  return (
    <ol className="relative border-s border-gray-200 dark:border-gray-700">
      {filteredItems.map((item, index) => (
        <TimelineItem key={index} content={item} />
      ))}
    </ol>
  );
};

const ProductDetails = ({ product }: { product: IProduct }) => {
  const { t } = useLanguage();
  const isTour = isProductType(product, "tours");
  const tourData = isTour ? product.tour : null;

  // Determine which accordion items should be shown
  const hasDescription = !!product?.description;
  const hasHighlight = !!tourData?.highlight;
  const hasIncluded = !!tourData?.included;
  const hasItinerary =
    Array.isArray(tourData?.itinerary) &&
    tourData.itinerary.filter((item) => item && item.trim() !== "").length > 0;
  const hasExpenses =
    Array.isArray(tourData?.expenses) &&
    tourData.expenses.filter((item) => item && item.trim() !== "").length > 0;
  const hasPackingList =
    Array.isArray(tourData?.packing_list) &&
    tourData.packing_list.filter((item) => item && item.trim() !== "").length >
      0;

  // Default open values
  const defaultValues = ["overview"];
  if (hasHighlight) defaultValues.push("highlight");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="mb-4"
    >
      {isTour && tourData?.difficulty && (
        <div className="mb-4">
          <label className="text-sm md:text-base font-semibold pr-3">{t("home.productDetails.difficultyLevel")} </label>
          <TourDifficultyBadge difficulty={tourData.difficulty} />
        </div>
      )}

      <Accordion
        type="multiple"
        defaultValue={defaultValues}
        className="space-y-4"
      >
        {hasDescription && (
          <AccordionItem value="overview" className="rounded-2xl border border-border border-b-0 bg-card px-5">
            <AccordionTrigger className="text-base md:text-lg font-semibold pt-4">
              {t("home.productDetails.overview")}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 font-normal text-sm text-muted-foreground line-clamp-5">
                <p>{product.description}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {hasHighlight && (
          <AccordionItem value="highlight" className="rounded-2xl border border-border border-b-0 bg-card px-5">
            <AccordionTrigger className="text-base md:text-lg font-semibold pt-4">
              {t("home.productDetails.highlight")}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 font-normal text-sm text-muted-foreground">
                <p>{tourData?.highlight}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {hasIncluded && (
          <AccordionItem value="included" className="rounded-2xl border border-border border-b-0 bg-card px-5">
            <AccordionTrigger className="text-base md:text-lg font-semibold pt-4">
              {t("home.productDetails.whatsIncluded")}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 font-normal text-sm text-muted-foreground">
                <p>{tourData?.included}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {hasItinerary && (
          <AccordionItem value="itinerary" className="rounded-2xl border border-border border-b-0 bg-card px-5">
            <AccordionTrigger className="text-base md:text-lg font-semibold pt-4">
              {t("home.productDetails.itinerary")}
            </AccordionTrigger>
            <AccordionContent>
              <TimelineList items={tourData?.itinerary} />
            </AccordionContent>
          </AccordionItem>
        )}

        {hasExpenses && (
          <AccordionItem value="expenses" className="rounded-2xl border border-border border-b-0 bg-card px-5">
            <AccordionTrigger className="text-base md:text-lg font-semibold pt-4">
              {t("home.productDetails.additionalExpenses")}
            </AccordionTrigger>
            <AccordionContent>
              <TimelineList items={tourData?.expenses} />
            </AccordionContent>
          </AccordionItem>
        )}

        {hasPackingList && (
          <AccordionItem value="packing_list" className="rounded-2xl border border-border border-b-0 bg-card px-5">
            <AccordionTrigger className="text-base md:text-lg font-semibold pt-4">
              {t("home.productDetails.whatToBring")}
            </AccordionTrigger>
            <AccordionContent>
              <TimelineList items={tourData?.packing_list} />
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </motion.div>
  );
};

export default ProductDetails;
