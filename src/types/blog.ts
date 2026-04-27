/** Forma canónica del post tras normalizar la respuesta del API. */
export interface IBlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  published_at: string;
  updated_at?: string;
  cover_image: string | null;
  author_name: string | null;
  author_avatar: string | null;
  reading_time_minutes: number | null;
  comments_count: number;
}

export interface BlogPostsListResponse {
  data: IBlogPost[];
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}
