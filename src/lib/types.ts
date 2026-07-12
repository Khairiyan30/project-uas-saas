export interface Project {
  id: string;
  name: string;
  event_type: string;
  description: string;
  progress_status: string;
  unique_slug: string;
  created_at: string;
  cover_photo_url: string | null;
  photo_count: number;
  favorite_count: number;
  revision_count: number;
  progress_percent?: number;
}

export interface Photo {
  id: string;
  project_id: string;
  url_original: string;
  url_edited: string | null;
  filename: string;
  is_favorite: boolean;
  created_at: string;
}

export interface UploadQueueItem {
  name: string;
  progress: number;
  status: "waiting" | "uploading" | "success" | "error";
}

export interface ApiResponse<T = unknown> {
  error?: string;
  message?: string;
  details?: string;
}

export interface ProjectsResponse extends ApiResponse {
  projects: Project[];
}

export interface GalleryResponse extends ApiResponse {
  project: Project;
  photos: Photo[];
}
