
export type Region = {
    id: string;
    nombre: string;
    codigoPostal: string | null;
  };
  
  export type Country = {
    id: string;
    nombre: string;
    orden: number;
    regiones: Region[];
  };