import { MediaItem, SearchQuery } from '../types';

export interface ISearchService {
  search(query: SearchQuery): Promise<MediaItem[]>;
  searchByFilename(filename: string): Promise<MediaItem[]>;
  searchByDateRange(dateFrom: Date, dateTo: Date): Promise<MediaItem[]>;
  searchByMimeType(mimeType: string): Promise<MediaItem[]>;
}