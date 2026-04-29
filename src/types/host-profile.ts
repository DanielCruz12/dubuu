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
  /** Idioma de la UI (se usa para guardar la traducción actual). */
  locale: "es" | "en" | (string & {});
  /**
   * Nuevo patrón backend: identificar el usuario en el body y
   * agrupar los campos en un objeto `data`.
   */
  user_id?: string;
  data?: Partial<{
    image_url: string;
    intro: string;
    description: string;
    years_experience: number;
    specialty: string;
    experience_summary: string;
    hosting_style: string;
    experience_tags: string[];
    languages: string[];
  }>;
  /** URL pública de la imagen de perfil (snake_case como backend). */
  image_url?: string;
  intro?: string;
  /**
   * Nuevo shape backend (snake_case).
   * Mantenemos los campos "viejos" abajo por compatibilidad.
   */
  description?: string;
  years_experience?: number;
  specialty?: string;
  experience_summary?: string;
  hosting_style?: string;
  experience_tags?: string[];
  languages?: string[];

  /** Compatibilidad (legacy) */
  descripcion?: string;
  anosExperiencia?: number;
  especialidad?: string;
  tipoExperiencias?: string;
  estilo?: string;
  tiposExperiencia?: string[];
  idiomas?: string[];
}
