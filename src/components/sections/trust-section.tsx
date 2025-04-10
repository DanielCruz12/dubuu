import { Headphones, Lock } from "lucide-react";

const TrustSection = () => {
  return (
    <div className="mx-auto rounded-lg p-6 shadow-sm border">
      <h2 className="font-semibold mb-4">Reserva con confianza</h2>

      <hr className="my-4" />

      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Lock className="h-6 w-6 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-normal">Protección de la privacidad</h4>
            <span className="space-y-4 text-sm text-muted-foreground">
              Usamos encriptación SSL para proteger sus datos
            </span>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Headphones className="h-6 w-6 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-normal">
              Asistencia global las 24 horas, los 7 días de la semana
            </h4>
            <span className="space-y-4 text-sm text-muted-foreground">
              Obtenga las respuestas que necesite, cuando las necesite
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSection;
