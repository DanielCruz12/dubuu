export type HostProfileDetailKey =
  | "specialty"
  | "experience_types"
  | "style";

export interface HostProfileDetail {
  key: HostProfileDetailKey;
  label: string;
  value: string;
}

/** Shape común de GET público y respuesta PATCH. */
export interface HostPublicProfile {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  calificacion: string | null;
  totalEvaluaciones: number;
  totalTours: number;
  anosExperiencia: number;
  intro: string;
  descripcion: string;
  detalles: HostProfileDetail[];
  tiposExperiencia: string[];
  idiomas: string[];
}

export interface HostProfileApiErrorBody {
  message: string;
}

/** Cuerpo PATCH (campos opcionales, nombres en español). */
export interface HostProfilePatchBody {
  intro?: string;
  descripcion?: string;
  anosExperiencia?: number;
  especialidad?: string;
  tipoExperiencias?: string;
  estilo?: string;
  tiposExperiencia?: string[];
  idiomas?: string[];
}
