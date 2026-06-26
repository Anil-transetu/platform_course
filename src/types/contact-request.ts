export interface ContactRequest {
  [key: string]: any;
  id: string;
  full_name: string;
  email: string;
  role: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export interface ContactRequestStats {
  total_requests: number;
  admin_requests: number;
  institution_representative_requests: number;
}

export interface ContactRequestsResponse {
  success: boolean;
  message: string;
  data: {
    records: ContactRequest[];
    pagination: {
      page: number;
      limit: number;
      total_records: number;
      total_pages: number;
    };
  };
}

export interface ContactRequestStatsResponse {
  success: boolean;
  message: string;
  data: ContactRequestStats;
}
