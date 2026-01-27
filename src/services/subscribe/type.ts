export interface Source {
  _id: string;
  name: string;
  url: string;
  created_at: string;
}

export interface SubscribeSourceParams {
  url: string;
  user_id: string;
}

export interface SubscribeSourceResponse {
  message: string;
  source_id: string;
  source_url: string;
}

export interface UnsubscribeSourceParams {
  source_id: string;
  user_id: string;
}

export interface UnsubscribeSourceResponse {
  message: string;
  source_id: string;
  source_url: string | null;
}

export interface GetSourcesParams {
  page?: number;
  page_size?: number;
}

export interface GetSourcesResponse {
  data: Source[];
  meta: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export type GetUserSourcesResponse = Source[];
