export interface MediaItem {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailPath?: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  metadata: {
    exif?: any;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface SearchQuery {
  filename?: string;
  dateFrom?: Date;
  dateTo?: Date;
  mimeType?: string;
  tags?: string[];
}

export interface UploadResult {
  success: boolean;
  mediaItem?: MediaItem;
  error?: string;
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  coverImageId?: string;
  mediaIds: string[];
  createdAt: Date;
  updatedAt: Date;
}