import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { IProduct } from "@/types/product";
import { isProductType } from "@/utils";
import { TourDifficultyBadge } from "../difficulty-badge";

// Timeline item component for reusability
const TimelineItem = ({ content }: { content: string }) => (
  <li className="mb-3 ms-4">
    <div className="absolute w-3 h-3 bg-primary/20 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-primary/30"></div>
    <p className="font-normal md:text-base text-muted-foreground">{content}</p>
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
    <div className="mb-4">
      {isTour && tourData?.difficulty && (
        <div className="mb-4">
          <TourDifficultyBadge difficulty={tourData.difficulty} />
        </div>
      )}

      <Accordion
        type="multiple"
        defaultValue={defaultValues}
        className="space-y-4"
      >
        {hasDescription && (
          <AccordionItem value="overview">
            <AccordionTrigger className="text-base md:text-xl font-semibold">
              Descripción general
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 font-normal md:text-base text-muted-foreground">
                <p>{product.description}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {hasHighlight && (
          <AccordionItem value="highlight">
            <AccordionTrigger className="text-base md:text-xl font-semibold">
              Destacar
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 font-normal md:text-base text-muted-foreground">
                <p>{tourData?.highlight}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {hasIncluded && (
          <AccordionItem value="included">
            <AccordionTrigger className="text-base md:text-xl font-semibold">
              Qué incluye
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 font-normal md:text-base text-muted-foreground">
                <p>{tourData?.included}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {hasItinerary && (
          <AccordionItem value="itinerary">
            <AccordionTrigger className="text-base md:text-xl font-semibold">
              Itinerario
            </AccordionTrigger>
            <AccordionContent>
              <TimelineList items={tourData?.itinerary} />
            </AccordionContent>
          </AccordionItem>
        )}

        {hasExpenses && (
          <AccordionItem value="expenses">
            <AccordionTrigger className="text-base md:text-xl font-semibold">
              Gastos adicionales
            </AccordionTrigger>
            <AccordionContent>
              <TimelineList items={tourData?.expenses} />
            </AccordionContent>
          </AccordionItem>
        )}

        {hasPackingList && (
          <AccordionItem value="packing_list">
            <AccordionTrigger className="text-base md:text-xl font-semibold">
              Cosas que debes llevar
            </AccordionTrigger>
            <AccordionContent>
              <TimelineList items={tourData?.packing_list} />
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};

export default ProductDetails;
