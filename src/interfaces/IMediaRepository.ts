import { MediaItem, SearchQuery } from '../types';

export interface IMediaRepository {
  save(media: MediaItem): Promise<MediaItem>;
  findById(id: string): Promise<MediaItem | null>;
  findAll(): Promise<MediaItem[]>;
  search(query: SearchQuery): Promise<MediaItem[]>;
  delete(id: string): Promise<void>;
  getAllTags(): Promise<string[]>;
  updateTags(id: string, tags: string[]): Promise<MediaItem>;
}