import { DashboardTitle } from "@/components/dashboard-title";

const Saved = () => {
  return (
    <div className="px-3 md:px-0">
      <DashboardTitle
        heading="Guardados"
        description="Vuelve a ver los productos que guardaste anteriormente"
      />
    </div>
  );
};

export default Saved;
