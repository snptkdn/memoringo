import { ISearchService } from '../../interfaces/ISearchService';
import { IMediaRepository } from '../../interfaces/IMediaRepository';
import { MediaItem, SearchQuery } from '../../types';

export class SimpleSearchService implements ISearchService {
  constructor(private mediaRepository: IMediaRepository) {}

  async search(query: SearchQuery): Promise<MediaItem[]> {
    return await this.mediaRepository.search(query);
  }

  async searchByFilename(filename: string): Promise<MediaItem[]> {
    return await this.mediaRepository.search({ filename });
  }

  async searchByDateRange(dateFrom: Date, dateTo: Date): Promise<MediaItem[]> {
    return await this.mediaRepository.search({ dateFrom, dateTo });
  }

  async searchByMimeType(mimeType: string): Promise<MediaItem[]> {
    return await this.mediaRepository.search({ mimeType });
  }
}