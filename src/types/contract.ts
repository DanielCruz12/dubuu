export type ContractStatus =
  | 'pending_delivery'
  | 'active'
  | 'completed'
  | 'disputed'

export type ChecklistType = 'OUT' | 'IN'

export interface IContractBooking {
  id: string
  status: string
  total: string
  paymentMethod: string | null
  booking_kind: string
  created_at: string
  rental: {
    pickup_time: string
    dropoff_time: string
    pickup_location: string
    dropoff_location: string
    pickup_notes?: string | null
    dropoff_notes?: string | null
  } | null
}

export interface IContractCustomer {
  first_name: string
  last_name: string
}

export interface IContractVehicle {
  brand: string
  model: string
  year: number
  color: string
  plate?: string | null
  vin?: string | null
  fuel_type: string
  transmission: string
  engine: string
}

export interface IContract {
  id: string
  booking_id: string
  status: ContractStatus
  draft_pdf_url?: string | null
  out_pdf_url?: string | null
  pdf_url?: string | null
  created_at: string
  updated_at: string
  checklists: IContractChecklist[]
  booking: IContractBooking | null
  customer: IContractCustomer | null
  vehicle: IContractVehicle | null
}

export interface IContractChecklist {
  id: string
  contract_id: string
  type: ChecklistType
  good_condition_tires: boolean
  spare_tire: boolean
  car_jack: boolean
  safety_cone: boolean
  fire_extinguisher: boolean
  mirrors_and_rearview: boolean
  seat_stains: boolean
  headlights_and_stops: boolean
  carplay_screen_and_speakers: boolean
  good_condition_windows: boolean
  diesel_caps: boolean
  dashboard_lights: boolean
  air_conditioning: boolean
  safety_hubs: boolean
  original_registration_card: boolean
  mud_flaps: boolean
  roof_racks_and_ladder: boolean
  fuel_percentage: string
  observations: Record<string, string>
  inspector_signature: string
  driver_signature: string
  created_at: string
}

export interface CreateChecklistPayload {
  contract_id: string
  type: ChecklistType
  good_condition_tires: boolean
  spare_tire: boolean
  car_jack: boolean
  safety_cone: boolean
  fire_extinguisher: boolean
  mirrors_and_rearview: boolean
  seat_stains: boolean
  headlights_and_stops: boolean
  carplay_screen_and_speakers: boolean
  good_condition_windows: boolean
  diesel_caps: boolean
  dashboard_lights: boolean
  air_conditioning: boolean
  safety_hubs: boolean
  original_registration_card: boolean
  mud_flaps: boolean
  roof_racks_and_ladder: boolean
  fuel_percentage: string
  observations: Record<string, string>
  inspector_signature: string
  driver_signature: string
}
