export interface Review {
    id: string
    name: string
    email: string
    rating: number
    comment: string
    date: string
    isVerified?: boolean
    likes?: number
    replies?: number
  }
  
  