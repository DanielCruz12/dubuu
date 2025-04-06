import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IProduct } from "@/types/product";
import { isProductType } from "@/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ProductDetails = ({ product }: { product: IProduct }) => {
    const isTour = isProductType(product, "tour");
  const tourData = isTour ? product.tour : null;

  return (
    <div className="mb-8">
      <Accordion
        type="multiple"
        defaultValue={["overview", "highlight", "included"]}
        className="space-y-4"
      >
        <AccordionItem value="overview">
          <AccordionTrigger className="text-base md:text-xl font-semibold">
            Descripción general
          </AccordionTrigger>
          <AccordionContent>
            {tourData && (
              <>
                <span className="font-bold text">Punto de salida:</span>
                <p>{tourData.departure_point}</p>
              </>
            )}
            <div className="space-y-4 font-normal md:text-base text-muted-foreground">
              <p>{product?.description}</p>
            </div>
          </AccordionContent>
        </AccordionItem>

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

        <AccordionItem value="itinerary">
          <AccordionTrigger className="text-base md:text-xl font-semibold">
            Itinerario
          </AccordionTrigger>
          <AccordionContent>
            <ol className="relative border-s border-gray-200 dark:border-gray-700">
              {tourData?.itinerary?.map((item, index) => (
                <li key={index} className="mb-3 ms-4">
                  <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                  <p className="space-y-4 font-normal md:text-base text-muted-foreground">
                    {item}
                  </p>
                </li>
              ))}
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ProductDetails;
