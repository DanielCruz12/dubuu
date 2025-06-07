import { TourForm } from "@/components/modules/add-tour";

export default function AddProductPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Agregar producto</h1>
      <TourForm />
    </div>
  );
}
