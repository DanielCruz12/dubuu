export interface IBlogSection {
  title: string
  content: string
  images?: string[]
  videos?: string[]
  order?: number
}

export interface IBlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: IBlogSection[]
  /** HTML sanitizado del editor (posts nuevos). Null en posts legado de secciones. */
  content_html?: string | null
  category: string
  category_id?: string
  published_at: string
  updated_at?: string
  cover_image: string | null
  images?: string[]
  videos?: string[]
  author_name: string | null
  author_avatar: string | null
  reading_time_minutes: number | null
  is_approved?: boolean
  is_published?: boolean
  likes_count?: number
}

export interface BlogPostsListResponse {
  data: IBlogPost[]
  pagination: {
    total: number
    totalPages: number
    page: number
    limit: number
  }
}
