export interface New {
  _id: string;
  url: string;
  category: string;
  created_at: string;
  published_at: string;
  source: string;
  summary: string;
  tags: string[];
  title: string;
}

export interface GetNewsParams {
  source?: string | null;
  category?: string | null;
  tags?: string[] | null;
  page?: number; // Page number (1-indexed)
  page_size?: number;
}

export interface GetNewsPagination {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface GetNewsFilter {
  source: string[];
  category: string[];
  tags: string[];
}

export interface GetNewsResponse {
  data: New[];
  meta: GetNewsPagination;
  filters: GetNewsFilter;
}
