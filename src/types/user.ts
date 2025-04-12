export interface IUser {
    id: string;
    username: string;
    email: string;
    bank_name?: string;
    account_number?: string;
    account_type?: "Ahorro" | "Corriente";
    first_name?: string;
    last_name?: string;
    id_region?: string;
    country?: string;
    city?: string;
    address?: string;
    zip_code?: string;
    phone_number?: string;
    role_id?: string;
    created_at?: string;
    updated_at?: string;
  }