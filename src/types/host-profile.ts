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

/** Cuerpo PATCH (campos opcionales, snake_case como espera el backend). */
export interface HostProfilePatchBody {
  /** Idioma de la UI (se usa para guardar la traducción actual). */
  locale: "es" | "en" | (string & {});
  user_id?: string;
  /** URL pública de la imagen de perfil. */
  image_url?: string | null;
  intro?: string | null;
  description?: string | null;
  years_experience?: number | null;
  specialty?: string | null;
  experience_summary?: string | null;
  hosting_style?: string | null;
  experience_tags?: string[] | null;
  languages?: string[] | null;
}
